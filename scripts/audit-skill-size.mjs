#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const maxLines = Number(process.env.WCBS_MAX_SKILL_LINES ?? 260);
const warnings = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === "SKILL.md") {
      const lines = fs.readFileSync(full, "utf8").split("\n").length;
      if (lines > maxLines) warnings.push(`${path.relative(root, full)} has ${lines} lines; consider splitting references.`);
    }
  }
}

walk(path.join(root, "skills"));
if (warnings.length) {
  console.log("Skill size warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}
console.log("PASS: skill-size audit completed.");
