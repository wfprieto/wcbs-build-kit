#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import process from "node:process";

const unittestArgs = ["-m", "unittest", "discover", "-s", "skills/subagent-driven-development/tests", "-v"];
const candidates = process.platform === "win32"
  ? [["py", ["-3"]], ["python", []], ["python3", []]]
  : [["python3", []], ["python", []], ["py", ["-3"]]];

for (const [command, prefix] of candidates) {
  const result = spawnSync(command, [...prefix, ...unittestArgs], { stdio: "inherit", shell: false });
  if (result.error?.code === "ENOENT") continue;
  if (result.error) {
    console.error(`Failed to launch ${command}: ${result.error.message}`);
    process.exit(1);
  }
  process.exit(result.status ?? 1);
}

console.error("Python 3 was not found. Tried python3, python, and py -3.");
process.exit(1);
