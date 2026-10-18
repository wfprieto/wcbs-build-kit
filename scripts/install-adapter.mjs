#!/usr/bin/env node

import fs from "node:fs";
import crypto from "node:crypto";
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
  "claude": ["CLAUDE.md", ".claude-plugin/plugin.json", "hooks", "scripts/render-session-bootstrap.mjs"],
  "cursor": [".cursor/rules/super-build-kit.mdc", ".cursor/hooks.json", "hooks", "scripts/render-session-bootstrap.mjs"],
  "github-copilot": [".github/copilot-instructions.md", ".github/hooks/wcbs-session-start.json", "hooks", "scripts/render-session-bootstrap.mjs"],
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

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function assertOwnedPath(destination, rel) {
  if (typeof rel !== "string" || !rel || rel.includes("\\") || rel.includes("\0") || path.posix.isAbsolute(rel) || path.win32.isAbsolute(rel) || rel.split("/").some((part) => !part || part === "." || part === "..") || rel === manifestRel || rel === recoveryRel) {
    throw new Error(`Invalid owned path in install manifest: ${String(rel)}`);
  }
  const file = path.resolve(destination, ...rel.split("/"));
  assertContained(destination, file, rel);
  assertNoSymlinkSegments(destination, file, rel);
  return file;
}

function loadInstallManifest(destination) {
  const file = manifestPath(destination);
  assertNoSymlinkSegments(destination, file, manifestRel);
  if (!fs.existsSync(file)) return null;
  const record = JSON.parse(fs.readFileSync(file, "utf8"));
  if (record?.schema_version !== 2) throw new Error("Legacy or malformed hashless install manifest; back up the project and migrate from its original source before destructive actions.");
  if (record.installed_by !== "wcbs-build-kit" || record.target !== target || !Array.isArray(record.files) || !record.files.length || !record.file_hashes || typeof record.file_hashes !== "object" || Array.isArray(record.file_hashes)) {
    throw new Error("Install manifest is malformed or belongs to a different target; refusing ownership action.");
  }
  const known = new Set(plannedFiles());
  const seen = new Set();
  for (const rel of record.files) {
    assertOwnedPath(destination, rel);
    const key = process.platform === "win32" ? rel.toLowerCase() : rel;
    if (seen.has(key) || !known.has(rel) || !Object.hasOwn(record.file_hashes, rel) || !/^[a-f0-9]{64}$/.test(record.file_hashes[rel])) {
      throw new Error(`Install manifest has duplicate, unrecognized, or unhashed owned file: ${rel}`);
    }
    seen.add(key);
  }
  if (Object.keys(record.file_hashes).length !== record.files.length) throw new Error("Install manifest file hashes do not match its owned files.");
  return record;
}

function installRecord(files) {
  return {
    schema_version: 2,
    installed_by: "wcbs-build-kit",
    target,
    source_root: root,
    installed_utc: new Date().toISOString(),
    files,
    file_hashes: {}
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
  const unresolvedBase = path.resolve(destination);
  const unresolvedCandidate = path.resolve(absolute);
  const relative = path.relative(unresolvedBase, unresolvedCandidate);
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Planned path escapes destination root: ${rel}`);
  }
  const base = canonicalPath(destination);
  const candidate = path.resolve(base, relative);
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
    let stat;
    try { stat = fs.lstatSync(cursor); }
    catch (error) { if (error.code === "ENOENT") continue; throw error; }
    if (stat.isSymbolicLink()) throw new Error(`Refusing symbolic-link destination path: ${rel}`);
  }
}

function inspectOwnedFiles(destination, record) {
  const missing = [];
  const modified = [];
  for (const rel of record.files) {
    const file = assertOwnedPath(destination, rel);
    let stat;
    try { stat = fs.lstatSync(file); }
    catch (error) { if (error.code === "ENOENT") { missing.push(rel); continue; } throw error; }
    if (!stat.isFile() || sha256(file) !== record.file_hashes[rel]) modified.push(rel);
  }
  return { missing, modified };
}

function assertOwnedIntegrity(destination, record, allowMissing = false) {
  const { missing, modified } = inspectOwnedFiles(destination, record);
  if (modified.length || (!allowMissing && missing.length)) {
    throw new Error(`Owned-file integrity failure: modified=${modified.join(",") || "none"}; missing=${missing.join(",") || "none"}.`);
  }
  return { missing, modified };
}

function buildPlan(destination, update) {
  const existing = loadInstallManifest(destination);
  if (update && !existing) throw new Error("Update requires an existing .wcbs/adapter-install-manifest.json. Run --install first.");
  if (!update && existing) throw new Error("Install manifest already exists. Use --update or --uninstall before reinstalling.");
  const files = plannedFiles();
  if (existing) {
    assertOwnedIntegrity(destination, existing);
    const current = new Set(files);
    const retired = existing.files.filter((rel) => !current.has(rel));
    if (retired.length) throw new Error(`Source file set changed; refusing to orphan previously owned files: ${retired.slice(0, 10).join(", ")}.`);
  }
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
  return { existing, files, operations, record: installRecord(files), manifestHash: existing ? sha256(finalManifest) : null };
}

function stagePlan(plan) {
  const stageRoot = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-adapter-stage-"));
  try {
    for (const operation of plan.operations) {
      const staged = path.join(stageRoot, "payload", ...operation.rel.split("/"));
      fs.mkdirSync(path.dirname(staged), { recursive: true });
      fs.copyFileSync(operation.source, staged);
      if (!fs.readFileSync(operation.source).equals(fs.readFileSync(staged))) {
        throw new Error(`Staged payload verification failed: ${operation.rel}`);
      }
      operation.staged = staged;
      plan.record.file_hashes[operation.rel] = sha256(staged);
    }
    const stagedManifest = path.join(stageRoot, "manifest.json");
    fs.writeFileSync(stagedManifest, `${JSON.stringify(plan.record, null, 2)}\n`, "utf8");
    return { stageRoot, stagedManifest };
  } catch (error) {
    fs.rmSync(stageRoot, { recursive: true, force: true });
    throw error;
  }
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

function writeRecoveryRecord(destination, error, residualPaths, backupDirectory) {
  const file = recoveryPath(destination);
  assertNoSymlinkSegments(destination, file, recoveryRel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify({
    status: "ROLLBACK_INCOMPLETE",
    target,
    failed_utc: new Date().toISOString(),
    error: error.message,
    backup_directory: backupDirectory,
    residual_paths: residualPaths.map((item) => display(path.relative(destination, item)))
  }, null, 2)}\n`, "utf8");
  return file;
}

function rollbackTransaction(destination, journal, originalError, backupDirectory) {
  const residual = [];
  const injectedRel = process.env.WCBS_TEST_FAIL_ROLLBACK_REL ?? null;
  for (const entry of [...journal.files].reverse()) {
    try {
      if (injectedRel === entry.rel) throw new Error("Injected rollback failure");
      assertNoSymlinkSegments(destination, entry.destination, entry.rel);
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
    let recovery;
    try { recovery = writeRecoveryRecord(destination, originalError, [...new Set(residual)], backupDirectory); }
    catch (error) { recovery = `could not be written (${error.message})`; }
    const action = mode === "--uninstall" ? "uninstall" : mode === "--repair" ? "repair" : "installation";
    const failure = new Error(`CRITICAL: ${action} failed and rollback was incomplete. Recovery record: ${recovery}. Preserved backups: ${backupDirectory}`);
    failure.rollbackIncomplete = true;
    throw failure;
  }
}

function commitPlan(destination, plan, staged) {
  const backupRoot = path.join(staged.stageRoot, "backup");
  const journal = { files: [], createdDirectories: [] };
  const failAfter = Number.parseInt(process.env.WCBS_TEST_FAIL_AFTER_WRITES ?? "0", 10);
  let writes = 0;
  try {
    if (plan.existing && sha256(manifestPath(destination)) !== plan.manifestHash) throw new Error("Install manifest changed during update; refusing overwrite.");
    for (const operation of plan.operations) {
      assertNoSymlinkSegments(destination, operation.destination, operation.rel);
      if (plan.existing?.files.includes(operation.rel)) {
        const state = inspectOwnedFiles(destination, { files: [operation.rel], file_hashes: plan.existing.file_hashes });
        if (state.modified.length || state.missing.length) throw new Error(`Owned-file integrity changed during update: ${operation.rel}`);
      } else if (fs.existsSync(operation.destination)) {
        throw new Error(`Unowned file appeared during update: ${operation.rel}`);
      }
      ensureParentDirectories(operation.destination, destination, journal);
      const backup = backupExisting(operation.destination, backupRoot, operation.rel);
      journal.files.push({ ...operation, backup });
      fs.copyFileSync(operation.staged, operation.destination);
      writes += 1;
      if (failAfter > 0 && writes >= failAfter) throw new Error(`Injected commit failure after ${writes} write(s)`);
    }
    const finalManifest = manifestPath(destination);
    assertNoSymlinkSegments(destination, finalManifest, manifestRel);
    if (plan.existing && sha256(finalManifest) !== plan.manifestHash) throw new Error("Install manifest changed during update; refusing overwrite.");
    ensureParentDirectories(finalManifest, destination, journal);
    const manifestBackup = backupExisting(finalManifest, backupRoot, manifestRel);
    journal.files.push({ rel: manifestRel, destination: finalManifest, backup: manifestBackup });
    fs.copyFileSync(staged.stagedManifest, finalManifest);
  } catch (error) {
    rollbackTransaction(destination, journal, error, backupRoot);
    throw error;
  }
}

function installOrUpdate(destination, update) {
  const plan = buildPlan(destination, update);
  let staged = null;
  let preserveStage = false;
  try {
    staged = stagePlan(plan);
    commitPlan(destination, plan, staged);
  } catch (error) {
    preserveStage = error.rollbackIncomplete === true;
    throw error;
  } finally {
    if (staged?.stageRoot && !preserveStage) fs.rmSync(staged.stageRoot, { recursive: true, force: true });
  }
  console.log(`PASS: ${update ? "updated" : "installed"} ${target} adapter into ${destination}`);
  console.log(`Files tracked: ${plan.files.length}`);
}

function uninstall(destination) {
  const existing = loadInstallManifest(destination);
  if (!existing) throw new Error("No install manifest found; refusing uninstall because ownership is unknown.");
  assertOwnedIntegrity(destination, existing);
  const manifestHash = sha256(manifestPath(destination));
  const stageRoot = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-adapter-uninstall-"));
  const journal = { files: [], createdDirectories: [] };
  const failAfter = Number.parseInt(process.env.WCBS_TEST_FAIL_UNINSTALL_AFTER_REMOVALS ?? "0", 10);
  let preserveStage = false;
  try {
    for (const rel of existing.files) backupExisting(assertOwnedPath(destination, rel), stageRoot, rel);
    backupExisting(manifestPath(destination), stageRoot, manifestRel);
    let removals = 0;
    for (const rel of [...existing.files].sort((a, b) => b.length - a.length)) {
      const file = assertOwnedPath(destination, rel);
      if (sha256(file) !== existing.file_hashes[rel]) throw new Error(`Owned-file integrity changed during uninstall: ${rel}`);
      journal.files.push({ rel, destination: file, backup: path.join(stageRoot, ...rel.split("/")) });
      fs.rmSync(file);
      removals += 1;
      if (failAfter > 0 && removals >= failAfter) throw new Error(`Injected uninstall removal failure after ${removals} removal(s)`);
    }
    const manifest = manifestPath(destination);
    assertNoSymlinkSegments(destination, manifest, manifestRel);
    if (sha256(manifest) !== manifestHash) throw new Error("Install manifest changed during uninstall; refusing removal.");
    journal.files.push({ rel: manifestRel, destination: manifest, backup: path.join(stageRoot, ...manifestRel.split("/")) });
    fs.rmSync(manifest);
  } catch (error) {
    try { rollbackTransaction(destination, journal, error, stageRoot); }
    catch (rollbackError) { preserveStage = rollbackError.rollbackIncomplete === true; throw rollbackError; }
    throw error;
  } finally {
    if (!preserveStage) fs.rmSync(stageRoot, { recursive: true, force: true });
  }
  console.log(`PASS: uninstalled ${existing.target} adapter from ${destination}`);
  console.log(`Files removed: ${existing.files.length}`);
}

function doctor(destination) {
  const existing = loadInstallManifest(destination);
  if (!existing) throw new Error("No install manifest found.");
  assertOwnedIntegrity(destination, existing);
  const marker = `WCBS_KIT_ACTIVE:${existing.target}`;
  const markerFound = existing.files.some((rel) => {
    const file = path.join(destination, ...rel.split("/"));
    return fs.existsSync(file) && fs.statSync(file).isFile() && fs.readFileSync(file, "utf8").includes(marker);
  });
  if (!markerFound) throw new Error(`Activation marker not found in installed files: ${marker}`);
  console.log(`PASS: ${existing.target} adapter install is structurally healthy in ${destination}`);
  console.log(`Files checked: ${existing.files.length}`);
}

function verifyOwnedFiles(destination) {
  const existing = loadInstallManifest(destination);
  if (!existing) throw new Error("No install manifest found.");
  const { missing, modified } = inspectOwnedFiles(destination, existing);
  const payload = { status: missing.length || modified.length ? "FAIL" : "PASS", target: existing.target, files_checked: existing.files.length, missing, changed: modified };
  if (payload.status !== "PASS") throw new Error(`Owned file verification failed: ${JSON.stringify(payload)}`);
  emit(payload, `PASS: owned files verified for ${existing.target} (${existing.files.length} files)`);
}

function repair(destination) {
  const existing = loadInstallManifest(destination);
  if (!existing) throw new Error("Repair requires an existing install manifest.");
  const { missing } = assertOwnedIntegrity(destination, existing, true);
  if (!missing.length) {
    emit({ status: "PASS", target: existing.target, files_repaired: 0 }, `PASS: no owned files need repair for ${existing.target}`);
    return;
  }
  const manifestHash = sha256(manifestPath(destination));
  const stageRoot = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-adapter-repair-"));
  const journal = { files: [], createdDirectories: [] };
  let preserveStage = false;
  try {
    for (const rel of missing) {
      const source = path.join(root, ...rel.split("/"));
      if (sha256(source) !== existing.file_hashes[rel]) throw new Error(`Repair source differs from recorded owned file: ${rel}`);
      const staged = path.join(stageRoot, ...rel.split("/"));
      fs.mkdirSync(path.dirname(staged), { recursive: true });
      fs.copyFileSync(source, staged);
      if (sha256(staged) !== existing.file_hashes[rel]) throw new Error(`Staged repair payload differs from recorded owned file: ${rel}`);
    }
    if (sha256(manifestPath(destination)) !== manifestHash) throw new Error("Install manifest changed during repair; refusing writes.");
    for (const rel of missing) {
      const file = assertOwnedPath(destination, rel);
      if (fs.existsSync(file)) throw new Error(`Missing owned file reappeared during repair: ${rel}`);
      ensureParentDirectories(file, destination, journal);
      fs.copyFileSync(path.join(stageRoot, ...rel.split("/")), file, fs.constants.COPYFILE_EXCL);
      journal.files.push({ rel, destination: file, backup: null });
      if (sha256(file) !== existing.file_hashes[rel]) throw new Error(`Repaired file failed integrity check: ${rel}`);
    }
    assertOwnedIntegrity(destination, existing);
  } catch (error) {
    try { rollbackTransaction(destination, journal, error, stageRoot); }
    catch (rollbackError) { preserveStage = rollbackError.rollbackIncomplete === true; throw rollbackError; }
    throw error;
  } finally {
    if (!preserveStage) fs.rmSync(stageRoot, { recursive: true, force: true });
  }
  emit({ status: "PASS", target: existing.target, files_repaired: missing.length }, `PASS: repaired ${missing.length} missing owned files for ${existing.target}`);
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
  const requestedDestination = path.resolve(dest);
  const destination = fs.existsSync(requestedDestination) ? fs.realpathSync.native(requestedDestination) : requestedDestination;
  if (sameFilesystemPath(destination, root)) {
    throw new Error("Build Kit source cannot be its own adapter destination. Supply the separate target project root.");
  }
  if (mode === "--install") fs.mkdirSync(destination, { recursive: true });
  else if (!fs.existsSync(destination)) throw new Error(`Destination does not exist: ${destination}`);
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
