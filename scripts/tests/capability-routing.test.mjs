import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const routing = JSON.parse(fs.readFileSync(path.join(root, "00_start_here", "capability-routing.json"), "utf8"));
const v2Registry = JSON.parse(fs.readFileSync(path.join(root, "runtime_adapters", "adapter-registry.yaml"), "utf8"));
const skillDirs = fs.readdirSync(path.join(root, "skills"), { withFileTypes: true })
  .filter(entry => entry.isDirectory() && fs.existsSync(path.join(root, "skills", entry.name, "SKILL.md")))
  .map(entry => entry.name)
  .sort();

function referencedSkills() {
  const routed = new Set();
  for (const capability of routing.capabilities) {
    for (const field of ["required_skills", "optional_skills"]) {
      for (const skill of capability[field] ?? []) routed.add(skill);
    }
  }
  for (const entry of routing.unrouted ?? []) routed.add(entry.skill);
  // V2 core routing is intentionally generated from the canonical registry so
  // the compact session bootstrap, behavior cases, and catalog cannot drift
  // from the skill inventory. Specialist capabilities remain in the legacy
  // capability router above.
  for (const entry of v2Registry.core_skills ?? []) routed.add(entry.name);
  return routed;
}

test("capability vocabulary stays within governed budgets", () => {
  assert.ok(routing.capabilities.length <= 20, "more than 20 top-level capabilities");
  for (const capability of routing.capabilities) {
    assert.ok(capability.subcapabilities.length <= 8, `${capability.id} exceeds 8 subcapabilities`);
  }
});

test("every skill is routed by the capability router or V2 core catalog", () => {
  const routed = referencedSkills();
  const missing = skillDirs.filter(skill => !routed.has(skill));
  assert.deepEqual(missing, [], `unrouted skills: ${missing.join(", ")}`);
  for (const entry of routing.unrouted ?? []) {
    assert.ok(entry.justification?.trim(), `${entry.skill} lacks an unrouted justification`);
  }
});

test("every routed skill exists", () => {
  for (const skill of referencedSkills()) {
    assert.ok(skillDirs.includes(skill), `routing references missing skill: ${skill}`);
  }
});

test("subcapabilities have exactly one parent and are not decorative", () => {
  const seen = new Map();
  for (const capability of routing.capabilities) {
    const outputs = [...(capability.required_skills ?? []), ...(capability.optional_skills ?? []), ...(capability.required_audits ?? []), ...(capability.required_templates ?? [])];
    assert.ok(outputs.length > 0, `${capability.id} has no execution routing`);
    for (const sub of capability.subcapabilities) {
      assert.ok(!seen.has(sub), `${sub} has multiple parents: ${seen.get(sub)} and ${capability.id}`);
      seen.set(sub, capability.id);
    }
  }
});

test("deprecated capabilities name a successor", () => {
  for (const entry of routing.deprecations ?? []) {
    assert.ok(entry.successor?.trim(), `deprecation ${entry.id ?? "unknown"} lacks a successor`);
  }
});
