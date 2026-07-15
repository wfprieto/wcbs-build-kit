#!/usr/bin/env node

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

const plan = readArg("--plan");
const task = readArg("--task");
const outDir = readArg("--out-dir") ?? ".wcbs/sdd/briefs";

if (!plan || !task) {
  console.error("Usage: node scripts/task-brief.mjs --plan <plan.md> --task <id-or-number> [--out-dir .wcbs/sdd/briefs]");
  process.exit(1);
}

const planPath = path.resolve(plan);
if (!fs.existsSync(planPath)) {
  console.error(`Plan not found: ${plan}`);
  process.exit(1);
}

const body = fs.readFileSync(planPath, "utf8");
const escaped = String(task).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const headingPattern = new RegExp(`(^#{1,6}\\s+.*(?:Task|Slice)\\s*${escaped}[^\\n]*\\n)`, "gmi");
const match = headingPattern.exec(body);
let section;

if (match) {
  const start = match.index;
  const next = body.slice(start + match[0].length).search(/^#{1,6}\s+/m);
  const end = next >= 0 ? start + match[0].length + next : body.length;
  section = body.slice(start, end).trim();
} else {
  section = `# Task ${task}\n\nExact task section was not found automatically in ${plan}. Use the plan source as context and replace this generated brief with the exact task requirements before dispatch.`;
}

fs.mkdirSync(outDir, { recursive: true });
const safeTask = String(task).replace(/[^a-z0-9._-]+/gi, "-");
const output = path.join(outDir, `task-${safeTask}-brief.md`);
fs.writeFileSync(output, `${section}\n\n## Brief Contract\n\n- Source plan: ${planPath}\n- Task id: ${task}\n- Immutable after dispatch: Yes\n`, "utf8");
console.log(path.resolve(output));
