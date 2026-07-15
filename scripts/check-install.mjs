#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const required = [
  "INSTALL.md",
  "QUICKSTART.md",
  "MANIFEST.md",
  "runtime_adapters/INSTALLATION_MATRIX.md",
  "runtime_adapters/CAPABILITY_MATRIX.md",
  "runtime_adapters/ACTIVATION_TESTS.md",
  "runtime_adapters/VERIFIED_SUPPORT_LEVELS.md",
  "scripts/wcbs-doctor.mjs",
  "scripts/wcbs-system-test.mjs",
  "scripts/install-adapter.mjs",
  "scripts/adapter-smoke-test.mjs"
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, ...file.split("/"))));
if (missing.length) {
  console.log("Install check failed. Missing files:");
  for (const file of missing) console.log(`- ${file}`);
  process.exit(1);
}

const doctor = spawnSync(process.execPath, ["scripts/wcbs-doctor.mjs", "--strict"], {
  cwd: root,
  stdio: "inherit"
});
if (doctor.status !== 0) process.exit(doctor.status ?? 1);

const system = spawnSync(process.execPath, ["scripts/wcbs-system-test.mjs"], {
  cwd: root,
  stdio: "inherit"
});
if (system.status !== 0) process.exit(system.status ?? 1);

for (const target of ["codex", "cursor"]) {
  const destination = fs.mkdtempSync(path.join(os.tmpdir(), `wcbs-${target}-install-`));
  try {
    for (const args of [
      ["scripts/install-adapter.mjs", "--target", target, "--dest", destination, "--install"],
      ["scripts/install-adapter.mjs", "--target", target, "--dest", destination, "--doctor"],
      ["scripts/adapter-smoke-test.mjs", "--target", target, "--dest", destination],
      ["scripts/install-adapter.mjs", "--target", target, "--dest", destination, "--uninstall"]
    ]) {
      const result = spawnSync(process.execPath, args, { cwd: root, stdio: "inherit" });
      if (result.status !== 0) process.exit(result.status ?? 1);
    }
  } finally {
    fs.rmSync(destination, { recursive: true, force: true });
  }
}

console.log("PASS: install check completed.");
