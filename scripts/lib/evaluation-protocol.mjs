import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { redactValues, runEval } from "./eval-runner.mjs";
import { HARDENED_GIT_POLICY_VERSION, hardenedGitEnvironment, inspectHardenedGitPolicy, requireHardenedGit, runHardenedGit } from "./hardened-git.mjs";

const ARM_NAMES = new Set(["neutral", "wcbs", "superpowers"]);
const ALLOWED_ENV = ["PATH", "PATHEXT", "SYSTEMROOT", "WINDIR", "COMSPEC", "TMP", "TEMP", "TMPDIR", "LANG", "LC_ALL", "TERM"];
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const json = (value) => JSON.stringify(value);
const posix = (value) => value.split(path.sep).join("/");
const releaseBuilder = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "build-release-artifacts.mjs");

function canonicalValue(value) {
  if (value === null || typeof value === "boolean" || typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (!value || typeof value !== "object") throw new Error("Blocked: canonical protocol data contains an unsupported value.");
  return Object.fromEntries(Object.keys(value).sort((left, right) => left.localeCompare(right)).map((key) => [key, canonicalValue(value[key])]));
}

export function canonicalJson(value) { return `${JSON.stringify(canonicalValue(value))}\n`; }
export function canonicalHash(value) { return sha256(canonicalJson(value)); }

function completeProtocolValue({ root, protocol }) {
  const rubric = protocol?.scoring_rubric;
  const harness = protocol?.evaluator_harness;
  let rubricBytes = null;
  let harnessBytes = null;
  if (rubric?.path && typeof root === "string") {
    const file = contained(root, path.join(root, ...rubric.path.split("/")), "complete protocol scoring rubric");
    if (fs.existsSync(file)) rubricBytes = fs.readFileSync(file, "utf8");
  }
  if (harness?.path && typeof root === "string") {
    const file = contained(root, path.join(root, ...harness.path.split("/")), "complete protocol evaluator harness");
    if (fs.existsSync(file)) harnessBytes = fs.readFileSync(file, "utf8");
  }
  const { cases, seed: _runtimeSeed, ...registration } = protocol ?? {};
  return {
    schema_version: 1,
    registration,
    resolved_cases: cases ?? null,
    literal_scoring_rubric: { path: rubric?.path ?? null, sha256: rubric?.sha256 ?? null, literal_utf8: rubricBytes },
    literal_evaluator_harness: { path: harness?.path ?? null, sha256: harness?.sha256 ?? null, literal_utf8: harnessBytes }
  };
}

export function completeProtocolHash({ root, protocol }) { return canonicalHash(completeProtocolValue({ root, protocol })); }

function now() { return new Date().toISOString(); }

function contained(root, candidate, label) {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(candidate);
  if (resolvedCandidate !== resolvedRoot && !resolvedCandidate.startsWith(`${resolvedRoot}${path.sep}`)) throw new Error(`Blocked: ${label} escapes its containing directory.`);
  return resolvedCandidate;
}

function realDirectory(directory, label) {
  const stat = fs.lstatSync(directory);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`Blocked: ${label} must be a non-symlink directory.`);
  return fs.realpathSync(directory);
}

function safeEvidenceSegments(relative, label) {
  if (typeof relative !== "string" || !relative || relative.includes("\\") || relative.includes("\0") || path.isAbsolute(relative) || /^[A-Za-z]:/.test(relative) || relative.startsWith("//")) throw new Error(`Blocked: ${label} must be a normalized relative POSIX path.`);
  const segments = relative.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === ".." || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(segment))) throw new Error(`Blocked: ${label} contains an unsafe path segment.`);
  return segments;
}

function directoryIdentity(directory, label) {
  const stat = fs.lstatSync(directory);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`Blocked: ${label} must be a non-symlink directory.`);
  return { path: directory, realpath: fs.realpathSync(directory), dev: stat.dev, ino: stat.ino };
}

function revalidateDirectory(identity, label) {
  const observed = directoryIdentity(identity.path, label);
  if (observed.realpath !== identity.realpath || observed.dev !== identity.dev || observed.ino !== identity.ino) throw new Error(`Blocked: ${label} changed after evidence capability creation.`);
  return observed;
}

function assertRunOutsideSource(sourceRoot, evidenceRoot) {
  if (evidenceRoot === sourceRoot || evidenceRoot.startsWith(`${sourceRoot}${path.sep}`)) throw new Error("Blocked: --evidence-dir must be physically outside the source checkout.");
}

function prepareEvidenceCapability({ root, evidence_dir, run_id, existing }) {
  if (typeof evidence_dir !== "string" || !path.isAbsolute(evidence_dir)) throw new Error("Blocked: --evidence-dir must be an absolute external directory.");
  if (typeof run_id !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(run_id) || run_id === "." || run_id === "..") throw new Error("Blocked: evaluation evidence requires one safe run id.");
  const sourceRoot = realDirectory(root, "source checkout");
  const rootIdentity = directoryIdentity(evidence_dir, "evidence directory");
  assertRunOutsideSource(sourceRoot, rootIdentity.realpath);
  const runDirectory = path.join(rootIdentity.realpath, run_id);
  if (!existing && fs.existsSync(runDirectory)) throw new Error(`Blocked: external evidence run directory already exists: ${runDirectory}`);
  const runIdentity = existing ? directoryIdentity(runDirectory, "external evidence run directory") : null;
  if (runIdentity && path.dirname(runIdentity.realpath) !== rootIdentity.realpath) throw new Error("Blocked: external evidence run directory must be a direct non-symlink child of the evidence root.");
  return Object.freeze({ kind: "wcbs-evidence-run", state: existing ? "existing" : "absent", run_id, source_root: sourceRoot, evidence_root: rootIdentity, run_directory: runDirectory, run_identity: runIdentity });
}

/** Validates an absent child only. `executeProtocol` owns its creation. */
export function prepareExternalEvidenceRun({ root, evidence_dir, run_id }) {
  return prepareEvidenceCapability({ root, evidence_dir, run_id, existing: false });
}

/** Opens an existing external run for a consumer; it never creates directories. */
export function openExternalEvidenceRun({ root, evidence_dir, run_id }) {
  return prepareEvidenceCapability({ root, evidence_dir, run_id, existing: true });
}

/** Backward-compatible resolver: `create` prepares an absent capability but does not create it. */
export function resolveExternalEvidenceRun({ root, evidence_dir, run_id, create = false }) {
  return create ? prepareExternalEvidenceRun({ root, evidence_dir, run_id }) : openExternalEvidenceRun({ root, evidence_dir, run_id });
}

function requireEvidenceHandle(handle, state) {
  if (!handle || handle.kind !== "wcbs-evidence-run" || handle.state !== state) throw new Error(`Blocked: evidence operation requires an ${state} opaque evidence-run capability.`);
  revalidateDirectory(handle.evidence_root, "evidence root");
  if (state === "existing") revalidateDirectory(handle.run_identity, "external evidence run directory");
  return handle;
}

export function createExternalEvidenceRun(handle) {
  requireEvidenceHandle(handle, "absent");
  try { fs.mkdirSync(handle.run_directory, { mode: 0o700 }); }
  catch (error) {
    if (error?.code === "EEXIST") throw new Error(`Blocked: external evidence run directory already exists: ${handle.run_directory}`);
    throw error;
  }
  try { fs.chmodSync(handle.run_directory, 0o700); } catch {}
  const runIdentity = directoryIdentity(handle.run_directory, "external evidence run directory");
  if (path.dirname(runIdentity.realpath) !== handle.evidence_root.realpath) throw new Error("Blocked: evidence run creation escaped its root.");
  return Object.freeze({ ...handle, state: "existing", run_identity: runIdentity });
}

function revalidateEvidenceHandle(handle) {
  requireEvidenceHandle(handle, "existing");
  assertRunOutsideSource(handle.source_root, handle.evidence_root.realpath);
}

function ensureEvidenceDirectory(handle, segments) {
  revalidateEvidenceHandle(handle);
  let current = handle.run_identity.realpath;
  for (const segment of segments) {
    current = path.join(current, segment);
    if (!fs.existsSync(current)) {
      try { fs.mkdirSync(current, { mode: 0o700 }); }
      catch (error) { if (error?.code !== "EEXIST") throw error; }
    }
    const identity = directoryIdentity(current, `evidence directory ${segments.join("/")}`);
    if (!identity.realpath.startsWith(`${handle.run_identity.realpath}${path.sep}`)) throw new Error("Blocked: evidence directory escaped the run boundary.");
  }
  return current;
}

/** Resolves one evidence entry after component-by-component lstat/realpath checks. */
export function resolveEvidenceEntry(handle, relative, { kind = "input", allowMissingFinal = false, createParents = false } = {}) {
  revalidateEvidenceHandle(handle);
  const segments = safeEvidenceSegments(relative, "evidence path");
  const parentSegments = segments.slice(0, -1);
  let parent = handle.run_identity.realpath;
  if (createParents) parent = ensureEvidenceDirectory(handle, parentSegments);
  else {
    for (const segment of parentSegments) {
      parent = path.join(parent, segment);
      const identity = directoryIdentity(parent, `evidence parent ${relative}`);
      if (!identity.realpath.startsWith(`${handle.run_identity.realpath}${path.sep}`)) throw new Error("Blocked: evidence parent escaped the run boundary.");
    }
  }
  const parentIdentity = directoryIdentity(parent, `evidence parent ${relative}`);
  const target = path.join(parentIdentity.realpath, segments.at(-1));
  if (fs.existsSync(target)) {
    const stat = fs.lstatSync(target);
    if (stat.isSymbolicLink() || (kind === "input" && !stat.isFile()) || (kind === "output" && !stat.isFile())) throw new Error(`Blocked: evidence ${kind} ${relative} must be a regular non-symlink file.`);
  } else if (!allowMissingFinal) throw new Error(`Blocked: evidence ${kind} ${relative} does not exist.`);
  return { target, parent: parentIdentity, relative: segments.join("/") };
}

/** Atomic, exclusive-create evidence writer with no-follow where the platform provides it. It detects but cannot prevent a privileged or same-authority parent-replacement race between syscalls. */
export function writeEvidenceFile(handle, relative, content) {
  const noFollow = typeof fs.constants.O_NOFOLLOW === "number" ? fs.constants.O_NOFOLLOW : 0;
  if (!noFollow && process.platform !== "win32") throw new Error("Blocked: this platform lacks the required no-follow evidence-write primitive.");
  const entry = resolveEvidenceEntry(handle, relative, { kind: "output", allowMissingFinal: true, createParents: true });
  if (fs.existsSync(entry.target)) throw new Error(`Blocked: evidence output ${entry.relative} already exists and will not be replaced.`);
  const temporaryName = `.${entry.relative.split("/").at(-1)}.${process.pid}.${crypto.randomUUID()}.tmp`;
  const temporary = path.join(entry.parent.realpath, temporaryName);
  let descriptor = null;
  try {
    descriptor = fs.openSync(temporary, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | noFollow, 0o600);
    fs.writeFileSync(descriptor, content, { encoding: "utf8" });
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = null;
    revalidateEvidenceHandle(handle);
    revalidateDirectory(entry.parent, `evidence parent ${entry.relative}`);
    fs.renameSync(temporary, entry.target);
    revalidateEvidenceHandle(handle);
    revalidateDirectory(entry.parent, `evidence parent ${entry.relative}`);
    const finalStat = fs.lstatSync(entry.target);
    if (finalStat.isSymbolicLink() || !finalStat.isFile()) throw new Error(`Blocked: evidence output ${entry.relative} changed after atomic write.`);
    return entry.target;
  } finally {
    if (descriptor !== null) try { fs.closeSync(descriptor); } catch {}
    try { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); } catch {}
  }
}

export function readEvidenceFile(handle, relative, label = "evidence input") {
  const entry = resolveEvidenceEntry(handle, relative, { kind: "input" });
  const body = fs.readFileSync(entry.target);
  revalidateEvidenceHandle(handle);
  revalidateDirectory(entry.parent, `evidence parent ${entry.relative}`);
  return body;
}

function writeEvidenceJson(handle, relative, value) {
  return writeEvidenceFile(handle, relative, `${JSON.stringify(value, null, 2)}\n`);
}

function readEvidenceJson(handle, relative, label = "evidence JSON") {
  try { return JSON.parse(readEvidenceFile(handle, relative, label).toString("utf8")); }
  catch (error) { throw new Error(`Blocked: ${label} is invalid: ${error.message}`); }
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

function windowsSystemDirectory(env) {
  const systemRoot = windowsEnvironmentValue(env, "SystemRoot");
  if (typeof systemRoot !== "string" || !path.win32.isAbsolute(systemRoot)) throw new Error("Blocked: Windows Git execution requires an absolute SystemRoot.");
  return path.win32.join(systemRoot, "System32");
}

function requireWindowsGitExecutable(executable, label = "Windows Git executable") {
  if (typeof executable !== "string" || !path.win32.isAbsolute(executable) || path.win32.extname(executable).toLowerCase() !== ".exe") {
    throw new Error(`Blocked: ${label} must be an absolute Windows .exe path.`);
  }
  return executable;
}

function windowsGitRuntimeDirectories(executable) {
  if (typeof executable !== "string" || !path.win32.isAbsolute(executable)) return [];
  const binaryDirectory = path.win32.dirname(executable);
  const directoryName = path.win32.basename(binaryDirectory).toLowerCase();
  if (!["bin", "cmd"].includes(directoryName)) return [binaryDirectory];
  const gitRoot = path.win32.dirname(binaryDirectory);
  return [
    path.win32.join(gitRoot, "bin"),
    path.win32.join(gitRoot, "cmd"),
    path.win32.join(gitRoot, "mingw64", "bin"),
    path.win32.join(gitRoot, "usr", "bin")
  ];
}

function trustedWindowsGitEnvironment(env, gitExecutable) {
  const systemDirectory = windowsSystemDirectory(env);
  const systemRoot = path.win32.dirname(systemDirectory);
  return {
    SystemRoot: systemRoot,
    WINDIR: systemRoot,
    Path: [systemDirectory, ...windowsGitRuntimeDirectories(gitExecutable)].join(";"),
    PATHEXT: ".COM;.EXE;.BAT;.CMD"
  };
}

function windowsGitWorkingDirectory(cwd) {
  if (cwd === undefined) return cwd;
  if (typeof cwd !== "string" || !path.win32.isAbsolute(cwd)) {
    throw new Error("Blocked: Windows Git source directory must be an absolute Windows path.");
  }
  return cwd;
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
  for (const command of configured) {
    if (platform === "win32") requireWindowsGitExecutable(command, "Windows Git executable configuration");
    if (probe(command, env)) return command;
  }
  if (platform === "win32") {
    for (const command of gitForWindowsCandidates(env)) if (exists(command)) return requireWindowsGitExecutable(command);
    throw new Error("Blocked: an absolute Git-for-Windows executable is unavailable. Configure WCBS_GIT_EXECUTABLE with an absolute path.");
  }
  for (const command of ["git"]) if (probe(command, env)) return command;
  throw new Error("Blocked: Git executable is unavailable. Configure WCBS_GIT_EXECUTABLE or make Git available on PATH.");
}

export function createGitInvocation(args, { git, env = process.env, platform = process.platform } = {}) {
  if (!Array.isArray(args) || args.some((arg) => typeof arg !== "string")) throw new Error("Blocked: Git arguments must be a string array.");
  const executable = git ?? resolveGitExecutable({ env, platform });
  if (platform === "win32") requireWindowsGitExecutable(executable);
  return { command: executable, args: [...args] };
}

export function runGitCommand(args, { cwd, env = process.env, platform = process.platform, git, encoding = "utf8", input, maxBuffer, timeout, spawn = spawnSync } = {}) {
  const windows = platform === "win32";
  const executable = git ?? resolveGitExecutable({ env, platform });
  const invocation = createGitInvocation(args, { git: executable, env, platform });
  const options = {
    cwd: windows ? windowsGitWorkingDirectory(cwd) : cwd,
    encoding,
    input,
    maxBuffer,
    timeout,
    windowsHide: true
  };
  if (windows) options.env = trustedWindowsGitEnvironment(env, executable);
  else options.env = env;
  return spawn(invocation.command, invocation.args, options);
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
    return requireHardenedGit(args, { cwd: root, encoding: "utf8" }, `git ${args[0] ?? "command"}`).trim();
  }
  catch (error) { throw new Error(`Blocked: git ${args.join(" ")} failed: ${error.message}`); }
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
  const archive = runHardenedGit(["archive", "--format=tar", revision], { cwd: source, encoding: null, maxBuffer: 128 * 1024 * 1024 });
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

function validateEvaluatorHarness(root, pin, blockers) {
  if (!pin?.path || !pin?.sha256) {
    blockers.push("Evaluator harness requires a path and sha256.");
    return null;
  }
  try {
    const file = contained(root, path.join(root, ...pin.path.split("/")), "evaluator harness manifest");
    if (!fs.existsSync(file)) throw new Error("manifest is missing.");
    if (hashFile(file) !== pin.sha256) throw new Error("manifest hash does not match the preregistration.");
    const manifest = readJson(file);
    if (manifest?.schema_version !== 1 || !Array.isArray(manifest.files) || !manifest.files.length) throw new Error("manifest must declare a non-empty schema-versioned file list.");
    const seen = new Set();
    for (const entry of manifest.files) {
      if (!entry || typeof entry.path !== "string" || !/^[a-f0-9]{64}$/.test(entry.sha256) || seen.has(entry.path)) throw new Error("manifest contains an invalid or duplicate file entry.");
      seen.add(entry.path);
      const target = contained(root, path.join(root, ...safeEvidenceSegments(entry.path, "evaluator harness file")), "evaluator harness file");
      if (!fs.existsSync(target) || fs.lstatSync(target).isSymbolicLink() || hashFile(target) !== entry.sha256) throw new Error(`pinned evaluator file does not match: ${entry.path}`);
    }
    return { path: pin.path, sha256: pin.sha256, files: manifest.files.map(({ path: filePath, sha256: fileSha256 }) => ({ path: filePath, sha256: fileSha256 })) };
  } catch (error) {
    blockers.push(`Evaluator harness validation failed: ${error.message}`);
    return null;
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

function validateRoleKeys(protocol, blockers) {
  const roles = protocol?.role_keys;
  if (!roles || typeof roles !== "object" || Array.isArray(roles) || !Array.isArray(roles.judges) || !roles.adjudicator || !roles.producer) {
    blockers.push("Protocol must pin one producer, two judge Ed25519 public keys, and one distinct adjudicator key.");
    return null;
  }
  if (roles.judges.length !== 2) blockers.push("Protocol role keys require exactly two judges.");
  const all = [roles.producer, ...(roles.judges ?? []), roles.adjudicator];
  const ids = new Set();
  const publicKeys = new Set();
  for (const [index, role] of all.entries()) {
    const label = index === 0 ? "producer role" : index < 3 ? `judge role ${index}` : "adjudicator role";
    if (!role || typeof role.key_id !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(role.key_id) || typeof role.public_key_pem !== "string") {
      blockers.push(`Protocol ${label} is malformed.`);
      continue;
    }
    ids.add(role.key_id);
    publicKeys.add(role.public_key_pem);
    try {
      if (crypto.createPublicKey(role.public_key_pem).asymmetricKeyType !== "ed25519") throw new Error("key is not Ed25519");
    } catch (error) { blockers.push(`Protocol ${label} public key is invalid: ${error.message}`); }
  }
  if (typeof roles.producer?.private_key_env !== "string" || !/^[A-Za-z_][A-Za-z0-9_]{0,127}$/.test(roles.producer.private_key_env)) blockers.push("Protocol producer role must pin a safe private-key environment-variable name.");
  if (ids.size !== 4 || publicKeys.size !== 4) blockers.push("Protocol producer, judges, and adjudicator must use four distinct key identities.");
  return blockers.length ? null : roles;
}

export function validatePhaseDesign({ phase, arms, cases, repetitions, expected_total_runs }) {
  const blockers = [];
  if (phase === undefined || phase === null) return blockers;
  const required = phase === "5" || phase === 5
    ? { arms: ["neutral", "wcbs"], minimum: 160 }
    : phase === "6" || phase === 6
      ? { arms: ["neutral", "wcbs", "superpowers"], minimum: 240 }
      : null;
  if (!required) return ["Protocol phase must be exactly 5 or 6."];
  const normalizedArms = Array.isArray(arms) ? [...arms].sort((left, right) => left.localeCompare(right)) : [];
  const expectedArms = [...required.arms].sort((left, right) => left.localeCompare(right));
  if (JSON.stringify(normalizedArms) !== JSON.stringify(expectedArms)) blockers.push(`Phase ${phase} requires exactly the ${expectedArms.join(", ")} arms.`);
  const ids = Array.isArray(cases) ? cases.map((entry) => entry?.id) : [];
  if (ids.length !== 8 || new Set(ids).size !== 8 || ids.some((id) => typeof id !== "string" || !id)) blockers.push(`Phase ${phase} requires exactly 8 distinct locked cases.`);
  if (!Number.isSafeInteger(repetitions) || repetitions < 10) blockers.push(`Phase ${phase} requires repetitions >= 10.`);
  const arithmetic = Array.isArray(arms) && Array.isArray(cases) && Number.isSafeInteger(repetitions) ? arms.length * cases.length * repetitions : null;
  if (arithmetic === null || arithmetic < required.minimum || expected_total_runs !== arithmetic) blockers.push(`Phase ${phase} requires at least ${required.minimum} scheduled runs with exact arithmetic equality.`);
  return blockers;
}

function repositoryIsClean(root) {
  const result = runHardenedGit(["status", "--porcelain=v1", "--untracked-files=all", "--ignored=matching"], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 || result.error) throw new Error(`Blocked: could not inspect evaluation checkout cleanliness: ${result.stderr?.toString().trim() || result.error?.message || "git status failed"}`);
  return result.stdout.trim() === "";
}

function runControlledGit(root, args, label) {
  const result = runHardenedGit(args, { cwd: root, encoding: "utf8" });
  if (result.status !== 0 || result.error) throw new Error(`${label}: ${result.stderr?.toString().trim() || result.error?.message || "git failed"}`);
  return result.stdout;
}

function buildImmutableArtifactManifest(root, identity, label) {
  const hardenedGit = inspectHardenedGitPolicy(root);
  const targetRoot = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-evaluation-target-"));
  const destination = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-evaluation-artifact-"));
  let worktreeAdded = false;
  try {
    fs.rmdirSync(targetRoot);
    runControlledGit(root, ["worktree", "add", "--detach", targetRoot, identity.commit], `${label} target worktree creation`);
    worktreeAdded = true;
    if (!repositoryIsClean(targetRoot)) throw new Error("fresh detached target worktree is dirty");
    const resolved = verifyGitIdentity(targetRoot, identity, `${label} materialized target`, "HEAD");
    if (resolved.commit !== identity.commit || resolved.tree !== identity.tree) throw new Error("materialized target identity drifted");
    const rawTreeEntry = runControlledGit(root, ["ls-tree", identity.commit, "scripts/build-release-artifacts.mjs"], `${label} builder tree lookup`).trim();
    const treeMatch = /^(100[67][0-7]{2}) blob ([a-f0-9]{40})\tscripts\/build-release-artifacts\.mjs$/.exec(rawTreeEntry);
    if (!treeMatch) throw new Error("target tree does not contain a regular release builder");
    const [mode, gitBlob] = treeMatch.slice(1);
    if (!new Set(["100644", "100755"]).has(mode)) throw new Error("target release builder has an unsupported Git mode");
    const blobBytes = runHardenedGit(["cat-file", "blob", gitBlob], { cwd: root, encoding: null });
    if (blobBytes.status !== 0 || blobBytes.error) throw new Error("could not materialize target release builder blob");
    const targetBuilder = path.join(targetRoot, "scripts", "build-release-artifacts.mjs");
    const targetBuilderBlobSha256 = sha256(blobBytes.stdout);
    const invokedBuilderSha256 = hashFile(targetBuilder);
    if (targetBuilderBlobSha256 !== invokedBuilderSha256) throw new Error("target builder bytes diverge from the pinned Git blob");
    const environment = hardenedGitEnvironment();
    const result = spawnSync(process.execPath, [targetBuilder, "--repository-root", targetRoot, "--source-commit", identity.commit, "--source-tree", identity.tree, "--out", destination], { cwd: targetRoot, env: environment, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, windowsHide: true });
    if (result.status !== 0 || result.error) throw new Error(`artifact materialization failed: ${result.stderr || result.error?.message || "release builder failed"}`);
    if (!repositoryIsClean(targetRoot)) throw new Error("target worktree changed while its artifact was built");
    const manifest = readJson(path.join(destination, "RELEASE_ARTIFACT_MANIFEST.json"));
    if (manifest?.source?.commit !== identity.commit || manifest?.source?.tree !== identity.tree) throw new Error("artifact source identity does not match the immutable target.");
    if (!manifest.content_manifest || typeof manifest.content_manifest_sha256 !== "string" || manifest.content_manifest_sha256 !== canonicalHash(manifest.content_manifest)) throw new Error("artifact content manifest self-hash is invalid.");
    if (!Array.isArray(manifest.content_manifest.entries) || !manifest.content_manifest.entries.length) throw new Error("artifact content manifest has no release entries.");
    for (const entry of manifest.content_manifest.entries) {
      if (!entry || typeof entry.name !== "string" || !/^[^/]+\/.+/.test(entry.name) || !/^[a-f0-9]{64}$/.test(entry.sha256) || entry.type !== "regular-file" || !Number.isSafeInteger(entry.unix_mode) || entry.unix_mode < 0 || entry.unix_mode > 0o777 || entry.origin?.zip_host_os !== 3) throw new Error("artifact content manifest contains an invalid ZIP entry.");
    }
    return {
      content_manifest: manifest.content_manifest,
      content_manifest_sha256: manifest.content_manifest_sha256,
      artifact_sha256: hashFile(path.join(destination, manifest.artifact)),
      target_builder_git_blob: gitBlob,
      target_builder_blob_sha256: targetBuilderBlobSha256,
      invoked_builder_sha256: invokedBuilderSha256,
      target_commit: resolved.commit,
      target_tree: resolved.tree,
      hardened_git: { policy_version: HARDENED_GIT_POLICY_VERSION, ...hardenedGit }
    };
  } finally {
    if (worktreeAdded) {
      const remove = runHardenedGit(["worktree", "remove", "--force", targetRoot], { cwd: root, encoding: "utf8" });
      if (remove.status !== 0 && fs.existsSync(targetRoot)) fs.rmSync(targetRoot, { recursive: true, force: true });
    } else if (fs.existsSync(targetRoot)) fs.rmSync(targetRoot, { recursive: true, force: true });
    fs.rmSync(destination, { recursive: true, force: true });
  }
}

export function validateEvaluationProvenance({ root, protocol, require_clean = true }) {
  const blockers = [];
  const subject = protocol?.evaluation_subject;
  const target = protocol?.claim_target;
  if (!subject || !target) return { status: "BLOCKED", blockers: ["Protocol requires immutable evaluation_subject and claim_target identities plus release artifact provenance."], subject_manifest: null, claim_manifest: null };
  try {
    if (require_clean && !repositoryIsClean(root)) throw new Error("caller checkout is dirty or contains an ignored or untracked artifact; immutable materialization must not use it.");
    if (require_clean) {
      const branch = runHardenedGit(["symbolic-ref", "-q", "HEAD"], { cwd: root, encoding: "utf8" });
      if (branch.status === 0) throw new Error("caller checkout must be a clean detached source before evaluation provenance is materialized.");
    }
    const resolvedSubject = verifyGitIdentity(root, subject, "evaluation subject", subject.commit);
    const resolvedTarget = verifyGitIdentity(root, target, "claim target", target.commit);
    const ancestor = runHardenedGit(["merge-base", "--is-ancestor", resolvedSubject.commit, resolvedTarget.commit], { cwd: root, encoding: "utf8" });
    if (ancestor.status !== 0) throw new Error("evaluation subject is not an ancestor of the claim target.");
    if (resolvedSubject.commit !== resolvedTarget.commit || resolvedSubject.tree !== resolvedTarget.tree) throw new Error("evaluation subject and claim target must be exactly identical; release-scope exceptions are prohibited.");
    if (protocol?.wcbs_candidate && (protocol.wcbs_candidate.commit !== resolvedSubject.commit || protocol.wcbs_candidate.tree !== resolvedSubject.tree)) throw new Error("WCBS candidate must be the exact evaluation subject and claim target.");
    const subjectManifest = buildImmutableArtifactManifest(root, resolvedSubject, "evaluation subject");
    const targetManifest = buildImmutableArtifactManifest(root, resolvedTarget, "claim target");
    if (subjectManifest.content_manifest_sha256 !== targetManifest.content_manifest_sha256) throw new Error("subject and claim-target release content manifests differ.");
    return { status: "PASS", blockers, subject_manifest: subjectManifest, claim_manifest: targetManifest };
  } catch (error) {
    blockers.push(`Evaluation provenance validation failed: ${error.message}`);
    return { status: "BLOCKED", blockers, subject_manifest: null, claim_manifest: null };
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
  blockers.push(...validatePhaseDesign({ phase: protocol?.phase, arms: protocol?.arms, cases, repetitions: protocol?.repetitions, expected_total_runs: protocol?.expected_total_runs }));
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
  const evaluatorHarness = validateEvaluatorHarness(root, protocol?.evaluator_harness, blockers);
  if (!protocol?.analysis || protocol.analysis.bootstrap_resamples !== 10_000) blockers.push("Protocol must lock exactly 10000 bootstrap resamples.");
  validateLockedControlProject(root, protocol, blockers);
  const roleKeys = validateRoleKeys(protocol, blockers);
  const provenance = validateEvaluationProvenance({ root, protocol });
  if (provenance.status !== "PASS") blockers.push(...provenance.blockers);
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
  return {
    status: blockers.length ? "BLOCKED" : "PASS",
    blockers,
    expected_total_runs: expected,
    role_keys: roleKeys,
    evaluator_harness: evaluatorHarness,
    complete_protocol_sha256: completeProtocolHash({ root, protocol }),
    artifact_provenance: provenance.status === "PASS" ? provenance : null
  };
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

function profileDirectoryFor(evidenceRun, runId) {
  return ensureEvidenceDirectory(evidenceRun, ["profiles", runId]);
}

function stageWorkspace({ root, protocol, record, evidenceRun, superpowersSource, protectedValue }) {
  const runDirectory = evidenceRun.run_identity.realpath;
  const workspace = ensureEvidenceDirectory(evidenceRun, ["workspaces", record.run_id]);
  ensureEvidenceDirectory(evidenceRun, ["sources"]);
  fs.cpSync(path.join(root, ...protocol.control_project_root.split("/")), workspace, { recursive: true });
  const initialManifest = sourceFileManifest(workspace);
  const profileDirectory = profileDirectoryFor(evidenceRun, record.run_id);
  try { fs.chmodSync(profileDirectory, 0o700); } catch {}
  const result = { workspace, initialManifest, profileDirectory, installation: null, loader: null, candidate: null, superpowers: null, setup_failures: [] };
  const pluginDir = contained(workspace, path.join(workspace, ".wcbs-evaluation", "plugins", record.arm), "plugin directory");
  if (record.arm === "wcbs") {
    const source = ensureEvidenceDirectory(evidenceRun, ["sources", `wcbs-${record.run_id}`]);
    archiveGitRevision(root, protocol.wcbs_candidate.commit, source, "WCBS candidate");
    result.candidate = { ...protocol.wcbs_candidate, source: posix(path.relative(runDirectory, source)) };
    const command = [process.execPath, path.join(source, "scripts", "wcbs.mjs"), "install", "--target", protocol.runtime_id, "--plugin-dir", pluginDir, "--json"];
    const installation = executeSetup({ command: command[0], arguments: command.slice(1) }, source, protocol.timeout_ms, protectedValue, profileDirectory, protocol.execution_identity.credential_name);
    result.installation = installation;
    if (installation.exit_code !== 0 || installation.timed_out || installation.tool_error) result.setup_failures.push("wcbs_installation");
  }
  if (record.arm === "superpowers") {
    const source = ensureEvidenceDirectory(evidenceRun, ["sources", `superpowers-${record.run_id}`]);
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

function retainedFailure(evidenceRun, recordRelative, record, category, reason) {
  const relative = `${recordRelative}/failure.json`;
  writeEvidenceJson(evidenceRun, relative, { category, reason, failure_as_data: true });
  record.artifacts.failure = relative;
}

function executionEvidenceCapability({ root, run_id, evidence, run_directory }) {
  if (evidence) {
    if (evidence.run_id !== run_id) throw new Error("Blocked: supplied evidence capability does not match the requested run id.");
    return requireEvidenceHandle(evidence, "absent");
  }
  if (typeof run_directory !== "string" || !path.isAbsolute(run_directory)) throw new Error("Blocked: executeProtocol requires an absent opaque evidence capability.");
  const legacy = prepareExternalEvidenceRun({ root, evidence_dir: path.dirname(run_directory), run_id: path.basename(run_directory) });
  return Object.freeze({ ...legacy, run_id });
}

export async function executeProtocol({ root, protocol, run_id, run_directory, evidence = null, seed, credential, superpowers_source = null, after_preflight = null }) {
  const preparedEvidence = executionEvidenceCapability({ root, run_id, evidence, run_directory });
  const completeProtocol = { ...protocol, seed };
  const preflight = preflightProtocol({ root, protocol: completeProtocol, superpowers_source, strict: true });
  if (preflight.status !== "PASS") return { status: "BLOCKED", blockers: preflight.blockers };
  if (!credential || String(credential).length < 12) return { status: "BLOCKED", blockers: ["A protected test or evaluation credential value of at least twelve characters is required for execute mode."] };
  if (after_preflight) after_preflight();
  const evidenceRun = createExternalEvidenceRun(preparedEvidence);
  const runDirectory = evidenceRun.run_identity.realpath;
  const schedule = createRandomSchedule({ protocol: completeProtocol, seed });
  const manifest = {
    schema_version: 1,
    run_id,
    created_utc: now(),
    protocol_id: protocol.protocol_id,
    protocol_sha256: preflight.complete_protocol_sha256,
    complete_protocol_sha256: preflight.complete_protocol_sha256,
    execution_identity: { ...protocol.execution_identity, credential_name: protocol.execution_identity.credential_name },
    wcbs_candidate: protocol.wcbs_candidate ?? null,
    evaluation_subject: protocol.evaluation_subject ?? null,
    claim_target: protocol.claim_target ?? null,
    release_artifact: preflight.artifact_provenance ? {
      subject_content_manifest_sha256: preflight.artifact_provenance.subject_manifest.content_manifest_sha256,
      claim_target_content_manifest_sha256: preflight.artifact_provenance.claim_manifest.content_manifest_sha256
    } : null,
    evaluator_harness: preflight.evaluator_harness,
    superpowers_source_identity: protocol.superpowers_source_identity ?? null,
    role_keys: preflight.role_keys,
    schedule,
    records: []
  };
  const caseMap = new Map(protocol.cases.map((entry) => [entry.id, entry]));
  for (const scheduled of schedule.records) {
    const testCase = caseMap.get(scheduled.case_id);
    const recordRelative = `records/${scheduled.run_id}`;
    const recordDirectory = ensureEvidenceDirectory(evidenceRun, ["records", scheduled.run_id]);
    const record = { ...scheduled, prompt: testCase.prompt, criteria: testCase.criteria, started_utc: now(), status: "Failed", artifacts: {} };
    let staged = null;
    try {
      staged = stageWorkspace({ root, protocol, record: scheduled, evidenceRun, superpowersSource: superpowers_source, protectedValue: credential });
      const superpowersDir = staged.superpowers ? path.join(runDirectory, staged.superpowers.source) : "";
      const agent = templateCommand(protocol.execution_identity.agent_command_template, { workspace: staged.workspace, plugin_dir: path.join(staged.workspace, ".wcbs-evaluation", "plugins", scheduled.arm), superpowers_dir: superpowersDir, prompt: testCase.prompt }, "agent command");
      const transcriptRelative = `${recordRelative}/transcript.json`;
      const transcriptFile = path.join(recordDirectory, "transcript.json");
      const transcript = await runEval({ command: agent.command, args: agent.arguments, cwd: staged.workspace, transcriptPath: transcriptFile, writeTranscript: (content) => writeEvidenceFile(evidenceRun, transcriptRelative, content), credential, credentialName: protocol.execution_identity.credential_name, timeoutMs: protocol.timeout_ms, profileDirectory: staged.profileDirectory });
      const verification = protocol.verification_command_template
        ? executeSetup(templateCommand(protocol.verification_command_template, { workspace: staged.workspace, plugin_dir: path.join(staged.workspace, ".wcbs-evaluation", "plugins", scheduled.arm), superpowers_dir: superpowersDir }, "verification command"), staged.workspace, protocol.timeout_ms, credential, staged.profileDirectory, protocol.execution_identity.credential_name)
        : null;
      const finalManifest = sourceFileManifest(staged.workspace);
      assertNoProtectedValue(staged.workspace, credential);
      const workspaceManifestRelative = `${recordRelative}/workspace-manifest.json`;
      const workspaceDiffRelative = `${recordRelative}/workspace-diff.json`;
      const workspaceManifest = writeEvidenceJson(evidenceRun, workspaceManifestRelative, finalManifest);
      const workspaceDiff = writeEvidenceJson(evidenceRun, workspaceDiffRelative, diffManifests(staged.initialManifest, finalManifest));
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
        transcript: transcriptRelative,
        transcript_sha256: hashFile(transcriptFile),
        workspace_manifest: workspaceManifestRelative,
        workspace_manifest_sha256: hashFile(workspaceManifest),
        workspace_diff: workspaceDiffRelative,
        workspace_diff_sha256: hashFile(workspaceDiff)
      };
      if (failed) retainedFailure(evidenceRun, recordRelative, record, record.failure_category, "The scheduled attempt completed with a locked failure policy outcome.");
    } catch (error) {
      record.status = "Failed";
      record.failure_as_data = true;
      record.failure_category = "attempt_error";
      record.reason = redactValues(error.message, [credential]);
      retainedFailure(evidenceRun, recordRelative, record, record.failure_category, record.reason);
    } finally {
      const profileDirectory = staged?.profileDirectory ?? profileDirectoryFor(evidenceRun, scheduled.run_id);
      if (fs.existsSync(profileDirectory)) {
        try {
          assertNoProtectedValue(profileDirectory, credential);
        } catch (error) {
          record.status = "Failed";
          record.failure_as_data = true;
          record.failure_category = "profile_containment";
          record.reason = redactValues(error.message, [credential]);
          retainedFailure(evidenceRun, recordRelative, record, record.failure_category, record.reason);
        } finally {
          fs.rmSync(profileDirectory, { recursive: true, force: true });
        }
      }
    }
    record.finished_utc = now();
    manifest.records.push(record);
    writeEvidenceJson(evidenceRun, `${recordRelative}/record.json`, record);
  }
  const unique = new Set(manifest.records.map((record) => record.run_id));
  if (manifest.records.length !== schedule.records.length || unique.size !== schedule.records.length) throw new Error("Blocked: scheduled evaluation records are incomplete or duplicated.");
  manifest.execution_outcome = manifest.records.some((record) => record.status !== "Complete") ? "COMPLETE_WITH_FAILURES" : "COMPLETE";
  manifest.completed_utc = now();
  manifest.manifest_sha256 = manifestSelfHash(manifest);
  writeEvidenceJson(evidenceRun, "run-manifest.json", manifest);
  return { status: "PASS", manifest, run_directory: runDirectory, evidence: evidenceRun };
}

const JUDGE_PACKET_SCHEMA_VERSION = 3;
const DELIVERY_FILE_NAME = /^packet-[a-f0-9]{24}\.json$/;
const SENSITIVE_JUDGE_VALUE = /(?:wcbs|superpowers|neutral|plugin(?:[_ -]?dir)?|loader|install(?:ation)?|source(?:[_ -]?path)?|runtime[_ -]?profile|workspace[_ -]?(?:manifest|diff)|command|(?:[A-Za-z]:\\|\/)(?:[^\s"']+))/i;

function redactedJudgeText(value) {
  if (typeof value !== "string") return "";
  const bounded = value.slice(0, 8_192).replace(SENSITIVE_JUDGE_VALUE, "[REDACTED]");
  return SENSITIVE_JUDGE_VALUE.test(bounded) ? "[REDACTED]" : bounded;
}

function consumerEvidenceHandle({ evidence, run_directory }) {
  if (evidence) return requireEvidenceHandle(evidence, "existing");
  if (typeof run_directory !== "string" || !path.isAbsolute(run_directory)) throw new Error("Blocked: delivery consumers require an existing opaque evidence capability.");
  return openExternalEvidenceRun({ root: process.cwd(), evidence_dir: path.dirname(run_directory), run_id: path.basename(run_directory) });
}

function readArtifactForCustody(evidenceRun, relative) {
  if (!relative) return { value: null, invalid: false };
  try { return { value: JSON.parse(readEvidenceFile(evidenceRun, relative, "custody artifact").toString("utf8")), invalid: false }; }
  catch { return { value: null, invalid: true }; }
}

function projectJudgePacket(record, packet_id, evidenceRun) {
  const transcript = readArtifactForCustody(evidenceRun, record.artifacts?.transcript);
  const stdout = transcript.value && typeof transcript.value.stdout === "string" ? transcript.value.stdout : "";
  const verification = record.verification
    ? (record.verification.exit_code === 0 && !record.verification.timed_out && !record.verification.tool_error ? "passed" : "failed")
    : "not-run";
  return {
    schema_version: JUDGE_PACKET_SCHEMA_VERSION,
    packet_id,
    case: {
      id: typeof record.case_id === "string" ? record.case_id : "invalid-case",
      prompt: redactedJudgeText(record.prompt),
      criteria: Array.isArray(record.criteria) ? record.criteria.map(redactedJudgeText) : []
    },
    model_output: redactedJudgeText(stdout),
    verification: { outcome: verification }
  };
}

function validateJudgePacket(packet, expectedId) {
  const expectedKeys = ["case", "model_output", "packet_id", "schema_version", "verification"];
  if (!packet || typeof packet !== "object" || Array.isArray(packet) || JSON.stringify(Object.keys(packet).sort()) !== JSON.stringify(expectedKeys)) throw new Error("Blocked: judge packet does not use the closed delivery schema.");
  if (packet.schema_version !== JUDGE_PACKET_SCHEMA_VERSION || packet.packet_id !== expectedId || !DELIVERY_FILE_NAME.test(`${packet.packet_id}.json`)) throw new Error("Blocked: judge packet identity is malformed.");
  if (!packet.case || typeof packet.case.id !== "string" || typeof packet.case.prompt !== "string" || !Array.isArray(packet.case.criteria) || packet.case.criteria.some((value) => typeof value !== "string")) throw new Error("Blocked: judge packet case projection is malformed.");
  if (typeof packet.model_output !== "string" || packet.model_output.length > 8_192) throw new Error("Blocked: judge packet model-output projection is malformed.");
  if (!packet.verification || !["passed", "failed", "not-run"].includes(packet.verification.outcome)) throw new Error("Blocked: judge packet verification projection is malformed.");
  const inspect = (value) => {
    if (typeof value === "string" && SENSITIVE_JUDGE_VALUE.test(value)) throw new Error("Blocked: judge packet contains an arm-sensitive value.");
    if (Array.isArray(value)) value.forEach(inspect);
    else if (value && typeof value === "object") Object.entries(value).forEach(([key, item]) => { if (SENSITIVE_JUDGE_VALUE.test(key)) throw new Error("Blocked: judge packet contains an arm-sensitive field."); inspect(item); });
  };
  inspect(packet);
}

function validateJudgeDelivery(evidenceRun, packetIds) {
  const directory = path.dirname(resolveEvidenceEntry(evidenceRun, "judge-packets/delivery-manifest.json", { kind: "input" }).target);
  const files = fs.readdirSync(directory, { withFileTypes: true });
  const expected = new Set(["delivery-manifest.json", ...packetIds.map((id) => `${id}.json`)]);
  if (files.length !== expected.size) throw new Error("Blocked: judge delivery contains an unexpected file.");
  for (const entry of files) {
    if (!expected.has(entry.name) || entry.isSymbolicLink() || !entry.isFile()) throw new Error("Blocked: judge delivery contains a symbolic link or unexpected entry.");
  }
  const manifest = readEvidenceJson(evidenceRun, "judge-packets/delivery-manifest.json", "judge delivery manifest");
  exactKeys(manifest, ["delivery_manifest_sha256", "entries", "kind", "schema_version"], "Judge delivery manifest");
  const listed = Array.isArray(manifest.entries) ? manifest.entries.map((entry) => entry.name) : [];
  const required = [...packetIds.map((id) => `${id}.json`)].sort((left, right) => left.localeCompare(right));
  if (manifest.schema_version !== JUDGE_PACKET_SCHEMA_VERSION || manifest.kind !== "judge-delivery" || JSON.stringify(listed) !== JSON.stringify(required) || manifest.delivery_manifest_sha256 !== envelopeHash(manifest, "delivery_manifest_sha256")) throw new Error("Blocked: judge delivery manifest is malformed.");
  for (const entry of manifest.entries) {
    const relative = `judge-packets/${entry?.name ?? ""}`;
    if (!entry || typeof entry.name !== "string" || !/^[a-f0-9]{64}$/.test(entry.sha256) || sha256(readEvidenceFile(evidenceRun, relative, "judge delivery packet")) !== entry.sha256) throw new Error("Blocked: judge delivery content hash is invalid.");
    validateJudgePacket(readEvidenceJson(evidenceRun, relative, "judge delivery packet"), entry.name.slice(0, -5));
  }
  return manifest.delivery_manifest_sha256;
}

function rawArtifactBindings(evidenceRun, manifest) {
  const bindings = [];
  for (const record of manifest.records ?? []) {
    for (const [pathKey, hashKey] of [["transcript", "transcript_sha256"], ["workspace_manifest", "workspace_manifest_sha256"], ["workspace_diff", "workspace_diff_sha256"]]) {
      const relative = record.artifacts?.[pathKey];
      const declared = record.artifacts?.[hashKey];
      if (typeof relative !== "string" || !/^[a-f0-9]{64}$/.test(declared ?? "")) throw new Error(`Blocked: sealed raw record ${record.run_id} is missing ${pathKey} identity.`);
      const observed = sha256(readEvidenceFile(evidenceRun, relative, `sealed raw ${pathKey}`));
      if (observed !== declared) throw new Error(`Blocked: sealed raw artifact ${relative} no longer matches its manifest hash.`);
      bindings.push({ run_id: record.run_id, path: relative, sha256: declared });
    }
  }
  return bindings.sort((left, right) => `${left.run_id}\0${left.path}`.localeCompare(`${right.run_id}\0${right.path}`));
}

function createProducerFreeze({ evidenceRun, manifest, delivery_manifest_sha256, mapping_sha256, packet_entries, producer_private_key = null }) {
  const role = manifest.role_keys?.producer;
  if (!role || typeof role.private_key_env !== "string") throw new Error("Blocked: sealed delivery requires a pinned producer role and private-key environment-variable name.");
  const privateKey = producer_private_key ?? process.env[role.private_key_env];
  if (!privateKey) throw new Error(`Blocked: producer private key is unavailable in ${role.private_key_env}.`);
  const freeze = {
    schema_version: 1,
    kind: "producer-freeze",
    domain: "wcbs-evaluation-producer-freeze/v1",
    raw_manifest_sha256: manifest.manifest_sha256,
    protocol_sha256: manifest.protocol_sha256,
    complete_protocol_sha256: manifest.complete_protocol_sha256,
    schedule_sha256: manifest.schedule?.schedule_sha256,
    producer_key_id: role.key_id,
    raw_artifacts: rawArtifactBindings(evidenceRun, manifest),
    packet_projections: packet_entries,
    delivery_manifest_sha256,
    mapping_sha256
  };
  freeze.producer_freeze_sha256 = envelopeHash(freeze, "producer_freeze_sha256");
  freeze.signature = detachedSignature(freeze, role.key_id, privateKey);
  writeEvidenceJson(evidenceRun, "custody/producer-freeze.json", freeze);
  return freeze;
}

function validateProducerFreeze({ evidenceRun, manifest, delivery_manifest_sha256, mapping_sha256, packet_entries }) {
  const freeze = readEvidenceJson(evidenceRun, "custody/producer-freeze.json", "producer freeze");
  exactKeys(freeze, ["schema_version", "kind", "domain", "raw_manifest_sha256", "protocol_sha256", "complete_protocol_sha256", "schedule_sha256", "producer_key_id", "raw_artifacts", "packet_projections", "delivery_manifest_sha256", "mapping_sha256", "producer_freeze_sha256", "signature"], "Producer freeze");
  const role = manifest.role_keys?.producer;
  if (!role || freeze.schema_version !== 1 || freeze.kind !== "producer-freeze" || freeze.domain !== "wcbs-evaluation-producer-freeze/v1" || freeze.producer_key_id !== role.key_id || freeze.raw_manifest_sha256 !== manifest.manifest_sha256 || freeze.protocol_sha256 !== manifest.protocol_sha256 || freeze.complete_protocol_sha256 !== manifest.complete_protocol_sha256 || freeze.schedule_sha256 !== manifest.schedule?.schedule_sha256 || freeze.delivery_manifest_sha256 !== delivery_manifest_sha256 || freeze.mapping_sha256 !== mapping_sha256 || canonicalJson(freeze.packet_projections) !== canonicalJson(packet_entries) || canonicalJson(freeze.raw_artifacts) !== canonicalJson(rawArtifactBindings(evidenceRun, manifest)) || freeze.producer_freeze_sha256 !== envelopeHash(freeze, "producer_freeze_sha256")) throw new Error("Blocked: producer freeze does not bind the sealed raw execution and delivered projections.");
  validateDetachedSignature(freeze, freeze.signature, role, "Producer freeze");
  return freeze.producer_freeze_sha256;
}

export function createBlindedJudgePackets({ run_directory, evidence = null, manifest = null, producer_private_key = null }) {
  const evidenceRun = consumerEvidenceHandle({ evidence, run_directory });
  const sealedManifest = manifest ?? readEvidenceJson(evidenceRun, "run-manifest.json", "run manifest");
  manifest = sealedManifest;
  validateManifestSelfHash(manifest);
  if (fs.existsSync(path.join(evidenceRun.run_identity.realpath, "judge-packets"))) throw new Error("Blocked: judge delivery already exists and may not be overwritten.");
  const mapping = [];
  const records = new Map((manifest.records ?? []).map((record) => [record.run_id, record]));
  const schedule = manifest.schedule?.records;
  if (!Array.isArray(schedule) || !schedule.length || schedule.length !== records.size || schedule.some((record) => !records.has(record.run_id))) throw new Error("Blocked: delivery requires one retained record for every locked schedule row.");
  const packets = schedule.map((scheduled) => {
    const record = records.get(scheduled.run_id);
    const packet_id = `packet-${sha256(`${manifest.schedule.schedule_sha256}:${scheduled.case_id}:${scheduled.arm}:${scheduled.repetition}`).slice(0, 24)}`;
    const packet = projectJudgePacket(record, packet_id, evidenceRun);
    validateJudgePacket(packet, packet_id);
    const relative = `judge-packets/${packet_id}.json`;
    const packetPath = writeEvidenceFile(evidenceRun, relative, canonicalJson(packet));
    mapping.push({ packet_id, run_id: scheduled.run_id, arm: scheduled.arm, case_id: scheduled.case_id, repetition: scheduled.repetition });
    return { packet_id, packet_path: relative };
  });
  const manifestEntries = packets.map(({ packet_path }) => ({ name: path.basename(packet_path), sha256: sha256(readEvidenceFile(evidenceRun, packet_path, "judge packet")) })).sort((left, right) => left.name.localeCompare(right.name));
  const delivery = { schema_version: JUDGE_PACKET_SCHEMA_VERSION, kind: "judge-delivery", entries: manifestEntries };
  delivery.delivery_manifest_sha256 = envelopeHash(delivery, "delivery_manifest_sha256");
  writeEvidenceFile(evidenceRun, "judge-packets/delivery-manifest.json", canonicalJson(delivery));
  const delivery_manifest_sha256 = validateJudgeDelivery(evidenceRun, packets.map((packet) => packet.packet_id));
  const blindMap = { schema_version: JUDGE_PACKET_SCHEMA_VERSION, kind: "blind-map", schedule_sha256: manifest.schedule.schedule_sha256, mapping };
  blindMap.mapping_sha256 = envelopeHash(blindMap, "mapping_sha256");
  writeEvidenceFile(evidenceRun, "custody/blind-map.json", canonicalJson(blindMap));
  const freeze = createProducerFreeze({ evidenceRun, manifest, delivery_manifest_sha256, mapping_sha256: blindMap.mapping_sha256, packet_entries: manifestEntries, producer_private_key });
  Object.defineProperties(packets, {
    delivery_manifest_sha256: { value: delivery_manifest_sha256 },
    mapping_sha256: { value: blindMap.mapping_sha256 },
    producer_freeze_sha256: { value: freeze.producer_freeze_sha256 }
  });
  return packets;
}

export function validateBlindedDelivery({ run_directory, evidence = null, manifest = null }) {
  const evidenceRun = consumerEvidenceHandle({ evidence, run_directory });
  manifest = manifest ?? readEvidenceJson(evidenceRun, "run-manifest.json", "run manifest");
  validateManifestSelfHash(manifest);
  const schedule = manifest.schedule?.records;
  if (!Array.isArray(schedule) || !schedule.length) throw new Error("Blocked: blinded delivery requires a locked schedule.");
  const expected = schedule.map((row) => ({
    packet_id: `packet-${sha256(`${manifest.schedule.schedule_sha256}:${row.case_id}:${row.arm}:${row.repetition}`).slice(0, 24)}`,
    run_id: row.run_id,
    arm: row.arm,
    case_id: row.case_id,
    repetition: row.repetition
  }));
  const delivery_manifest_sha256 = validateJudgeDelivery(evidenceRun, expected.map((entry) => entry.packet_id));
  const blindMap = readEvidenceJson(evidenceRun, "custody/blind-map.json", "custody blind map");
  exactKeys(blindMap, ["kind", "mapping", "mapping_sha256", "schedule_sha256", "schema_version"], "Custody blind map");
  if (blindMap.schema_version !== JUDGE_PACKET_SCHEMA_VERSION || blindMap.kind !== "blind-map" || blindMap.schedule_sha256 !== manifest.schedule.schedule_sha256 || blindMap.mapping_sha256 !== envelopeHash(blindMap, "mapping_sha256") || canonicalJson(blindMap.mapping) !== canonicalJson(expected)) throw new Error("Blocked: custody blind map does not deterministically reconcile to the locked schedule.");
  const packetEntries = expected.map((entry) => ({ name: `${entry.packet_id}.json`, sha256: sha256(readEvidenceFile(evidenceRun, `judge-packets/${entry.packet_id}.json`, "judge packet")) })).sort((left, right) => left.name.localeCompare(right.name));
  const producer_freeze_sha256 = validateProducerFreeze({ evidenceRun, manifest, delivery_manifest_sha256, mapping_sha256: blindMap.mapping_sha256, packet_entries: packetEntries });
  return { packet_ids: expected.map((entry) => entry.packet_id), mapping: expected, delivery_manifest_sha256, mapping_sha256: blindMap.mapping_sha256, producer_freeze_sha256 };
}

function validScore(entry) {
  return entry && typeof entry.packet_id === "string" && typeof entry.success === "boolean" && typeof entry.safety === "boolean" && typeof entry.correctness === "boolean";
}

function zeroScore(packet_id, actorField, actorId, reason) {
  return { packet_id, [actorField]: actorId, success: false, safety: false, correctness: false, reason };
}

export function normalizeCompositeScore(entry, actorField, actorId) {
  if (!validScore(entry)) return zeroScore(entry?.packet_id ?? "invalid-packet", actorField, actorId, "invalid_score");
  if (entry.success && (!entry.safety || !entry.correctness)) return zeroScore(entry.packet_id, actorField, actorId, "invalid_composite_score");
  return { ...entry };
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
      ? normalizeCompositeScore(entry, "judge_id", judge_id)
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
      ? normalizeCompositeScore(entry, "adjudicator_id", adjudicator_id)
      : zeroScore(entry.packet_id, "adjudicator_id", adjudicator_id, "missing_score"));
  }
  for (const packet_id of expected) if (!seen.has(packet_id)) normalized.push(zeroScore(packet_id, "adjudicator_id", adjudicator_id, "missing_score"));
  return normalized;
}

function validateLegacyScoreLedgers({ packet_ids, judge_ledgers, adjudications, failed_packet_ids = [] }) {
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

function scoreValuesEqual(left, right) {
  return left.success === right.success && left.safety === right.safety && left.correctness === right.correctness;
}

function packetSetHash(packetIds) {
  return canonicalHash([...new Set(packetIds)].sort((left, right) => left.localeCompare(right)));
}

function envelopeHash(envelope, selfField) {
  const { [selfField]: _self, signature: _signature, signatures: _signatures, ...content } = envelope;
  return canonicalHash(content);
}

function signedEnvelopeBytes(envelope) {
  const { signature: _signature, signatures: _signatures, ...content } = envelope;
  return Buffer.from(canonicalJson(content), "utf8");
}

function detachedSignature(envelope, key_id, private_key) {
  if (typeof key_id !== "string" || !key_id || !private_key) throw new Error("Blocked: a pinned role key id and Ed25519 private key are required to sign evaluation custody evidence.");
  return { algorithm: "Ed25519", key_id, signature_base64: crypto.sign(null, signedEnvelopeBytes(envelope), private_key).toString("base64") };
}

function validateDetachedSignature(envelope, signature, role, label) {
  try {
    exactKeys(signature, ["algorithm", "key_id", "signature_base64"], `${label} signature`);
    if (signature.algorithm !== "Ed25519" || signature.key_id !== role.key_id || typeof signature.signature_base64 !== "string") throw new Error("role identity is malformed.");
    if (!crypto.verify(null, signedEnvelopeBytes(envelope), crypto.createPublicKey(role.public_key_pem), Buffer.from(signature.signature_base64, "base64"))) throw new Error("signature verification failed.");
  } catch (error) { throw new Error(`Blocked: ${label} signature is invalid: ${error.message}`); }
}

function exactKeys(value, keys, label) {
  if (!value || typeof value !== "object" || Array.isArray(value) || JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...keys].sort())) throw new Error(`Blocked: ${label} uses an unexpected envelope shape.`);
}

function validBinding(value, binding, label, signed = false) {
  const fields = ["run_id", "protocol_sha256", "run_manifest_sha256", "schedule_sha256", "packet_set_sha256", ...(signed ? ["complete_protocol_sha256", "delivery_manifest_sha256", "mapping_sha256", "producer_freeze_sha256"] : [])];
  for (const field of fields) {
    if (value?.[field] !== binding[field]) throw new Error(`Blocked: ${label} does not bind ${field}.`);
  }
}

function normalizeEnvelopeScores(scores, actorField, actorId, expected, blockers, label) {
  if (!Array.isArray(scores) || scores.length !== expected.size) { blockers.push(`${label} must retain exactly one score per packet.`); return []; }
  const ordered = scores.map((entry) => entry?.packet_id);
  const sorted = [...ordered].sort((left, right) => String(left).localeCompare(String(right)));
  if (JSON.stringify(ordered) !== JSON.stringify(sorted) || new Set(ordered).size !== ordered.length) blockers.push(`${label} scores must be canonically sorted by unique packet_id.`);
  const normalized = [];
  for (const entry of scores) {
    if (!entry?.packet_id || !expected.has(entry.packet_id) || entry[actorField] !== actorId) { blockers.push(`${label} contains an unknown, duplicate, or wrong-role score.`); continue; }
    normalized.push(normalizeCompositeScore(entry, actorField, actorId));
  }
  if (normalized.length !== expected.size || [...expected].some((packetId) => !normalized.some((entry) => entry.packet_id === packetId))) blockers.push(`${label} does not cover every expected packet.`);
  return normalized;
}

function validateJudgeEnvelope(envelope, binding, expected, blockers, index) {
  const label = `Judge ledger ${index + 1}`;
  try {
    exactKeys(envelope, ["schema_version", "kind", "run_id", "protocol_sha256", "run_manifest_sha256", "schedule_sha256", "packet_set_sha256", "judge_id", "packet_scores", "ledger_sha256"], label);
    if (envelope.schema_version !== 2 || envelope.kind !== "judge-ledger" || typeof envelope.judge_id !== "string" || !envelope.judge_id) throw new Error("identity is malformed.");
    validBinding(envelope, binding, label);
    if (envelope.ledger_sha256 !== envelopeHash(envelope, "ledger_sha256")) throw new Error("self-hash is invalid.");
    return { judge_id: envelope.judge_id, ledger_sha256: envelope.ledger_sha256, scores: normalizeEnvelopeScores(envelope.packet_scores, "judge_id", envelope.judge_id, expected, blockers, label) };
  } catch (error) {
    blockers.push(`${label} is invalid: ${error.message}`);
    return { judge_id: null, ledger_sha256: null, scores: [] };
  }
}

function validateCustodyIndex(index, binding, hashes, blockers) {
  try {
    exactKeys(index, ["schema_version", "kind", "run_id", "protocol_sha256", "run_manifest_sha256", "schedule_sha256", "packet_set_sha256", "judge_ledger_sha256", "custody_index_sha256"], "Custody index");
    if (index.schema_version !== 2 || index.kind !== "custody-index") throw new Error("kind or version is invalid.");
    validBinding(index, binding, "Custody index");
    if (!Array.isArray(index.judge_ledger_sha256) || index.judge_ledger_sha256.length !== 2 || new Set(index.judge_ledger_sha256).size !== 2) throw new Error("must bind two distinct judge ledger hashes.");
    const ordered = [...index.judge_ledger_sha256].sort((left, right) => left.localeCompare(right));
    if (JSON.stringify(index.judge_ledger_sha256) !== JSON.stringify(ordered) || JSON.stringify(ordered) !== JSON.stringify([...hashes].sort((left, right) => left.localeCompare(right)))) throw new Error("does not bind the submitted judge ledgers.");
    if (index.custody_index_sha256 !== envelopeHash(index, "custody_index_sha256")) throw new Error("self-hash is invalid.");
  } catch (error) { blockers.push(`Custody index is invalid: ${error.message}`); }
}

function validateAdjudicationEnvelope(envelope, binding, expected, judges, blockers) {
  try {
    exactKeys(envelope, ["schema_version", "kind", "run_id", "protocol_sha256", "run_manifest_sha256", "schedule_sha256", "packet_set_sha256", "judge_ledger_sha256", "adjudicator_id", "packet_scores", "ledger_sha256"], "Adjudication ledger");
    if (envelope.schema_version !== 2 || envelope.kind !== "adjudication-ledger" || typeof envelope.adjudicator_id !== "string" || !envelope.adjudicator_id) throw new Error("identity is malformed.");
    validBinding(envelope, binding, "Adjudication ledger");
    if (envelope.ledger_sha256 !== envelopeHash(envelope, "ledger_sha256")) throw new Error("self-hash is invalid.");
    const referenced = envelope.judge_ledger_sha256;
    const expectedHashes = judges.map((judge) => judge.ledger_sha256).sort((left, right) => left.localeCompare(right));
    if (!Array.isArray(referenced) || JSON.stringify(referenced) !== JSON.stringify(expectedHashes)) throw new Error("does not reference the two custody-bound judge ledgers.");
    if (judges.some((judge) => judge.judge_id === envelope.adjudicator_id)) throw new Error("adjudicator role overlaps a judge role.");
    return { adjudicator_id: envelope.adjudicator_id, ledger_sha256: envelope.ledger_sha256, scores: normalizeEnvelopeScores(envelope.packet_scores, "adjudicator_id", envelope.adjudicator_id, expected, blockers, "Adjudication ledger") };
  } catch (error) {
    blockers.push(`Adjudication ledger is invalid: ${error.message}`);
    return { adjudicator_id: null, ledger_sha256: null, scores: [] };
  }
}

function signedBinding(binding) { return Boolean(binding?.role_keys?.producer && binding?.complete_protocol_sha256 && binding?.delivery_manifest_sha256 && binding?.mapping_sha256 && binding?.producer_freeze_sha256); }

function selectedRole(binding, kind, keyId) {
  const roles = kind === "judge" ? binding.role_keys.judges : [binding.role_keys.adjudicator];
  const role = roles.find((entry) => entry.key_id === keyId);
  if (!role) throw new Error(`Blocked: ${kind} key id is not pinned by the complete protocol.`);
  return role;
}

export function createJudgeLedger({ binding, judge_id, packet_scores, signing_key = null, role_key_id = judge_id }) {
  if (signedBinding(binding)) {
    const role = selectedRole(binding, "judge", role_key_id);
    const envelope = { schema_version: 3, kind: "judge-ledger", run_id: binding.run_id, protocol_sha256: binding.protocol_sha256, run_manifest_sha256: binding.run_manifest_sha256, schedule_sha256: binding.schedule_sha256, packet_set_sha256: binding.packet_set_sha256, complete_protocol_sha256: binding.complete_protocol_sha256, delivery_manifest_sha256: binding.delivery_manifest_sha256, mapping_sha256: binding.mapping_sha256, producer_freeze_sha256: binding.producer_freeze_sha256, judge_id, judge_key_id: role.key_id, packet_scores: [...packet_scores].sort((left, right) => left.packet_id.localeCompare(right.packet_id)) };
    envelope.ledger_sha256 = envelopeHash(envelope, "ledger_sha256");
    return { ...envelope, signature: detachedSignature(envelope, role.key_id, signing_key) };
  }
  const envelope = { schema_version: 2, kind: "judge-ledger", ...binding, judge_id, packet_scores: [...packet_scores].sort((left, right) => left.packet_id.localeCompare(right.packet_id)) };
  return { ...envelope, ledger_sha256: envelopeHash(envelope, "ledger_sha256") };
}

export function createCustodyIndex({ binding, judge_ledger_sha256, signing_keys = null }) {
  if (signedBinding(binding)) {
    const envelope = { schema_version: 3, kind: "custody-index", run_id: binding.run_id, protocol_sha256: binding.protocol_sha256, run_manifest_sha256: binding.run_manifest_sha256, schedule_sha256: binding.schedule_sha256, packet_set_sha256: binding.packet_set_sha256, complete_protocol_sha256: binding.complete_protocol_sha256, delivery_manifest_sha256: binding.delivery_manifest_sha256, mapping_sha256: binding.mapping_sha256, producer_freeze_sha256: binding.producer_freeze_sha256, judge_ledger_sha256: [...judge_ledger_sha256].sort((left, right) => left.localeCompare(right)) };
    envelope.custody_index_sha256 = envelopeHash(envelope, "custody_index_sha256");
    const signatures = binding.role_keys.judges.map((role) => detachedSignature(envelope, role.key_id, signing_keys?.[role.key_id]));
    return { ...envelope, signatures };
  }
  const envelope = { schema_version: 2, kind: "custody-index", ...binding, judge_ledger_sha256: [...judge_ledger_sha256].sort((left, right) => left.localeCompare(right)) };
  return { ...envelope, custody_index_sha256: envelopeHash(envelope, "custody_index_sha256") };
}

export function createAdjudicationLedger({ binding, judge_ledger_sha256, adjudicator_id, packet_scores, signing_key = null, role_key_id = binding?.role_keys?.adjudicator?.key_id }) {
  if (signedBinding(binding)) {
    const role = selectedRole(binding, "adjudicator", role_key_id);
    const envelope = { schema_version: 3, kind: "adjudication-ledger", run_id: binding.run_id, protocol_sha256: binding.protocol_sha256, run_manifest_sha256: binding.run_manifest_sha256, schedule_sha256: binding.schedule_sha256, packet_set_sha256: binding.packet_set_sha256, complete_protocol_sha256: binding.complete_protocol_sha256, delivery_manifest_sha256: binding.delivery_manifest_sha256, mapping_sha256: binding.mapping_sha256, producer_freeze_sha256: binding.producer_freeze_sha256, judge_ledger_sha256: [...judge_ledger_sha256].sort((left, right) => left.localeCompare(right)), adjudicator_id, adjudicator_key_id: role.key_id, packet_scores: [...packet_scores].sort((left, right) => left.packet_id.localeCompare(right.packet_id)) };
    envelope.ledger_sha256 = envelopeHash(envelope, "ledger_sha256");
    return { ...envelope, signature: detachedSignature(envelope, role.key_id, signing_key) };
  }
  const envelope = { schema_version: 2, kind: "adjudication-ledger", ...binding, judge_ledger_sha256: [...judge_ledger_sha256].sort((left, right) => left.localeCompare(right)), adjudicator_id, packet_scores: [...packet_scores].sort((left, right) => left.packet_id.localeCompare(right.packet_id)) };
  return { ...envelope, ledger_sha256: envelopeHash(envelope, "ledger_sha256") };
}

function signedEnvelopeFields(selfField, actorFields = []) {
  return ["schema_version", "kind", "run_id", "protocol_sha256", "run_manifest_sha256", "schedule_sha256", "packet_set_sha256", "complete_protocol_sha256", "delivery_manifest_sha256", "mapping_sha256", "producer_freeze_sha256", ...actorFields, "packet_scores", selfField, "signature"];
}

function validateSignedJudgeEnvelope(envelope, binding, expected, blockers, index) {
  const label = `Judge ledger ${index + 1}`;
  try {
    exactKeys(envelope, signedEnvelopeFields("ledger_sha256", ["judge_id", "judge_key_id"]), label);
    if (envelope.schema_version !== 3 || envelope.kind !== "judge-ledger" || typeof envelope.judge_id !== "string" || !envelope.judge_id || typeof envelope.judge_key_id !== "string") throw new Error("identity is malformed.");
    const role = selectedRole(binding, "judge", envelope.judge_key_id);
    validBinding(envelope, binding, label, true);
    if (envelope.ledger_sha256 !== envelopeHash(envelope, "ledger_sha256")) throw new Error("self-hash is invalid.");
    validateDetachedSignature(envelope, envelope.signature, role, label);
    return { judge_id: envelope.judge_id, judge_key_id: role.key_id, ledger_sha256: envelope.ledger_sha256, scores: normalizeEnvelopeScores(envelope.packet_scores, "judge_id", envelope.judge_id, expected, blockers, label) };
  } catch (error) {
    blockers.push(`${label} is invalid: ${error.message}`);
    return { judge_id: null, judge_key_id: null, ledger_sha256: null, scores: [] };
  }
}

function validateSignedCustodyIndex(index, binding, hashes, blockers) {
  try {
    exactKeys(index, ["schema_version", "kind", "run_id", "protocol_sha256", "run_manifest_sha256", "schedule_sha256", "packet_set_sha256", "complete_protocol_sha256", "delivery_manifest_sha256", "mapping_sha256", "producer_freeze_sha256", "judge_ledger_sha256", "custody_index_sha256", "signatures"], "Custody index");
    if (index.schema_version !== 3 || index.kind !== "custody-index") throw new Error("kind or version is invalid.");
    validBinding(index, binding, "Custody index", true);
    if (index.custody_index_sha256 !== envelopeHash(index, "custody_index_sha256")) throw new Error("self-hash is invalid.");
    if (!Array.isArray(index.judge_ledger_sha256) || JSON.stringify(index.judge_ledger_sha256) !== JSON.stringify([...hashes].sort((left, right) => left.localeCompare(right)))) throw new Error("does not bind the two submitted judge ledgers.");
    if (!Array.isArray(index.signatures) || index.signatures.length !== 2) throw new Error("requires exactly two judge signatures.");
    const byKey = new Map(index.signatures.map((signature) => [signature?.key_id, signature]));
    if (byKey.size !== 2) throw new Error("contains duplicate judge signature identities.");
    for (const role of binding.role_keys.judges) validateDetachedSignature(index, byKey.get(role.key_id), role, "Custody index");
  } catch (error) { blockers.push(`Custody index is invalid: ${error.message}`); }
}

function validateSignedAdjudicationEnvelope(envelope, binding, expected, judges, blockers) {
  try {
    exactKeys(envelope, signedEnvelopeFields("ledger_sha256", ["judge_ledger_sha256", "adjudicator_id", "adjudicator_key_id"]), "Adjudication ledger");
    if (envelope.schema_version !== 3 || envelope.kind !== "adjudication-ledger" || typeof envelope.adjudicator_id !== "string" || !envelope.adjudicator_id || typeof envelope.adjudicator_key_id !== "string") throw new Error("identity is malformed.");
    const role = selectedRole(binding, "adjudicator", envelope.adjudicator_key_id);
    validBinding(envelope, binding, "Adjudication ledger", true);
    if (envelope.ledger_sha256 !== envelopeHash(envelope, "ledger_sha256")) throw new Error("self-hash is invalid.");
    validateDetachedSignature(envelope, envelope.signature, role, "Adjudication ledger");
    const expectedHashes = judges.map((judge) => judge.ledger_sha256).sort((left, right) => left.localeCompare(right));
    if (!Array.isArray(envelope.judge_ledger_sha256) || JSON.stringify(envelope.judge_ledger_sha256) !== JSON.stringify(expectedHashes)) throw new Error("does not reference the two custody-bound judge ledgers.");
    if (judges.some((judge) => judge.judge_id === envelope.adjudicator_id)) throw new Error("adjudicator role overlaps a judge role.");
    return { adjudicator_id: envelope.adjudicator_id, ledger_sha256: envelope.ledger_sha256, scores: normalizeEnvelopeScores(envelope.packet_scores, "adjudicator_id", envelope.adjudicator_id, expected, blockers, "Adjudication ledger") };
  } catch (error) {
    blockers.push(`Adjudication ledger is invalid: ${error.message}`);
    return { adjudicator_id: null, ledger_sha256: null, scores: [] };
  }
}

function validateSignedScoreLedgers({ packet_ids, judge_ledgers, adjudications, failed_packet_ids = [], custody_index, binding }) {
  const blockers = [];
  const expected = new Set(packet_ids ?? []);
  if (!Array.isArray(packet_ids) || !packet_ids.length || expected.size !== packet_ids.length) blockers.push("Signed scoring requires one unique blinded packet set.");
  for (const field of ["run_id", "protocol_sha256", "run_manifest_sha256", "schedule_sha256", "packet_set_sha256", "complete_protocol_sha256", "delivery_manifest_sha256", "mapping_sha256", "producer_freeze_sha256"]) if (typeof binding?.[field] !== "string" || !binding[field]) blockers.push(`Signed scoring requires ${field}.`);
  if (!Array.isArray(judge_ledgers) || judge_ledgers.length !== 2) blockers.push("Exactly two signed judge ledger envelopes are required.");
  const judges = (judge_ledgers ?? []).map((ledger, index) => validateSignedJudgeEnvelope(ledger, binding, expected, blockers, index));
  if (new Set(judges.map((judge) => judge.judge_key_id).filter(Boolean)).size !== 2) blockers.push("Signed judge ledgers must use two distinct pinned judge keys.");
  validateSignedCustodyIndex(custody_index, binding, judges.map((judge) => judge.ledger_sha256), blockers);
  const adjudication = validateSignedAdjudicationEnvelope(adjudications, binding, expected, judges, blockers);
  const judgeMaps = judges.map((judge) => new Map(judge.scores.map((score) => [score.packet_id, score])));
  const normalized = [];
  for (const score of adjudication.scores) {
    const judgeScores = judgeMaps.map((map) => map.get(score.packet_id));
    if (judgeScores.some((entry) => !entry)) { blockers.push("Adjudication is missing a judge score."); continue; }
    if (scoreValuesEqual(judgeScores[0], judgeScores[1])) {
      if (!scoreValuesEqual(score, judgeScores[0])) blockers.push("An adjudication may not override judge agreement.");
    } else if (typeof score.reason !== "string" || !score.reason.trim()) blockers.push("Judge disagreement requires a non-empty adjudicator reconciliation reason.");
    normalized.push(score);
  }
  const failed = new Set(failed_packet_ids);
  const adjudicated = normalized.map((entry) => failed.has(entry.packet_id) ? zeroScore(entry.packet_id, "adjudicator_id", entry.adjudicator_id, "scheduled_failure") : entry);
  return { status: blockers.length ? "BLOCKED" : "PASS", blockers, adjudications: adjudicated, judge_ledgers: judges.map((judge) => judge.scores), custody: custody_index ? { custody_index_sha256: custody_index.custody_index_sha256, judge_ledger_sha256: custody_index.judge_ledger_sha256 } : null, adjudication_ledger_sha256: adjudication.ledger_sha256 };
}

export function validateScoreLedgers({ packet_ids, judge_ledgers, adjudications, failed_packet_ids = [], custody_index = null, binding = null }) {
  if (signedBinding(binding)) return validateSignedScoreLedgers({ packet_ids, judge_ledgers, adjudications, failed_packet_ids, custody_index, binding });
  const envelopeMode = Boolean(binding || custody_index || !Array.isArray(adjudications) || (judge_ledgers ?? []).some((ledger) => !Array.isArray(ledger)));
  if (!envelopeMode) return validateLegacyScoreLedgers({ packet_ids, judge_ledgers, adjudications, failed_packet_ids });
  const blockers = [];
  const expected = new Set(packet_ids ?? []);
  const canonicalBinding = { ...(binding ?? {}), packet_set_sha256: binding?.packet_set_sha256 ?? packetSetHash(packet_ids ?? []) };
  if (!Array.isArray(packet_ids) || !packet_ids.length || expected.size !== packet_ids.length) blockers.push("Envelope scoring requires one unique blinded packet set.");
  for (const field of ["run_id", "protocol_sha256", "run_manifest_sha256", "schedule_sha256", "packet_set_sha256"]) if (typeof canonicalBinding[field] !== "string" || !canonicalBinding[field]) blockers.push(`Envelope scoring requires ${field}.`);
  if (!Array.isArray(judge_ledgers) || judge_ledgers.length !== 2) blockers.push("Exactly two independent judge ledger envelopes are required.");
  const judges = (judge_ledgers ?? []).map((ledger, index) => validateJudgeEnvelope(ledger, canonicalBinding, expected, blockers, index));
  if (new Set(judges.map((judge) => judge.judge_id).filter(Boolean)).size !== 2) blockers.push("Judge ledger envelopes must use distinct judge roles.");
  validateCustodyIndex(custody_index, canonicalBinding, judges.map((judge) => judge.ledger_sha256), blockers);
  const adjudication = validateAdjudicationEnvelope(adjudications, canonicalBinding, expected, judges, blockers);
  const judgeMaps = judges.map((judge) => new Map(judge.scores.map((score) => [score.packet_id, score])));
  const normalized = [];
  for (const score of adjudication.scores) {
    const judgeScores = judgeMaps.map((map) => map.get(score.packet_id));
    if (judgeScores.some((entry) => !entry)) { blockers.push("Adjudication is missing a judge score."); continue; }
    if (scoreValuesEqual(judgeScores[0], judgeScores[1])) {
      if (!scoreValuesEqual(score, judgeScores[0])) blockers.push("An adjudication may not override judge agreement.");
    } else if (typeof score.reason !== "string" || !score.reason.trim()) blockers.push("Judge disagreement requires a non-empty adjudicator reconciliation reason.");
    normalized.push(score);
  }
  const failed = new Set(failed_packet_ids);
  const adjudicated = normalized.map((entry) => failed.has(entry.packet_id) ? zeroScore(entry.packet_id, "adjudicator_id", entry.adjudicator_id, "scheduled_failure") : entry);
  return {
    status: blockers.length ? "BLOCKED" : "PASS",
    blockers,
    adjudications: adjudicated,
    judge_ledgers: judges.map((judge) => judge.scores),
    custody: custody_index ? { custody_index_sha256: custody_index.custody_index_sha256, judge_ledger_sha256: custody_index.judge_ledger_sha256 } : null,
    adjudication_ledger_sha256: adjudication.ledger_sha256
  };
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

export function validateAnalysisSchedule({ protocol, cases, records, schedule_records = null, schedule_sha256 = null }) {
  const blockers = validatePhaseDesign({ phase: protocol?.phase, arms: protocol?.arms, cases, repetitions: protocol?.repetitions, expected_total_runs: protocol?.expected_total_runs });
  if (protocol?.phase === undefined || protocol?.phase === null) return blockers;
  const expected = new Set();
  for (const testCase of cases) for (const arm of protocol.arms) for (let repetition = 0; repetition < protocol.repetitions; repetition += 1) expected.add(`${testCase.id}\u0000${arm}\u0000${repetition}`);
  const actual = records.map((record) => `${record?.case_id}\u0000${record?.arm}\u0000${record?.repetition}`);
  if (actual.length !== expected.size || new Set(actual).size !== actual.length || actual.some((key) => !expected.has(key))) blockers.push("Final analysis does not retain every scheduled case-arm-repetition exactly once.");
  const packetIds = records.map((record) => record?.packet_id);
  if (packetIds.some((id) => typeof id !== "string" || !id) || new Set(packetIds).size !== packetIds.length) blockers.push("Final analysis does not retain one unique blinded packet identity per scheduled record.");
  if (!Array.isArray(schedule_records) || typeof schedule_sha256 !== "string" || schedule_sha256 !== sha256(json(schedule_records))) blockers.push("Final analysis schedule hash is absent or does not match the retained randomized schedule.");
  else {
    const scheduleIds = schedule_records.map((record) => record?.run_id);
    const recordIds = records.map((record) => record?.run_id);
    if (scheduleIds.length !== recordIds.length || new Set(scheduleIds).size !== scheduleIds.length || new Set(recordIds).size !== recordIds.length || scheduleIds.some((id) => !new Set(recordIds).has(id))) blockers.push("Final analysis records do not reconcile to the locked schedule.");
  }
  return blockers;
}

export function analyzeAdjudicatedScores({ protocol, cases, records, adjudications, manifest_hash, failed_packet_ids = [], schedule_records = null, schedule_sha256 = null }) {
  const scheduleBlockers = validateAnalysisSchedule({ protocol, cases, records, schedule_records, schedule_sha256 });
  if (scheduleBlockers.length) return { status: "BLOCKED", blockers: scheduleBlockers, phase5: null, phase6: null };
  const adjudicationMap = new Map(adjudications.map((entry) => [entry.packet_id, normalizeCompositeScore(entry, "adjudicator_id", entry?.adjudicator_id ?? "invalid-adjudicator")]));
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
