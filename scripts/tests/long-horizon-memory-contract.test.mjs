import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const skillPath = path.join(root, "skills/long-horizon-agent-runtime/SKILL.md");
const controllerPath = path.join(root, "00_start_here/bootstrap-controller.json");
const skill = fs.readFileSync(skillPath, "utf8");
const controller = JSON.parse(fs.readFileSync(controllerPath, "utf8"));

const normalizedRehydrationPaths = controller.rehydration_set.map((entry) => entry.replaceAll("\\", "/"));

test("long-horizon runtime references the Controller rehydration declaration", () => {
  assert.match(skill, /00_start_here\/bootstrap-controller\.json/);
  assert.match(skill, /Controller-declared `rehydration_set`/);
});

test("long-horizon runtime does not duplicate the Controller rehydration file list", () => {
  for (const declaredPath of normalizedRehydrationPaths) {
    assert.equal(
      skill.includes(declaredPath),
      false,
      `skill must not hardcode Controller-owned rehydration path: ${declaredPath}`
    );
  }
});

test("long-horizon runtime contains the mandatory resume gate", () => {
  assert.match(skill, /<HARD-GATE>[\s\S]*On resuming any long-horizon run[\s\S]*authoritative bootstrap certificate[\s\S]*rehydrate[\s\S]*<\/HARD-GATE>/);
  assert.match(skill, /Never continue from partial project state/);
});

test("long-horizon runtime distinguishes state lifetimes and delegates cross-project learning", () => {
  assert.match(skill, /Session-scoped state/);
  assert.match(skill, /Project-scoped state/);
  assert.match(skill, /Cross-project learning/);
  assert.match(skill, /skills\/compound-learning-capture\/SKILL\.md/);
});

test("long-horizon runtime defines both loss-detector failure modes", () => {
  assert.match(skill, /certificate hash does not match[\s\S]*force complete re-initialization/i);
  assert.match(skill, /certificate is missing[\s\S]*interrupted before `CERTIFY`[\s\S]*force complete re-initialization/i);
});

test("long-horizon runtime requires append-only evidence-ledger writes", () => {
  assert.match(skill, /evidence-ledger\.jsonl/);
  assert.match(skill, /Append only/);
  assert.match(skill, /Do not overwrite, reorder, backfill invented evidence/);
});