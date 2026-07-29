import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { redactValues, runEval } from "./eval-runner.mjs";

const ARM_NAMES = new Set(["neutral", "wcbs", "superpowers"]);
const ALLOWED_ENV = ["PATH", "PATHEXT", "SYSTEMROOT", "WINDIR", "COMSPEC", "TMP", "TEMP", "TMPDIR", "LANG", "LC_ALL", "TERM"];
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const json = (value) => JSON.stringify(value);
const posix = (value) => value.split(path.sep).join("/");
const WINDOWS_SAFE_GIT_TOKEN = /^[A-Za-z0-9._:@/\\{}=+\- ()]+$/;
const WINDOWS_TREE_REVISION = /^(?:HEAD|[a-f0-9]{40})\^\{tree\}$/i;

function now() { return new Date().toISOString(); }

function contained(root, candidate, label) {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(candidate);
  if (resolvedCandidate !== resolvedRoot && !resolvedCandidate.startsWith(`${resolvedRoot}${path.sep}`)) throw new Error(`Blocked: ${label} escapes its containing directory.`);
  return resolvedCandidate;
}

function readJson(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }

function hashFile(file) { return sha256(fs.readFileSync(file)); }

function defaultGitProbe(command, env, platform = process.platform) {
  const result = runGitCommand(["--version"], { git: command, env, platform, encoding: "utf8" });
  return result.status === 0 && !result.error;
}

function windowsEnvironmentValue(env, name) {
  if (env[name] !== undefined) return env[name];
  const key = Object.keys(env).find((candidate) => candidate.toLowerCase() === name.toLowerCase());
  return key === undefined ? undefined : env[key];
}

function normalizeWindowsEnvironment(env) {
  const values = new Map();
  for (const [key, value] of Object.entries(env)) {
    const normalized = key.toLowerCase();
    if (!values.has(normalized)) values.set(normalized, [key, value]);
  }
  for (const key of ["Path", "PATHEXT", "SystemRoot", "WINDIR", "ComSpec", "TMP", "TEMP", "HOME", "USERPROFILE"]) {
    const value = windowsEnvironmentValue(env, key);
    if (value !== undefined) values.set(key.toLowerCase(), [key, value]);
  }
  return Object.fromEntries(values.values());
}

function windowsCmdExecutable(env) {
  const systemRoot = windowsEnvironmentValue(env, "SystemRoot");
  if (typeof systemRoot !== "string" || !path.win32.isAbsolute(systemRoot)) throw new Error("Blocked: Windows Git launcher requires an absolute SystemRoot.");
  return path.win32.join(systemRoot, "System32", "cmd.exe");
}

function windowsSystemDirectory(env) { return path.win32.dirname(windowsCmdExecutable(env)); }

function trustedWindowsCommandEnvironment(env) {
  const systemDirectory = windowsSystemDirectory(env);
  const systemRoot = path.win32.dirname(systemDirectory);
  return {
    SystemRoot: systemRoot,
    WINDIR: systemRoot,
    Path: systemDirectory,
    PATHEXT: ".COM;.EXE;.BAT;.CMD"
  };
}

function windowsGitArguments(args, cwd) {
  if (cwd === undefined) return args;
  if (typeof cwd !== "string" || !path.win32.isAbsolute(cwd)) throw new Error("Blocked: Windows Git source directory must be an absolute path.");
  return ["-C", cwd, ...args];
}

function gitForWindowsCandidates(env) {
  const roots = ["ProgramW6432", "ProgramFiles", "ProgramFiles(x86)"].map((name) => windowsEnvironmentValue(env, name))
    .filter((root) => typeof root === "string" && path.win32.isAbsolute(root));
  return [...new Set([
    ...roots.map((root) => path.win32.join(root, "Git", "bin", "git.exe")),
    ...roots.map((root) => path.win32.join(root, "Git", "cmd", "git.exe"))
  ])];
}

export function resolveGitExecutable({ env = process.env, platform = process.platform, exists = fs.existsSync, probe = (command, probeEnv) => defaultGitProbe(command, probeEnv, platform) } = {}) {
  const configured = [env.WCBS_GIT_EXECUTABLE, env.GIT_EXECUTABLE].filter((command) => typeof command === "string" && command.trim());
  for (const command of configured) if (probe(command, env)) return command;
  if (platform === "win32") {
    for (const command of gitForWindowsCandidates(env)) if (exists(command)) return command;
  }
  const pathCommands = platform === "win32" ? ["git.exe", "git"] : ["git"];
  for (const command of pathCommands) if (probe(command, env)) return command;
  throw new Error("Blocked: Git executable is unavailable. Configure WCBS_GIT_EXECUTABLE or make Git available on PATH.");
}

function quoteWindowsGitToken(value, label, allowTreeRevision = false) {
  if (typeof value !== "string" || !value) throw new Error(`Blocked: ${label} must be a non-empty string.`);
  if (!WINDOWS_SAFE_GIT_TOKEN.test(value) && !(allowTreeRevision && WINDOWS_TREE_REVISION.test(value))) {
    throw new Error(`Blocked: ${label} contains characters unsafe for the Windows Git launcher.`);
  }
  return `"${value.replace(/\^/g, "^^")}"`;
}

export function createGitInvocation(args, { git, env = process.env, platform = process.platform } = {}) {
  if (!Array.isArray(args) || args.some((arg) => typeof arg !== "string")) throw new Error("Blocked: Git arguments must be a string array.");
  const executable = git ?? resolveGitExecutable({ env, platform });
  if (platform !== "win32") return { command: executable, args: [...args] };
  const command = [
    quoteWindowsGitToken(executable, "Git executable"),
    ...args.map((arg) => quoteWindowsGitToken(arg, "Git argument", true))
  ].join(" ");
  windowsCmdExecutable(env);
  return {
    command: "cmd.exe",
    args: ["/d", "/v:off", "/s", "/c", `"${command}"`]
  };
}

export function runGitCommand(args, { cwd, env = process.env, platform = process.platform, git, encoding = "utf8", input, maxBuffer, timeout, spawn = spawnSync, currentDirectory = process.cwd, changeDirectory = process.chdir } = {}) {
  const windows = platform === "win32";
  const invocation = createGitInvocation(windows ? windowsGitArguments(args, cwd) : args, { git, env, platform });
  const options = {
    cwd: windows ? windowsSystemDirectory(env) : cwd,
    encoding,
    input,
    maxBuffer,
    timeout,
    windowsHide: true
  };
  if (windows) options.env = trustedWindowsCommandEnvironment(env);
  else options.env = env;
  if (!windows) return spawn(invocation.command, invocation.args, options);
  const originalDirectory = currentDirectory();
  changeDirectory(options.cwd);
  try { return spawn(invocation.command, invocation.args, options); }
  finally { changeDirectory(originalDirectory); }
}

function templateValues(context) {
  return {
    "{{workspace}}": context.workspace,
    "{{plugin_dir}}": context.plugin_dir,
    "{{superpowers_dir}}": context.superpowers_dir ?? "",
    "{{prompt}}": context.prompt ?? ""
  };
}

function templateCommand(template, context, label) {
  if (!template || typeof template.command !== "string" || !template.command || !Array.isArray(template.arguments)) throw new Error(`Blocked: ${label} must declare a command and argument array.`);
  const values = templateValues(context);
  const tokens = [template.command, ...template.arguments];
  const placeholders = tokens.flatMap((token) => Object.keys(values).filter((needle) => String(token).includes(needle)));
  if (label.includes("loader") && placeholders.length !== 1) throw new Error(`Blocked: ${label} must contain exactly one runtime workspace placeholder.`);
  const interpolate = (token) => {
    let output = String(token);
    for (const [needle, value] of Object.entries(values)) output = output.split(needle).join(value);
    if (/\{\{[^}]+\}\}/.test(output)) throw new Error(`Blocked: ${label} contains an unknown placeholder.`);
    return output;
  };
  return { command: interpolate(template.command), arguments: template.arguments.map(interpolate) };
}

function runGit(root, args) {
  try {
    const result = runGitCommand(args, { cwd: root, encoding: "utf8" });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      const error = new Error(result.stderr?.toString().trim() || `git exited ${result.status}`);
      error.stderr = result.stderr;
      throw error;
    }
    return result.stdout.trim();
  }
  catch (error) { throw new Error(`Blocked: git ${args.join(" ")} failed: ${error.stderr?.toString().trim() || error.message}`); }
}

function verifyGitIdentity(source, identity, label, revision = "HEAD") {
  if (!identity?.commit || !identity?.tree) throw new Error(`Blocked: ${label} identity requires commit and tree.`);
  const commit = runGit(source, ["rev-parse", revision]);
  const tree = runGit(source, ["rev-parse", `${revision}^{tree}`]);
  if (commit !== identity.commit) throw new Error(`Blocked: ${label} commit mismatch; expected ${identity.commit}, received ${commit}.`);
  if (tree !== identity.tree) throw new Error(`Blocked: ${label} tree mismatch; expected ${identity.tree}, received ${tree}.`);
  return { commit, tree };
}

function archiveGitRevision(source, revision, destination, label) {
  contained(path.dirname(destination), destination, `${label} destination`);
  fs.mkdirSync(destination, { recursive: true });
  const archive = runGitCommand(["archive", "--format=tar", revision], { cwd: source, encoding: null, maxBuffer: 128 * 1024 * 1024 });
  if (archive.status !== 0 || !archive.stdout?.length) throw new Error(`Blocked: could not archive ${label} revision ${revision}: ${archive.stderr?.toString() || "no archive output"}`);
  const extract = spawnSync("tar", ["-xf", "-", "-C", destination], { input: archive.stdout, encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });
  if (extract.status !== 0) throw new Error(`Blocked: could not extract ${label} archive: ${extract.stderr || "tar failed"}`);
}

function sourceFileManifest(directory, root = directory) {
  const files = [];
  const walk = (absolute) => {
    for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
      if ([".git", "node_modules", "__pycache__"].includes(entry.name)) continue;
      const child = path.join(absolute, entry.name);
      const stat = fs.lstatSync(child);
      if (stat.isSymbolicLink()) throw new Error(`Blocked: evidence workspace contains a symbolic link: ${posix(path.relative(root, child))}`);
      if (stat.isDirectory()) walk(child);
      else if (stat.isFile()) files.push({ path: posix(path.relative(root, child)), sha256: hashFile(child), bytes: stat.size });
      else throw new Error(`Blocked: evidence workspace contains an unsupported entry: ${posix(path.relative(root, child))}`);
    }
  };
  walk(directory);
  return files.sort((left, right) => left.path.localeCompare(right.path));
}

function diffManifests(before, after) {
  const oldMap = new Map(before.map((entry) => [entry.path, entry]));
  const newMap = new Map(after.map((entry) => [entry.path, entry]));
  const added = after.filter((entry) => !oldMap.has(entry.path));
  const removed = before.filter((entry) => !newMap.has(entry.path));
  const modified = after.filter((entry) => oldMap.has(entry.path) && oldMap.get(entry.path).sha256 !== entry.sha256);
  return { added, removed, modified };
}

function protectedVariants(value) {
  return [value, Buffer.from(value, "utf8").toString("base64"), encodeURIComponent(value), JSON.stringify(value).slice(1, -1)].filter(Boolean);
}

function assertNoProtectedValue(directory, protectedValue) {
  if (!protectedValue) return;
  const variants = protectedVariants(protectedValue);
  for (const entry of sourceFileManifest(directory)) {
    const body = fs.readFileSync(path.join(directory, ...entry.path.split("/")));
    const text = body.toString("utf8");
    if (variants.some((variant) => text.includes(variant))) throw new Error(`Blocked: protected credential material was found in retained workspace evidence: ${entry.path}`);
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
}

function canonicalManifestContent(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) throw new Error("Blocked: run manifest must be an object before its self-hash can be verified.");
  const { manifest_sha256: _selfHash, ...content } = manifest;
  return json(content);
}

export function manifestSelfHash(manifest) {
  return sha256(canonicalManifestContent(manifest));
}

export function validateManifestSelfHash(manifest) {
  const stored = manifest?.manifest_sha256;
  if (typeof stored !== "string" || !/^[a-f0-9]{64}$/.test(stored)) throw new Error("Blocked: run manifest self-hash is missing or malformed.");
  const expected = manifestSelfHash(manifest);
  if (stored !== expected) throw new Error("Blocked: run manifest self-hash does not match its final content.");
  return expected;
}

function sanitizeEnvironment(profileDirectory, credential, credentialName) {
  const env = {};
  for (const key of ALLOWED_ENV) if (process.env[key] !== undefined) env[key] = process.env[key];
  env.HOME = profileDirectory;
  env.USERPROFILE = profileDirectory;
  if (credential) env[credentialName] = credential;
  return process.platform === "win32" ? normalizeWindowsEnvironment(env) : env;
}

function executeSetup(command, cwd, timeoutMs, protectedValue, profileDirectory, credentialName) {
  const started_utc = now();
  const result = spawnSync(command.command, command.arguments, { cwd, env: sanitizeEnvironment(profileDirectory, protectedValue, credentialName), encoding: "utf8", timeout: timeoutMs, windowsHide: true });
  const stdout = redactValues(result.stdout ?? "", protectedValue ? [protectedValue] : []);
  const stderr = redactValues(result.stderr ?? "", protectedValue ? [protectedValue] : []);
  return {
    command: [command.command, ...command.arguments],
    started_utc,
    finished_utc: now(),
    exit_code: result.status,
    signal: result.signal ?? null,
    timed_out: result.error?.code === "ETIMEDOUT",
    tool_error: result.error?.code === "ETIMEDOUT" ? null : result.error?.message ?? null,
    stdout,
    stderr
  };
}

function validateTemplate(template, label, blockers) {
  if (!template || typeof template.command !== "string" || !Array.isArray(template.arguments)) blockers.push(`${label} is missing a command template.`);
}

function countPlaceholder(template, placeholder) {
  if (!template) return 0;
  return JSON.stringify([template.command, ...template.arguments]).split(placeholder).length - 1;
}

function validatePinnedFile(root, pin, label, blockers) {
  if (!pin?.path || !pin?.sha256) { blockers.push(`${label} requires a path and sha256.`); return; }
  try {
    const file = contained(root, path.join(root, ...pin.path.split("/")), label);
    if (!fs.existsSync(file)) throw new Error("file is missing.");
    if (hashFile(file) !== pin.sha256) throw new Error("file hash does not match the preregistration.");
  } catch (error) {
    blockers.push(`${label} validation failed: ${error.message}`);
  }
}

function validateLockedControlProject(root, protocol, blockers) {
  if (!protocol?.control_project_root || !protocol?.control_project_manifest || !protocol?.control_project_manifest_sha256) {
    blockers.push("Protocol must pin the control project root, manifest path, and manifest hash.");
    return;
  }
  try {
    const manifestPath = contained(root, path.join(root, ...protocol.control_project_manifest.split("/")), "control project manifest");
    if (!fs.existsSync(manifestPath)) throw new Error("manifest is missing.");
    if (hashFile(manifestPath) !== protocol.control_project_manifest_sha256) throw new Error("manifest hash does not match the preregistration.");
    const manifest = readJson(manifestPath);
    if (manifest.root !== protocol.control_project_root) throw new Error("manifest root does not match the preregistration.");
    const controlRoot = contained(root, path.join(root, ...protocol.control_project_root.split("/")), "control project root");
    if (!fs.existsSync(controlRoot)) throw new Error("control project root is missing.");
    const actual = sourceFileManifest(controlRoot).map(({ path: filePath, sha256: fileSha256 }) => ({ path: filePath, sha256: fileSha256 }));
    const declared = Array.isArray(manifest.files) ? manifest.files.slice().sort((left, right) => left.path.localeCompare(right.path)) : [];
    if (!declared.length || json(actual) !== json(declared)) throw new Error("control project files or hashes drift from its manifest.");
    for (const forbidden of manifest.forbidden_baseline_entries ?? []) {
      const candidate = contained(controlRoot, path.join(controlRoot, ...String(forbidden).split("/")), "forbidden baseline entry");
      if (fs.existsSync(candidate)) throw new Error(`control project contains forbidden baseline entry ${forbidden}.`);
    }
  } catch (error) {
    blockers.push(`Locked control project validation failed: ${error.message}`);
  }
}

export function preflightProtocol({ root, protocol, superpowers_source = null, strict = false }) {
  const blockers = [];
  const cases = protocol?.cases ?? [];
  if (!protocol || !Array.isArray(protocol.arms) || protocol.arms.length < 2 || new Set(protocol.arms).size !== protocol.arms.length || protocol.arms.some((arm) => !ARM_NAMES.has(arm))) blockers.push("Protocol arms must be a unique declared subset of neutral, wcbs, and superpowers.");
  if (!protocol?.arms?.includes("neutral")) blockers.push("Protocol must include a neutral arm.");
  if (!Array.isArray(cases) || !cases.length) blockers.push("Protocol must include locked evaluation cases.");
  const caseIds = new Set();
  for (const testCase of cases) {
    if (!testCase?.id || typeof testCase.prompt !== "string" || !testCase.prompt.trim() || !Array.isArray(testCase.criteria) || !testCase.criteria.length || caseIds.has(testCase.id)) blockers.push("Every locked case requires a unique id, non-empty prompt, and non-empty criteria array.");
    caseIds.add(testCase?.id);
  }
  if (!Number.isSafeInteger(protocol?.repetitions) || protocol.repetitions <= 0) blockers.push("Protocol repetitions must be a positive integer.");
  const expected = Array.isArray(protocol?.arms) && Array.isArray(cases) ? protocol.arms.length * cases.length * protocol.repetitions : null;
  if (protocol?.expected_total_runs !== expected) blockers.push(`Protocol expected_total_runs must equal cases × arms × repetitions (${expected}).`);
  const identity = protocol?.execution_identity;
  if (!identity?.agent_version || !identity?.model_id) blockers.push("Execution identity requires immutable agent_version and model_id.");
  if (!identity?.credential_name) blockers.push("Execution identity requires a credential_name; credential values are never preregistered.");
  validateTemplate(identity?.agent_command_template, "Agent", blockers);
  if (identity?.agent_command_template && (countPlaceholder(identity.agent_command_template, "{{workspace}}") !== 1 || countPlaceholder(identity.agent_command_template, "{{prompt}}") !== 1)) blockers.push("Agent command template must use exactly one {{workspace}} and one {{prompt}} placeholder.");
  if (identity?.model_id && /^(latest|sonnet|opus|haiku)$/i.test(identity.model_id)) blockers.push("Execution identity model_id must be a full immutable identifier, not an alias.");
  if (!Number.isSafeInteger(protocol?.timeout_ms) || protocol.timeout_ms <= 0 || protocol.timeout_ms > 3_600_000) blockers.push("Protocol timeout_ms must be a positive integer at most 3600000.");
  if (!protocol?.failure_policy?.timeout || !protocol?.failure_policy?.tool_error || !protocol?.failure_policy?.invalid_artifact || !protocol?.failure_policy?.missing_score) blockers.push("Protocol must lock timeout, tool_error, invalid_artifact, and missing_score policies.");
  if (!protocol?.scoring_rubric?.path || !protocol?.scoring_rubric?.sha256) blockers.push("Protocol must pin a scoring rubric path and hash.");
  validatePinnedFile(root, protocol?.scoring_rubric, "Scoring rubric", blockers);
  if (!protocol?.analysis || protocol.analysis.bootstrap_resamples !== 10_000) blockers.push("Protocol must lock exactly 10000 bootstrap resamples.");
  validateLockedControlProject(root, protocol, blockers);
  if (protocol?.arms?.includes("wcbs")) {
    try { verifyGitIdentity(root, protocol.wcbs_candidate, "WCBS candidate", protocol.wcbs_candidate?.commit); }
    catch (error) { blockers.push(error.message); }
    const template = protocol.arm_loader_templates?.wcbs;
    validateTemplate(template, "WCBS runtime loader", blockers);
    if (template && countPlaceholder(template, "{{plugin_dir}}") !== 1) blockers.push("WCBS runtime loader must use exactly one {{plugin_dir}} placeholder.");
    if (identity?.agent_command_template && countPlaceholder(identity.agent_command_template, "{{plugin_dir}}") !== 1) blockers.push("WCBS agent command template must use exactly one {{plugin_dir}} placeholder so the staged loader can affect the agent process.");
  }
  if (protocol?.arms?.includes("superpowers")) {
    if (!superpowers_source) blockers.push("--superpowers-source is required for a Superpowers protocol.");
    else {
      try { verifyGitIdentity(superpowers_source, protocol.superpowers_source_identity, "Superpowers source"); }
      catch (error) { blockers.push(error.message); }
    }
    const template = protocol.arm_loader_templates?.superpowers;
    validateTemplate(template, "Superpowers runtime loader", blockers);
    if (template && countPlaceholder(template, "{{superpowers_dir}}") !== 1) blockers.push("Superpowers runtime loader must use exactly one {{superpowers_dir}} placeholder.");
    if (identity?.agent_command_template && countPlaceholder(identity.agent_command_template, "{{superpowers_dir}}") !== 1) blockers.push("Superpowers agent command template must use exactly one {{superpowers_dir}} placeholder so the staged loader can affect the agent process.");
  }
  return { status: blockers.length ? "BLOCKED" : "PASS", blockers, expected_total_runs: expected };
}

export function deterministicUnitInterval(seed, counter) {
  const hex = sha256(`${seed}:${counter}`).slice(0, 13);
  return Number.parseInt(hex, 16) / 0x10000000000000;
}

export function createRandomSchedule({ protocol, cases = protocol.cases, seed }) {
  if (typeof seed !== "string" || seed.length < 8) throw new Error("Blocked: execute-mode seed must be a safe non-empty string of at least eight characters.");
  const records = [];
  for (const testCase of cases) {
    for (const arm of protocol.arms) {
      for (let repetition = 0; repetition < protocol.repetitions; repetition += 1) records.push({
        case_id: testCase.id,
        arm,
        repetition,
        run_id: sha256(`${protocol.protocol_id}:${testCase.id}:${arm}:${repetition}`).slice(0, 20)
      });
    }
  }
  for (let index = records.length - 1, counter = 0; index > 0; index -= 1, counter += 1) {
    const replacement = Math.floor(deterministicUnitInterval(seed, counter) * (index + 1));
    [records[index], records[replacement]] = [records[replacement], records[index]];
  }
  return { seed, records, schedule_sha256: sha256(json(records)) };
}

function profileDirectoryFor(runDirectory, runId) {
  return contained(runDirectory, path.join(runDirectory, "profiles", runId), "runtime profile");
}

function stageWorkspace({ root, protocol, record, runDirectory, superpowersSource, protectedValue }) {
  const workspaces = contained(runDirectory, path.join(runDirectory, "workspaces"), "workspaces directory");
  const workspace = contained(workspaces, path.join(workspaces, record.run_id), "workspace");
  const sources = contained(runDirectory, path.join(runDirectory, "sources"), "sources directory");
  fs.mkdirSync(workspace, { recursive: true });
  fs.cpSync(path.join(root, ...protocol.control_project_root.split("/")), workspace, { recursive: true });
  const initialManifest = sourceFileManifest(workspace);
  const profileDirectory = profileDirectoryFor(runDirectory, record.run_id);
  fs.mkdirSync(profileDirectory, { recursive: true, mode: 0o700 });
  try { fs.chmodSync(profileDirectory, 0o700); } catch {}
  const result = { workspace, initialManifest, profileDirectory, installation: null, loader: null, candidate: null, superpowers: null, setup_failures: [] };
  const pluginDir = contained(workspace, path.join(workspace, ".wcbs-evaluation", "plugins", record.arm), "plugin directory");
  if (record.arm === "wcbs") {
    const source = contained(sources, path.join(sources, `wcbs-${record.run_id}`), "WCBS source");
    archiveGitRevision(root, protocol.wcbs_candidate.commit, source, "WCBS candidate");
    result.candidate = { ...protocol.wcbs_candidate, source: posix(path.relative(runDirectory, source)) };
    const command = [process.execPath, path.join(source, "scripts", "wcbs.mjs"), "install", "--target", protocol.runtime_id, "--plugin-dir", pluginDir, "--json"];
    const installation = executeSetup({ command: command[0], arguments: command.slice(1) }, source, protocol.timeout_ms, protectedValue, profileDirectory, protocol.execution_identity.credential_name);
    result.installation = installation;
    if (installation.exit_code !== 0 || installation.timed_out || installation.tool_error) result.setup_failures.push("wcbs_installation");
  }
  if (record.arm === "superpowers") {
    const source = contained(sources, path.join(sources, `superpowers-${record.run_id}`), "Superpowers source");
    archiveGitRevision(superpowersSource, protocol.superpowers_source_identity.commit, source, "Superpowers source");
    result.superpowers = { ...protocol.superpowers_source_identity, source: posix(path.relative(runDirectory, source)) };
  }
  if (record.arm !== "neutral") {
    const command = templateCommand(protocol.arm_loader_templates[record.arm], { workspace, plugin_dir: pluginDir, superpowers_dir: result.superpowers ? path.join(runDirectory, result.superpowers.source) : "" }, `${record.arm} loader`);
    result.loader = executeSetup(command, workspace, protocol.timeout_ms, protectedValue, profileDirectory, protocol.execution_identity.credential_name);
    if (result.loader.exit_code !== 0 || result.loader.timed_out || result.loader.tool_error) result.setup_failures.push(`${record.arm}_loader`);
  }
  return result;
}

function retainedFailure(recordDirectory, record, category, reason) {
  const failureFile = path.join(recordDirectory, "failure.json");
  writeJson(failureFile, { category, reason, failure_as_data: true });
  record.artifacts.failure = posix(path.relative(path.dirname(path.dirname(recordDirectory)), failureFile));
}

export async function executeProtocol({ root, protocol, run_id, run_directory, seed, credential, superpowers_source = null, after_preflight = null }) {
  const completeProtocol = { ...protocol, seed };
  const preflight = preflightProtocol({ root, protocol: completeProtocol, superpowers_source, strict: true });
  if (preflight.status !== "PASS") return { status: "BLOCKED", blockers: preflight.blockers };
  if (!credential || String(credential).length < 12) return { status: "BLOCKED", blockers: ["A protected test or evaluation credential value of at least twelve characters is required for execute mode."] };
  if (after_preflight) after_preflight();
  const runDirectory = contained(path.dirname(run_directory), run_directory, "run directory");
  if (fs.existsSync(runDirectory)) throw new Error(`Blocked: evaluation run directory already exists: ${runDirectory}`);
  fs.mkdirSync(runDirectory, { recursive: true, mode: 0o700 });
  const schedule = createRandomSchedule({ protocol: completeProtocol, seed });
  const manifest = {
    schema_version: 1,
    run_id,
    created_utc: now(),
    protocol_id: protocol.protocol_id,
    protocol_sha256: sha256(json(protocol)),
    execution_identity: { ...protocol.execution_identity, credential_name: protocol.execution_identity.credential_name },
    wcbs_candidate: protocol.wcbs_candidate ?? null,
    superpowers_source_identity: protocol.superpowers_source_identity ?? null,
    schedule,
    records: []
  };
  writeJson(path.join(runDirectory, "run-manifest.json"), manifest);
  const caseMap = new Map(protocol.cases.map((entry) => [entry.id, entry]));
  for (const scheduled of schedule.records) {
    const testCase = caseMap.get(scheduled.case_id);
    const recordDirectory = contained(runDirectory, path.join(runDirectory, "records", scheduled.run_id), "record directory");
    fs.mkdirSync(recordDirectory, { recursive: true });
    const record = { ...scheduled, prompt: testCase.prompt, criteria: testCase.criteria, started_utc: now(), status: "Failed", artifacts: {} };
    let staged = null;
    try {
      staged = stageWorkspace({ root, protocol, record: scheduled, runDirectory, superpowersSource: superpowers_source, protectedValue: credential });
      const superpowersDir = staged.superpowers ? path.join(runDirectory, staged.superpowers.source) : "";
      const agent = templateCommand(protocol.execution_identity.agent_command_template, { workspace: staged.workspace, plugin_dir: path.join(staged.workspace, ".wcbs-evaluation", "plugins", scheduled.arm), superpowers_dir: superpowersDir, prompt: testCase.prompt }, "agent command");
      const transcriptFile = contained(runDirectory, path.join(recordDirectory, "transcript.json"), "transcript");
      const transcript = await runEval({ command: agent.command, args: agent.arguments, cwd: staged.workspace, transcriptPath: transcriptFile, credential, credentialName: protocol.execution_identity.credential_name, timeoutMs: protocol.timeout_ms, profileDirectory: staged.profileDirectory });
      const verification = protocol.verification_command_template
        ? executeSetup(templateCommand(protocol.verification_command_template, { workspace: staged.workspace, plugin_dir: path.join(staged.workspace, ".wcbs-evaluation", "plugins", scheduled.arm), superpowers_dir: superpowersDir }, "verification command"), staged.workspace, protocol.timeout_ms, credential, staged.profileDirectory, protocol.execution_identity.credential_name)
        : null;
      const finalManifest = sourceFileManifest(staged.workspace);
      assertNoProtectedValue(staged.workspace, credential);
      const workspaceManifest = path.join(recordDirectory, "workspace-manifest.json");
      const workspaceDiff = path.join(recordDirectory, "workspace-diff.json");
      writeJson(workspaceManifest, finalManifest);
      writeJson(workspaceDiff, diffManifests(staged.initialManifest, finalManifest));
      const failed = staged.setup_failures.length || transcript.exit_code !== 0 || transcript.timed_out || transcript.tool_error || (verification && (verification.exit_code !== 0 || verification.timed_out || verification.tool_error));
      record.status = failed ? "Failed" : "Complete";
      if (failed) {
        record.failure_as_data = true;
        record.failure_category = staged.setup_failures.length ? "setup_failure" : transcript.timed_out ? "timeout" : transcript.tool_error || transcript.exit_code !== 0 ? "tool_error" : "verification_failure";
      }
      record.agent_command = transcript.command;
      record.installation = staged.installation;
      record.loader = staged.loader;
      record.candidate = staged.candidate;
      record.superpowers = staged.superpowers;
      record.verification = verification;
      record.artifacts = {
        transcript: posix(path.relative(runDirectory, transcriptFile)),
        transcript_sha256: hashFile(transcriptFile),
        workspace_manifest: posix(path.relative(runDirectory, workspaceManifest)),
        workspace_diff: posix(path.relative(runDirectory, workspaceDiff))
      };
      if (failed) retainedFailure(recordDirectory, record, record.failure_category, "The scheduled attempt completed with a locked failure policy outcome.");
    } catch (error) {
      record.status = "Failed";
      record.failure_as_data = true;
      record.failure_category = "attempt_error";
      record.reason = redactValues(error.message, [credential]);
      retainedFailure(recordDirectory, record, record.failure_category, record.reason);
    } finally {
      const profileDirectory = staged?.profileDirectory ?? profileDirectoryFor(runDirectory, scheduled.run_id);
      if (fs.existsSync(profileDirectory)) {
        try {
          assertNoProtectedValue(profileDirectory, credential);
        } catch (error) {
          record.status = "Failed";
          record.failure_as_data = true;
          record.failure_category = "profile_containment";
          record.reason = redactValues(error.message, [credential]);
          retainedFailure(recordDirectory, record, record.failure_category, record.reason);
        } finally {
          fs.rmSync(profileDirectory, { recursive: true, force: true });
        }
      }
    }
    record.finished_utc = now();
    manifest.records.push(record);
    writeJson(path.join(recordDirectory, "record.json"), record);
    writeJson(path.join(runDirectory, "run-manifest.json"), manifest);
  }
  const unique = new Set(manifest.records.map((record) => record.run_id));
  if (manifest.records.length !== schedule.records.length || unique.size !== schedule.records.length) throw new Error("Blocked: scheduled evaluation records are incomplete or duplicated.");
  manifest.execution_outcome = manifest.records.some((record) => record.status !== "Complete") ? "COMPLETE_WITH_FAILURES" : "COMPLETE";
  manifest.completed_utc = now();
  manifest.manifest_sha256 = manifestSelfHash(manifest);
  writeJson(path.join(runDirectory, "run-manifest.json"), manifest);
  return { status: "PASS", manifest, run_directory: runDirectory };
}

function scrubArmIdentity(value) {
  if (typeof value === "string") return value.replace(/wcbs|superpowers|neutral/gi, "[ARM]");
  if (Array.isArray(value)) return value.map(scrubArmIdentity);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([key]) => key !== "arm").map(([key, item]) => [key, scrubArmIdentity(item)]));
  return value;
}

export function createBlindedJudgePackets({ run_directory, manifest = readJson(path.join(run_directory, "run-manifest.json")) }) {
  validateManifestSelfHash(manifest);
  const packetsDirectory = contained(run_directory, path.join(run_directory, "judge-packets"), "judge packet directory");
  fs.mkdirSync(packetsDirectory, { recursive: true });
  const mapping = [];
  const packets = manifest.records.map((record, index) => {
    const packet_id = `packet-${String(index + 1).padStart(4, "0")}-${sha256(`${manifest.schedule.schedule_sha256}:${record.run_id}`).slice(0, 12)}`;
    const artifact_errors = [];
    const readArtifact = (relative, label) => {
      if (!relative) return null;
      try { return readJson(contained(run_directory, path.join(run_directory, relative), "judge artifact")); }
      catch (error) {
        artifact_errors.push({ artifact: label, reason: error.message });
        return null;
      }
    };
    const packet = scrubArmIdentity({
      packet_id,
      case_id: record.case_id,
      repetition: record.repetition,
      prompt: record.prompt,
      criteria: record.criteria,
      status: record.status,
      transcript: readArtifact(record.artifacts?.transcript, "transcript"),
      workspace_manifest: readArtifact(record.artifacts?.workspace_manifest, "workspace_manifest"),
      workspace_diff: readArtifact(record.artifacts?.workspace_diff, "workspace_diff"),
      failure: readArtifact(record.artifacts?.failure, "failure"),
      verification: record.verification ? { exit_code: record.verification.exit_code, signal: record.verification.signal, timed_out: record.verification.timed_out, tool_error: record.verification.tool_error, stdout: record.verification.stdout, stderr: record.verification.stderr } : null,
      failure_as_data: record.status !== "Complete" || artifact_errors.length > 0,
      artifact_errors
    });
    const packetPath = path.join(packetsDirectory, `${packet_id}.json`);
    writeJson(packetPath, packet);
    mapping.push({ packet_id, run_id: record.run_id, arm: record.arm });
    return { packet_id, packet_path: posix(path.relative(run_directory, packetPath)) };
  });
  writeJson(path.join(run_directory, "blind-map.json"), { schema_version: 1, mapping });
  return packets;
}

function validScore(entry) {
  return entry && typeof entry.packet_id === "string" && typeof entry.success === "boolean" && typeof entry.safety === "boolean" && typeof entry.correctness === "boolean";
}

function zeroScore(packet_id, actorField, actorId, reason) {
  return { packet_id, [actorField]: actorId, success: false, safety: false, correctness: false, reason };
}

function normalizeLedger(ledger, expected, index, blockers) {
  if (!Array.isArray(ledger) || !ledger.length) { blockers.push(`Judge ledger ${index + 1} is empty or not an array.`); return { judge_id: null, scores: [] }; }
  const judgeIds = new Set(ledger.map((entry) => entry?.judge_id).filter((value) => typeof value === "string" && value));
  if (judgeIds.size !== 1) blockers.push(`Judge ledger ${index + 1} must contain exactly one judge_id.`);
  const judge_id = judgeIds.values().next().value ?? null;
  const seen = new Set();
  const scores = [];
  for (const entry of ledger) {
    if (!entry?.packet_id || !expected.has(entry.packet_id) || seen.has(entry.packet_id)) { blockers.push(`Judge ledger ${index + 1} has an unknown or duplicate packet score.`); continue; }
    seen.add(entry.packet_id);
    scores.push(validScore(entry) && entry.judge_id === judge_id
      ? entry
      : zeroScore(entry.packet_id, "judge_id", judge_id, "invalid_score"));
  }
  for (const packet_id of expected) if (!seen.has(packet_id)) scores.push(zeroScore(packet_id, "judge_id", judge_id, "missing_score"));
  return { judge_id, scores };
}

function normalizeAdjudications(adjudications, expected, judgeIds, blockers) {
  if (!Array.isArray(adjudications) || !adjudications.length) { blockers.push("Adjudication ledger is empty or not an array."); return []; }
  const adjudicatorIds = new Set(adjudications.map((entry) => entry?.adjudicator_id).filter((value) => typeof value === "string" && value));
  if (adjudicatorIds.size !== 1) blockers.push("Adjudication ledger must contain exactly one adjudicator_id.");
  const adjudicator_id = adjudicatorIds.values().next().value ?? null;
  if (judgeIds.has(adjudicator_id)) blockers.push("The adjudicator must not be either independent judge.");
  const seen = new Set();
  const normalized = [];
  for (const entry of adjudications) {
    if (!entry?.packet_id || !expected.has(entry.packet_id) || seen.has(entry.packet_id)) { blockers.push("Adjudication has an unknown or duplicate packet score."); continue; }
    seen.add(entry.packet_id);
    normalized.push(validScore(entry) && entry.adjudicator_id === adjudicator_id && entry.reason
      ? entry
      : zeroScore(entry.packet_id, "adjudicator_id", adjudicator_id, "missing_score"));
  }
  for (const packet_id of expected) if (!seen.has(packet_id)) normalized.push(zeroScore(packet_id, "adjudicator_id", adjudicator_id, "missing_score"));
  return normalized;
}

export function validateScoreLedgers({ packet_ids, judge_ledgers, adjudications, failed_packet_ids = [] }) {
  const blockers = [];
  if (!Array.isArray(packet_ids) || !packet_ids.length) blockers.push("No blinded packets were supplied for scoring.");
  if (!Array.isArray(judge_ledgers) || judge_ledgers.length !== 2) blockers.push("Exactly two independent judge ledgers are required.");
  const expected = new Set(packet_ids ?? []);
  const normalizedLedgers = (judge_ledgers ?? []).map((ledger, index) => normalizeLedger(ledger, expected, index, blockers));
  const judgeIds = new Set(normalizedLedgers.map((ledger) => ledger.judge_id).filter(Boolean));
  if (judgeIds.size !== 2 || normalizedLedgers.some((ledger) => !ledger.judge_id)) blockers.push("The two ledgers must come from distinct single judges.");
  const normalizedAdjudications = normalizeAdjudications(adjudications, expected, judgeIds, blockers);
  const failed = new Set(failed_packet_ids);
  const adjudicated = normalizedAdjudications.map((entry) => failed.has(entry.packet_id)
    ? zeroScore(entry.packet_id, "adjudicator_id", entry.adjudicator_id, "scheduled_failure")
    : entry);
  return { status: blockers.length ? "BLOCKED" : "PASS", blockers, adjudications: adjudicated, judge_ledgers: normalizedLedgers.map((ledger) => ledger.scores) };
}

function percentile(values, percentileValue) {
  const index = Math.max(0, Math.min(values.length - 1, Math.floor((values.length - 1) * percentileValue)));
  return values[index];
}

function aggregate(records, cases, field) {
  return cases.reduce((total, testCase) => {
    const entries = records.filter((entry) => entry.case_id === testCase.id);
    return total + entries.reduce((sum, entry) => sum + (entry[field] ? 1 : 0), 0) / entries.length;
  }, 0) / cases.length;
}

export function analyzeAdjudicatedScores({ protocol, cases, records, adjudications, manifest_hash, failed_packet_ids = [] }) {
  const adjudicationMap = new Map(adjudications.map((entry) => [entry.packet_id, entry]));
  const failed = new Set(failed_packet_ids);
  const completed = records.map((record) => {
    const adjudication = adjudicationMap.get(record.packet_id) ?? {};
    return record.status === "Failed" || failed.has(record.packet_id)
      ? { ...record, ...adjudication, success: false, safety: false, correctness: false }
      : { ...record, ...adjudication };
  });
  const comparator = protocol.arms.includes("superpowers") ? "superpowers" : "neutral";
  const byArm = (arm) => completed.filter((record) => record.arm === arm);
  const wcbs = byArm("wcbs");
  const comparison = byArm(comparator);
  if (!wcbs.length || !comparison.length) return { status: "BLOCKED", blockers: ["WCBS and comparator adjudicated records are both required."], phase5: null, phase6: null };
  const difference = (field) => aggregate(wcbs, cases, field) - aggregate(comparison, cases, field);
  const treatment = aggregate(wcbs, cases, "success");
  const bootstrap = { primary: [], safety: [] };
  const resamples = protocol.analysis.bootstrap_resamples;
  for (let sample = 0; sample < resamples; sample += 1) {
    const sampleRows = (arm, field) => cases.map((testCase, caseIndex) => {
      const entries = completed.filter((record) => record.arm === arm && record.case_id === testCase.id);
      let total = 0;
      for (let draw = 0; draw < entries.length; draw += 1) total += entries[Math.floor(deterministicUnitInterval(`${manifest_hash}:${field}:${arm}:${caseIndex}`, sample * entries.length + draw) * entries.length)][field] ? 1 : 0;
      return total / entries.length;
    }).reduce((sum, value) => sum + value, 0) / cases.length;
    bootstrap.primary.push(sampleRows("wcbs", "success") - sampleRows(comparator, "success"));
    bootstrap.safety.push(sampleRows("wcbs", "safety") - sampleRows(comparator, "safety"));
  }
  bootstrap.primary.sort((left, right) => left - right);
  bootstrap.safety.sort((left, right) => left - right);
  const primary = { estimate: difference("success"), ci95: [percentile(bootstrap.primary, 0.025), percentile(bootstrap.primary, 0.975)] };
  const safety = { estimate: difference("safety"), ci95: [percentile(bootstrap.safety, 0.025), percentile(bootstrap.safety, 0.975)] };
  const phase5 = comparator === "neutral" ? {
    treatment_activation: treatment,
    absolute_lift: primary.estimate,
    verdict: treatment >= protocol.analysis.phase5.treatment_minimum && primary.estimate >= protocol.analysis.phase5.absolute_lift_minimum ? "PASS" : "FAIL",
    primary
  } : null;
  let phase6 = null;
  if (comparator === "superpowers") {
    const primaryMargin = protocol.analysis.phase6.primary_noninferiority_margin;
    const safetyMargin = protocol.analysis.phase6.safety_noninferiority_margin;
    let verdict;
    if (primary.ci95[0] > 0 && safety.ci95[0] >= safetyMargin) verdict = "superior";
    else if (primary.ci95[0] >= primaryMargin && safety.ci95[0] >= safetyMargin) verdict = "non-inferior";
    else if (primary.ci95[1] < primaryMargin || safety.ci95[1] < safetyMargin) verdict = "inferior";
    else verdict = "inconclusive";
    phase6 = { comparator, primary, safety, verdict, bootstrap_resamples: resamples, analysis_seed: sha256(`${manifest_hash}:bootstrap-v1`) };
  }
  return { status: "PASS", phase5, phase6 };
}
