#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourcePath = path.join(root, "00_start_here/capability-routing.json");
const outputPath = path.join(root, "00_start_here/LOAD_ORDER.md");
const model = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const begin = "<!-- BEGIN GENERATED CAPABILITY ROUTING -->";
const end = "<!-- END GENERATED CAPABILITY ROUTING -->";

const lines = [begin, "", "## EOS Capability Routing", "", "> GENERATED REGION. Source: `00_start_here/capability-routing.json`. Do not edit between the markers.", ""];
for (const capability of model.capabilities) {
  lines.push(`### ${capability.id}`, "");
  if (capability.subcapabilities.length) lines.push(`Subcapabilities: ${capability.subcapabilities.map(x => `\`${x}\``).join(", ")}.`, "");
  if (capability.required_skills.length) lines.push(`Required skills: ${capability.required_skills.map(x => `\`skills/${x}/SKILL.md\``).join(", ")}.`);
  if (capability.optional_skills.length) lines.push(`Optional skills: ${capability.optional_skills.map(x => `\`skills/${x}/SKILL.md\``).join(", ")}.`);
  if (capability.required_audits.length) lines.push(`Audits: ${capability.required_audits.map(x => `\`${x}\``).join(", ")}.`);
  if (capability.required_templates.length) lines.push(`Templates: ${capability.required_templates.map(x => `\`${x}\``).join(", ")}.`);
  if (capability.required_release_gates.length) lines.push(`Gates: ${capability.required_release_gates.map(x => `\`${x}\``).join(", ")}.`);
  lines.push("");
}
if (model.unrouted?.length) {
  lines.push("### Universal Or Meta Skills", "");
  for (const entry of model.unrouted) lines.push(`- \`skills/${entry.skill}/SKILL.md\` — ${entry.justification}`);
  lines.push("");
}
lines.push(end);
const generated = lines.join("\n");
const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8").replace(/\r\n?/g, "\n") : "# Load Order\n";

function merge(body) {
  const start = body.indexOf(begin);
  const finish = body.indexOf(end);
  if (start >= 0 && finish >= start) return `${body.slice(0, start).trimEnd()}\n\n${generated}\n${body.slice(finish + end.length).replace(/^\n+/, "")}`;
  return `${body.trimEnd()}\n\n${generated}\n`;
}

const expected = merge(current);
if (process.argv.includes("--check")) {
  const routed = new Set();
  for (const capability of model.capabilities) for (const field of ["required_skills", "optional_skills"]) for (const skill of capability[field] ?? []) routed.add(skill);
  for (const entry of model.unrouted ?? []) routed.add(entry.skill);
  const missing = [...routed].filter(skill => !current.includes(`skills/${skill}/SKILL.md`));
  if (missing.length) {
    console.error(`FAIL: LOAD_ORDER.md does not reference routed skills: ${missing.join(", ")}. Run npm run generate:load-order after routing is complete.`);
    process.exit(1);
  }
  if (current.includes(begin) && current !== expected) {
    console.error("FAIL: generated capability-routing region is stale. Run npm run generate:load-order.");
    process.exit(1);
  }
  console.log(current.includes(begin) ? "PASS: generated capability-routing region is current." : "PASS: legacy load order preserves every routed skill; generation will append a bounded region without deleting existing guidance.");
} else {
  fs.writeFileSync(outputPath, expected);
  console.log("Updated the bounded capability-routing region in 00_start_here/LOAD_ORDER.md without replacing existing guidance.");
}
