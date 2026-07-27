#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

function values(name) {
  const found = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === name && args[index + 1]) {
      found.push(args[index + 1]);
      index += 1;
    } else if (arg.startsWith(`${name}=`)) {
      found.push(arg.slice(name.length + 1));
    }
  }
  return found;
}

function usage(message) {
  if (message) console.error(`Blocked: ${message}`);
  console.error("Usage: node scripts/resolve-install-context.mjs --target <runtime-id> [--dest <project-root> | --candidate <project-root> ...]");
  process.exit(2);
}

function canonical(value) {
  const resolved = path.resolve(value);
  const existing = fs.existsSync(resolved) ? fs.realpathSync.native(resolved) : resolved;
  return process.platform === "win32" ? existing.toLowerCase() : existing;
}

function shellQuote(value) {
  if (process.platform === "win32") return `'${value.replaceAll("'", "''")}'`;
  return `'${value.replaceAll("'", "'\"'\"'")}'`;
}

const targets = values("--target");
const destinations = values("--dest");
if (targets.length !== 1) usage("exactly one --target value is required");
if (destinations.length > 1) usage("exactly one --dest value is required");

const target = targets[0];
const destinationArg = destinations[0];
const candidates = [...new Set(values("--candidate").map((value) => path.resolve(value)))];

const manifestPath = path.join(root, "runtime_adapters", "manifests", `${target}.json`);
if (!fs.existsSync(manifestPath)) usage(`runtime target is not supported: ${target}`);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest.runtime_id !== target) usage(`runtime manifest identity does not match target: ${target}`);

if (!destinationArg) {
  console.log(`Runtime: ${target}`);
  console.log("Which project should receive the WCBS adapter?");
  console.log("Options:");
  if (candidates.length) {
    for (const candidate of candidates) console.log(`- ${candidate}`);
  } else {
    console.log("- No destination project exists yet.");
  }
  console.log("State: Blocked");
  console.log("Missing input: destination project");
  process.exit(2);
}

const destination = path.resolve(destinationArg);
if (!fs.existsSync(destination) || !fs.statSync(destination).isDirectory()) {
  usage(`destination project root does not exist or is not a directory: ${destination}`);
}
if (canonical(destination) === canonical(root)) {
  usage("Build Kit source cannot be its own adapter destination");
}

const quotedDestination = shellQuote(destination);
console.log("State: Ready");
console.log(`Runtime: ${target}`);
console.log(`Destination: ${destination}`);
console.log(`Install: node scripts/install-adapter.mjs --target ${target} --dest ${quotedDestination} --install`);
console.log(`Doctor: node scripts/install-adapter.mjs --target ${target} --dest ${quotedDestination} --doctor`);
console.log(`Owned files: node scripts/install-adapter.mjs --target ${target} --dest ${quotedDestination} --verify-owned-files`);
console.log(`Smoke test: node scripts/adapter-smoke-test.mjs --target ${target} --dest ${quotedDestination}`);
