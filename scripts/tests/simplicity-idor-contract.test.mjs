import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");

test("simplest-safe-path is a routed, portable WCBS skill", () => {
  const skill = read("skills/simplest-safe-path/SKILL.md");
  assert.match(skill, /^name:\s*simplest-safe-path$/m);
  assert.match(skill, /^description:\s*Use when /m);
  for (const term of ["APIVR", "Complexity Budget", "simpler alternative", "Evidence", "PASS", "Blocked"]) {
    assert.match(skill, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }
  const loadOrder = read("00_start_here/LOAD_ORDER.md");
  assert.match(loadOrder, /skills\/simplest-safe-path\/SKILL\.md/);
  const routing = JSON.parse(read("00_start_here/capability-routing.json"));
  const route = routing.capabilities.find(capability => capability.id === "needs-release");
  assert.ok(route, "missing needs-release route");
  assert.ok(!route.required_skills.includes("simplest-safe-path"));
  assert.ok(route.optional_skills.includes("simplest-safe-path"));
  assert.match(skill, /Do not activate for a predetermined narrow edit/i);
  const audit = read("50_audits/WCBS_SIMPLICITY_GUARDRAIL_AUDIT.md");
  assert.match(audit, /conditional activation/i);
  assert.doesNotMatch(audit, /new required skill/i);
});

test("current WCBS IDOR assessment preserves applicability and evidence boundaries", () => {
  const assessment = read("50_audits/WCBS_IDOR_APPLICABILITY_ASSESSMENT.md");
  for (const term of [
    "No current IDOR vulnerability found",
    "does not contain",
    "HTTP/API route handlers",
    "TaskStore.complete(id)",
    "TaskService.completeTask(id)",
    "Not Run / Blocked",
    "two accounts",
    "direct API"
  ]) assert.match(assessment, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
});
