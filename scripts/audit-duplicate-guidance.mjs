#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const activeDirs = ["00_start_here", "10_governance", "40_knowledge", "50_audits", "60_templates", "skills", "runtime_adapters", "docs"];
const phraseCounts = new Map();
const tracked = ["Audit wide. Fix narrow. Prove everything.", "NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST", "Do not claim `Runtime Verified`"];

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
  for (const phrase of tracked) if (body.includes(phrase)) phraseCounts.set(phrase, (phraseCounts.get(phrase) ?? 0) + 1);
}

for (const [phrase, count] of phraseCounts) console.log(`${count}\t${phrase}`);
console.log("PASS: duplicate-guidance audit completed. Review counts for intentional canonical repetition.");
