import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateAgainstSchema } from "../lib/json-schema.mjs";
import { certificateInvariantErrors, validateBootstrapArtifactSet } from "../lib/bootstrap-artifacts.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const fixtureRoot = "scripts/tests/fixtures/bootstrap";
const fixtureDir = path.join(root, fixtureRoot);
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const readFixture = (name) => readJson(`${fixtureRoot}/${name}`);
const clone = (value) => structuredClone(value);
const stripComment = ({ __comment, ...document }) => document;
const schema = (name) => readJson(`runtime_adapters/schemas/${name}.schema.json`);

const schemas = {
  certificate: schema("bootstrap-certificate"),
  capability: schema("capability-resolution"),
  goals: schema("elite-goals-ledger"),
  evidence: schema("evidence-ledger"),
  team: schema("engineering-team"),
  profile: schema("project-profile"),
  risks: schema("risk-register"),
  release: schema("release-state")
};

const validation = validateBootstrapArtifactSet(root, fixtureDir, { requireComplete: true });
const golden = validation.documents;
const controller = readJson("00_start_here/bootstrap-controller.json");

test("the committed golden bootstrap set passes the shared validator", () => {
  assert.deepEqual(validation.errors, []);
});

for (const [name, document] of Object.entries(golden)) {
  test(`golden bootstrap ${name} fixture validates`, () => {
    const documents = name === "evidence" ? document : [document];
    for (const entry of documents) assert.deepEqual(validateAgainstSchema(schemas[name], entry), []);
  });
}

test("golden bootstrap fixtures describe one coherent project", () => {
  const ids = [golden.profile.project_id, golden.capability.project_id, golden.goals.project_id, golden.risks.project_id];
  assert.deepEqual(new Set(ids), new Set(["atlas-bootstrap"]));
  assert.deepEqual(golden.certificate.skills_loaded, golden.team.required_skills);
  assert.deepEqual(golden.certificate.gates_required, golden.team.gates);
  assert.deepEqual(certificateInvariantErrors(golden.certificate, golden.goals, controller), []);
});

test("evidence ledger fixture is append-ordered JSONL", () => {
  const raw = fs.readFileSync(path.join(fixtureDir, "evidence-ledger.jsonl"), "utf8");
  assert.ok(raw.endsWith("\n"), "append-only ledger must end on a complete line");
  const timestamps = golden.evidence.map((entry) => Date.parse(entry.ts));
  for (let index = 1; index < timestamps.length; index += 1) assert.ok(timestamps[index] > timestamps[index - 1], "ledger records must remain in append order");
});

test("positive fixture corruption is detected by the shared validator", () => {
  const corrupted = clone(golden.capability);
  corrupted.capabilities[0].justification = "";
  assert.match(validateAgainstSchema(schemas.capability, corrupted).join(" | "), /justification.*minLength|string is shorter/i);
});

test("negative fixtures are not part of the golden artifact set", () => {
  assert.ok(fs.existsSync(path.join(fixtureDir, "negative")));
  assert.equal(Object.keys(golden).length, 8);
});

test("negative capability fixture fails schema when justification is empty", () => {
  const document = stripComment(readFixture("negative/capability-empty-justification.json"));
  assert.match(validateAgainstSchema(schemas.capability, document).join(" | "), /justification.*minLength|string is shorter/i);
});

test("negative certificate fixture rejects PASS with mandatory Unknown input", () => {
  const certificate = clone(golden.certificate);
  certificate.inputs[0].state = readFixture("negative/pass-with-unknown-input.json").mutation.value;
  assert.deepEqual(validateAgainstSchema(schemas.certificate, certificate), []);
  assert.match(certificateInvariantErrors(certificate, golden.goals, controller).join(" | "), /mandatory input.*Unknown/i);
});

test("negative certificate fixture rejects PASS with unresolved blockers", () => {
  const certificate = clone(golden.certificate);
  certificate.unresolved_blockers = readFixture("negative/pass-with-blockers.json").mutation.value;
  assert.match(certificateInvariantErrors(certificate, golden.goals, controller).join(" | "), /unresolved blockers/i);
});

test("negative goals fixture rejects PASS when an applicable goal is Not Run", () => {
  const goals = clone(golden.goals);
  goals.goals[0].evidence_state = readFixture("negative/pass-with-goal-not-run.json").mutation.value;
  assert.deepEqual(validateAgainstSchema(schemas.goals, goals), []);
  assert.match(certificateInvariantErrors(golden.certificate, goals, controller).join(" | "), /Elite Goal is Not Run/i);
});

test("negative certificate fixture rejects PASS when degradations exist", () => {
  const certificate = clone(golden.certificate);
  certificate.degradations = readFixture("negative/pass-with-degradations.json").mutation.value;
  assert.match(certificateInvariantErrors(certificate, golden.goals, controller).join(" | "), /degradations cap verdict/i);
});

test("negative certificate fixture rejects Controller rehydration-set mismatch", () => {
  const certificate = clone(golden.certificate);
  certificate.rehydration_set = readFixture("negative/rehydration-set-mismatch.json").mutation.value;
  assert.match(certificateInvariantErrors(certificate, golden.goals, controller).join(" | "), /does not match Controller/i);
});
