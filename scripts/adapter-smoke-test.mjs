#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { validatePackageReferences } from "./lib/package-references.mjs";

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
const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const childOptions = { encoding: "utf8", shell: false, timeout: 10_000, maxBuffer: 256 * 1024, killSignal: "SIGKILL" };
let installedRoot;
let install;

function fail(message) {
  errors.push(message);
}

function reportErrors() {
  if (!errors.length) return;
  console.log("WCBS Adapter Smoke Test\n\nFailures:");
  for (const error of errors) console.log(`- ${error}`);
  process.exit(1);
}

function verifyCodexRenderer() {
  const require = (condition, message) => { if (!condition) throw new Error(message); };
  const { codexSessionStart } = validatePackageReferences(installedRoot, target, install.files);
  require(codexSessionStart.length === 1, "Expected exactly one Codex SessionStart command");
  const invocation = codexSessionStart[0];
  const routerPath = path.join(installedRoot, "skills", "using-wcbs", "SKILL.md");
  const routerBody = fs.readFileSync(routerPath, "utf8").trim();
  const result = spawnSync(process.execPath, [invocation.rendererPath, ...invocation.args], { ...childOptions, cwd: installedRoot });
  if (result.error) throw new Error(`Installed renderer execution failed: ${result.error.code ?? result.error.message}`);
  require(result.status === 0, `Installed renderer exited with ${result.signal ?? result.status}`);
  require(!result.stderr.trim(), "Installed renderer wrote to stderr");
  let payload;
  try { payload = JSON.parse(result.stdout); }
  catch { throw new Error("Installed renderer must emit one JSON SessionStart payload"); }
  require(payload && !Array.isArray(payload) && Object.keys(payload).length === 1 && Object.hasOwn(payload, "hookSpecificOutput"), "Invalid Codex hook envelope");
  const hook = payload.hookSpecificOutput;
  require(hook && !Array.isArray(hook) && Object.keys(hook).length === 2 && hook.hookEventName === "SessionStart", "Invalid Codex SessionStart fields");
  require(typeof hook.additionalContext === "string", "SessionStart additionalContext must be a string");
  const context = hook.additionalContext;
  const marker = "WCBS_KIT_ACTIVE:codex";
  require(context.split(/\r?\n/).includes(marker) && (context.match(/WCBS_KIT_ACTIVE:/g) ?? []).length === 1, "Expected exactly one standalone Codex activation marker");
  require(routerBody.length > 0, "Installed canonical using-wcbs skill is empty");
  for (const required of [
    `Active runtime: codex. WCBS package root: ${installedRoot}.`,
    `Tool map: ${path.join(installedRoot, "runtime_adapters", "tool_mappings", "codex.json")}.`,
    `Core skill catalog: ${path.join(installedRoot, "runtime_adapters", "generated", "skill-catalog.json")}.`,
    `Canonical first skill: ${routerPath}.`,
    `<canonical-using-wcbs-skill>\n${routerBody}\n</canonical-using-wcbs-skill>`
  ]) require(context.includes(required), "SessionStart is missing required installed package context");
  for (const tag of ["<canonical-using-wcbs-skill>", "</canonical-using-wcbs-skill>"]) {
    require(context.split(tag).length - 1 === 1, "SessionStart must include exactly one canonical skill body");
  }
}

function resolveInDest(rel) {
  return path.join(installedRoot ?? dest, ...rel.split("/"));
}

function readInDest(rel) {
  return fs.readFileSync(resolveInDest(rel), "utf8");
}

if (!target || !dest) {
  console.error("Usage: node scripts/adapter-smoke-test.mjs --target <runtime-id> --dest <installed-kit-path> [--scenarios tests/system/activation-scenarios.json]");
  process.exit(1);
}

// Integrity and reference checks must precede installed metadata reads or execution.
if (target === "codex") {
  try {
    installedRoot = fs.realpathSync.native(path.resolve(dest));
    const doctor = spawnSync(process.execPath, [path.join(sourceRoot, "scripts", "install-adapter.mjs"), "--target", target, "--dest", installedRoot, "--doctor"], { ...childOptions, cwd: installedRoot });
    if (doctor.error) throw new Error(`Package doctor failed: ${doctor.error.code ?? doctor.error.message}`);
    if (doctor.status !== 0 || doctor.stderr.trim()) throw new Error(`Package doctor failed: ${doctor.stderr.trim() || doctor.signal || doctor.status}`);
  } catch (error) { fail(`Codex executable package verification preflight: ${error.message}`); }
  reportErrors();
}

const manifestPath = resolveInDest(".wcbs/adapter-install-manifest.json");
if (!fs.existsSync(manifestPath)) {
  fail("Missing .wcbs/adapter-install-manifest.json. Run install-adapter --install first.");
} else {
  install = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
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

const scenarioPath = path.isAbsolute(scenarioFile) ? scenarioFile : resolveInDest(scenarioFile);
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

if (target === "codex" && !errors.length) {
  try { verifyCodexRenderer(); }
  catch (error) { fail(`Codex executable package verification: ${error.message}`); }
}

reportErrors();
console.log(`PASS: ${target} adapter smoke test passed for ${path.resolve(dest)}`);
if (target === "codex") {
  console.log("Verification: Executable package verification.");
  console.log("Evidence tier: Structurally Verified (executable component).");
  console.log("Authenticated Codex activation: Not Run by this command.");
  console.log("Observed agent behavior: Not Run by this command.");
} else {
  console.log("Verification: Structural package and scenario checks (Structurally Verified).");
  console.log("Runtime activation and observed agent behavior: Not Run by this command.");
}
