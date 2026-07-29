#!/usr/bin/env node
// Publishes observed activation markers from a complete V2 evaluation run only.
// Marker output is never a runtime-support verdict or behavioral score.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { validateManifestSelfHash } from "./lib/evaluation-protocol.mjs";

const root = process.cwd();
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
  const resolved = path.resolve(root, ...relative.split("/"));
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) throw new Error(`${label} escapes the repository root: ${relative}`);
  return resolved;
}

function readJson(file, label) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { throw new Error(`${label} is not valid JSON: ${error.message}`); }
}

const runId = option("run-id");
const protocolPath = option("protocol", "evals/gate-0c-preregistration.json");
if (!validRunId(runId)) { console.error("BLOCKED: --run-id must be one safe path segment."); process.exit(1); }
try {
  const runDirectory = path.join(root, "evals", "runs", runId);
  const manifest = readJson(path.join(runDirectory, "run-manifest.json"), "run manifest");
  validateManifestSelfHash(manifest);
  const protocol = readJson(repositoryPath(protocolPath, "protocol preregistration"), "protocol preregistration");
  if (manifest.protocol_id !== protocol.protocol_id) throw new Error("run manifest protocol does not match the locked preregistration.");
  if (!Array.isArray(manifest.records) || manifest.records.length !== protocol.expected_total_runs) throw new Error("run manifest does not contain the complete preregistered record count.");
  const expected = new Set((manifest.schedule?.records ?? []).map((record) => record.run_id));
  const seen = new Set();
  for (const record of manifest.records) {
    if (!expected.has(record.run_id) || seen.has(record.run_id) || record.status !== "Complete") throw new Error("run manifest contains an incomplete, duplicate, or unregistered record.");
    seen.add(record.run_id);
  }
  if (seen.size !== expected.size) throw new Error("run manifest is missing a scheduled record.");
  const expectedMarker = `WCBS_KIT_ACTIVE:${protocol.runtime_id}`;
  const observations = manifest.records.map((record) => {
    const relative = record.artifacts?.transcript;
    if (!relative) throw new Error(`record ${record.run_id} has no retained transcript.`);
    const transcriptFile = repositoryPath(`evals/runs/${runId}/${relative}`, "transcript");
    if (!transcriptFile.startsWith(`${runDirectory}${path.sep}`)) throw new Error(`record ${record.run_id} transcript escapes its run directory.`);
    const transcript = readJson(transcriptFile, `transcript for ${record.run_id}`);
    const markers = [...new Set(`${transcript.stdout ?? ""}\n${transcript.stderr ?? ""}`.match(markerPattern) ?? [])];
    return { run_id: record.run_id, case_id: record.case_id, arm: record.arm, repetition: record.repetition, transcript: relative, markers, evidence: markers.includes(expectedMarker) ? "Observed" : "Not Observed" };
  });
  const rate = (arm) => {
    const subset = observations.filter((entry) => entry.arm === arm);
    return subset.length ? subset.filter((entry) => entry.markers.includes(expectedMarker)).length / subset.length : null;
  };
  const evidence = {
    schema_version: 2,
    run_id: runId,
    protocol_id: protocol.protocol_id,
    execution_identity: manifest.execution_identity ?? null,
    expected_marker: expectedMarker,
    total_records: observations.length,
    observed_marker_rate_by_arm: Object.fromEntries((protocol.arms ?? []).map((arm) => [arm, rate(arm)])),
    interpretation: "Observed marker output is one transport signal only. It neither proves a native runtime session nor substitutes for blinded behavioral scoring, and it cannot alter a support label.",
    observations
  };
  fs.writeFileSync(path.join(runDirectory, "activation-evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  const wcbsObserved = observations.filter((entry) => entry.arm === "wcbs" && entry.markers.includes(expectedMarker)).length;
  console.log(`Run: ${runId}`);
  console.log(`WCBS records with ${expectedMarker}: ${wcbsObserved}`);
  console.log(`Written: evals/runs/${runId}/activation-evidence.json`);
  console.log("PASS: observed marker evidence was published. No runtime or behavioral claim was produced.");
} catch (error) {
  console.error(`BLOCKED: evidence publication refused: ${error.message}`);
  process.exit(1);
}
