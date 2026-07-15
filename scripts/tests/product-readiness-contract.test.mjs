import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel) => fs.readFileSync(path.join(root, ...rel.split("/")), "utf8");
const run = (script, args = []) => spawnSync(process.execPath, [path.join(root, "scripts", script), ...args], { cwd: root, encoding: "utf8" });

test("installer lists targets and supports JSON dry-run", () => {
  let result = run("install-adapter.mjs", ["--list-targets", "--json"]);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(JSON.parse(result.stdout).targets.includes("codex"));
  result = run("install-adapter.mjs", ["--target", "codex", "--dry-run", "--json"]);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(JSON.parse(result.stdout).files.includes("AGENTS.md"));
});

test("installer verifies and repairs owned files", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-product-install-"));
  try {
    assert.equal(run("install-adapter.mjs", ["--target", "claude", "--dest", dir, "--install"]).status, 0);
    assert.equal(run("install-adapter.mjs", ["--target", "claude", "--dest", dir, "--verify-owned-files"]).status, 0);
    fs.writeFileSync(path.join(dir, "CLAUDE.md"), "changed\n", "utf8");
    assert.notEqual(run("install-adapter.mjs", ["--target", "claude", "--dest", dir, "--verify-owned-files"]).status, 0);
    assert.equal(run("install-adapter.mjs", ["--target", "claude", "--dest", dir, "--repair"]).status, 0);
    assert.equal(run("install-adapter.mjs", ["--target", "claude", "--dest", dir, "--verify-owned-files"]).status, 0);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("behavior fixtures and version drift checks pass", () => {
  assert.equal(run("run-behavior-fixtures.mjs").status, 0);
  assert.equal(run("audit-version-drift.mjs").status, 0);
});

test("product maturity docs exist", () => {
  for (const rel of [
    "CONTRIBUTING.md",
    "docs/FIRST_10_MINUTES.md",
    "docs/WHICH_SKILL_DO_I_USE.md",
    "docs/COMMON_TASKS.md",
    "docs/ADOPTION_EVIDENCE.md",
    "docs/VERIFIED_RUNTIME_TRANSCRIPTS.md",
    "RELEASE_NOTES.md",
    ".github/ISSUE_TEMPLATE/bug_report.md",
    ".github/ISSUE_TEMPLATE/failed_install_report.md",
    ".github/ISSUE_TEMPLATE/adapter_support_request.md",
    ".github/ISSUE_TEMPLATE/skill_improvement_request.md",
  ]) {
    assert.ok(fs.existsSync(path.join(root, ...rel.split("/"))), rel);
  }
});

test("release workflow and cross-platform workflow include product gates", () => {
  assert.match(read(".github/workflows/release-check.yml"), /build:release-artifacts/);
  assert.match(read(".github/workflows/cross-platform.yml"), /release-check/);
});
