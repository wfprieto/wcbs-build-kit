#!/usr/bin/env node

import process from "node:process";

const args = new Set(process.argv.slice(2));
const targetArg = process.argv.find((arg) => arg.startsWith("--target="));
const target = targetArg ? targetArg.split("=")[1] : null;
const dryRun = args.has("--dry-run");

const adapters = {
  codex: ["AGENTS.md"],
  claude: ["CLAUDE.md"],
  cursor: [".cursor/rules/super-build-kit.mdc"],
  copilot: [".github/copilot-instructions.md"],
  gemini: ["GEMINI.md"],
  replit: ["REPLIT.md", "runtime_adapters/REPLIT_AGENT.md"],
  manus: ["Manus.md"],
  generic: ["00_start_here/START_HERE.md"]
};

if (!target || !adapters[target]) {
  console.log("Usage: node scripts/install-adapter.mjs --target=<codex|claude|cursor|copilot|gemini|replit|manus|generic> --dry-run");
  process.exit(1);
}

if (!dryRun) {
  console.log("This installer is currently read-only. Re-run with --dry-run to print adapter instructions.");
  process.exit(1);
}

console.log(`Adapter target: ${target}`);
console.log("Read or install these files according to your runtime:");
for (const file of adapters[target]) console.log(`- ${file}`);
console.log("");
console.log("Then run the activation test in runtime_adapters/ACTIVATION_TESTS.md.");
