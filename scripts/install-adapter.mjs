#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const readArg = (name) => {
  const equal = args.find((arg) => arg.startsWith(`${name}=`));
  if (equal) return equal.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const has = (flag) => args.includes(flag);

const aliases = new Map([
  ["copilot", "github-copilot"],
  ["generic", "generic-agent"]
]);
const target = aliases.get(readArg("--target")) ?? readArg("--target");
const dest = readArg("--dest");
const mode = ["--install", "--update", "--uninstall", "--doctor", "--dry-run"].find(has) ?? "--dry-run";
const manifestRel = ".wcbs/adapter-install-manifest.json";

const commonFiles = [
  "00_start_here",
  "10_governance",
  "20_skills",
  "30_agents",
  "40_knowledge",
  "50_audits",
  "60_templates",
  "skills",
  "runtime_adapters",
  "README.md",
  "QUICKSTART.md",
  "MANIFEST.md",
  "SUPPORT_MATRIX.md",
  "LICENSE",
  "tests/system/activation-scenarios.json"
];

const adapters = {
  "codex": [".codex-plugin/plugin.json", "AGENTS.md"],
  "claude": ["CLAUDE.md"],
  "cursor": [".cursor/rules/super-build-kit.mdc"],
  "github-copilot": [".github/copilot-instructions.md"],
  "gemini": ["GEMINI.md"],
  "replit": ["REPLIT.md", "runtime_adapters/REPLIT_AGENT.md"],
  "manus": ["Manus.md"],
  "generic-agent": ["00_start_here/START_HERE.md"]
};

function usage(exitCode = 1) {
  console.log("Usage: node scripts/install-adapter.mjs --target <codex|claude|cursor|copilot|gemini|replit|manus|generic> [--dest <path>] [--dry-run|--install|--update|--uninstall|--doctor]");
  console.log("");
  console.log("Safety: install, update, uninstall, and doctor require --dest. Writes are project-local and tracked in .wcbs/adapter-install-manifest.json.");
  process.exit(exitCode);
}

function assertTarget() {
  if (!target || !adapters[target]) usage(1);
}

function assertDest() {
  if (!dest) {
    console.error(`${mode} requires --dest <path>.`);
    process.exit(1);
  }
}

function display(rel) {
  return rel.split(path.sep).join("/");
}

function walkSource(rel) {
  const source = path.join(root, ...rel.split("/"));
  if (!fs.existsSync(source)) throw new Error(`Source path does not exist: ${rel}`);
  const stat = fs.statSync(source);
  if (stat.isFile()) return [rel];
  const files = [];
  const walk = (absolute, prefix) => {
    for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
      if (entry.name === "__pycache__") continue;
      const childAbs = path.join(absolute, entry.name);
      const childRel = `${prefix}/${entry.name}`;
      if (entry.isDirectory()) walk(childAbs, childRel);
      else if (entry.isFile()) files.push(childRel);
    }
  };
  walk(source, rel);
  return files;
}

function plannedFiles() {
  const all = new Set([...commonFiles.flatMap(walkSource), ...adapters[target].flatMap(walkSource)]);
  return [...all].sort();
}

function manifestPath(destination) {
  return path.join(destination, ...manifestRel.split("/"));
}

function loadInstallManifest(destination) {
  const file = manifestPath(destination);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeInstallManifest(destination, files) {
  const record = {
    installed_by: "wcbs-build-kit",
    target,
    source_root: root,
    installed_utc: new Date().toISOString(),
    files
  };
  const file = manifestPath(destination);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`, "utf8");
  return record;
}

function copyFileRel(destination, rel, ownedFiles) {
  const source = path.join(root, ...rel.split("/"));
  const targetFile = path.join(destination, ...rel.split("/"));
  if (fs.existsSync(targetFile)) {
    const same = fs.readFileSync(source).equals(fs.readFileSync(targetFile));
    if (!same && !ownedFiles.has(rel)) {
      throw new Error(`Refusing to overwrite unowned file: ${rel}`);
    }
  }
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.copyFileSync(source, targetFile);
}

function installOrUpdate(destination, update) {
  const existing = loadInstallManifest(destination);
  if (update && !existing) throw new Error("Update requires an existing .wcbs/adapter-install-manifest.json. Run --install first.");
  const files = plannedFiles();
  const owned = new Set(existing?.files ?? []);
  for (const rel of files) copyFileRel(destination, rel, owned);
  writeInstallManifest(destination, files);
  console.log(`PASS: ${update ? "updated" : "installed"} ${target} adapter into ${destination}`);
  console.log(`Files tracked: ${files.length}`);
}

function uninstall(destination) {
  const existing = loadInstallManifest(destination);
  if (!existing) throw new Error("No install manifest found; refusing uninstall because ownership is unknown.");
  for (const rel of [...existing.files].sort((a, b) => b.length - a.length)) {
    const file = path.join(destination, ...rel.split("/"));
    if (fs.existsSync(file) && fs.statSync(file).isFile()) fs.rmSync(file);
  }
  fs.rmSync(manifestPath(destination), { force: true });
  console.log(`PASS: uninstalled ${existing.target} adapter from ${destination}`);
  console.log(`Files removed: ${existing.files.length}`);
}

function doctor(destination) {
  const existing = loadInstallManifest(destination);
  if (!existing) throw new Error("No install manifest found.");
  const missing = existing.files.filter((rel) => !fs.existsSync(path.join(destination, ...rel.split("/"))));
  const marker = `WCBS_KIT_ACTIVE:${existing.target}`;
  const markerFound = existing.files.some((rel) => {
    const file = path.join(destination, ...rel.split("/"));
    return fs.existsSync(file) && fs.statSync(file).isFile() && fs.readFileSync(file, "utf8").includes(marker);
  });
  if (missing.length) throw new Error(`Installed files missing: ${missing.slice(0, 10).join(", ")}`);
  if (!markerFound) throw new Error(`Activation marker not found in installed files: ${marker}`);
  console.log(`PASS: ${existing.target} adapter install is structurally healthy in ${destination}`);
  console.log(`Files checked: ${existing.files.length}`);
}

try {
  assertTarget();
  if (mode === "--dry-run") {
    const files = plannedFiles();
    console.log(`Adapter target: ${target}`);
    console.log("Mode: dry-run");
    console.log(`Files that would be installed: ${files.length}`);
    for (const file of files.slice(0, 40)) console.log(`- ${file}`);
    if (files.length > 40) console.log(`... ${files.length - 40} more`);
    console.log("");
    console.log("Run with --dest <path> --install to perform a project-local install.");
    process.exit(0);
  }
  assertDest();
  const destination = path.resolve(dest);
  fs.mkdirSync(destination, { recursive: true });
  if (mode === "--install") installOrUpdate(destination, false);
  else if (mode === "--update") installOrUpdate(destination, true);
  else if (mode === "--uninstall") uninstall(destination);
  else if (mode === "--doctor") doctor(destination);
  else usage(1);
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
}
