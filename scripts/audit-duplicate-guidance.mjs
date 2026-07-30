#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const baselinePath = path.join(root, "10_governance", "DUPLICATE_GUIDANCE_BASELINE.json");

if (!fs.existsSync(baselinePath)) {
  console.error("FAIL: duplicate-guidance baseline is missing.");
  process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const activeDirs = baseline.active_directories;
const tracked = baseline.phrases;
const phraseCounts = new Map(Object.keys(tracked).map((phrase) => [phrase, 0]));

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

for (const file of activeDirs.flatMap((dir) => walk(path.join(root, dir)))) {
  const body = fs.readFileSync(file, "utf8");
  for (const phrase of Object.keys(tracked)) {
    if (body.includes(phrase)) phraseCounts.set(phrase, (phraseCounts.get(phrase) ?? 0) + 1);
  }
}

const failures = [];
for (const [phrase, expected] of Object.entries(tracked)) {
  const actual = phraseCounts.get(phrase) ?? 0;
  console.log(`${actual}\t${phrase}`);
  if (actual !== expected) failures.push(`Expected ${expected} active occurrences of ${JSON.stringify(phrase)}, found ${actual}.`);
}

if (failures.length) {
  console.error("FAIL: duplicate-guidance drift detected:");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("Update canonical guidance or intentionally revise 10_governance/DUPLICATE_GUIDANCE_BASELINE.json with review evidence.");
  process.exit(1);
}

console.log("PASS: duplicate-guidance counts match the governed baseline.");
