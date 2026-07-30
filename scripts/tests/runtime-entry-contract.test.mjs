import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolveContainedPosixRelativePath } from "../lib/adapter-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (relative) => fs.readFileSync(path.join(root, ...relative.split("/")), "utf8");
const registry = JSON.parse(read("runtime_adapters/adapter-registry.yaml"));
const runtimeEntryPoints = registry.runtime_startup_contract.thin_entry_points;

test("runtime startup policy is generated from the canonical adapter registry", () => {
  const result = spawnSync(process.execPath, ["scripts/generate-v2-metadata.mjs", "--check"], {
    cwd: root,
    encoding: "utf8"
  });
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);

  const contract = read("runtime_adapters/generated/runtime-startup-contract.md");
  assert.match(contract, /GENERATED FILE - DO NOT EDIT BY HAND/i);
  assert.match(contract, /`BOOTSTRAP\.md`/);
  assert.match(contract, /`00_start_here\/LOAD_ORDER\.md`/);
  assert.match(contract, /Do not claim a check passed unless it was actually run/i);
});

test("primary runtime entry points route to the one startup contract and keep only runtime-specific markers", () => {
  for (const [runtime, relative] of Object.entries(runtimeEntryPoints)) {
    const body = read(relative);
    assert.match(body, /Read and execute `BOOTSTRAP\.md` before project work\. If the Kernel cannot transfer to its Controller, stop and emit only the transport failure envelope\./, `${relative} must retain the direct fail-closed Kernel route`);
    assert.match(body, /runtime_adapters\/generated\/runtime-startup-contract\.md/, `${relative} must route to the canonical startup contract`);
    assert.match(body, new RegExp(`WCBS_KIT_ACTIVE:${runtime}`), `${relative} must retain its runtime-specific activation marker`);
    for (const common of registry.runtime_startup_contract.common_controls) assert.equal(body.includes(common), false, `${relative} must not restate common policy: ${common}`);
    for (const startupFile of registry.runtime_startup_contract.startup_files) assert.equal(body.includes(startupFile), false, `${relative} must not restate common startup path: ${startupFile}`);
    assert.ok(body.split(/\r?\n/).length <= 80, `${relative} exceeds the runtime-entry budget`);
  }
});

test("runtime startup contract paths remain contained POSIX-relative repository paths", () => {
  assert.equal(resolveContainedPosixRelativePath(root, "runtime_adapters/generated/runtime-startup-contract.md"), path.join(root, "runtime_adapters", "generated", "runtime-startup-contract.md"));
  for (const unsafe of ["../outside.md", "/etc/passwd", "C:\\windows\\system32", "runtime_adapters\\generated\\contract.md", "runtime_adapters/../generated/contract.md", "./runtime_adapters/contract.md"]) {
    assert.throws(() => resolveContainedPosixRelativePath(root, unsafe), /safe POSIX-relative repository path/);
  }
});
