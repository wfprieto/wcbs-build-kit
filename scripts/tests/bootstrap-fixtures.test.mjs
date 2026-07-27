import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateAgainstSchema } from "../lib/json-schema.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const fixtureRoot = "scripts/tests/fixtures/bootstrap";
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const readFixture = (name) => readJson(`${fixtureRoot}/${name}`);
const readJsonl = (relative) => fs.readFileSync(path.join(root, relative), "utf8").trim().split(/\r?\n/).map(JSON.parse);
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

const golden = {
  certificate: readFixture("bootstrap-certificate.json"),
  capability: readFixture("capability-resolution.json"),
  goals: readFixture("elite-goals-ledger.json"),
  evidence: readJsonl(`${fixtureRoot}/evidence-ledger.jsonl`),
  team: readFixture("engineering-team.json"),
  profile: readFixture("project-profile.json"),
  risks: readFixture("risk-register.json"),
  release: readFixture("release-state.json")
};

function certificateInvariantErrors(certificate, goals, controller) {
  const errors = [];
  if (certificate.initialization_verdict === "PASS") {
    for (const input of certificate.inputs) {
      if (input.mandatory === true && ["Unknown", "Not Run", "Blocked"].includes(input.state)) {
        errors.push(`PASS forbidden: mandatory input ${input.id} is ${input.state}`);
      }
    }
    if (certificate.unresolved_blockers.length > 0) errors.push("PASS forbidden: unresolved blockers remain");
    if (certificate.degradations.length > 0) errors.push("PASS forbidden: degradations cap verdict at CONDITIONAL PASS");
    if (goals.goals.some((goal) => goal.applicable && goal.evidence_state === "Not Run")) errors.push("PASS forbidden: an applicable Elite Goal is Not Run");
  }
  if (JSON.stringify(certificate.rehydration_set) !== JSON.stringify(controller.rehydration_set)) {
    errors.push("certificate rehydration_set does not match Controller declaration");
  }
  return errors;
}

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
  assert.deepEqual(certificateInvariantErrors(golden.certificate, golden.goals, readJson("00_start_here/bootstrap-controller.json")), []);
});

test("evidence ledger fixture is append-ordered JSONL", () => {
  const raw = fs.readFileSync(path.join(root, fixtureRoot, "evidence-ledger.jsonl"), "utf8");
  assert.ok(raw.endsWith("\n"), "append-only ledger must end on a complete line");
  const timestamps = golden.evidence.map((entry) => Date.parse(entry.ts));
  for (let index = 1; index < timestamps.length; index += 1) assert.ok(timestamps[index] > timestamps[index - 1], "ledger records must remain in append order");
});

test("negative capability fixture fails schema when justification is empty", () => {
  const document = stripComment(readFixture("negative/capability-empty-justification.json"));
  assert.match(validateAgainstSchema(schemas.capability, document).join(" | "), /justification.*minLength|string is shorter/i);
});

test("negative certificate fixture rejects PASS with mandatory Unknown input", () => {
  const certificate = clone(golden.certificate);
  certificate.inputs[0].state = readFixture("negative/pass-with-unknown-input.json").mutation.value;
  assert.deepEqual(validateAgainstSchema(schemas.certificate, certificate), []);
  assert.match(certificateInvariantErrors(certificate, golden.goals, readJson("00_start_here/bootstrap-controller.json")).join(" | "), /mandatory input.*Unknown/i);
});

test("negative certificate fixture rejects PASS with unresolved blockers", () => {
  const certificate = clone(golden.certificate);
  certificate.unresolved_blockers = readFixture("negative/pass-with-blockers.json").mutation.value;
  assert.match(certificateInvariantErrors(certificate, golden.goals, readJson("00_start_here/bootstrap-controller.json")).join(" | "), /unresolved blockers/i);
});

test("negative goals fixture rejects PASS when an applicable goal is Not Run", () => {
  const goals = clone(golden.goals);
  goals.goals[0].evidence_state = readFixture("negative/pass-with-goal-not-run.json").mutation.value;
  assert.deepEqual(validateAgainstSchema(schemas.goals, goals), []);
  assert.match(certificateInvariantErrors(golden.certificate, goals, readJson("00_start_here/bootstrap-controller.json")).join(" | "), /Elite Goal is Not Run/i);
});

test("negative certificate fixture rejects PASS when degradations exist", () => {
  const certificate = clone(golden.certificate);
  certificate.degradations = readFixture("negative/pass-with-degradations.json").mutation.value;
  assert.match(certificateInvariantErrors(certificate, golden.goals, readJson("00_start_here/bootstrap-controller.json")).join(" | "), /degradations cap verdict/i);
});

test("negative certificate fixture rejects Controller rehydration-set mismatch", () => {
  const certificate = clone(golden.certificate);
  certificate.rehydration_set = readFixture("negative/rehydration-set-mismatch.json").mutation.value;
  assert.match(certificateInvariantErrors(certificate, golden.goals, readJson("00_start_here/bootstrap-controller.json")).join(" | "), /does not match Controller/i);
});
