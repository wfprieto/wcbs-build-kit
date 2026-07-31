import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, ...relative.split("/")), "utf8"));
const run = (arguments_) => spawnSync(process.execPath, arguments_, { cwd: root, encoding: "utf8" });

test("evaluation readiness records immutable source identities and distinguishes stale configuration from unavailable execution inputs", () => {
  const subject = readJson("evals/EVALUATION_SUBJECT.json");
  assert.equal(subject.schema_version, 1);
  for (const key of ["wcbs", "superpowers"]) {
    assert.match(subject[key].commit, /^[a-f0-9]{40}$/);
    assert.match(subject[key].tree, /^[a-f0-9]{40}$/);
  }

  const result = run(["scripts/evaluation-readiness.mjs", "--protocol", "evals/gate-0c-preregistration.json"]);
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  const record = JSON.parse(result.stdout);
  assert.equal(record.schema_version, 1);
  assert.equal(record.configuration.status, "PASS");
  assert.equal(record.execution.status, "BLOCKED");
  assert.match(record.execution.blockers.join("\n"), /immutable agent_version|command template|role keys/i);
  assert.doesNotMatch(JSON.stringify(record), /WCBS_EVAL_CREDENTIAL=/);
});

test("evaluation readiness rejects a protocol path outside the repository", () => {
  const result = run(["scripts/evaluation-readiness.mjs", "--protocol", "../../package.json"]);
  assert.equal(result.status, 1, `${result.stdout}${result.stderr}`);
  assert.match(`${result.stdout}${result.stderr}`, /protocol path must be repository-relative/i);
});

test("Superpowers comparison readiness accepts an explicit external source input and classifies a bad source as configuration", () => {
  const missingSource = path.join(os.tmpdir(), `wcbs-missing-superpowers-${process.pid}`);
  const result = run([
    "scripts/evaluation-readiness.mjs",
    "--protocol", "evals/superpowers-comparison-preregistration.json",
    "--superpowers-source", missingSource
  ]);
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  const record = JSON.parse(result.stdout);
  assert.equal(record.configuration.status, "BLOCKED");
  assert.match(record.configuration.blockers.join("\n"), /Superpowers source.*unavailable|Superpowers source.*identity/i);
  assert.doesNotMatch(record.execution.blockers.join("\n"), /--superpowers-source is required/i);
});

test("runtime proof packs cover every registry runtime and fail closed when a required evidence tier is missing", () => {
  const registry = readJson("runtime_adapters/adapter-registry.yaml");
  const catalog = readJson("runtime_adapters/RUNTIME_PROOF_PACKS.json");
  assert.equal(catalog.schema_version, 1);
  assert.equal(catalog.packs.length, registry.adapters.length);
  assert.deepEqual(catalog.packs.map((entry) => entry.runtime_id).sort(), registry.adapters.map((entry) => entry.runtime_id).sort());
  for (const pack of catalog.packs) {
    const adapter = registry.adapters.find((entry) => entry.runtime_id === pack.runtime_id);
    assert.deepEqual(pack.evidence_tiers.map((tier) => tier.id), ["package_integrity", "structural_lifecycle", "registration", "clean_session_activation", "clean_session_invocation"]);
    assert.equal(pack.clean_session_evidence.state, "Blocked");
    assert.match(pack.uninstall.acceptance_criterion, /WCBS-owned/i);
    assert.equal(pack.native_lifecycle.install, adapter.manifest.install);
    assert.equal(pack.native_lifecycle.uninstall, adapter.manifest.uninstall);
    assert.equal(pack.runtime_registration.native_install_mechanism, adapter.manifest.native_install_mechanism);
    assert.equal(pack.runtime_registration.bootstrap_path, adapter.manifest.bootstrap_path);
    assert.equal(pack.representative_invocation.mechanism, adapter.tool_mapping.actions.read_skill.mechanism);
  }

  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-proof-pack-"));
  try {
    const invalid = structuredClone(catalog);
    invalid.packs[0].native_lifecycle.install = "incorrect lifecycle route";
    const candidate = path.join(scratch, "invalid-proof-packs.json");
    fs.writeFileSync(candidate, `${JSON.stringify(invalid)}\n`);
    const result = run(["scripts/verify-runtime-proof-packs.mjs", "--catalog", candidate]);
    assert.equal(result.status, 1, `${result.stdout}${result.stderr}`);
    assert.match(`${result.stdout}${result.stderr}`, /native lifecycle/i);
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
});

test("WCBS_START routes all four operator intents without creating a second authority source", () => {
  const start = fs.readFileSync(path.join(root, "WCBS_START.md"), "utf8");
  for (const intent of ["Install or use", "Contribute or change", "Release or verify", "Evaluate runtime support"]) assert.match(start, new RegExp(intent));
  assert.match(start, /Eight primary workflows/i);
  assert.match(start, /Design checkpoint/i);
  assert.match(start, /prove it before you say it/i);
  assert.match(start, /00_start_here\/SOURCE_OF_TRUTH\.md/);
  assert.match(start, /50_audits\/AUDIT_TIER_ROUTER\.md/);
});
