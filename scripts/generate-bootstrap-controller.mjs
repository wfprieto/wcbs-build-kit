#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const source = path.join(root, "00_start_here/bootstrap-controller.json");
const output = path.join(root, "00_start_here/BOOTSTRAP_CONTROLLER.md");
const model = JSON.parse(fs.readFileSync(source, "utf8"));
const lines = [
  "# EOS Bootstrap Controller",
  "",
  "> GENERATED FILE. Do not edit by hand. Source: `00_start_here/bootstrap-controller.json`.",
  "",
  `Controller version: \`${model.controller_version}\``,
  "",
  "## State Sequence",
  "",
];
for (const [index, state] of model.states.entries()) {
  lines.push(`### ${index + 1}. ${state.id}`, "");
  lines.push(`- Blocking: \`${state.blocking}\``);
  lines.push(`- Entry: ${state.entry_conditions.join("; ")}`);
  lines.push(`- Inputs: ${state.required_inputs.join("; ")}`);
  lines.push(`- Outputs: ${state.produced_artifacts.join("; ")}`);
  lines.push(`- Failures: ${state.failure_conditions.join("; ")}`);
  lines.push(`- Recovery: ${state.recovery_behavior.join("; ")}`);
  lines.push(`- Evidence: ${state.evidence_produced.join(", ")}`);
  lines.push(`- Next: ${state.allowed_transitions.length ? state.allowed_transitions.join(", ") : "APIVR lifecycle"}`, "");
}
lines.push("## Rehydration Set", "", ...model.rehydration_set.map(x => `- \`${x}\``), "");
const rendered = `${lines.join("\n").trimEnd()}\n`;
if (process.argv.includes("--check")) {
  const current = fs.existsSync(output) ? fs.readFileSync(output, "utf8").replace(/\r\n?/g, "\n") : "";
  if (current !== rendered) {
    console.error("FAIL: BOOTSTRAP_CONTROLLER.md is stale. Run npm run generate:controller.");
    process.exit(1);
  }
  console.log("PASS: generated Controller documentation is current.");
} else {
  fs.writeFileSync(output, rendered);
  console.log("Generated 00_start_here/BOOTSTRAP_CONTROLLER.md");
}
