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
