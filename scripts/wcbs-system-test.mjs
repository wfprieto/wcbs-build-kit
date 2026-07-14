#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const fixturePath = path.join(root, "tests", "system", "routing-fixtures.json");
const errors = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, ...relativePath.split("/")), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, ...relativePath.split("/")));
}

function fail(message) {
  errors.push(message);
}

if (!exists("tests/system/routing-fixtures.json")) {
  fail("Missing tests/system/routing-fixtures.json");
} else {
  const data = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  for (const fixture of data.fixtures) {
    let combinedContent = "";
    for (const file of fixture.requiredFiles) {
      if (!exists(file)) {
        fail(`${fixture.name}: missing ${file}`);
        continue;
      }
      combinedContent += `\n${read(file)}`;
    }
    for (const term of fixture.requiredTerms) {
      if (!combinedContent.includes(term)) fail(`${fixture.name}: workflow context missing required term ${term}`);
    }
  }
}

const loadOrder = exists("00_start_here/LOAD_ORDER.md") ? read("00_start_here/LOAD_ORDER.md") : "";
for (const required of [
  "skills/20-pass-protocol/SKILL.md",
  "skills/external-integration-launch-gate/SKILL.md",
  "skills/compound-learning-capture/SKILL.md",
  "skills/knowledge-refresh-and-drift-control/SKILL.md"
]) {
  if (!loadOrder.includes(required)) fail(`LOAD_ORDER.md missing ${required}`);
}

const adapterTargets = {
  codex: ["AGENTS.md"],
  claude: ["CLAUDE.md"],
  cursor: [".cursor/rules/super-build-kit.mdc"],
  copilot: [".github/copilot-instructions.md"],
  gemini: ["GEMINI.md"],
  replit: ["REPLIT.md", "runtime_adapters/REPLIT_AGENT.md"],
  manus: ["Manus.md"],
  generic: ["00_start_here/START_HERE.md"]
};

for (const [target, files] of Object.entries(adapterTargets)) {
  for (const file of files) {
    if (!exists(file)) fail(`adapter ${target}: missing ${file}`);
  }
}

for (const file of ["INSTALL.md", "QUICKSTART.md", "RELEASE_PROCESS.md", "VERSIONING.md", "SECURITY.md"]) {
  if (!exists(file)) fail(`software-ready doc missing ${file}`);
}

console.log("WCBS Super Build Kit System Test");
if (errors.length) {
  console.log("");
  console.log("Failures:");
  for (const error of errors) console.log(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("PASS: startup, planning, forensic security, and critical routing fixtures passed.");
}
