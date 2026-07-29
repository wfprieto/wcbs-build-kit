#!/usr/bin/env node
// Analyzes completed blinded score ledgers only. It never activates a runtime,
// changes a support label, or converts an inconclusive result into a claim.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { analyzeAdjudicatedScores, validateManifestSelfHash, validateScoreLedgers } from "./lib/evaluation-protocol.mjs";

const root = process.cwd();
const args = process.argv.slice(2);
const values = (name) => args.flatMap((value, index) => value === `--${name}` && args[index + 1] ? [args[index + 1]] : value.startsWith(`--${name}=`) ? [value.slice(name.length + 3)] : []);
const one = (name, fallback = null) => values(name).at(-1) ?? fallback;
const validRunId = (value) => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value) && value !== "." && value !== "..";
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

function loadProtocol(relative) {
  const protocol = readJson(repositoryPath(relative, "protocol preregistration"), "protocol preregistration");
  const registry = readJson(repositoryPath(protocol.case_registry, "case registry"), "case registry");
  return { ...protocol, cases: registry.cases.map((entry) => ({ id: entry.id, prompt: entry.prompt, criteria: entry.activation })) };
}

function loadLedger(relative, label) {
  const body = readJson(repositoryPath(relative, label), label);
  return Array.isArray(body) ? body : body.scores;
}

const runId = one("run-id");
const protocolPath = one("protocol", "evals/gate-0c-preregistration.json");
const judgePaths = values("judge-ledger");
const adjudicationPath = one("adjudications");
if (!validRunId(runId)) { console.error("BLOCKED: --run-id must be one safe path segment."); process.exit(1); }
if (judgePaths.length !== 2 || !adjudicationPath) { console.error("BLOCKED: provide exactly two --judge-ledger paths and one --adjudications path."); process.exit(1); }
try {
  const runDirectory = path.join(root, "evals", "runs", runId);
  const manifest = readJson(path.join(runDirectory, "run-manifest.json"), "run manifest");
  validateManifestSelfHash(manifest);
  const blindMap = readJson(path.join(runDirectory, "blind-map.json"), "blind map");
  const protocol = loadProtocol(protocolPath);
  if (manifest.protocol_id !== protocol.protocol_id) throw new Error("run manifest protocol does not match the analysis protocol.");
  if (!Array.isArray(manifest.records) || manifest.records.some((record) => !["Complete", "Failed"].includes(record.status))) throw new Error("run manifest contains a non-terminal protocol-integrity record.");
  const packetByRun = new Map((blindMap.mapping ?? []).map((entry) => [entry.run_id, entry.packet_id]));
  const records = manifest.records.map((record) => ({ ...record, packet_id: packetByRun.get(record.run_id) }));
  if (records.some((record) => !record.packet_id) || new Set(records.map((record) => record.packet_id)).size !== records.length) throw new Error("blind map does not provide one packet identity for every retained record.");
  const failedPacketIds = records.filter((record) => record.status === "Failed").map((record) => record.packet_id);
  for (const record of records) {
    const packet = readJson(path.join(runDirectory, "judge-packets", `${record.packet_id}.json`), `judge packet for ${record.run_id}`);
    if (packet.failure_as_data) failedPacketIds.push(record.packet_id);
  }
  const scoreResult = validateScoreLedgers({
    packet_ids: records.map((record) => record.packet_id),
    judge_ledgers: judgePaths.map((relative, index) => loadLedger(relative, `judge ledger ${index + 1}`)),
    adjudications: loadLedger(adjudicationPath, "adjudications"),
    failed_packet_ids: [...new Set(failedPacketIds)]
  });
  if (scoreResult.status !== "PASS") throw new Error(scoreResult.blockers.join(" "));
  const analysis = analyzeAdjudicatedScores({
    protocol,
    cases: protocol.cases,
    records,
    adjudications: scoreResult.adjudications,
    manifest_hash: manifest.manifest_sha256,
    failed_packet_ids: [...new Set(failedPacketIds)]
  });
  if (analysis.status !== "PASS") throw new Error(analysis.blockers.join(" "));
  const output = {
    schema_version: 1,
    run_id: runId,
    protocol_id: protocol.protocol_id,
    protocol_path: protocolPath,
    run_manifest_sha256: manifest.manifest_sha256,
    scoring_inputs: {
      judge_ledgers: judgePaths,
      adjudications: adjudicationPath
    },
    analysis,
    interpretation: "This analysis is behavioral evidence only. It does not prove native runtime activation or alter any public support label."
  };
  fs.writeFileSync(path.join(runDirectory, "behavioral-analysis.json"), `${JSON.stringify(output, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  const phase = analysis.phase6 ?? analysis.phase5;
  console.log(`Run: ${runId}`);
  console.log(`Verdict: ${phase.verdict}`);
  console.log(`Written: evals/runs/${runId}/behavioral-analysis.json`);
  console.log("PASS: adjudicated blinded analysis completed. Interpret the preregistered verdict exactly as written.");
} catch (error) {
  console.error(`BLOCKED: analysis refused to run: ${error.message}`);
  process.exit(1);
}
