import fs from "node:fs";
import path from "node:path";
import { validateToolMapping } from "./adapter-contract.mjs";

/** Validate local references and resolve supported Codex commands without running hooks. */
export function validatePackageReferences(packageRoot, target, ownedFiles) {
  const root = path.resolve(packageRoot);
  const owned = new Set(ownedFiles);
  const codexSessionStart = [];
  const invalid = (label, reason) => { throw new Error(`Invalid package reference ${label}: ${reason}.`); };

  function reference(value, label, kind = "file", allowRoot = false) {
    if (typeof value !== "string" || !value || value.trim() !== value || /[\\\x00-\x1f\x7f]/.test(value) || /^[a-z][a-z0-9+.-]*:/i.test(value) || path.posix.isAbsolute(value) || path.win32.isAbsolute(value)) {
      invalid(label, "expected a nonempty package-relative path");
    }
    let relative = value.replace(/^\.\//, "");
    if (kind === "directory") relative = relative.replace(/\/$/, "");
    const isRoot = allowRoot && kind === "directory" && ["", "."].includes(relative);
    if (!isRoot && relative.split("/").some((part) => !part || part === "." || part === "..")) invalid(label, "malformed path or package escape");
    let file = root;
    let stat;
    for (const part of isRoot ? [] : relative.split("/")) {
      file = path.join(file, part);
      try { stat = fs.lstatSync(file); }
      catch (error) { invalid(label, error.code === "ENOENT" ? `missing ${value}` : `unreadable ${value}`); }
      if (stat.isSymbolicLink()) invalid(label, `symbolic-link redirect at ${value}`);
    }
    stat ??= fs.lstatSync(root);
    if (kind === "file" ? !stat.isFile() : !stat.isDirectory()) invalid(label, `expected a ${kind}: ${value}`);
    if (kind === "file" ? !owned.has(relative) : ![...owned].some((entry) => isRoot || entry.startsWith(`${relative}/`))) {
      invalid(label, `unowned package ${kind}: ${value}`);
    }
    return { file, relative };
  }

  function json(value, label = value) {
    const { file } = reference(value, label);
    let data;
    try { data = JSON.parse(fs.readFileSync(file, "utf8")); }
    catch { invalid(label, "unreadable or malformed JSON"); }
    if (!data || typeof data !== "object" || Array.isArray(data)) invalid(label, "expected a JSON object");
    return data;
  }

  if (typeof target !== "string" || !/^[a-z][a-z0-9-]*$/.test(target)) invalid("runtime_id", "malformed runtime identity");
  const manifestPath = `runtime_adapters/manifests/${target}.json`;
  const manifest = json(manifestPath);
  if (manifest.runtime_id !== target) invalid(manifestPath, "runtime identity does not match installation");
  reference(manifest.bootstrap_path, `${manifestPath}.bootstrap_path`);
  const mapping = json(manifest.tool_mapping_path, `${manifestPath}.tool_mapping_path`);
  if (mapping.runtime_id !== target) invalid(manifest.tool_mapping_path, "runtime identity does not match installation");
  try { validateToolMapping(mapping); }
  catch (error) { invalid(manifest.tool_mapping_path, error.message); }

  function rendererInputs() {
    for (const relative of [
      "scripts/render-session-bootstrap.mjs", "runtime_adapters/adapter-registry.yaml",
      "runtime_adapters/generated/using-wcbs-bootstrap.md", "runtime_adapters/generated/skill-catalog.json",
      "skills/using-wcbs/SKILL.md"
    ]) reference(relative, `SessionStart dependency ${relative}`);
  }

  function hookCommand(command, label, pattern, expectedPath) {
    if (typeof command !== "string") invalid(label, "missing or malformed hook command");
    const match = pattern.exec(command);
    if (!match) invalid(label, "unsupported or malformed built-in hook command");
    const dependency = reference(match[1], label);
    if (dependency.relative !== expectedPath) invalid(label, `expected built-in hook target ${expectedPath}`);
    return dependency.file;
  }

  function pluginHooks(value, label = value) {
    const hooks = json(value, label);
    const groups = hooks.hooks?.SessionStart;
    if (!Array.isArray(groups) || !groups.length) invalid(value, "missing SessionStart hooks");
    for (const group of groups) {
      if (!Array.isArray(group?.hooks) || !group.hooks.length) invalid(value, "malformed SessionStart hooks");
      for (const hook of group.hooks) {
        if (hook?.type !== "command") invalid(value, "unsupported SessionStart hook type");
        const rendererPath = hookCommand(hook.command, `${value}.command`, target === "codex"
          ? /^node "\$\{PLUGIN_ROOT\}\/([^"]+)" --runtime codex --shape codex$/
          : /^"\$\{CLAUDE_PLUGIN_ROOT\}\/([^"]+)" session-start --runtime claude$/,
        target === "codex" ? "scripts/render-session-bootstrap.mjs" : "hooks/run-hook.cmd");
        if (target === "codex") codexSessionStart.push({ rendererPath, args: ["--runtime", "codex", "--shape", "codex"] });
      }
    }
    rendererInputs();
  }

  if (["codex", "claude", "kimi"].includes(target)) {
    const plugin = json(manifest.bootstrap_path);
    const skills = reference(plugin.skills, `${manifest.bootstrap_path}.skills`, "directory");
    if (![...owned].some((entry) => entry.startsWith(`${skills.relative}/`) && entry.endsWith("/SKILL.md"))) {
      invalid(`${manifest.bootstrap_path}.skills`, "directory has no owned SKILL.md");
    }
    if (target === "codex") pluginHooks(plugin.hooks, `${manifest.bootstrap_path}.hooks`);
    if (target === "claude") {
      if (Object.hasOwn(plugin, "hooks")) invalid(`${manifest.bootstrap_path}.hooks`, "explicit hook registration is unsupported; this package uses default discovery");
      pluginHooks("hooks/hooks.json");
    }
    if (target === "kimi") {
      const skill = plugin.sessionStart?.skill;
      if (typeof skill !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skill)) invalid(`${manifest.bootstrap_path}.sessionStart.skill`, "malformed skill identity");
      reference(`${skills.relative}/${skill}/SKILL.md`, `${manifest.bootstrap_path}.sessionStart.skill`);
    }
  }

  for (const relative of target === "cursor" ? [".cursor/hooks.json"] : target === "github-copilot" ? [".github/hooks/wcbs-session-start.json"] : []) {
    // These registrations are delivered by V1; the V2 instruction-file route omits them.
    if (!owned.has(relative)) continue;
    const config = json(relative);
    const hooks = config.hooks?.sessionStart;
    if (!Array.isArray(hooks) || !hooks.length) invalid(relative, "missing sessionStart hooks");
    for (const hook of hooks) {
      if (target === "cursor") hookCommand(hook?.command, relative, /^\.\/(\S+) session-start --runtime cursor$/, "hooks/run-hook");
      else {
        const cwd = reference(hook?.cwd, `${relative}.cwd`, "directory", true);
        if (cwd.file !== root) invalid(`${relative}.cwd`, "built-in hook must run from the installed package root");
        hookCommand(hook?.bash, `${relative}.bash`, /^\.\/(\S+) session-start --runtime github-copilot$/, "hooks/run-hook");
        if (hook?.powershell !== String.raw`cmd.exe /d /s /c "call .\hooks\run-hook.cmd session-start --runtime github-copilot"`) invalid(`${relative}.powershell`, "unsupported or malformed built-in hook command");
        reference("hooks/run-hook.cmd", `${relative}.powershell`);
      }
    }
    rendererInputs();
  }

  if (target === "claude" || [".cursor/hooks.json", ".github/hooks/wcbs-session-start.json"].some((relative) => owned.has(relative))) {
    for (const relative of ["hooks/run-hook", "hooks/run-hook.cmd", "hooks/session-start"]) reference(relative, `SessionStart dependency ${relative}`);
  }
  if (target === "codex" && owned.has(".agents/plugins/marketplace.json")) {
    const marketplace = json(".agents/plugins/marketplace.json");
    if (!Array.isArray(marketplace.plugins) || !marketplace.plugins.length) invalid("marketplace.plugins", "missing plugin sources");
    for (const plugin of marketplace.plugins) {
      if (plugin?.source?.source !== "local") invalid("marketplace.source", "expected the bundled local plugin source");
      const source = reference(plugin.source.path, "marketplace.source.path", "directory", true);
      if (source.file !== root) invalid("marketplace.source.path", "bundled local source must resolve to the installed package root");
    }
  }
  return { codexSessionStart };
}
