import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const hash = (relative) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, ...relative.split("/")))).digest("hex");

test("every shipped behavioral protocol pins the current scoring-rubric bytes", () => {
  const expected = hash("evals/behavioral-scoring-rubric.json");
  const harness = hash("evals/evaluator-harness-manifest.json");
  for (const relative of ["evals/gate-0c-preregistration.json", "evals/superpowers-comparison-preregistration.json"]) {
    const protocol = JSON.parse(fs.readFileSync(path.join(root, ...relative.split("/")), "utf8"));
    assert.equal(protocol.scoring_rubric.path, "evals/behavioral-scoring-rubric.json");
    assert.equal(protocol.scoring_rubric.sha256, expected, `${relative} has a stale scoring-rubric hash`);
    assert.equal(protocol.evaluator_harness.path, "evals/evaluator-harness-manifest.json");
    assert.equal(protocol.evaluator_harness.sha256, harness, `${relative} has a stale evaluator-harness hash`);
  }
});

test("both behavioral protocols pin one well-formed Claude executable identity", () => {
  const paths = ["evals/gate-0c-preregistration.json", "evals/superpowers-comparison-preregistration.json"];
  const identities = paths.map((relative) => {
    const protocol = JSON.parse(fs.readFileSync(path.join(root, ...relative.split("/")), "utf8"));
    const command = protocol.execution_identity.agent_command_template;
    const hashIndex = command.arguments.indexOf("--claude-sha256");
    const executableIndex = command.arguments.indexOf("--claude-exe");
    assert.ok(hashIndex >= 0 && executableIndex >= 0, `${relative} must pin the executable and its hash`);
    const sha256 = command.arguments[hashIndex + 1];
    assert.match(sha256, /^[a-f0-9]{64}$/, `${relative} has a malformed executable SHA-256`);
    assert.equal(protocol.execution_identity.model_id, "claude-sonnet-5");
    assert.deepEqual(protocol.verification_command_template, { command: "node", arguments: ["--test", "test/task-store.test.mjs"] });
    return { executable: command.arguments[executableIndex + 1], sha256 };
  });
  assert.deepEqual(identities[0], identities[1]);
});
