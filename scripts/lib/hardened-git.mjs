import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

export const HARDENED_GIT_POLICY_VERSION = "2";

const ENV_ALLOWLIST = ["PATH", "PATHEXT", "SYSTEMROOT", "WINDIR", "COMSPEC", "TMP", "TEMP", "TMPDIR", "LANG", "LC_ALL"];

function createPrivateEmptyHooksDirectory() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-empty-git-hooks-"));
  const stat = fs.lstatSync(directory);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error("Blocked: hardened Git hook directory is not a real directory.");
  fs.chmodSync(directory, 0o700);
  if (fs.readdirSync(directory).length) throw new Error("Blocked: hardened Git hook directory is not empty.");
  return directory;
}

export function hardenedGitEnvironment(source = process.env) {
  const environment = {};
  for (const key of ENV_ALLOWLIST) if (source[key] !== undefined) environment[key] = source[key];
  environment.GIT_CONFIG_NOSYSTEM = "1";
  environment.GIT_CONFIG_GLOBAL = process.platform === "win32" ? "NUL" : "/dev/null";
  environment.GIT_ATTR_NOSYSTEM = "1";
  environment.GIT_OPTIONAL_LOCKS = "0";
  environment.GIT_TERMINAL_PROMPT = "0";
  return environment;
}

function gitExecutable(source = process.env) {
  const configured = source.WCBS_GIT_EXECUTABLE ?? source.GIT_EXECUTABLE;
  if (typeof configured === "string" && configured.trim()) return configured;
  return "git";
}

function policyArguments(hooksDirectory) {
  const nullDevice = process.platform === "win32" ? "NUL" : "/dev/null";
  return [
    "-c", `core.hooksPath=${hooksDirectory}`,
    "-c", "core.fsmonitor=false",
    "-c", `core.attributesFile=${nullDevice}`,
    "-c", "core.autocrlf=false",
    "-c", "core.eol=lf",
    "-c", "protocol.file.allow=never"
  ];
}

export function runHardenedGit(args, { cwd, encoding = "utf8", input, maxBuffer = 256 * 1024 * 1024, timeout, env = process.env, spawn = spawnSync } = {}) {
  if (!Array.isArray(args) || args.some((value) => typeof value !== "string")) throw new Error("Blocked: hardened Git requires a direct string argument array.");
  const hooksDirectory = createPrivateEmptyHooksDirectory();
  try {
    return spawn(gitExecutable(env), [...policyArguments(hooksDirectory), ...args], {
      cwd,
      encoding,
      input,
      maxBuffer,
      timeout,
      env: hardenedGitEnvironment(env),
      windowsHide: true,
      shell: false
    });
  } finally {
    fs.rmSync(hooksDirectory, { recursive: true, force: true });
  }
}

export function requireHardenedGit(args, options = {}, label = "Git operation") {
  const result = runHardenedGit(args, options);
  if (result.status !== 0 || result.error) throw new Error(`Blocked: ${label} failed: ${result.stderr?.toString().trim() || result.error?.message || "git failed"}`);
  return result.stdout;
}

function parseLocalConfig(output) {
  const pairs = [];
  for (const entry of String(output).split("\0").filter(Boolean)) {
    const newline = entry.indexOf("\n");
    const equal = entry.indexOf("=");
    const separator = newline >= 0 ? newline : equal;
    if (separator <= 0) continue;
    pairs.push({ key: entry.slice(0, separator).toLowerCase(), value: entry.slice(separator + 1) });
  }
  return pairs;
}

export function inspectHardenedGitPolicy(root) {
  const local = requireHardenedGit(["config", "--no-includes", "--local", "--null", "--list"], { cwd: root }, "local Git configuration inspection");
  const neutralizedKeys = new Set(["core.hookspath", "core.fsmonitor", "core.attributesfile", "core.autocrlf", "core.eol"]);
  const config = parseLocalConfig(local);
  // These values are explicitly overridden in policyArguments(). Rejecting
  // them would make the immutable archive builder depend on a caller's local
  // checkout preferences even though they cannot affect hardened Git calls.
  const neutralized = config.filter(({ key }) => neutralizedKeys.has(key));
  const blocked = config.filter(({ key }) => key.startsWith("include.") || key === "include" || key.startsWith("filter."));
  if (blocked.length) throw new Error(`Blocked: local Git configuration contains checkout-affecting entries: ${blocked.map(({ key }) => key).join(", ")}.`);
  const names = requireHardenedGit(["ls-tree", "-r", "--name-only", "HEAD"], { cwd: root }, "Git attributes inspection").toString("utf8").split("\n").filter(Boolean);
  for (const name of names.filter((entry) => path.posix.basename(entry) === ".gitattributes")) {
    const attributes = requireHardenedGit(["show", `HEAD:${name}`], { cwd: root }, `Git attributes inspection for ${name}`).toString("utf8");
    if (/(?:^|\s)(?:filter(?:=[^\s]+)?|working-tree-encoding(?:=[^\s]+)?|ident)(?:\s|$)/m.test(attributes)) throw new Error(`Blocked: repository attributes contain a checkout-transforming declaration in ${name}.`);
  }
  return {
    policy_version: HARDENED_GIT_POLICY_VERSION,
    blocked_local_config: [],
    neutralized_local_config: [...new Set(neutralized.map(({ key }) => key))].sort()
  };
}
