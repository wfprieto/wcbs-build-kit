import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const run = (script, args = [], cwd = root) => spawnSync(process.execPath, [path.join(root, "scripts", script), ...args], {
  cwd, encoding: "utf8", timeout: 60000, maxBuffer: 1024 * 1024
});
function succeeds(result) {
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  return result.stdout;
}
function temporary(callback) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-verification-claims-"));
  try { callback(directory); }
  finally { fs.rmSync(directory, { recursive: true, force: true }); }
}
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

test("repository doctor reports static contract scope instead of claiming release gates executed", () => {
  const output = succeeds(run("wcbs-doctor.mjs"));
  assert.match(output, /Verification:.*documentation.*structural contracts.*Structurally Verified/i);
  assert.match(output, /Not performed.*release-gate execution.*authenticated activation.*observed agent behavior/i);
  assert.doesNotMatch(output, /package gates.*passed/i);
});

test("declared Verified fixture data never becomes observed agent behavior", () => {
  temporary((directory) => {
    const fixtures = path.join(directory, "tests", "behavior");
    fs.mkdirSync(fixtures, { recursive: true });
    const file = path.join(fixtures, "declared.json");
    const fixture = { apivr_tier: "Standard", elite_goals: [1], evidence_state: "Verified", release_gate_status: "PASS", final_verdict: "PASS", skills: ["using-wcbs"], verification: ["Declared fixture data only"] };
    fs.writeFileSync(file, JSON.stringify(fixture));
    const output = succeeds(run("run-behavior-fixtures.mjs", [], directory));
    assert.match(output, /Verification:.*fixture.data validation.*Behaviorally Verified.*fixture conformance/i);
    assert.match(output, /Not performed.*agent execution.*authenticated activation.*observed agent behavior/i);
    delete fixture.skills;
    fs.writeFileSync(file, JSON.stringify(fixture));
    const invalid = run("run-behavior-fixtures.mjs", [], directory);
    assert.equal(invalid.status, 1);
    assert.match(invalid.stdout, /skills must be a non-empty array/);
    assert.doesNotMatch(invalid.stdout, /^PASS:/m);
  });
});

test("an empty behavior fixture set fails instead of implying validation coverage", () => {
  temporary((directory) => {
    fs.mkdirSync(path.join(directory, "tests", "behavior"), { recursive: true });
    const result = run("run-behavior-fixtures.mjs", [], directory);
    assert.equal(result.status, 1, result.stdout);
    assert.match(result.stdout, /no.*(?:JSON|behavior).*fixtures|empty.*fixture/i);
    assert.doesNotMatch(result.stdout, /^PASS:/m);
  });
});

test("system checks identify static fixture scope and retain missing-input failure", () => {
  const output = succeeds(run("wcbs-system-test.mjs"));
  assert.match(output, /Verification:.*static routing.fixture.*Behaviorally Verified/i);
  assert.match(output, /Not performed.*authenticated activation.*security assessment.*observed agent behavior/i);
  temporary((directory) => {
    const result = run("wcbs-system-test.mjs", [], directory);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /Missing tests\/system\/routing-fixtures.json/);
    assert.doesNotMatch(result.stdout, /^PASS:/m);
  });
});

test("registry status is metadata evidence and a supplied marker stays an unauthenticated candidate", () => {
  const registry = path.join(root, "runtime_adapters", "adapter-registry.yaml");
  const before = hash(registry);
  const metadata = JSON.parse(succeeds(run("wcbs.mjs", ["status", "--json"])));
  assert.equal(metadata.verification_scope, "registry_metadata");
  temporary((directory) => {
    const transcript = path.join(directory, "invented-response.txt");
    fs.writeFileSync(transcript, "WCBS_KIT_ACTIVE:codex\nClaiming a skill loaded is not a tool trace.\n");
    const candidate = JSON.parse(succeeds(run("wcbs.mjs", ["verify-activation", "--target", "codex", "--transcript", transcript, "--json"])));
    assert.equal(candidate.status, "RECORDED_CANDIDATE");
    assert.equal(candidate.evidence, "Likely");
    assert.equal(candidate.verification_scope, "marker_candidate");
    assert.equal(candidate.runtime_state, "Not Run");
    assert.equal(candidate.agent_behavior_state, "Not Run");
  });
  assert.equal(hash(registry), before, "metadata reads and marker candidates must not advance support");
});

for (const target of ["codex", "cursor"]) {
  test(`${target} smoke distinguishes executed components from structural checks without runtime promotion`, () => {
    temporary((directory) => {
      const destination = path.join(directory, "installed package");
      succeeds(run("install-adapter.mjs", ["--target", target, "--dest", destination, "--install"]));
      const receipt = path.join(destination, ".wcbs", "adapter-install-manifest.json");
      const before = hash(receipt);
      const output = succeeds(run("adapter-smoke-test.mjs", ["--target", target, "--dest", destination]));
      if (target === "codex") {
        assert.match(output, /Verification: Executable package verification/);
        assert.match(output, /Authenticated Codex activation: Not Run by this command/);
        assert.match(output, /Observed agent behavior: Not Run by this command/);
      } else {
        assert.match(output, /Verification: Structural package and scenario checks.*Structurally Verified/);
        assert.match(output, /Runtime activation and observed agent behavior: Not Run by this command/);
        assert.doesNotMatch(output, /Executable package verification/);
      }
      assert.equal(hash(receipt), before);
    });
  });
}
