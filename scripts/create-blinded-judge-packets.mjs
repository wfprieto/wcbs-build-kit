#!/usr/bin/env node
// Creates blinded scoring packets from one completed evaluation run. The arm map
// remains local evidence and is intentionally not printed by this command.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createBlindedJudgePackets, readEvidenceFile, resolveExternalEvidenceRun, validateManifestSelfHash } from "./lib/evaluation-protocol.mjs";

const root = process.cwd();
const args = process.argv.slice(2);
const option = (name) => {
  const prefix = `--${name}=`;
  const inline = args.find((value) => value.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : null;
};
const validRunId = (value) => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value) && value !== "." && value !== "..";
const runId = option("run-id");
const evidenceDir = option("evidence-dir");
if (!validRunId(runId)) { console.error("BLOCKED: --run-id must be one safe path segment."); process.exit(1); }
let evidence;
try { evidence = resolveExternalEvidenceRun({ root, evidence_dir: evidenceDir, run_id: runId }); }
catch (error) { console.error(error.message); process.exit(1); }
let manifest;
try { manifest = JSON.parse(readEvidenceFile(evidence, "run-manifest.json", "run manifest").toString("utf8")); }
catch (error) { console.error(`BLOCKED: run manifest is invalid JSON: ${error.message}`); process.exit(1); }
try { validateManifestSelfHash(manifest); }
catch (error) { console.error(`BLOCKED: run manifest integrity check failed: ${error.message}`); process.exit(1); }
if (!manifest.complete_protocol_sha256 || !manifest.role_keys) {
  console.error("BLOCKED: blinded delivery requires the complete-protocol hash and pinned role keys recorded by a successful execution preflight.");
  process.exit(1);
}
if (!Array.isArray(manifest.records) || !manifest.records.length || manifest.records.some((record) => !["Complete", "Failed"].includes(record.status))) {
  console.error("BLOCKED: blinded packets require one retained terminal attempt for every scheduled run; only protocol-integrity failures may block packet creation.");
  process.exit(1);
}
try {
  const packets = createBlindedJudgePackets({ evidence, manifest });
  console.log(`Run: ${runId}`);
  console.log(`Blinded packets: ${packets.length}`);
  console.log(`Packet directory: ${path.join(evidence.run_directory, "judge-packets")}`);
  console.log("PASS: packets were created without exposing arm identities. Keep blind-map.json unavailable to judges and adjudicators until all records are adjudicated.");
} catch (error) {
  console.error(`BLOCKED: could not create blinded packets: ${error.message}`);
  process.exit(1);
}
