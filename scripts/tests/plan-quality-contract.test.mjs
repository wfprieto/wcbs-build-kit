import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel) => fs.readFileSync(path.join(root, ...rel.split("/")), "utf8");

test("writing-plans skill requires pre-flight contradiction scanning", () => {
  const body = read("skills/writing-plans/SKILL.md");
  assert.match(body, /Pre-Flight Contradiction Scan/);
  assert.match(body, /60_templates\/PLAN_PREFLIGHT_CONFLICT_REPORT_TEMPLATE\.md/);
  assert.match(body, /resolve them before implementation or mark the plan `BLOCKED`/);
});

test("implementation blueprint contains an executable pre-flight scan section", () => {
  const body = read("60_templates/IMPLEMENTATION_BLUEPRINT_TEMPLATE.md");
  assert.match(body, /## Pre-Flight Contradiction Scan/);
  assert.match(body, /Objective\/non-goal conflicts/);
  assert.match(body, /Reviewer instruction conflicts/);
});

test("zero-placeholder rules ban common vague plan phrases", () => {
  const body = `${read("skills/writing-plans/SKILL.md")}\n${read("60_templates/IMPLEMENTATION_BLUEPRINT_TEMPLATE.md")}`;
  for (const phrase of ["TBD", "later", "as needed", "fix tests", "update files", "handle edge cases", "wire things together", "improve quality"]) {
    assert.match(body, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }
});

test("pre-flight conflict report template is available", () => {
  const body = read("60_templates/PLAN_PREFLIGHT_CONFLICT_REPORT_TEMPLATE.md");
  assert.match(body, /Objective \/ non-goals/);
  assert.match(body, /Tests \/ evidence/);
  assert.match(body, /APIVR Verdict/);
});
