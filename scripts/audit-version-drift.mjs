#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const plugin = JSON.parse(fs.readFileSync(path.join(root, ".codex-plugin", "plugin.json"), "utf8"));
const changelog = fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8");
const releaseNotes = fs.existsSync(path.join(root, "RELEASE_NOTES.md")) ? fs.readFileSync(path.join(root, "RELEASE_NOTES.md"), "utf8") : "";
const errors = [];

if (plugin.version !== pkg.version) errors.push(`plugin version ${plugin.version} does not match package version ${pkg.version}`);
if (!changelog.includes(`## ${pkg.version}`)) errors.push(`CHANGELOG.md does not include ## ${pkg.version}`);
if (!releaseNotes.includes(pkg.version)) errors.push(`RELEASE_NOTES.md does not mention ${pkg.version}`);

if (errors.length) {
  console.log("Version drift failures:");
  for (const error of errors) console.log(`- ${error}`);
  process.exit(1);
}

console.log(`PASS: version ${pkg.version} is consistent across package, plugin, changelog, and release notes.`);
