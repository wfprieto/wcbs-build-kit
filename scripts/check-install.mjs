#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const logPath = path.join(root, ".wcbs", "install-readiness.log");
const logLines = [];
const emit = (line = "") => { const text = String(line); logLines.push(text); console.log(text); };
const persistLog = () => { fs.mkdirSync(path.dirname(logPath), { recursive: true }); fs.writeFileSync(logPath, `${logLines.join("\n")}\n`); };
const required = [
  "INSTALL.md",
  "GET_STARTED.md",
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
  emit("Install check failed. Missing files:");
  for (const file of missing) emit(`- ${file}`);
  persistLog();
  process.exit(1);
}

const run = (label, args) => {
  emit(`RUN: ${label}: ${process.execPath} ${args.join(" ")}`);
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
  if (result.stdout) for (const line of result.stdout.replace(/\r\n?/g, "\n").trimEnd().split("\n")) emit(line);
  if (result.stderr) for (const line of result.stderr.replace(/\r\n?/g, "\n").trimEnd().split("\n")) emit(line);
  if (result.error) emit(`ERROR: ${result.error.message}`);
  if (result.status !== 0) {
    emit(`FAIL: ${label} exited with status ${result.status ?? "unknown"}.`);
    persistLog();
    process.exit(result.status ?? 1);
  }
};

run("strict doctor", ["scripts/wcbs-doctor.mjs", "--strict"]);
run("system test", ["scripts/wcbs-system-test.mjs"]);

for (const target of ["codex", "cursor", "claude", "github-copilot", "gemini", "replit", "manus", "generic-agent"]) {
  const destination = fs.mkdtempSync(path.join(os.tmpdir(), `wcbs-${target}-install-`));
  try {
    for (const [action, args] of [
      ["install", ["scripts/install-adapter.mjs", "--target", target, "--dest", destination, "--install"]],
      ["doctor", ["scripts/install-adapter.mjs", "--target", target, "--dest", destination, "--doctor"]],
      ["verify-owned-files", ["scripts/install-adapter.mjs", "--target", target, "--dest", destination, "--verify-owned-files"]],
      ["smoke-test", ["scripts/adapter-smoke-test.mjs", "--target", target, "--dest", destination]],
      ["uninstall", ["scripts/install-adapter.mjs", "--target", target, "--dest", destination, "--uninstall"]]
    ]) run(`${target} ${action}`, args);
  } finally {
    fs.rmSync(destination, { recursive: true, force: true });
  }
}

emit("PASS: install check completed.");
persistLog();
