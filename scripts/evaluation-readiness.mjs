#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { preflightProtocol } from "./lib/evaluation-protocol.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const option = (name, fallback = null) => {
  const prefix = `--${name}=`;
  const inline = process.argv.slice(2).find((entry) => entry.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
};
const repositoryPath = (relative, label) => {
  if (typeof relative !== "string" || !relative) throw new Error(`BLOCKED: ${label} must be a non-empty repository-relative path.`);
  const resolved = path.resolve(root, ...relative.split("/"));
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) throw new Error(`BLOCKED: ${label} must be repository-relative and inside the repository root.`);
  return resolved;
};
const readJson = (relative, label = "JSON input") => JSON.parse(fs.readFileSync(repositoryPath(relative, label), "utf8"));
const git = (directory, args) => {
  const result = spawnSync("git", args, { cwd: directory, encoding: "utf8" });
  return { ok: result.status === 0, stdout: (result.stdout ?? "").trim() };
};

const protocolPath = option("protocol", "evals/gate-0c-preregistration.json");
const superpowersSource = option("superpowers-source");
const subject = readJson("evals/EVALUATION_SUBJECT.json", "evaluation subject record");
const protocol = readJson(protocolPath, "protocol path");
protocol.cases = readJson(protocol.case_registry, "case registry").cases.map((entry) => ({ id: entry.id, prompt: entry.prompt, criteria: entry.activation, activation: entry.activation }));
const configurationBlockers = [];
const checkIdentity = (directory, actual, expected, label) => {
  if (!actual || actual.commit !== expected.commit || actual.tree !== expected.tree) configurationBlockers.push(`${label} protocol identity does not match evals/EVALUATION_SUBJECT.json.`);
  const commit = git(directory, ["cat-file", "-e", `${expected.commit}^{commit}`]);
  const tree = git(directory, ["rev-parse", `${expected.commit}^{tree}`]);
  if (!commit.ok || !tree.ok || tree.stdout !== expected.tree) configurationBlockers.push(`${label} immutable commit or tree is unavailable in its declared source checkout.`);
};
checkIdentity(root, protocol.wcbs_candidate, subject.wcbs, "WCBS candidate");
checkIdentity(root, protocol.evaluation_subject, subject.wcbs, "Evaluation subject");
checkIdentity(root, protocol.claim_target, subject.wcbs, "Claim target");
if (protocol.arms?.includes("superpowers")) {
  if (!superpowersSource) configurationBlockers.push("Superpowers source input is required for a Superpowers comparison readiness check.");
  else checkIdentity(superpowersSource, protocol.superpowers_source_identity, subject.superpowers, "Superpowers source");
}
for (const pin of [protocol.scoring_rubric, protocol.evaluator_harness]) {
  const file = pin?.path && repositoryPath(pin.path, "pinned file");
  if (!file || !/^[a-f0-9]{64}$/.test(pin.sha256 ?? "") || !fs.existsSync(file) || sha256(fs.readFileSync(file)) !== pin.sha256) configurationBlockers.push(`Pinned file is stale or invalid: ${pin?.path ?? "unknown"}.`);
}
try {
  const harness = readJson(protocol.evaluator_harness.path, "evaluator harness manifest");
  for (const entry of harness.files ?? []) {
    const file = repositoryPath(entry.path, "evaluator harness file");
    if (!/^[a-f0-9]{64}$/.test(entry.sha256 ?? "") || !fs.existsSync(file) || sha256(fs.readFileSync(file)) !== entry.sha256) configurationBlockers.push(`Evaluator harness file is stale or invalid: ${entry.path ?? "unknown"}.`);
  }
} catch (error) { configurationBlockers.push(`Evaluator harness cannot be read: ${error.message}`); }

const preflight = preflightProtocol({ root, protocol, superpowers_source: superpowersSource, strict: true });
const externalPatterns = /immutable agent_version|command template|Protocol must pin one producer|credential|clean detached source|checkout is dirty|--superpowers-source|runtime loader/i;
const executionBlockers = preflight.blockers.filter((blocker) => externalPatterns.test(blocker));
for (const blocker of preflight.blockers) if (!externalPatterns.test(blocker) && !configurationBlockers.includes(blocker)) configurationBlockers.push(blocker);
const record = {
  schema_version: 1,
  kind: "wcbs-evaluation-readiness",
  generated_utc: new Date().toISOString(),
  protocol: { path: protocolPath, sha256: sha256(fs.readFileSync(repositoryPath(protocolPath, "protocol path"))) },
  subject,
  configuration: { status: configurationBlockers.length ? "BLOCKED" : "PASS", blockers: configurationBlockers },
  execution: { status: executionBlockers.length ? "BLOCKED" : "PASS", blockers: executionBlockers },
  claim: "This readiness record validates committed pins and names blocked external requirements. It is not a behavioral evaluation result or runtime-support proof."
};
console.log(JSON.stringify(record, null, 2));
