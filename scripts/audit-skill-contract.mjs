#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const skillsRoot = path.join(root, "skills");
const failures = [];
const required = ["name", "description", "activation", "required_inputs", "required_outputs", "authority_dependencies", "evidence_requirements"];

function frontmatter(body) {
  if (!body.startsWith("---\n")) return null;
  const end = body.indexOf("\n---\n", 4);
  if (end < 0) return null;
  const values = new Map();
  for (const line of body.slice(4, end).split("\n")) {
    const match = line.match(/^([a-z_]+):\s*(.*)$/);
    if (match) values.set(match[1], match[2].trim());
  }
  return values;
}

for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(skillsRoot, entry.name, "SKILL.md");
  if (!fs.existsSync(file)) continue;
  const body = fs.readFileSync(file, "utf8").replace(/\r\n?/g, "\n");
  const lines = body.endsWith("\n") ? body.slice(0, -1).split("\n").length : body.split("\n").length;
  const fm = frontmatter(body);
  const relative = path.relative(root, file).replaceAll("\\", "/");
  if (!fm) { failures.push(`${relative}: invalid YAML frontmatter block.`); continue; }
  for (const key of required) if (!fm.has(key) || !fm.get(key)) failures.push(`${relative}: missing required frontmatter field ${key}.`);
  if (fm.get("name") !== entry.name) failures.push(`${relative}: name must match directory ${entry.name}.`);
  const description = fm.get("description") ?? "";
  if (description.length < 40 || description.length > 500) failures.push(`${relative}: description must be 40-500 characters.`);
  if (!/use when|activate when|trigger/i.test(description)) failures.push(`${relative}: description must contain a trigger phrase.`);
  if (/\buse when\s+(use|uses|used|using|to use)\b/i.test(description)) failures.push(`${relative}: description trigger phrase is malformed ("Use when use ..."); write one readable trigger clause.`);
  if (lines > 260) failures.push(`${relative}: ${lines} lines exceeds the 260-line hard limit.`);
  if (!/<HARD-GATE>|Excuse.*Reality|Decision Flow|## Workflow|## Process/is.test(body)) failures.push(`${relative}: body must contain a gate, decision flow, workflow, process, or rationalization table.`);
}

if (failures.length) {
  console.error("FAIL: portable skill contract violations:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("PASS: all portable skills satisfy the seven-field contract and 260-line budget.");
