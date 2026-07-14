#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
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
  "scripts/wcbs-doctor.mjs",
  "scripts/wcbs-system-test.mjs"
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

console.log("PASS: install check completed.");
