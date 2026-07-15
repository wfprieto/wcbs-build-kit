#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const dir = path.join(root, "tests", "behavior");
const required = ["apivr_tier", "elite_goals", "evidence_state", "release_gate_status", "final_verdict"];
const allowedEvidence = new Set(["Verified", "Likely", "Suspected", "Unknown", "Not Run", "Blocked"]);
const errors = [];

if (!fs.existsSync(dir)) errors.push("Missing tests/behavior directory.");
else {
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".json")).sort()) {
    const rel = `tests/behavior/${file}`;
    const item = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    for (const key of required) if (!item[key]) errors.push(`${rel}: missing ${key}`);
    if (item.evidence_state && !allowedEvidence.has(item.evidence_state)) errors.push(`${rel}: invalid evidence_state ${item.evidence_state}`);
    if (!Array.isArray(item.skills) || item.skills.length === 0) errors.push(`${rel}: skills must be a non-empty array`);
    if (!Array.isArray(item.verification) || item.verification.length === 0) errors.push(`${rel}: verification must be a non-empty array`);
  }
}

if (errors.length) {
  console.log("WCBS Behavior Fixture Test");
  console.log("Failures:");
  for (const error of errors) console.log(`- ${error}`);
  process.exit(1);
}

console.log("PASS: behavior fixtures include APIVR tier, skills, evidence state, release gates, verification, and verdict.");
