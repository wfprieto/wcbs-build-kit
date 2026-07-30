#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const readArg = (name) => {
  const equal = args.find((arg) => arg.startsWith(`${name}=`));
  if (equal) return equal.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};

const base = readArg("--base");
const head = readArg("--head");
const brief = readArg("--brief");
const report = readArg("--report");
const outDir = readArg("--out-dir") ?? ".wcbs/sdd/review-packages";

function die(message) {
  console.error(message);
  process.exit(1);
}

if (!base || !head || !brief) die("Usage: node scripts/review-package.mjs --base <sha> --head <sha> --brief <brief.md> [--report report.md] [--out-dir .wcbs/sdd/review-packages]");
if (/[~^]/.test(base) || /[~^]/.test(head)) die("Shortcut refs are prohibited; use exact base and head SHAs.");
if (base === head) die("Base and head must differ.");
if (!fs.existsSync(brief)) die(`Brief not found: ${brief}`);
if (report && !fs.existsSync(report)) die(`Report not found: ${report}`);

const git = (gitArgs) => {
  const result = spawnSync("git", gitArgs, { encoding: "utf8" });
  if (result.status !== 0) die(result.stderr || result.stdout || `git ${gitArgs.join(" ")} failed`);
  return result.stdout;
};

git(["merge-base", "--is-ancestor", base, head]);
const name = `${base.slice(0, 12)}..${head.slice(0, 12)}.md`.replace(/[^a-z0-9._-]+/gi, "-");
fs.mkdirSync(outDir, { recursive: true });
const output = path.join(outDir, name);

const parts = [
  "# Review Package",
  "",
  `- Base: ${base}`,
  `- Head: ${head}`,
  `- Brief: ${path.resolve(brief)}`,
  report ? `- Implementer report: ${path.resolve(report)}` : "- Implementer report: Not provided",
  "",
  "## Task Brief",
  "",
  fs.readFileSync(brief, "utf8"),
  "",
  "## Implementer Report",
  "",
  report ? fs.readFileSync(report, "utf8") : "Not provided.",
  "",
  "## Commit List",
  "",
  "```text",
  git(["log", "--oneline", `${base}..${head}`]).trim(),
  "```",
  "",
  "## Diff Stat",
  "",
  "```text",
  git(["diff", "--stat", `${base}..${head}`]).trim(),
  "```",
  "",
  "## Diff",
  "",
  "```diff",
  git(["diff", "-U10", `${base}..${head}`]).trim(),
  "```",
  ""
];

fs.writeFileSync(output, parts.join("\n"), "utf8");
console.log(path.resolve(output));
