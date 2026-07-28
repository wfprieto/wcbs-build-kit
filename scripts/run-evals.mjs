#!/usr/bin/env node
// Gate 0C evaluation entry point. Default mode is structural preflight only.
// Paid execution is permitted only after the preregistration records the exact
// agent version, immutable model id, and treatment runtime.
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { runEval } from "./lib/eval-runner.mjs";

const root = process.cwd();
const args = process.argv.slice(2);
const failures = [];
const notes = [];
const fail = (message) => failures.push(message);
const note = (message) => notes.push(message);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback = null) => {
  const prefix = `--${name}=`;
  const inline = args.find((value) => value.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : fallback;
};
const strict = flag("strict");
const execute = flag("execute");

function repositoryPath(relative, label) {
  if (typeof relative !== "string" || !relative) { fail(`${label} must be a non-empty repository-relative path.`); return null; }
  const resolved = path.resolve(root, relative);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) { fail(`${label} escapes the repository root: ${relative}`); return null; }
  return resolved;
}

function readJson(relative, label = relative) {
  const file = repositoryPath(relative, label);
  if (!file) return null;
  if (!fs.existsSync(file)) { fail(`Missing required eval artifact: ${relative}`); return null; }
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { fail(`${relative} is not valid JSON: ${error.message}`); return null; }
}

function positiveInteger(value, label, maximum = Number.MAX_SAFE_INTEGER) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) { fail(`${label} must be a positive integer.`); return null; }
  if (number > maximum) { fail(`${label} must be at most ${maximum}.`); return null; }
  return number;
}

function validRunId(value) {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value) && value !== "." && value !== "..";
}

const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const preregistration = readJson("evals/gate-0c-preregistration.json");
const registryPath = preregistration?.case_registry ?? "evals/gate-0c-cases.json";
const controlManifestPath = preregistration?.control_project_manifest ?? "evals/control-project-manifest.json";
const registry = readJson(registryPath, "case_registry");
const controlManifest = readJson(controlManifestPath, "control_project_manifest");
const cases = Array.isArray(registry?.cases) ? registry.cases : [];

if (!cases.length) fail(`${registryPath} declares no cases.`);
const seenCaseIds = new Set();
for (const entry of cases) {
  if (!entry?.id) { fail(`${registryPath} contains a case with no id.`); continue; }
  if (seenCaseIds.has(entry.id)) fail(`${registryPath} contains duplicate case id: ${entry.id}`);
  seenCaseIds.add(entry.id);
  if (typeof entry.prompt !== "string" || !entry.prompt.trim()) fail(`Case ${entry.id} has no prompt; prompts are locked before measurement.`);
  if (!Array.isArray(entry.activation) || !entry.activation.length) fail(`Case ${entry.id} has no activation criteria.`);
}

const lockedRuns = positiveInteger(registry?.runs_per_case_per_arm, `${registryPath} runs_per_case_per_arm`);
if (lockedRuns !== null && preregistration?.runs_per_case_per_arm !== lockedRuns) fail(`runs_per_case_per_arm disagrees between ${registryPath} and the preregistration.`);

if (!Array.isArray(controlManifest?.files)) {
  fail(`${controlManifestPath} must declare a files array.`);
} else if (typeof controlManifest?.root !== "string") {
  fail(`${controlManifestPath} must declare a control-project root.`);
} else {
  const controlRoot = repositoryPath(controlManifest.root, "control project root");
  if (controlRoot && !fs.existsSync(controlRoot)) fail(`Control project root is missing: ${controlManifest.root}`);
  if (controlRoot && fs.existsSync(controlRoot)) {
    const actual = [];
    const walk = (directory, relative = "") => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const child = path.posix.join(relative, entry.name);
        const absolute = path.join(directory, entry.name);
        if (entry.isSymbolicLink()) { fail(`Control project must not contain symlinks: ${child}`); continue; }
        if (entry.isDirectory()) walk(absolute, child);
        else if (entry.isFile()) actual.push(child);
        else fail(`Control project contains unsupported entry: ${child}`);
      }
    };
    walk(controlRoot);
    const declared = controlManifest.files.map((entry) => entry?.path).sort();
    actual.sort();
    if (JSON.stringify(actual) !== JSON.stringify(declared)) fail(`Control project file set drifted from ${controlManifestPath}.`);
    for (const entry of controlManifest.files) {
      if (typeof entry?.path !== "string" || typeof entry?.sha256 !== "string") { fail(`${controlManifestPath} has an invalid file record.`); continue; }
      const file = path.resolve(controlRoot, entry.path);
      if (file !== controlRoot && !file.startsWith(`${controlRoot}${path.sep}`)) { fail(`Control project manifest path escapes its root: ${entry.path}`); continue; }
      if (!fs.existsSync(file)) { fail(`Control project file missing: ${entry.path}`); continue; }
      if (sha256(file) !== entry.sha256) fail(`Control project file content drifted: ${entry.path}`);
    }
    for (const forbidden of controlManifest.forbidden_baseline_entries ?? []) {
      const forbiddenPath = path.resolve(controlRoot, forbidden);
      if (forbiddenPath !== controlRoot && !forbiddenPath.startsWith(`${controlRoot}${path.sep}`)) { fail(`Forbidden baseline entry escapes control root: ${forbidden}`); continue; }
      if (fs.existsSync(forbiddenPath)) fail(`Baseline contamination in control project: ${forbidden}`);
    }
  }
}

const identity = preregistration?.execution_identity ?? {};
const identityRecorded = Boolean(identity.agent_version) && Boolean(identity.model_id);
const target = preregistration?.treatment_runtime_id;
if (typeof target !== "string" || !/^[a-z0-9-]+$/.test(target)) fail("treatment_runtime_id must be a valid runtime id.");
else if (!fs.existsSync(path.join(root, "runtime_adapters", "manifests", `${target}.json`))) fail(`treatment_runtime_id is not a shipped runtime: ${target}`);
if (!identityRecorded) note("Execution identity is not recorded. Evidence state: Blocked. Paid runs must not start until the exact agent version and full immutable model id are committed to evals/gate-0c-preregistration.json.");
if (identity.model_id && /^(sonnet|opus|haiku)$/i.test(String(identity.model_id))) fail(`execution_identity.model_id is an alias (${identity.model_id}); the preregistration requires a full immutable model id.`);

console.log("WCBS Gate 0C Eval Harness");
console.log(`Mode: ${execute ? "execute" : strict ? "preflight (strict)" : "preflight"}`);
console.log(`Cases registered: ${cases.length}`);
console.log(`Runs per case per arm: ${lockedRuns ?? "invalid"}`);
console.log(`Treatment runtime: ${target ?? "invalid"}`);
console.log(`Execution identity recorded: ${identityRecorded ? "yes" : "no"}`);

if (failures.length) {
  console.error("FAIL: eval preflight found structural problems:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (!execute) {
  for (const message of notes) console.log(`NOTE: ${message}`);
  if (strict && !identityRecorded) {
    console.error("FAIL: --strict requires a recorded execution identity before the eval is runnable.");
    process.exit(1);
  }
  console.log(identityRecorded
    ? "PASS: eval preflight is clean and execution identity is recorded. Run with --execute to perform paid runs."
    : "PASS: eval preflight is clean. Execution state is Blocked pending a recorded execution identity; no runs were performed and no scores were produced.");
  process.exit(0);
}

if (!identityRecorded) {
  console.error("FAIL: refusing to execute paid runs. Record execution_identity.agent_version and execution_identity.model_id in a commit before the first paid run.");
  process.exit(1);
}

const agentCommand = option("agent-command");
const credentialName = option("credential-name", "WCBS_EVAL_CREDENTIAL");
const credential = process.env[credentialName];
const timeoutMs = positiveInteger(option("timeout-ms", "600000"), "timeout-ms", 3_600_000);
if (!agentCommand) { console.error("FAIL: --agent-command is required in execute mode and must name the preregistered agent executable."); process.exit(1); }
if (!credential) { console.error(`FAIL: environment variable ${credentialName} is not set. The runner refuses to execute without a credential to redact.`); process.exit(1); }
if (timeoutMs === null) { console.error("FAIL: timeout-ms must be a positive integer at most 3600000."); process.exit(1); }
const runId = option("run-id", `gate-0c-${new Date().toISOString().replace(/[:.]/g, "-")}`);
if (!validRunId(runId)) { console.error("FAIL: run-id must be one safe path segment using letters, digits, dots, underscores, or hyphens."); process.exit(1); }
const runRoot = path.join(root, "evals", "runs", runId);
if (fs.existsSync(runRoot)) { console.error(`FAIL: eval run directory already exists: evals/runs/${runId}`); process.exit(1); }
fs.mkdirSync(runRoot, { recursive: true });

function stageArm(arm) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), `wcbs-eval-${arm}-`));
  fs.cpSync(path.join(root, ...controlManifest.root.split("/")), directory, { recursive: true });
  if (arm === "treatment") {
    const install = spawnSync(process.execPath, ["scripts/install-adapter.mjs", "--target", target, "--dest", directory, "--install"], { cwd: root, encoding: "utf8" });
    if (install.status !== 0) throw new Error(`treatment arm staging failed: ${install.stdout}${install.stderr}`);
  }
  return directory;
}

const runManifest = { run_id: runId, execution_identity: identity, treatment_runtime_id: target, runs_per_case_per_arm: lockedRuns, transcripts: [] };
for (const testCase of cases) {
  for (const arm of ["baseline", "treatment"]) {
    for (let index = 0; index < lockedRuns; index += 1) {
      const transcript = path.join(runRoot, `${testCase.id}.${arm}.${index}.json`);
      let workspace = null;
      try {
        workspace = stageArm(arm);
        const result = await runEval({ command: agentCommand, args: [testCase.prompt], cwd: workspace, transcriptPath: transcript, credential, credentialName, timeoutMs });
        const relativeTranscript = path.relative(root, transcript).split(path.sep).join("/");
        if (result.exit_code !== 0) runManifest.transcripts.push({ case: testCase.id, arm, index, transcript: relativeTranscript, activation: "Blocked", exit_code: result.exit_code, reason: "agent process exited nonzero" });
        else runManifest.transcripts.push({ case: testCase.id, arm, index, transcript: relativeTranscript, activation: "Not Run", exit_code: result.exit_code });
      } catch (error) {
        runManifest.transcripts.push({ case: testCase.id, arm, index, transcript: null, activation: "Blocked", reason: String(error.message) });
      } finally {
        if (workspace) fs.rmSync(workspace, { recursive: true, force: true });
      }
    }
  }
}
fs.writeFileSync(path.join(runRoot, "run-manifest.json"), `${JSON.stringify(runManifest, null, 2)}\n`, "utf8");
const blocked = runManifest.transcripts.filter((record) => record.activation === "Blocked");
console.log(`Run manifest: evals/runs/${runId}/run-manifest.json`);
if (blocked.length) { console.error(`BLOCKED: ${blocked.length} eval invocations did not complete successfully; do not publish activation evidence.`); process.exit(1); }
console.log("PASS: paid runs completed. Human scoring remains required before publishing activation evidence.");
