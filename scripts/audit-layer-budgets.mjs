#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = p => fs.readFileSync(path.join(root, p), "utf8").replace(/\r\n?/g, "\n");
const failures = [];

const contract = read("00_start_here/KERNEL_CONTRACT.md");
const lineMatch = contract.match(/Maximum Kernel size:\s*\*\*(\d+) lines and ([\d,]+) characters\*\*/i);
if (!lineMatch) failures.push("KERNEL_CONTRACT.md must declare the ratcheting Kernel line and character budget.");
const maxLines = Number(lineMatch?.[1] ?? 0);
const maxChars = Number((lineMatch?.[2] ?? "0").replaceAll(",", ""));
const kernel = read("BOOTSTRAP.md");
const kernelLines = kernel.endsWith("\n") ? kernel.slice(0, -1).split("\n").length : kernel.split("\n").length;
if (kernelLines > maxLines) failures.push(`BOOTSTRAP.md has ${kernelLines} lines; budget is ${maxLines}.`);
if (kernel.length > maxChars) failures.push(`BOOTSTRAP.md has ${kernel.length} characters; budget is ${maxChars}.`);

const controller = JSON.parse(read("00_start_here/bootstrap-controller.json"));
if (controller.states.length > 12) failures.push(`Controller has ${controller.states.length} states; budget is 12.`);
const controllerDoc = path.join(root, "00_start_here/BOOTSTRAP_CONTROLLER.md");
if (fs.existsSync(controllerDoc)) {
  const lines = read("00_start_here/BOOTSTRAP_CONTROLLER.md").split("\n").length;
  if (lines > 400) failures.push(`BOOTSTRAP_CONTROLLER.md has ${lines} lines; budget is 400.`);
}

const routing = JSON.parse(read("00_start_here/capability-routing.json"));
if (routing.capabilities.length > 20) failures.push(`Capability model has ${routing.capabilities.length} top-level capabilities; budget is 20.`);
for (const capability of routing.capabilities) {
  if (capability.subcapabilities.length > 8) failures.push(`${capability.id} has ${capability.subcapabilities.length} subcapabilities; budget is 8.`);
}

if (failures.length) {
  console.error("FAIL: EOS layer budget violation:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("PASS: EOS Kernel, Controller, and capability budgets are within contract.");
