#!/usr/bin/env node
// Deterministic preflight for the V2 blinded behavioral-evaluation design.
// This command never invokes a model or spends money.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, ...relative.split("/")), "utf8"));
const design = read("evals/v2-core-skill-preregistration.json");
const cases = read("evals/v2-core-skill-cases.json");
const registry = read("runtime_adapters/adapter-registry.yaml");
const failures = [];
const fail = (message) => failures.push(message);

if (design.status !== "preregistered-before-paid-runs") fail("V2 preregistration status must be preregistered-before-paid-runs.");
if (!/blinded/i.test(design.judging?.protocol ?? "")) fail("V2 preregistration must require blinded judging.");
if (!/random/i.test(design.randomization?.protocol ?? "")) fail("V2 preregistration must require randomized order.");
if (!Array.isArray(design.redaction_rules) || !design.redaction_rules.length) fail("V2 preregistration must define redaction rules.");
if (!Number.isSafeInteger(design.cost_cap_usd) || design.cost_cap_usd <= 0) fail("V2 preregistration must define a positive fixed cost cap.");
if (!Array.isArray(cases.cases)) fail("V2 case catalog must contain cases.");
const expected = new Set(registry.core_skills.map((skill) => skill.name));
const grouped = new Map();
for (const testCase of cases.cases ?? []) {
  if (!expected.has(testCase.skill)) fail(`Case ${testCase.id} names an unknown core skill.`);
  if (!/[a-z0-9-]+-(direct|indirect|pressure)$/.test(testCase.id ?? "")) fail(`Case has invalid id: ${testCase.id}`);
  if (!testCase.prompt || !Array.isArray(testCase.criteria) || testCase.criteria.length < 3) fail(`Case ${testCase.id} must lock a prompt and three scoring criteria.`);
  if (![10, 20].includes(testCase.runs_per_case_per_arm)) fail(`Case ${testCase.id} must use a locked 10 or 20 run count.`);
  grouped.set(testCase.skill, [...(grouped.get(testCase.skill) ?? []), testCase.kind]);
}
for (const skill of expected) {
  const kinds = (grouped.get(skill) ?? []).sort();
  if (JSON.stringify(kinds) !== JSON.stringify(["direct", "indirect", "pressure"])) fail(`Core skill ${skill} must have direct, indirect, and pressure cases.`);
}
if (failures.length) {
  console.error("FAIL: V2 behavioral evaluation design is not preregistered:");
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}
console.log(`PASS: V2 eval design is preregistered (${cases.cases.length} cases across ${expected.size} core skills).`);
console.log("Execution state is Blocked until an authorized evaluator records immutable model identity and approves paid execution.");
