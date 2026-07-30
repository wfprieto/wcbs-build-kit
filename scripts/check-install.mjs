#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
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
  "scripts/wcbs.mjs",
  "scripts/adapter-smoke-test.mjs",
  "runtime_adapters/adapter-registry.yaml",
  "runtime_adapters/generated/using-wcbs-bootstrap.md",
  "docs/V2_RUNTIME_EVIDENCE.md",
  "docs/V2_MIGRATION.md"
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

const v2Registry = JSON.parse(fs.readFileSync(path.join(root, "runtime_adapters", "adapter-registry.yaml"), "utf8"));
for (const adapter of v2Registry.adapters) {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), `wcbs-v2-${adapter.runtime_id}-project-`));
  const plugin = path.join(project, "runtime-plugins", `wcbs-${adapter.runtime_id}`);
  const userFiles = {
    "README.md": "# ordinary project\n",
    "package.json": "{\"name\":\"ordinary-project\"}\n",
    "src/index.js": "export const ordinary = true;\n"
  };
  const hashes = new Map();
  try {
    for (const [relative, content] of Object.entries(userFiles)) {
      const file = path.join(project, ...relative.split("/"));
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content, "utf8");
      hashes.set(relative, crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"));
    }
    for (const [action, args] of [
      ["v2 install", ["scripts/wcbs.mjs", "install", "--target", adapter.runtime_id, "--plugin-dir", plugin, "--json"]],
      ["v2 doctor", ["scripts/wcbs.mjs", "doctor", "--plugin-dir", plugin, "--json"]],
      ["v2 status", ["scripts/wcbs.mjs", "status", "--plugin-dir", plugin, "--json"]],
      ["v2 uninstall", ["scripts/wcbs.mjs", "uninstall", "--plugin-dir", plugin, "--json"]]
    ]) run(`${adapter.runtime_id} ${action}`, args);
    if (fs.existsSync(plugin)) throw new Error(`V2 uninstall left plugin directory: ${plugin}`);
    for (const [relative, expected] of hashes) {
      const actual = crypto.createHash("sha256").update(fs.readFileSync(path.join(project, ...relative.split("/")))).digest("hex");
      if (actual !== expected) throw new Error(`V2 install altered user-owned project file: ${relative}`);
    }
  } finally {
    fs.rmSync(project, { recursive: true, force: true });
  }
}

emit("PASS: install check completed.");
persistLog();
