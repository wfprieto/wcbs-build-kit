import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = p => fs.readFileSync(path.join(root, p), "utf8").replace(/\r\n?/g, "\n");

// STRUCTURAL DRIFT CONTROL ONLY
// This test verifies repository documentation structure or wording.
// It is NOT behavioral evidence that an external agent follows the path.
test("Kernel remains transport-only and within the frozen budget", () => {
  const kernel = read("BOOTSTRAP.md");
  const contract = read("00_start_here/KERNEL_CONTRACT.md");
  const lines = kernel.endsWith("\n") ? kernel.slice(0, -1).split("\n").length : kernel.split("\n").length;
  assert.ok(lines <= 45, `Kernel has ${lines} lines`);
  assert.ok(kernel.length <= 2700, `Kernel has ${kernel.length} characters`);
  assert.match(contract, /Maximum Kernel size:\s*\*\*45 lines and 2,700 characters\*\*/);
  assert.match(kernel, /bootstrap-controller\.json/);
  assert.match(kernel, /handoff envelope/i);
  assert.match(kernel, /agent is instructed to stop/i);
  assert.match(contract, /instruction contract for an external agent/i);
  assert.match(contract, /does not make an external agent's compliance technically unavoidable/i);
  const forbidden = [
    "frontend", "backend", "database", "security", "testing", "deployment", "accessibility", "performance",
    "APIVR", "Elite Build Goal", "PASS", "CONDITIONAL PASS", "PARTIAL", "FAIL", "BLOCKED",
    "Verified", "Likely", "Suspected", "Unknown", "Not Run", "Blocked"
  ];
  for (const term of forbidden) assert.equal(kernel.includes(term), false, `Kernel contains forbidden term: ${term}`);
});

test("Kernel contract freezes five responsibilities and closed transport reasons", () => {
  const contract = read("00_start_here/KERNEL_CONTRACT.md");
  for (const reason of ["controller_unavailable", "controller_integrity_failed", "delivery_environment_unresolved", "project_root_unresolved", "kernel_artifact_unreadable"])
    assert.match(contract, new RegExp(reason));
  assert.match(contract, /Every responsibility removed from the Kernel is a permanent architectural improvement/);
  assert.match(contract, /major EOS version bump/);
});
