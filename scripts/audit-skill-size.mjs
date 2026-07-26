#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const warningLines = Number(process.env.WCBS_MAX_SKILL_LINES ?? 260);
const hardLimitLines = Number(process.env.WCBS_HARD_MAX_SKILL_LINES ?? 500);
const warnings = [];
const failures = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === "SKILL.md") {
      const lines = fs.readFileSync(full, "utf8").split("\n").length;
      const relative = path.relative(root, full);
      if (lines > hardLimitLines) failures.push(`${relative} has ${lines} lines; hard limit is ${hardLimitLines}.`);
      else if (lines > warningLines) warnings.push(`${relative} has ${lines} lines; review whether references should be split.`);
    }
  }
}

walk(path.join(root, "skills"));

if (warnings.length) {
  console.log("Skill size warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (failures.length) {
  console.error("FAIL: oversized runtime skills detected:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PASS: all skills remain below the ${hardLimitLines}-line hard limit.`);
