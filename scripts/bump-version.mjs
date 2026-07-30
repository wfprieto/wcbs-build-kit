#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
  console.error("Usage: node scripts/bump-version.mjs <semver>");
  process.exit(1);
}

const root = process.cwd();
for (const rel of ["package.json", ".codex-plugin/plugin.json"]) {
  const file = path.join(root, ...rel.split("/"));
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  data.version = version;
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

console.log(`Updated package and plugin version to ${version}. Update CHANGELOG.md and RELEASE_NOTES.md before release.`);
