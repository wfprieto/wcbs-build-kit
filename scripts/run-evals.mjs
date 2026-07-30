#!/usr/bin/env node
// Behavioral evaluation entry point. Default mode is non-paid preflight only.
// It will never infer an agent command or native runtime loader from a support
// claim: those must be preregistered from vendor documentation before execute.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { executeProtocol, preflightProtocol, resolveExternalEvidenceRun } from "./lib/evaluation-protocol.mjs";

const root = process.cwd();
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback = null) => {
  const prefix = `--${name}=`;
  const inline = args.find((value) => value.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : fallback;
};
const validRunId = (value) => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value) && value !== "." && value !== "..";

function repositoryPath(relative, label) {
  if (typeof relative !== "string" || !relative) throw new Error(`Blocked: ${label} must be a non-empty repository-relative path.`);
  const resolved = path.resolve(root, ...relative.split("/"));
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) throw new Error(`Blocked: ${label} escapes the repository root: ${relative}`);
  return resolved;
}

function readJson(relative, label) {
  const file = repositoryPath(relative, label);
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { throw new Error(`Blocked: cannot read ${label}: ${error.message}`); }
}

function loadProtocol(relative) {
  const preregistration = readJson(relative, "protocol preregistration");
  const registry = readJson(preregistration.case_registry, "case registry");
  if (!Array.isArray(registry.cases)) throw new Error("Blocked: case registry must provide a cases array.");
  const cases = registry.cases.map((entry) => ({
    id: entry.id,
    prompt: entry.prompt,
    criteria: entry.activation,
    activation: entry.activation
  }));
  return { ...preregistration, cases };
}

function printPreflight({ protocolPath, protocol, preflight, execute }) {
  console.log("WCBS Behavioral Evaluation Harness");
  console.log(`Mode: ${execute ? "execute" : "preflight"}`);
  console.log(`Protocol: ${protocolPath}`);
  console.log(`Phase: ${protocol.phase ?? "unspecified"}`);
  console.log(`Arms: ${(protocol.arms ?? []).join(", ") || "invalid"}`);
  console.log(`Scheduled runs: ${preflight.expected_total_runs ?? "invalid"}`);
  console.log(`Preflight: ${preflight.status}`);
  for (const blocker of preflight.blockers) console.log(`BLOCKED: ${blocker}`);
}

const protocolPath = option("protocol", "evals/gate-0c-preregistration.json");
const execute = flag("execute");
const strict = flag("strict");
const superpowersSource = option("superpowers-source");
const evidenceDir = option("evidence-dir");
let protocol;
try {
  protocol = loadProtocol(protocolPath);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

if (execute && !evidenceDir) {
  console.error("BLOCKED: --evidence-dir is required for evaluation execution and must name an absolute directory outside the source checkout.");
  process.exit(1);
}

let evidence = null;
const runId = option("run-id");
const seed = option("seed");
if (execute) {
  if (!validRunId(runId)) { console.error("BLOCKED: --run-id must be one safe path segment using letters, digits, dots, underscores, or hyphens."); process.exit(1); }
  if (typeof seed !== "string" || seed.length < 8) { console.error("BLOCKED: --seed must be a supplied safe string of at least eight characters."); process.exit(1); }
  try { evidence = resolveExternalEvidenceRun({ root, evidence_dir: evidenceDir, run_id: runId, create: true }); }
  catch (error) { console.error(error.message); process.exit(1); }
}

const preflight = preflightProtocol({ root, protocol, superpowers_source: superpowersSource, strict: strict || execute });
printPreflight({ protocolPath, protocol, preflight, execute });

if (!execute) {
  if (strict && preflight.status !== "PASS") {
    console.error("FAIL: --strict requires a complete immutable execution identity, pinned loaders, and every protocol preflight gate to pass before any run directory is created.");
    process.exit(1);
  }
  console.log(preflight.status === "PASS"
    ? "PASS: non-paid preflight is complete. Use --execute with a supplied seed and protected credential only after reviewing the immutable protocol."
    : "BLOCKED: non-paid preflight found incomplete preregistration. No paid run, score, support-label update, or comparison claim was produced.");
  process.exit(0);
}

if (preflight.status !== "PASS") {
  console.error("BLOCKED: execute mode refuses to create a run directory until strict preflight passes.");
  process.exit(1);
}

const credentialName = protocol.execution_identity.credential_name;
const credential = process.env[credentialName];
if (!credential) { console.error(`BLOCKED: ${credentialName} is not set. The runner refuses to execute without a protected credential value to redact.`); process.exit(1); }
const result = await executeProtocol({
  root,
  protocol,
  run_id: runId,
  evidence,
  seed,
  credential,
  superpowers_source: superpowersSource
});
console.log(`Run directory: ${result.run_directory ?? evidence.run_directory}`);
console.log(`Execution result: ${result.status}`);
for (const blocker of result.blockers ?? []) console.error(`BLOCKED: ${blocker}`);
if (result.status !== "PASS") process.exit(1);
const failedAttempts = result.manifest.records.filter((record) => record.status === "Failed").length;
console.log(`PASS: ${result.manifest.records.length} scheduled attempts were retained (${failedAttempts} failure-as-data records). Generate blinded packets and obtain two independent ledgers plus adjudication before any statistical result is analyzed.`);
