#!/usr/bin/env node
// Analyzes completed blinded score ledgers only. It never activates a runtime,
// changes a support label, or converts an inconclusive result into a claim.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { analyzeAdjudicatedScores, canonicalHash, canonicalJson, completeProtocolHash, readEvidenceFile, resolveExternalEvidenceRun, validateBlindedDelivery, validateEvaluationProvenance, validateManifestSelfHash, validateScoreLedgers, writeEvidenceFile } from "./lib/evaluation-protocol.mjs";

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

function evidencePath(relative, label) {
  if (typeof relative !== "string" || !relative || path.isAbsolute(relative)) throw new Error(`${label} must be a non-empty evidence-run-relative path.`);
  return relative;
}

function readCanonicalEnvelope(evidence, relative, label) {
  let body;
  try { body = readEvidenceFile(evidence, relative, label).toString("utf8"); }
  catch (error) { throw new Error(`${label} could not be read: ${error.message}`); }
  let parsed;
  try { parsed = JSON.parse(body); }
  catch (error) { throw new Error(`${label} is not valid JSON: ${error.message}`); }
  if (canonicalJson(parsed) !== body) throw new Error(`${label} must be canonical UTF-8 JSON with lexicographic keys and one final newline.`);
  return parsed;
}

function loadProtocol(relative) {
  const protocol = readJson(repositoryPath(relative, "protocol preregistration"), "protocol preregistration");
  const registry = readJson(repositoryPath(protocol.case_registry, "case registry"), "case registry");
  return { ...protocol, cases: registry.cases.map((entry) => ({ id: entry.id, prompt: entry.prompt, criteria: entry.activation })) };
}

const runId = one("run-id");
const protocolPath = one("protocol", "evals/gate-0c-preregistration.json");
const judgePaths = values("judge-ledger");
const adjudicationPath = one("adjudications");
const custodyIndexPath = one("custody-index");
const evidenceDir = one("evidence-dir");
if (!validRunId(runId)) { console.error("BLOCKED: --run-id must be one safe path segment."); process.exit(1); }
try {
  const evidence = resolveExternalEvidenceRun({ root, evidence_dir: evidenceDir, run_id: runId });
  const runDirectory = evidence.run_directory;
  const manifest = JSON.parse(readEvidenceFile(evidence, "run-manifest.json", "run manifest").toString("utf8"));
  validateManifestSelfHash(manifest);
  if (judgePaths.length !== 2 || !adjudicationPath || !custodyIndexPath) throw new Error("provide exactly two --judge-ledger paths, one --custody-index path, and one --adjudications path.");
  const protocol = loadProtocol(protocolPath);
  const provenance = validateEvaluationProvenance({ root, protocol });
  if (provenance.status !== "PASS") throw new Error(provenance.blockers.join(" "));
  if (manifest.protocol_id !== protocol.protocol_id) throw new Error("run manifest protocol does not match the analysis protocol.");
  const completeProtocolSha256 = completeProtocolHash({ root, protocol });
  if (manifest.complete_protocol_sha256 !== completeProtocolSha256 || manifest.protocol_sha256 !== completeProtocolSha256) throw new Error("run manifest is bound to a different complete protocol.");
  if (!protocol.role_keys || !manifest.role_keys || canonicalJson(protocol.role_keys) !== canonicalJson(manifest.role_keys)) throw new Error("run manifest and complete protocol must pin the same signed custody role keys.");
  if (manifest.evaluation_subject?.commit !== protocol.evaluation_subject?.commit || manifest.claim_target?.commit !== protocol.claim_target?.commit) throw new Error("run manifest subject and claim target do not match the analysis protocol.");
  if (manifest.release_artifact?.subject_content_manifest_sha256 !== provenance.subject_manifest.content_manifest_sha256 || manifest.release_artifact?.claim_target_content_manifest_sha256 !== provenance.claim_manifest.content_manifest_sha256) throw new Error("run manifest release artifact identity does not match freshly materialized subject and claim-target content manifests.");
  if (!Array.isArray(manifest.records) || manifest.records.some((record) => !["Complete", "Failed"].includes(record.status))) throw new Error("run manifest contains a non-terminal protocol-integrity record.");
  const delivery = validateBlindedDelivery({ evidence, manifest });
  const packetByRun = new Map(delivery.mapping.map((entry) => [entry.run_id, entry.packet_id]));
  const records = manifest.records.map((record) => ({ ...record, packet_id: packetByRun.get(record.run_id) }));
  if (records.some((record) => !record.packet_id) || new Set(records.map((record) => record.packet_id)).size !== records.length) throw new Error("blind map does not provide one packet identity for every retained record.");
  const failedPacketIds = records.filter((record) => record.status === "Failed").map((record) => record.packet_id);
  const scoreResult = validateScoreLedgers({
    packet_ids: records.map((record) => record.packet_id),
    binding: {
      run_id: runId,
      protocol_sha256: manifest.protocol_sha256,
      run_manifest_sha256: manifest.manifest_sha256,
      schedule_sha256: manifest.schedule?.schedule_sha256,
      packet_set_sha256: canonicalHash(records.map((record) => record.packet_id).sort((left, right) => left.localeCompare(right))),
      complete_protocol_sha256: completeProtocolSha256,
      delivery_manifest_sha256: delivery.delivery_manifest_sha256,
      mapping_sha256: delivery.mapping_sha256,
      producer_freeze_sha256: delivery.producer_freeze_sha256,
      role_keys: protocol.role_keys
    },
    judge_ledgers: judgePaths.map((relative, index) => readCanonicalEnvelope(evidence, evidencePath(relative, `judge ledger ${index + 1}`), `judge ledger ${index + 1}`)),
    custody_index: readCanonicalEnvelope(evidence, evidencePath(custodyIndexPath, "custody index"), "custody index"),
    adjudications: readCanonicalEnvelope(evidence, evidencePath(adjudicationPath, "adjudications"), "adjudications"),
    failed_packet_ids: [...new Set(failedPacketIds)]
  });
  if (scoreResult.status !== "PASS") throw new Error(scoreResult.blockers.join(" "));
  const analysis = analyzeAdjudicatedScores({
    protocol,
    cases: protocol.cases,
    records,
    adjudications: scoreResult.adjudications,
    manifest_hash: manifest.manifest_sha256,
    failed_packet_ids: [...new Set(failedPacketIds)],
    schedule_records: manifest.schedule?.records,
    schedule_sha256: manifest.schedule?.schedule_sha256
  });
  if (analysis.status !== "PASS") throw new Error(analysis.blockers.join(" "));
  const output = {
    schema_version: 2,
    run_id: runId,
    protocol_id: protocol.protocol_id,
    protocol_path: protocolPath,
    run_manifest_sha256: manifest.manifest_sha256,
    scoring_inputs: {
      judge_ledgers: judgePaths,
      custody_index: custodyIndexPath,
      adjudications: adjudicationPath
    },
    custody_reconciliation: {
      custody_index_sha256: scoreResult.custody?.custody_index_sha256,
      judge_ledger_sha256: scoreResult.custody?.judge_ledger_sha256,
      adjudication_ledger_sha256: scoreResult.adjudication_ledger_sha256,
      subject_content_manifest_sha256: provenance.subject_manifest.content_manifest_sha256,
      claim_target_content_manifest_sha256: provenance.claim_manifest.content_manifest_sha256
    },
    analysis,
    interpretation: "This analysis is behavioral evidence only. It does not prove native runtime activation or alter any public support label."
  };
  const outputPath = writeEvidenceFile(evidence, "behavioral-analysis.json", `${JSON.stringify(output, null, 2)}\n`);
  const phase = analysis.phase6 ?? analysis.phase5;
  console.log(`Run: ${runId}`);
  console.log(`Verdict: ${phase.verdict}`);
  console.log(`Written: ${outputPath}`);
  console.log("PASS: adjudicated blinded analysis completed. Interpret the preregistered verdict exactly as written.");
} catch (error) {
  console.error(`BLOCKED: analysis refused to run: ${error.message}`);
  process.exit(1);
}
