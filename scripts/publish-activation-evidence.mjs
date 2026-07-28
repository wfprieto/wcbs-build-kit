#!/usr/bin/env node
// Publish observed markers only. This does not score case-level activation and
// never upgrades runtime support based on marker output alone.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const runsRoot = path.join(root, "evals", "runs");
const args = process.argv.slice(2);
const option = (name, fallback = null) => {
  const prefix = `--${name}=`;
  const inline = args.find((value) => value.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : fallback;
};
const validRunId = (value) => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value) && value !== "." && value !== "..";
const markerPattern = /WCBS_KIT_ACTIVE:[a-z0-9-]+/g;

function repositoryPath(relative, label) {
  if (typeof relative !== "string" || !relative) throw new Error(`${label} must be a non-empty repository-relative path.`);
  const resolved = path.resolve(root, relative);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) throw new Error(`${label} escapes the repository root: ${relative}`);
  return resolved;
}

function latestRunId() {
  if (!fs.existsSync(runsRoot)) return null;
  const entries = fs.readdirSync(runsRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  return entries.at(-1) ?? null;
}

const runId = option("run-id", latestRunId());
if (!runId) { console.error("BLOCKED: no eval run directory found under evals/runs. Run npm run eval -- --execute first."); process.exit(1); }
if (!validRunId(runId)) { console.error("BLOCKED: run-id must be one safe path segment."); process.exit(1); }
const runDir = path.join(runsRoot, runId);
const manifestFile = path.join(runDir, "run-manifest.json");
if (!fs.existsSync(manifestFile)) { console.error(`BLOCKED: evals/runs/${runId}/run-manifest.json does not exist.`); process.exit(1); }

let manifest;
try { manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8")); }
catch (error) { console.error(`BLOCKED: run manifest is not valid JSON: ${error.message}`); process.exit(1); }
let preregistration, registry;
try {
  preregistration = JSON.parse(fs.readFileSync(repositoryPath("evals/gate-0c-preregistration.json", "preregistration"), "utf8"));
  registry = JSON.parse(fs.readFileSync(repositoryPath(preregistration.case_registry, "case registry"), "utf8"));
} catch (error) {
  console.error(`BLOCKED: could not read the locked eval design: ${error.message}`);
  process.exit(1);
}
const expectedMarker = typeof manifest.treatment_runtime_id === "string" ? `WCBS_KIT_ACTIVE:${manifest.treatment_runtime_id}` : null;
if (!expectedMarker) { console.error("BLOCKED: run manifest does not declare treatment_runtime_id."); process.exit(1); }
const lockedRuns = registry?.runs_per_case_per_arm;
const expectedRecords = [];
for (const testCase of registry?.cases ?? []) {
  for (const arm of ["baseline", "treatment"]) {
    for (let index = 0; index < lockedRuns; index += 1) expectedRecords.push({ case: testCase.id, arm, index });
  }
}
const recordKey = (record) => `${record.case}\u0000${record.arm}\u0000${record.index}`;
const expectedKeys = new Set(expectedRecords.map(recordKey));
const actualRecords = Array.isArray(manifest.transcripts) ? manifest.transcripts : [];
const actualKeys = new Set();
const manifestFailures = [];
if (manifest.treatment_runtime_id !== preregistration.treatment_runtime_id) manifestFailures.push("treatment runtime does not match the locked preregistration");
if (manifest.runs_per_case_per_arm !== lockedRuns || preregistration.runs_per_case_per_arm !== lockedRuns) manifestFailures.push("runs_per_case_per_arm does not match the locked eval design");
for (const record of actualRecords) {
  const key = recordKey(record);
  if (!expectedKeys.has(key)) manifestFailures.push(`unexpected transcript record: ${key}`);
  else if (actualKeys.has(key)) manifestFailures.push(`duplicate transcript record: ${key}`);
  actualKeys.add(key);
  if (record.exit_code !== 0 || record.activation === "Blocked") manifestFailures.push(`incomplete transcript record: ${key}`);
}
for (const key of expectedKeys) if (!actualKeys.has(key)) manifestFailures.push(`missing transcript record: ${key}`);
if (manifestFailures.length) {
  console.error("BLOCKED: eval run manifest is incomplete or inconsistent with the locked design:");
  for (const failure of manifestFailures) console.error(`- ${failure}`);
  process.exit(1);
}
const observations = [];
for (const record of manifest.transcripts ?? []) {
  if (!record.transcript || record.exit_code !== 0) { observations.push({ ...record, markers: [], evidence: "Blocked" }); continue; }
  const transcriptFile = path.resolve(root, record.transcript);
  if (!transcriptFile.startsWith(`${runDir}${path.sep}`)) { observations.push({ ...record, markers: [], evidence: "Blocked", reason: "transcript path escapes run directory" }); continue; }
  if (!fs.existsSync(transcriptFile)) { observations.push({ ...record, markers: [], evidence: "Blocked", reason: "transcript missing" }); continue; }
  try {
    const transcript = JSON.parse(fs.readFileSync(transcriptFile, "utf8"));
    const markers = [...new Set(`${transcript.stdout ?? ""}\n${transcript.stderr ?? ""}`.match(markerPattern) ?? [])];
    const expected = markers.includes(expectedMarker);
    observations.push({ case: record.case, arm: record.arm, index: record.index, transcript: record.transcript, markers, evidence: expected ? "Verified" : "Not Run" });
  } catch (error) {
    observations.push({ ...record, markers: [], evidence: "Blocked", reason: `invalid transcript JSON: ${error.message}` });
  }
}
const treatment = observations.filter((observation) => observation.arm === "treatment");
const baseline = observations.filter((observation) => observation.arm === "baseline");
const rate = (set) => set.length ? set.filter((observation) => observation.markers?.includes(expectedMarker)).length / set.length : null;
const evidence = {
  run_id: runId,
  execution_identity: manifest.execution_identity ?? null,
  treatment_runtime_id: manifest.treatment_runtime_id,
  expected_marker: expectedMarker,
  total_transcripts: observations.length,
  treatment_marker_rate: rate(treatment),
  baseline_marker_rate: rate(baseline),
  interpretation: "Observed marker output satisfies only the marker-test criterion. Human review must score the case-level activation criteria before any runtime-support or Gate 0C claim.",
  observations
};
fs.writeFileSync(path.join(runDir, "activation-evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
const observed = treatment.filter((observation) => observation.markers?.includes(expectedMarker));
console.log(`Run: ${runId}`);
console.log(`Treatment transcripts: ${treatment.length}`);
console.log(`Treatment transcripts with ${expectedMarker}: ${observed.length}`);
console.log(`Written: evals/runs/${runId}/activation-evidence.json`);
if (!observed.length) { console.error("BLOCKED: no successful treatment transcript contained the expected marker. Do not record runtime activation."); process.exit(1); }
console.log("PASS: observed marker evidence was published. Case-level scoring remains required.");
