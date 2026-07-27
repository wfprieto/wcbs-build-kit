#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "evals", "control-project-manifest.json");
const projectRoot = path.join(root, "evals", "control-project");

function walk(relative = "") {
  return fs.readdirSync(path.join(projectRoot, relative), { withFileTypes: true }).flatMap((entry) => {
    const child = path.posix.join(relative.replaceAll("\\", "/"), entry.name);
    return entry.isDirectory() ? walk(child) : [child];
  });
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

export function generateControlManifest(existing = JSON.parse(fs.readFileSync(manifestPath, "utf8"))) {
  return {
    ...existing,
    files: walk().sort().map((file) => ({ path: file, sha256: sha256(path.join(projectRoot, file)) }))
  };
}

const generated = `${JSON.stringify(generateControlManifest(), null, 2)}\n`;
if (process.argv.includes("--check")) {
  const current = fs.readFileSync(manifestPath, "utf8");
  if (current !== generated) {
    console.error("evals/control-project-manifest.json is stale. Run: node scripts/generate-control-manifest.mjs");
    process.exitCode = 1;
  }
} else {
  fs.writeFileSync(manifestPath, generated, "utf8");
  console.log("Updated evals/control-project-manifest.json");
}
