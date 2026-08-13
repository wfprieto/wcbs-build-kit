import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("execution graph is routed and cataloged as one optional WCBS capability", () => {
  const routing = JSON.parse(read("00_start_here/capability-routing.json"));
  const release = routing.capabilities.find((entry) => entry.id === "needs-release");
  assert.ok(release, "needs-release capability is missing");
  assert.ok(release.optional_skills.includes("execution-graph"));

  const registry = JSON.parse(read("runtime_adapters/adapter-registry.yaml"));
  const matches = registry.specialist_skills.filter((entry) => entry.name === "execution-graph");
  assert.deepEqual(matches, [{
    name: "execution-graph",
    path: "skills/execution-graph/SKILL.md",
    classification: "domain-procedure"
  }]);

  const generated = JSON.parse(read("runtime_adapters/generated/specialist-skill-catalog.json"));
  assert.deepEqual(generated.specialist_skills.filter((entry) => entry.name === "execution-graph"), matches);
});

test("execution graph owns scheduling mechanics without duplicating WCBS authority", () => {
  const body = read("skills/execution-graph/SKILL.md");
  for (const required of [
    /requirement-to-node traceability/i,
    /Kahn's algorithm/i,
    /READY frontier/i,
    /evidence-backed node locking/i,
    /transitive dependents/i,
    /transitive dependents that are not SUPERSEDED/i,
    /ascending NODE ID as the final tie-break/i,
    /Resolving a blocker returns the node to PENDING and triggers recomputation/i,
    /Any unlocked node that is not SUPERSEDED may become BLOCKED/i,
    /demote every unlocked node that no longer meets\s+READY conditions to PENDING/i,
    /does not own initialization/i,
    /never authorizes subagents/i,
    /LOCKED is not an APIVR, goal, phase, or release PASS/i
  ]) assert.match(body, required);
  assert.match(body, /required_inputs:.*applicable Elite Build Goals/i);
  assert.match(body, /Confirm initialization, tier, applicable Elite Build Goals/i);
  assert.match(body, /Report the tier, applicable Elite Build Goals, and baseline/i);

  assert.match(body, /Direct:.*approved migration plan/i);
  assert.match(body, /Indirect:.*dependent slices/i);
  assert.match(body, /Pressure:.*unverified code/i);
});

test("execution graph activation is discoverable through existing WCBS routing surfaces", () => {
  for (const file of [
    "00_start_here/START_HERE.md",
    "00_start_here/LOAD_ORDER.md",
    "skills/super-build-kit/SKILL.md",
    "README.md",
    "docs/WHICH_SKILL_DO_I_USE.md"
  ]) assert.match(read(file), /skills\/execution-graph\/SKILL\.md/, `${file} does not route execution-graph`);
});
