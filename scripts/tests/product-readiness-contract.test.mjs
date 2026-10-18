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

test("installer refuses edited owned files and repairs missing owned files", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-product-install-"));
  try {
    assert.equal(run("install-adapter.mjs", ["--target", "claude", "--dest", dir, "--install"]).status, 0);
    assert.equal(run("install-adapter.mjs", ["--target", "claude", "--dest", dir, "--verify-owned-files"]).status, 0);
    fs.writeFileSync(path.join(dir, "CLAUDE.md"), "changed\n", "utf8");
    assert.notEqual(run("install-adapter.mjs", ["--target", "claude", "--dest", dir, "--verify-owned-files"]).status, 0);
    assert.notEqual(run("install-adapter.mjs", ["--target", "claude", "--dest", dir, "--repair"]).status, 0);
    assert.equal(fs.readFileSync(path.join(dir, "CLAUDE.md"), "utf8"), "changed\n");
    fs.rmSync(path.join(dir, "CLAUDE.md"));
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
    "GET_STARTED.md",
    "docs/WHICH_SKILL_DO_I_USE.md",
    "docs/COMMON_TASKS.md",
    "docs/ADOPTION_EVIDENCE.md",
    "docs/evidence/V2_0_0_AUDIT_UPDATE.md",
    "docs/VERIFIED_RUNTIME_TRANSCRIPTS.md",
    "RELEASE_NOTES.md",
    ".github/ISSUE_TEMPLATE/bug_report.md",
    ".github/ISSUE_TEMPLATE/failed_install_report.md",
    ".github/ISSUE_TEMPLATE/first_install_feedback.md",
    ".github/ISSUE_TEMPLATE/adapter_support_request.md",
    ".github/ISSUE_TEMPLATE/skill_improvement_request.md",
  ]) {
    assert.ok(fs.existsSync(path.join(root, ...rel.split("/"))), rel);
  }
});

test("current distribution reserves owned rights and preserves earlier grants", () => {
  const notice = read("LICENSE");
  assert.match(notice, /ALL RIGHTS RESERVED/);
  assert.match(notice, /Copyright \(c\) 2026 wfprieto/);
  assert.match(notice, /Earlier MIT-licensed material/);
  assert.match(notice, /Third-party material and contributions/);
  for (const rel of [
    "package.json",
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    ".kimi-plugin/plugin.json",
  ]) {
    assert.equal(JSON.parse(read(rel)).license, "UNLICENSED", rel);
  }
  for (const rel of ["README.md", "WCBS_START.md", "GET_STARTED.md"]) {
    assert.match(read(rel), /LICENSE/, rel);
  }
});

test("rights transition has a distinct version from the MIT release", () => {
  const version = JSON.parse(read("package.json")).version;
  assert.notEqual(version, "2.0.0");
  for (const rel of [".claude-plugin/plugin.json", ".codex-plugin/plugin.json", ".kimi-plugin/plugin.json", ".agents/plugins/marketplace.json"]) {
    assert.equal(JSON.parse(read(rel)).version, version, rel);
  }
  assert.equal(JSON.parse(read(".claude-plugin/marketplace.json")).plugins[0].version, version);
  assert.match(read("DISTRIBUTION_POLICY.md"), /distinct version/);
});

test("historical audit routes current release claims through a dated evidence update", () => {
  const historical = read("docs/evidence/FINAL_20_PASS_AUDIT.md");
  const update = read("docs/evidence/V2_0_0_AUDIT_UPDATE.md");
  assert.match(historical, /V2_0_0_AUDIT_UPDATE\.md/);
  assert.match(historical, /historical audit/i);
  assert.match(update, /4d07eced7fac10a6cadf27fe54e70c91ec282f4a/);
  assert.match(update, /39090877955/);
  assert.match(update, /39090877951/);
  assert.match(update, /b85e5e12a105cca07afa4926d991d7333b7a282f/);
  assert.match(update, /Gate 0C.*160/i);
  assert.match(update, /Superpowers comparison.*240/i);
  assert.match(update, /Runtime Verified:\s+Not Run/i);
});

test("public adoption claims keep distribution separate from runtime proof", () => {
  const pkg = JSON.parse(read("package.json"));
  const claudeMarketplace = JSON.parse(read(".claude-plugin/marketplace.json"));
  const feedback = read(".github/ISSUE_TEMPLATE/first_install_feedback.md");
  assert.equal(pkg.private, true);
  assert.ok(claudeMarketplace.description?.trim());
  const getStarted = read("GET_STARTED.md");
  assert.match(getStarted, /first_install_feedback\.md/);
  assert.match(getStarted, /codex plugin marketplace add wfprieto\/wcbs-build-kit --ref v2\.0\.0/);
  assert.match(getStarted, /claude plugin marketplace add wfprieto\/wcbs-build-kit/);
  assert.match(read("docs/ADOPTION_EVIDENCE.md"), /self-hosted/i);
  assert.match(read("docs/ADOPTION_EVIDENCE.md"), /independent.*feedback/i);
  assert.match(read("SUPPORT_MATRIX.md"), /registration.*install.*runtime activation/i);
  assert.match(read("DISTRIBUTION_POLICY.md"), /package\.json` private/);
  assert.match(read("DISTRIBUTION_POLICY.md"), /defer npm publication/);
  assert.match(feedback, /version or commit/i);
  assert.match(feedback, /redact/i);
});

test("release workflows expose every forensic product gate", () => {
  const release = read(".github/workflows/release-check.yml");
  const crossPlatform = read(".github/workflows/cross-platform.yml");
  assert.match(release, /^ {2}pull_request:\s*\n {4}branches:\s*\n {6}- main\s*$/m);
  assert.match(release, /^\s*run:\s*npm run release-check\s*(?:#.*)?$/m);
  for (const command of [
    "npm run check:whitespace",
    "npm run verify",
    "npm run check:matrix",
    "npm run version:audit",
    "npm run audit:governance",
    "npm run behavior-test",
    "npm run test",
    "npm run system-test",
    "npm run check-install",
    "npm run build:release-artifacts",
  ]) {
    assert.match(crossPlatform, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing cross-platform gate: ${command}`);
  }
});

test("release scripts retain a tracked-file whitespace gate", () => {
  const packageJson = JSON.parse(read("package.json"));
  assert.equal(packageJson.scripts["check:whitespace"], "node scripts/check-whitespace.mjs");
  assert.match(packageJson.scripts.check, /npm run check:whitespace/);
  assert.match(read(".github/workflows/release-check.yml"), /^\s*run:\s*npm run release-check\s*(?:#.*)?$/m);
});
