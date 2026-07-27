import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const script = path.join(root, "scripts", "apply-eos-remediation.mjs");

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-eos-migration-"));
  fs.cpSync(root, dir, { recursive: true, filter: src => ![".git", "node_modules", "__pycache__", ".wcbs"].includes(path.basename(src)) });
  return dir;
}

function digestTree(dir) {
  const entries = [];
  const walk = current => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a,b)=>a.name.localeCompare(b.name))) {
      if ([".git", "node_modules", "__pycache__"].includes(entry.name)) continue;
      const full = path.join(current, entry.name);
      const rel = path.relative(dir, full).replaceAll("\\", "/");
      if (entry.isDirectory()) walk(full);
      else entries.push(`${rel}\0${crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex")}`);
    }
  };
  walk(dir);
  return crypto.createHash("sha256").update(entries.join("\n")).digest("hex");
}

function run(args, cwd=root) {
  return spawnSync(process.execPath, [script, ...args], { cwd, encoding: "utf8" });
}

test("migrator dry-run is the default and changes nothing", () => {
  const dir = fixture();
  try {
    const before = digestTree(dir);
    const result = run(["--dest", dir], dir);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.match(result.stdout, /DRY RUN/);
    assert.equal(digestTree(dir), before);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("migrator refuses apply without an explicit destination", () => {
  const result = run(["--apply"]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}${result.stderr}`, /requires an explicit --dest/);
});

test("two apply runs are idempotent and preserve the canonical entry point", () => {
  const dir = fixture();
  try {
    const migratorBefore = fs.readFileSync(path.join(dir, "scripts", "apply-eos-remediation.mjs"));
    const provenance = path.join(dir, "90_archive", "provenance", "UPSTREAM_FILE_INVENTORY.md");
    const provenanceBefore = fs.existsSync(provenance) ? fs.readFileSync(provenance) : null;
    const first = run(["--apply", "--dest", dir], dir);
    assert.equal(first.status, 0, `${first.stdout}\n${first.stderr}`);
    assert.ok(fs.existsSync(path.join(dir, "GET_STARTED.md")), "GET_STARTED.md was removed");
    assert.deepEqual(fs.readFileSync(path.join(dir, "scripts", "apply-eos-remediation.mjs")), migratorBefore, "migrator modified itself");
    if (provenanceBefore) assert.deepEqual(fs.readFileSync(provenance), provenanceBefore, "provenance was rewritten");
    const goals = fs.readFileSync(path.join(dir, "10_governance", "source_of_truth", "Elite_Build_Goals_v3.md"), "utf8");
    assert.equal((goals.match(/^# 3\.0 Meta Goal 0 — Deterministic Autonomous Initialization$/gm) ?? []).length, 1);
    const afterFirst = digestTree(dir);
    const second = run(["--apply", "--dest", dir], dir);
    assert.equal(second.status, 0, `${second.stdout}\n${second.stderr}`);
    assert.match(second.stdout, /already applied/);
    assert.equal(digestTree(dir), afterFirst, "second run changed the migrated tree");
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
