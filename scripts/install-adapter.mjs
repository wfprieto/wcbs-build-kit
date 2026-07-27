#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
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
const jsonOutput = has("--json");
const mode = ["--list-targets", "--install", "--update", "--uninstall", "--doctor", "--verify-owned-files", "--repair", "--dry-run"].find(has) ?? "--dry-run";
const manifestRel = ".wcbs/adapter-install-manifest.json";
const recoveryRel = ".wcbs/adapter-install-recovery.json";

const commonFiles = [
  "BOOTSTRAP.md",
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
  "GET_STARTED.md",
  "INSTALL.md",
  "MANIFEST.md",
  "SUPPORT_MATRIX.md",
  "RELEASE_PROCESS.md",
  "VERSIONING.md",
  "CHANGELOG.md",
  "SECURITY.md",
  "docs",
  "LICENSE",
  "tests/system/activation-scenarios.json"
];

const adapters = {
  "codex": [".codex-plugin/plugin.json", "AGENTS.md"],
  "claude": ["CLAUDE.md", ".claude-plugin/plugin.json", "hooks"],
  "cursor": [".cursor/rules/super-build-kit.mdc"],
  "github-copilot": [".github/copilot-instructions.md"],
  "gemini": ["GEMINI.md"],
  "replit": ["REPLIT.md", "runtime_adapters/REPLIT_AGENT.md"],
  "manus": ["Manus.md"],
  "generic-agent": ["00_start_here/START_HERE.md"]
};

function usage(exitCode = 1) {
  console.log("Usage: node scripts/install-adapter.mjs --target <codex|claude|cursor|copilot|gemini|replit|manus|generic> [--dest <path>] [--dry-run|--install|--update|--uninstall|--doctor|--verify-owned-files|--repair] [--json]");
  console.log("       node scripts/install-adapter.mjs --list-targets [--json]");
  console.log("");
  console.log("Safety: install, update, uninstall, and doctor require --dest. Writes are project-local and tracked in .wcbs/adapter-install-manifest.json.");
  process.exit(exitCode);
}

function emit(payload, text) {
  if (jsonOutput) console.log(JSON.stringify(payload, null, 2));
  else console.log(text);
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
  const stat = fs.lstatSync(source);
  if (stat.isSymbolicLink()) throw new Error(`Source path must not be a symbolic link: ${rel}`);
  if (stat.isFile()) return [rel];
  const files = [];
  const walk = (absolute, prefix) => {
    for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
      if (entry.name === "__pycache__") continue;
      const childAbs = path.join(absolute, entry.name);
      const childRel = `${prefix}/${entry.name}`;
      const childStat = fs.lstatSync(childAbs);
      if (childStat.isSymbolicLink()) throw new Error(`Source path must not be a symbolic link: ${childRel}`);
      if (childStat.isDirectory()) walk(childAbs, childRel);
      else if (childStat.isFile()) files.push(childRel);
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

function recoveryPath(destination) {
  return path.join(destination, ...recoveryRel.split("/"));
}

function loadInstallManifest(destination) {
  const file = manifestPath(destination);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function installRecord(files) {
  return {
    installed_by: "wcbs-build-kit",
    target,
    source_root: root,
    installed_utc: new Date().toISOString(),
    files
  };
}

function canonicalPath(value) {
  const resolved = path.resolve(value);
  const existing = fs.existsSync(resolved) ? fs.realpathSync.native(resolved) : resolved;
  return process.platform === "win32" ? existing.toLowerCase() : existing;
}

function sameFilesystemPath(left, right) {
  return canonicalPath(left) === canonicalPath(right);
}

function assertContained(destination, absolute, rel) {
  const base = canonicalPath(destination);
  const candidate = path.resolve(absolute);
  const comparable = process.platform === "win32" ? candidate.toLowerCase() : candidate;
  if (comparable !== base && !comparable.startsWith(`${base}${path.sep}`)) {
    throw new Error(`Planned path escapes destination root: ${rel}`);
  }
}

function assertNoSymlinkSegments(destination, absolute, rel) {
  let cursor = path.resolve(destination);
  const relative = path.relative(cursor, absolute);
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, segment);
    if (!fs.existsSync(cursor)) continue;
    const stat = fs.lstatSync(cursor);
    if (stat.isSymbolicLink()) throw new Error(`Refusing symbolic-link destination path: ${rel}`);
  }
}

function buildPlan(destination, update) {
  const existing = loadInstallManifest(destination);
  if (update && !existing) throw new Error("Update requires an existing .wcbs/adapter-install-manifest.json. Run --install first.");
  if (!update && existing) throw new Error("Install manifest already exists. Use --update or --uninstall before reinstalling.");
  const files = plannedFiles();
  const owned = new Set(existing?.files ?? []);
  const seen = new Set();
  const collisions = [];
  const operations = [];

  for (const rel of files) {
    const destinationFile = path.join(destination, ...rel.split("/"));
    assertContained(destination, destinationFile, rel);
    assertNoSymlinkSegments(destination, destinationFile, rel);
    const key = process.platform === "win32" ? destinationFile.toLowerCase() : destinationFile;
    if (seen.has(key)) collisions.push(`${rel} (duplicate canonical path)`);
    seen.add(key);
    if (fs.existsSync(destinationFile)) {
      const stat = fs.lstatSync(destinationFile);
      if (!stat.isFile()) collisions.push(`${rel} (expected file, found non-file)`);
      else if (!owned.has(rel)) collisions.push(`${rel} (unowned existing file)`);
    }
    operations.push({ rel, source: path.join(root, ...rel.split("/")), destination: destinationFile });
  }

  const finalManifest = manifestPath(destination);
  assertContained(destination, finalManifest, manifestRel);
  assertNoSymlinkSegments(destination, finalManifest, manifestRel);
  if (!update && fs.existsSync(finalManifest)) collisions.push(`${manifestRel} (existing manifest)`);
  if (collisions.length) {
    throw new Error(`Preflight collision(s); no files written: ${[...new Set(collisions)].sort().join(", ")}`);
  }
  return { existing, files, operations, record: installRecord(files) };
}

function stagePlan(plan) {
  const stageRoot = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-adapter-stage-"));
  for (const operation of plan.operations) {
    const staged = path.join(stageRoot, "payload", ...operation.rel.split("/"));
    fs.mkdirSync(path.dirname(staged), { recursive: true });
    fs.copyFileSync(operation.source, staged);
    if (!fs.readFileSync(operation.source).equals(fs.readFileSync(staged))) {
      throw new Error(`Staged payload verification failed: ${operation.rel}`);
    }
    operation.staged = staged;
  }
  const stagedManifest = path.join(stageRoot, "manifest.json");
  fs.writeFileSync(stagedManifest, `${JSON.stringify(plan.record, null, 2)}\n`, "utf8");
  return { stageRoot, stagedManifest };
}

function ensureParentDirectories(file, destination, journal) {
  const missing = [];
  let cursor = path.dirname(file);
  while (cursor !== destination && cursor.startsWith(destination) && !fs.existsSync(cursor)) {
    missing.push(cursor);
    cursor = path.dirname(cursor);
  }
  for (const dir of missing.reverse()) {
    fs.mkdirSync(dir);
    journal.createdDirectories.push(dir);
  }
}

function backupExisting(file, backupRoot, rel) {
  if (!fs.existsSync(file)) return null;
  const backup = path.join(backupRoot, ...rel.split("/"));
  fs.mkdirSync(path.dirname(backup), { recursive: true });
  fs.copyFileSync(file, backup);
  return backup;
}

function writeRecoveryRecord(destination, error, residualPaths) {
  const file = recoveryPath(destination);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify({
    status: "ROLLBACK_INCOMPLETE",
    target,
    failed_utc: new Date().toISOString(),
    error: error.message,
    residual_paths: residualPaths.map((item) => display(path.relative(destination, item)))
  }, null, 2)}\n`, "utf8");
  return file;
}

function rollbackTransaction(destination, journal, originalError) {
  const residual = [];
  const injectedRel = process.env.WCBS_TEST_FAIL_ROLLBACK_REL ?? null;
  for (const entry of [...journal.files].reverse()) {
    try {
      if (injectedRel === entry.rel) throw new Error("Injected rollback failure");
      if (entry.backup) fs.copyFileSync(entry.backup, entry.destination);
      else fs.rmSync(entry.destination, { force: true });
    } catch {
      residual.push(entry.destination);
    }
  }
  for (const dir of [...journal.createdDirectories].reverse()) {
    try {
      if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
    } catch {
      residual.push(dir);
    }
  }
  if (residual.length) {
    const recovery = writeRecoveryRecord(destination, originalError, [...new Set(residual)]);
    throw new Error(`CRITICAL: installation failed and rollback was incomplete. Recovery record: ${recovery}`);
  }
}

function commitPlan(destination, plan, staged) {
  const backupRoot = path.join(staged.stageRoot, "backup");
  const journal = { files: [], createdDirectories: [] };
  const failAfter = Number.parseInt(process.env.WCBS_TEST_FAIL_AFTER_WRITES ?? "0", 10);
  let writes = 0;
  try {
    for (const operation of plan.operations) {
      ensureParentDirectories(operation.destination, destination, journal);
      const backup = backupExisting(operation.destination, backupRoot, operation.rel);
      fs.copyFileSync(operation.staged, operation.destination);
      journal.files.push({ ...operation, backup });
      writes += 1;
      if (failAfter > 0 && writes >= failAfter) throw new Error(`Injected commit failure after ${writes} write(s)`);
    }
    const finalManifest = manifestPath(destination);
    ensureParentDirectories(finalManifest, destination, journal);
    const manifestBackup = backupExisting(finalManifest, backupRoot, manifestRel);
    fs.copyFileSync(staged.stagedManifest, finalManifest);
    journal.files.push({ rel: manifestRel, destination: finalManifest, backup: manifestBackup });
  } catch (error) {
    rollbackTransaction(destination, journal, error);
    throw error;
  }
}

function installOrUpdate(destination, update) {
  const plan = buildPlan(destination, update);
  let staged = null;
  try {
    staged = stagePlan(plan);
    commitPlan(destination, plan, staged);
  } finally {
    if (staged?.stageRoot) fs.rmSync(staged.stageRoot, { recursive: true, force: true });
  }
  console.log(`PASS: ${update ? "updated" : "installed"} ${target} adapter into ${destination}`);
  console.log(`Files tracked: ${plan.files.length}`);
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

function verifyOwnedFiles(destination) {
  const existing = loadInstallManifest(destination);
  if (!existing) throw new Error("No install manifest found.");
  const missing = existing.files.filter((rel) => !fs.existsSync(path.join(destination, ...rel.split("/"))));
  const changed = existing.files.filter((rel) => {
    const source = path.join(root, ...rel.split("/"));
    const installed = path.join(destination, ...rel.split("/"));
    return fs.existsSync(source) && fs.existsSync(installed) && !fs.readFileSync(source).equals(fs.readFileSync(installed));
  });
  const payload = { status: missing.length || changed.length ? "FAIL" : "PASS", target: existing.target, files_checked: existing.files.length, missing, changed };
  if (payload.status !== "PASS") throw new Error(`Owned file verification failed: ${JSON.stringify(payload)}`);
  emit(payload, `PASS: owned files verified for ${existing.target} (${existing.files.length} files)`);
}

function repair(destination) {
  const existing = loadInstallManifest(destination);
  if (!existing) throw new Error("Repair requires an existing install manifest.");
  installOrUpdate(destination, true);
  emit({ status: "PASS", target: existing.target, files_repaired: existing.files.length }, `PASS: repaired owned files for ${existing.target}`);
}

try {
  if (mode === "--list-targets") {
    const targets = Object.keys(adapters);
    emit({ targets }, targets.join("\n"));
    process.exit(0);
  }
  assertTarget();
  if (mode === "--dry-run") {
    const files = plannedFiles();
    if (jsonOutput) emit({ target, mode: "dry-run", files }, "");
    else {
      console.log(`Adapter target: ${target}`);
      console.log("Mode: dry-run");
      console.log(`Files that would be installed: ${files.length}`);
      for (const file of files.slice(0, 40)) console.log(`- ${file}`);
      if (files.length > 40) console.log(`... ${files.length - 40} more`);
      console.log("");
      console.log("Run with --dest <path> --install to perform a project-local install.");
    }
    process.exit(0);
  }
  assertDest();
  const destination = path.resolve(dest);
  if (sameFilesystemPath(destination, root)) {
    throw new Error("Build Kit source cannot be its own adapter destination. Supply the separate target project root.");
  }
  fs.mkdirSync(destination, { recursive: true });
  if (mode === "--install") installOrUpdate(destination, false);
  else if (mode === "--update") installOrUpdate(destination, true);
  else if (mode === "--uninstall") uninstall(destination);
  else if (mode === "--doctor") doctor(destination);
  else if (mode === "--verify-owned-files") verifyOwnedFiles(destination);
  else if (mode === "--repair") repair(destination);
  else usage(1);
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
}
