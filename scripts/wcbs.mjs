#!/usr/bin/env node
/**
 * WCBS V2 public command.
 *
 * The V2 route installs a self-contained plugin bundle into an explicit runtime
 * plugin directory. It never guesses a project location and never writes into
 * an ordinary project. The legacy project-vendoring installer stays available
 * only for verified migration and rollback.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const command = args.find((arg) => !arg.startsWith("-")) ?? "status";
const option = (name) => {
  const equal = args.find((arg) => arg.startsWith(`${name}=`));
  if (equal) return equal.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const has = (name) => args.includes(name);
const json = has("--json");
const target = option("--target");
const pluginDirInput = option("--plugin-dir");
const projectInput = option("--project");
const aliases = new Map([["copilot", "github-copilot"], ["generic", "generic-agent"]]);
const manifestRel = ".wcbs/v2-plugin-install-manifest.json";
const legacyManifestRel = ".wcbs/adapter-install-manifest.json";

function display(value) { return value.split(path.sep).join("/"); }
function emit(payload, text = payload.message ?? "") {
  if (json) console.log(JSON.stringify(payload, null, 2));
  else console.log(text);
}
function fail(message, extra = {}) {
  const payload = { status: "BLOCKED", evidence: "Blocked", message, ...extra };
  if (json) console.log(JSON.stringify(payload, null, 2));
  else console.error(`BLOCKED: ${message}`);
  process.exitCode = 1;
}
function sha256(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }
function readRegistry() {
  const file = path.join(root, "runtime_adapters", "adapter-registry.yaml");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function resolveTarget(requestedTarget = target) {
  const id = aliases.get(requestedTarget) ?? requestedTarget;
  const registry = readRegistry();
  const adapter = registry.adapters.find((item) => item.runtime_id === id);
  if (!adapter) throw new Error(`Blocked: choose --target from ${registry.adapters.map((item) => item.runtime_id).sort().join(", ")}.`);
  return adapter;
}
function assertNoSymlinkInExistingPath(absolute) {
  const parsed = path.parse(absolute);
  const segments = path.relative(parsed.root, absolute).split(path.sep).filter(Boolean);
  let current = parsed.root;
  for (const segment of segments) {
    current = path.join(current, segment);
    let stat;
    try {
      stat = fs.lstatSync(current);
    } catch (error) {
      if (error?.code === "ENOENT") break;
      throw error;
    }
    if (stat.isSymbolicLink()) throw new Error(`Blocked: plugin directory path must not contain a symbolic link: ${display(current)}.`);
    if (!stat.isDirectory() && current !== absolute) throw new Error(`Blocked: plugin directory ancestor is not a directory: ${display(current)}.`);
  }
}
function assertSafePluginDir(value) {
  if (!value) throw new Error("Blocked: --plugin-dir is required. Choose the runtime's plugin directory explicitly; WCBS will not guess or write into a project.");
  const absolute = path.resolve(value);
  if (absolute === path.parse(absolute).root || absolute === root) throw new Error("Blocked: --plugin-dir must be a dedicated, non-root plugin directory outside the WCBS source checkout.");
  assertNoSymlinkInExistingPath(absolute);
  return absolute;
}
function relativeFiles(sourceRoots) {
  const files = [];
  const walk = (absolute, relative) => {
    const stat = fs.lstatSync(absolute);
    if (stat.isSymbolicLink()) throw new Error(`Blocked: package source must not contain a symbolic link: ${display(relative)}`);
    if (stat.isFile()) { files.push(display(relative)); return; }
    for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
      if ([".git", "node_modules", "__pycache__"].includes(entry.name)) continue;
      walk(path.join(absolute, entry.name), path.join(relative, entry.name));
    }
  };
  for (const relative of sourceRoots) {
    const absolute = path.join(root, ...relative.split("/"));
    if (!fs.existsSync(absolute)) throw new Error(`Blocked: required plugin source is missing: ${relative}`);
    walk(absolute, relative);
  }
  return [...new Set(files)].sort();
}
function packageRoots(adapter) {
  const runtimeArtifact = adapter.packaging?.plugin_path;
  const common = [
    "00_start_here", "10_governance", "20_skills", "30_agents", "40_knowledge", "50_audits", "60_templates",
    "skills", "runtime_adapters/adapter-registry.yaml", "runtime_adapters/generated",
    `runtime_adapters/manifests/${adapter.runtime_id}.json`, `runtime_adapters/tool_mappings/${adapter.runtime_id}.json`, "LICENSE"
  ];
  // A Codex plugin package is also a self-contained local marketplace root.
  // Codex discovers the marketplace manifest from the root supplied to
  // `codex plugin marketplace add`; keeping it inside the owned bundle makes
  // the documented install path replayable without touching a user's global
  // marketplace directory.
  if (adapter.runtime_id === "codex") common.push(".agents/plugins/marketplace.json");
  if (adapter.runtime_id === "claude") common.push("hooks");
  return [...common, runtimeArtifact];
}
function readInstallManifest(pluginDir) {
  const file = path.join(pluginDir, ...manifestRel.split("/"));
  if (!fs.existsSync(file)) return null;
  const record = JSON.parse(fs.readFileSync(file, "utf8"));
  if (record.schema_version !== 1 || record.installed_by !== "wcbs-v2-plugin" || !Array.isArray(record.files)) throw new Error("Blocked: plugin ownership manifest is malformed; refusing ownership action.");
  return record;
}
function verifyOwned(pluginDir, record) {
  const missing = [], changed = [];
  for (const entry of record.files) {
    if (!entry?.path || !/^[a-f0-9]{64}$/i.test(entry.sha256 ?? "")) throw new Error("Blocked: plugin ownership manifest contains an invalid file record.");
    const file = path.resolve(pluginDir, ...entry.path.split("/"));
    if (!(file === pluginDir || file.startsWith(`${pluginDir}${path.sep}`))) throw new Error(`Blocked: plugin ownership path escapes its directory: ${entry.path}`);
    if (!fs.existsSync(file)) missing.push(entry.path);
    else if (fs.lstatSync(file).isSymbolicLink() || !fs.lstatSync(file).isFile() || sha256(file) !== entry.sha256) changed.push(entry.path);
  }
  return { missing, changed };
}
function unexpectedPluginEntries(pluginDir, record) {
  const ownedFiles = new Set([...record.files.map((entry) => entry.path), manifestRel]);
  const ownedDirectories = new Set();
  for (const relative of ownedFiles) {
    let directory = path.posix.dirname(relative);
    while (directory !== ".") {
      ownedDirectories.add(directory);
      directory = path.posix.dirname(directory);
    }
  }
  const unexpected = [];
  const walk = (directory, relative = "") => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const childRelative = relative ? `${relative}/${entry.name}` : entry.name;
      const child = path.join(directory, entry.name);
      const stat = fs.lstatSync(child);
      if (stat.isSymbolicLink()) {
        unexpected.push(`${childRelative} (symbolic link)`);
      } else if (stat.isDirectory()) {
        if (!ownedDirectories.has(childRelative)) unexpected.push(`${childRelative} (unowned directory)`);
        else walk(child, childRelative);
      } else if (!stat.isFile() || !ownedFiles.has(childRelative)) {
        unexpected.push(`${childRelative} (unowned file)`);
      }
    }
  };
  walk(pluginDir);
  return unexpected;
}
function install(adapter, pluginDir) {
  assertSafePluginDir(pluginDir);
  if (fs.existsSync(pluginDir)) {
    const record = readInstallManifest(pluginDir);
    if (record) throw new Error("Blocked: a WCBS V2 plugin is already installed there. Use doctor, uninstall, or a new --plugin-dir.");
    if (!fs.lstatSync(pluginDir).isDirectory() || fs.readdirSync(pluginDir).length) throw new Error("Blocked: --plugin-dir already contains unowned files; choose an empty dedicated plugin directory.");
  }
  const files = relativeFiles(packageRoots(adapter));
  const parent = path.dirname(pluginDir);
  fs.mkdirSync(parent, { recursive: true });
  assertSafePluginDir(pluginDir);
  const stage = fs.mkdtempSync(path.join(parent, ".wcbs-v2-stage-"));
  const payload = path.join(stage, "payload");
  try {
    for (const relative of files) {
      const source = path.join(root, ...relative.split("/"));
      const destination = path.join(payload, ...relative.split("/"));
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(source, destination);
      if (sha256(source) !== sha256(destination)) throw new Error(`Blocked: staged plugin hash mismatch: ${relative}`);
    }
    const record = {
      schema_version: 1,
      installed_by: "wcbs-v2-plugin",
      target: adapter.runtime_id,
      package_version: JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version,
      installed_utc: new Date().toISOString(),
      evidence: "Installed In Isolated Fixture",
      source_revision: "local-build",
      files: files.map((relative) => ({ path: relative, sha256: sha256(path.join(payload, ...relative.split("/"))) }))
    };
    const manifest = path.join(payload, ...manifestRel.split("/"));
    fs.mkdirSync(path.dirname(manifest), { recursive: true });
    fs.writeFileSync(manifest, `${JSON.stringify(record, null, 2)}\n`, "utf8");
    assertSafePluginDir(pluginDir);
    if (fs.existsSync(pluginDir)) fs.rmdirSync(pluginDir);
    assertSafePluginDir(pluginDir);
    fs.renameSync(payload, pluginDir);
    return record;
  } finally {
    fs.rmSync(stage, { recursive: true, force: true });
  }
}
function doctor(pluginDir) {
  assertSafePluginDir(pluginDir);
  const record = readInstallManifest(pluginDir);
  if (!record) throw new Error("Blocked: no WCBS V2 ownership manifest exists at --plugin-dir.");
  const integrity = verifyOwned(pluginDir, record);
  if (integrity.missing.length || integrity.changed.length) throw new Error(`Blocked: plugin integrity failure; missing=${integrity.missing.join(",") || "none"}; modified owned plugin files=${integrity.changed.join(",") || "none"}.`);
  const unexpected = unexpectedPluginEntries(pluginDir, record);
  if (unexpected.length) throw new Error(`Blocked: plugin contains unowned or unsafe plugin entries; refusing ownership action: ${unexpected.slice(0, 10).join(", ")}.`);
  const marker = `WCBS_KIT_ACTIVE:${record.target}`;
  const generated = path.join(pluginDir, "runtime_adapters", "generated", "using-wcbs-bootstrap.md");
  if (!fs.existsSync(generated) || !fs.readFileSync(generated, "utf8").includes("{{activation_marker}}")) throw new Error("Blocked: generated bootstrap template is missing or malformed.");
  return { ...record, marker, integrity };
}
function uninstall(pluginDir) {
  const record = doctor(pluginDir);
  assertSafePluginDir(pluginDir);
  const tombstone = `${pluginDir}.wcbs-v2-removing-${process.pid}-${Date.now()}`;
  fs.renameSync(pluginDir, tombstone);
  fs.rmSync(tombstone, { recursive: true, force: true });
  return record;
}
function migrate(adapter, pluginDir, project, apply) {
  if (!project) throw new Error("Blocked: --project is required for V1 migration.");
  const legacyProject = path.resolve(project);
  const legacyFile = path.join(legacyProject, ...legacyManifestRel.split("/"));
  if (!fs.existsSync(legacyFile)) throw new Error("Blocked: no V1 adapter ownership manifest exists in --project.");
  const legacy = JSON.parse(fs.readFileSync(legacyFile, "utf8"));
  if (!Array.isArray(legacy.files) || typeof legacy.source_root !== "string" || !legacy.target) throw new Error("Blocked: V1 ownership manifest is incomplete; migration cannot prove ownership.");
  if (legacy.target !== adapter.runtime_id) throw new Error(`Blocked: V1 project target is ${legacy.target}; requested V2 target is ${adapter.runtime_id}.`);
  const source = path.resolve(legacy.source_root);
  if (!fs.existsSync(source)) throw new Error("Blocked: V1 source_root is unavailable; migration cannot verify that old owned files are unchanged.");
  const ownedPaths = legacy.files.map((relative) => {
    if (typeof relative !== "string" || !relative || path.isAbsolute(relative)) throw new Error("Blocked: V1 ownership manifest contains an invalid path.");
    const oldFile = path.resolve(legacyProject, ...relative.split("/"));
    const sourceFile = path.resolve(source, ...relative.split("/"));
    if (!oldFile.startsWith(`${legacyProject}${path.sep}`) || !sourceFile.startsWith(`${source}${path.sep}`)) throw new Error(`Blocked: V1 ownership path escapes its root: ${relative}`);
    return { relative, oldFile, sourceFile };
  });
  const changed = ownedPaths.filter(({ oldFile, sourceFile }) => {
    return !fs.existsSync(oldFile) || !fs.existsSync(sourceFile) || fs.lstatSync(oldFile).isSymbolicLink() || sha256(oldFile) !== sha256(sourceFile);
  }).map(({ relative }) => relative);
  if (changed.length) throw new Error(`Blocked: V1-owned files changed or are unverifiable; migration will not remove them: ${changed.slice(0, 10).join(", ")}`);
  const plan = { status: apply ? "PASS" : "DRY_RUN", evidence: apply ? "Installed In Isolated Fixture" : "Verified", legacy_target: legacy.target, old_files: legacy.files.length, plugin_dir: pluginDir, project: legacyProject };
  if (!apply) return plan;
  const record = install(adapter, pluginDir);
  const stage = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-v1-migration-backup-"));
  const backups = [];
  try {
    for (const entry of ownedPaths) {
      const backup = path.join(stage, ...entry.relative.split("/"));
      fs.mkdirSync(path.dirname(backup), { recursive: true });
      fs.copyFileSync(entry.oldFile, backup);
      backups.push({ ...entry, backup });
    }
    let removals = 0;
    for (const entry of [...ownedPaths].sort((left, right) => right.relative.length - left.relative.length)) {
      fs.rmSync(entry.oldFile);
      removals += 1;
      if (Number(process.env.WCBS_TEST_FAIL_MIGRATION_AFTER_REMOVALS ?? 0) === removals) throw new Error("Injected migration removal failure");
    }
    fs.rmSync(legacyFile, { force: true });
    return { ...plan, v2_files: record.files.length };
  } catch (error) {
    const restoreFailures = [];
    for (const entry of backups) {
      try {
        fs.mkdirSync(path.dirname(entry.oldFile), { recursive: true });
        fs.copyFileSync(entry.backup, entry.oldFile);
      } catch { restoreFailures.push(entry.relative); }
    }
    try { uninstall(pluginDir); } catch { /* preserve the original migration error */ }
    if (restoreFailures.length) throw new Error(`CRITICAL: V1 migration failed and restoration was incomplete: ${restoreFailures.join(", ")}`);
    throw error;
  } finally {
    fs.rmSync(stage, { recursive: true, force: true });
  }
}
function usage() {
  console.log("Usage: node scripts/wcbs.mjs <install|doctor|status|migrate|uninstall|verify-activation|skill-eval> [options]");
}

try {
  if (!new Set(["install", "doctor", "status", "migrate", "uninstall", "verify-activation", "skill-eval", "help", "--help"]).has(command)) throw new Error(`Blocked: unknown command ${command}.`);
  if (["help", "--help"].includes(command)) { usage(); }
  else if (command === "skill-eval") {
    emit({ status: "BLOCKED", evidence: "Blocked", message: "Paid skill evaluation requires the pre-registered evaluator command. Run: npm run eval" }, "BLOCKED: run npm run eval for the controlled preflight.");
    process.exitCode = 1;
  } else if (command === "verify-activation") {
    const adapter = resolveTarget();
    const transcript = option("--transcript");
    if (!transcript) {
      emit({ status: "BLOCKED", evidence: "Blocked", target: adapter.runtime_id, message: "A raw transcript from a fresh authenticated runtime session is required. See docs/V2_RUNTIME_EVIDENCE.md." }, "BLOCKED: supply --transcript <fresh-session-response> after completing the documented runtime test.");
      process.exitCode = 1;
    } else {
      const body = fs.readFileSync(path.resolve(transcript), "utf8");
      const marker = adapter.manifest.activation_marker;
      if (!body.includes(marker)) throw new Error(`Blocked: transcript does not contain ${marker}.`);
      emit({ status: "RECORDED_CANDIDATE", evidence: "Likely", target: adapter.runtime_id, marker, message: "Transcript marker was found. Independent replay and evidence review are still required before any Runtime Verified label." }, "RECORDED_CANDIDATE: marker found; independent clean-session replay still required.");
    }
  } else if (command === "status" && !pluginDirInput) {
    const registry = readRegistry();
    emit({ status: "PASS", evidence: "Verified", adapters: registry.adapters.map((adapter) => ({ runtime_id: adapter.runtime_id, designed: adapter.support.designed, verified: adapter.support.verified, label: adapter.support.label })) }, "PASS: WCBS V2 registry is available. Supply --plugin-dir to inspect an installed plugin.");
  } else {
    const pluginDir = assertSafePluginDir(pluginDirInput);
    if (command === "install") {
      const adapter = resolveTarget();
      const record = install(adapter, pluginDir);
      emit({ status: "PASS", evidence: record.evidence, target: record.target, plugin_dir: pluginDir, files: record.files.length }, `PASS: installed ${record.target} plugin into ${pluginDir} (${record.files.length} owned files).`);
    } else if (command === "doctor") {
      const record = doctor(pluginDir);
      emit({ status: "PASS", evidence: "Structurally Verified", target: record.target, plugin_dir: pluginDir, files_checked: record.files.length, runtime_state: "Not Run" }, `PASS: ${record.target} plugin integrity is structurally verified; runtime activation remains Not Run.`);
    } else if (command === "status") {
      const record = doctor(pluginDir);
      emit({ status: "PASS", evidence: "Verified", target: record.target, plugin_dir: pluginDir, installed_evidence: record.evidence, runtime_state: "Not Run", marker: record.marker }, `PASS: ${record.target} plugin is installed; runtime activation remains Not Run.`);
    } else if (command === "uninstall") {
      const record = uninstall(pluginDir);
      emit({ status: "PASS", evidence: "Verified", target: record.target, plugin_dir: pluginDir, files_removed: record.files.length }, `PASS: removed only ${record.files.length} verified WCBS plugin files.`);
    } else if (command === "migrate") {
      const legacyTarget = !target && projectInput && fs.existsSync(path.join(path.resolve(projectInput), ...legacyManifestRel.split("/")))
        ? JSON.parse(fs.readFileSync(path.join(path.resolve(projectInput), ...legacyManifestRel.split("/")), "utf8")).target
        : target;
      const adapter = resolveTarget(legacyTarget);
      const plan = migrate(adapter, pluginDir, projectInput, has("--apply"));
      emit(plan, plan.status === "DRY_RUN" ? "DRY_RUN: V1 ownership is verified; rerun with --apply to migrate." : "PASS: verified V1 ownership migrated to the V2 plugin directory.");
    }
  }
} catch (error) {
  fail(error.message);
}
