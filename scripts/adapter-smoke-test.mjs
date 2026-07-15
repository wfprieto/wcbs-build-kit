#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const readArg = (name) => {
  const equal = args.find((arg) => arg.startsWith(`${name}=`));
  if (equal) return equal.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};

const target = readArg("--target");
const dest = readArg("--dest");
const scenarioFile = readArg("--scenarios") ?? "tests/system/activation-scenarios.json";
const errors = [];

function fail(message) {
  errors.push(message);
}

function resolveInDest(rel) {
  return path.join(dest, ...rel.split("/"));
}

function readInDest(rel) {
  return fs.readFileSync(resolveInDest(rel), "utf8");
}

if (!target || !dest) {
  console.error("Usage: node scripts/adapter-smoke-test.mjs --target <runtime-id> --dest <installed-kit-path> [--scenarios tests/system/activation-scenarios.json]");
  process.exit(1);
}

const manifestPath = resolveInDest(".wcbs/adapter-install-manifest.json");
if (!fs.existsSync(manifestPath)) {
  fail("Missing .wcbs/adapter-install-manifest.json. Run install-adapter --install first.");
} else {
  const install = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (install.target !== target) fail(`Install manifest target is ${install.target}, expected ${target}.`);
  const missing = install.files.filter((rel) => !fs.existsSync(resolveInDest(rel)));
  if (missing.length) fail(`Installed files missing: ${missing.slice(0, 10).join(", ")}`);
}

const runtimeManifestPath = resolveInDest(`runtime_adapters/manifests/${target}.json`);
const runtimeMappingPath = resolveInDest(`runtime_adapters/tool_mappings/${target}.json`);
if (!fs.existsSync(runtimeManifestPath)) fail(`Missing runtime manifest for ${target}.`);
if (!fs.existsSync(runtimeMappingPath)) fail(`Missing runtime tool mapping for ${target}.`);

if (fs.existsSync(runtimeManifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(runtimeManifestPath, "utf8"));
  const marker = `WCBS_KIT_ACTIVE:${target}`;
  if (manifest.activation_marker !== marker) fail(`Runtime manifest activation marker is not exact: ${marker}`);
  const bootstrapPath = resolveInDest(manifest.bootstrap_path);
  if (!fs.existsSync(bootstrapPath)) fail(`Bootstrap path missing: ${manifest.bootstrap_path}`);
}

const scenarioPath = path.isAbsolute(scenarioFile) ? scenarioFile : path.join(dest, ...scenarioFile.split("/"));
if (!fs.existsSync(scenarioPath)) {
  fail(`Missing activation scenarios file: ${scenarioFile}`);
} else {
  const data = JSON.parse(fs.readFileSync(scenarioPath, "utf8"));
  for (const scenario of data.scenarios) {
    let combined = "";
    for (const file of scenario.requiredFiles) {
      if (!fs.existsSync(resolveInDest(file))) {
        fail(`${scenario.name}: missing ${file}`);
        continue;
      }
      combined += `\n${readInDest(file)}`;
    }
    for (const term of scenario.requiredTerms) {
      if (!combined.includes(term)) fail(`${scenario.name}: missing required term ${term}`);
    }
  }
}

if (errors.length) {
  console.log("WCBS Adapter Smoke Test");
  console.log("");
  console.log("Failures:");
  for (const error of errors) console.log(`- ${error}`);
  process.exit(1);
}

console.log(`PASS: ${target} adapter smoke test passed for ${path.resolve(dest)}`);
