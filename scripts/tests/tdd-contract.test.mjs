import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel) => fs.readFileSync(path.join(root, ...rel.split("/")), "utf8");

test("TDD skill preserves the hard Iron Law and delete-and-restart gate", () => {
  const body = read("skills/test-driven-development/SKILL.md");
  assert.match(body, /NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST/);
  assert.match(body, /delete-and-restart rule/i);
  assert.match(body, /watch it fail for the intended reason/i);
  assert.match(body, /Do not keep premature code as a reference/i);
});

test("implementation blueprint requires observed red-green-refactor evidence", () => {
  const body = read("60_templates/IMPLEMENTATION_BLUEPRINT_TEMPLATE.md");
  assert.match(body, /Expected failing result before implementation/);
  assert.match(body, /Expected passing result/);
  assert.match(body, /Behavior that must remain unchanged/);
  assert.match(body, /Evidence state: Verified \/ Likely \/ Suspected \/ Unknown \/ Not Run \/ Blocked/);
});

test("canonical audit protocols inspect test-first order and red-green-refactor evidence", () => {
  const body = read("50_audits/CANONICAL_AUDIT_PROTOCOLS.md");
  assert.match(body, /test-first order/i);
  assert.match(body, /Red-Green-Refactor evidence/i);
  assert.match(body, /unrun verification/i);
});
