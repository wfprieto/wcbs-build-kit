#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourcePath = path.join(root, "00_start_here/capability-routing.json");
const outputPath = path.join(root, "00_start_here/LOAD_ORDER.md");
const model = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const lines = [
  "# Load Order",
  "",
  "> GENERATED FILE. Do not edit by hand. Source: `00_start_here/capability-routing.json`.",
  "",
  "Load the EOS Kernel first, then the Controller, then select only the capabilities required by the project.",
  "",
  "## Universal Control Flow",
  "",
  "1. `BOOTSTRAP.md`",
  "2. `00_start_here/bootstrap-controller.json`",
  "3. `00_start_here/SOURCE_OF_TRUTH.md`",
  "4. `10_governance/APIVR_EXECUTION_LIFECYCLE.md`",
  "5. `10_governance/source_of_truth/Elite_Build_Goals_v3.md`",
  "6. Capability-specific skills, audits, templates, and gates below",
  "",
];

for (const capability of model.capabilities) {
  lines.push(`## ${capability.id}`, "");
  if (capability.subcapabilities.length) lines.push(`Subcapabilities: ${capability.subcapabilities.map(x => `\`${x}\``).join(", ")}.`, "");
  if (capability.required_skills.length) lines.push(`Required skills: ${capability.required_skills.map(x => `\`skills/${x}/SKILL.md\``).join(", ")}.`);
  if (capability.optional_skills.length) lines.push(`Optional skills: ${capability.optional_skills.map(x => `\`skills/${x}/SKILL.md\``).join(", ")}.`);
  if (capability.required_audits.length) lines.push(`Audits: ${capability.required_audits.map(x => `\`${x}\``).join(", ")}.`);
  if (capability.required_templates.length) lines.push(`Templates: ${capability.required_templates.map(x => `\`${x}\``).join(", ")}.`);
  if (capability.required_release_gates.length) lines.push(`Gates: ${capability.required_release_gates.map(x => `\`${x}\``).join(", ")}.`);
  lines.push("");
}

lines.push("## Portability", "", "Runtime delivery must follow `runtime_adapters/PORTABILITY_CONTRACT.md` and `runtime_adapters/PORTING_GUIDE.md`.", "", "Complex work may use `skills/subagent-driven-development/SKILL.md` after preflight gates pass.", "");
const rendered = `${lines.join("\n").trimEnd()}\n`;
if (process.argv.includes("--check")) {
  const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8").replace(/\r\n?/g, "\n") : "";
  if (current !== rendered) {
    console.error("FAIL: 00_start_here/LOAD_ORDER.md is stale. Run npm run generate:load-order.");
    process.exit(1);
  }
  console.log("PASS: generated load order is current.");
} else {
  fs.writeFileSync(outputPath, rendered);
  console.log("Generated 00_start_here/LOAD_ORDER.md");
}
