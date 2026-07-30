import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

test("the V2 core-skill evaluation is generated, blinded, and preflightable without a paid run", () => {
  const result = spawnSync(process.execPath, ["scripts/verify-v2-eval-design.mjs"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  assert.match(result.stdout, /42 cases across 14 core skills/);
  assert.match(result.stdout, /Execution state is Blocked/i);
  const registry = JSON.parse(fs.readFileSync(path.join(root, "runtime_adapters", "adapter-registry.yaml"), "utf8"));
  const cases = JSON.parse(fs.readFileSync(path.join(root, "evals", "v2-core-skill-cases.json"), "utf8"));
  assert.equal(cases.cases.length, registry.core_skills.length * 3);
  for (const skill of registry.core_skills) {
    assert.deepEqual(cases.cases.filter((entry) => entry.skill === skill.name).map((entry) => entry.kind).sort(), ["direct", "indirect", "pressure"]);
  }
});
