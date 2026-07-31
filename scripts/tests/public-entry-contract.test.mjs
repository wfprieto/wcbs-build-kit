// STRUCTURAL DRIFT CONTROL ONLY
// This test verifies repository documentation structure or wording.
// It is NOT behavioral evidence that an external agent follows the path.
// The child-process destination cases below separately exercise repository
// CLI behavior. Gate 0C remains the external-agent activation evidence path.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const readme = read("README.md");
const getStarted = read("GET_STARTED.md");
const bootstrap = read("BOOTSTRAP.md");
const kernelContract = read("00_start_here/KERNEL_CONTRACT.md");
const controller = read("00_start_here/bootstrap-controller.json");
const controllerDoc = read("00_start_here/BOOTSTRAP_CONTROLLER.md");
const installer = read("scripts/install-adapter.mjs");
const resolverPath = path.join(root, "scripts", "resolve-install-context.mjs");

const supportedTargets = ["codex", "claude", "cursor", "github-copilot", "gemini", "replit", "manus", "generic-agent"];

test("README gives a single public URL entry path", () => {
  assert.match(readme, /AI CODING AGENT GIVEN ONLY THIS REPOSITORY URL/);
  assert.match(readme, /Open `GET_STARTED\.md` first\./);
  assert.match(readme, /Do not choose between `AGENTS\.md`, `CLAUDE\.md`, `GEMINI\.md`, `INSTALL\.md`, `BOOTSTRAP\.md`, or `runtime_adapters\/` before following `GET_STARTED\.md`\./);
  assert.match(readme, /`BOOTSTRAP\.md`/);
  assert.match(readme, /`00_start_here\/bootstrap-controller\.json`/);
  assert.match(readme, /do not claim activation until the installed adapter passes its doctor and smoke test/i);
});

test("GET_STARTED makes project-scoped installation the default until a native V2 registration route is verified", () => {
  assert.match(getStarted, /Coding agent arriving from the GitHub URL/);
  assert.match(getStarted, /V1 Project-Local Compatibility Route \(Current Default\)/);
  assert.match(getStarted, /resolve-install-context\.mjs --target <runtime> --candidate <path>/);
  assert.match(getStarted, /A V2 package integrity result is not a runtime registration result/);
  assert.match(getStarted, /docs\/V2_RUNTIME_EVIDENCE\.md/);
  assert.match(getStarted, /URL-paste discovery is `REQUESTED`, not `ENFORCED`/);
  assert.match(getStarted, /Do not claim activation/);
});

test("runtime selection fails closed instead of guessing", () => {
  assert.match(getStarted, /Use an explicit runtime-provided identity signal/);
  assert.match(getStarted, /runtime_adapters\/manifests\/<runtime>\.json/);
  assert.match(getStarted, /ask exactly one bounded question/);
  assert.match(getStarted, /Do not infer a runtime from model style, repository contents, or familiarity/);
});

test("V1 compatibility keeps destination resolution ahead of project writes", () => {
  assert.match(getStarted, /V1 Project-Local Compatibility Route/);
  assert.match(getStarted, /resolve-install-context\.mjs --target <runtime> --candidate <path>/);
  assert.match(getStarted, /State: Ready/);
  assert.match(getStarted, /writes\s+nothing/i);
  assert.match(getStarted, /returns `Blocked`/);
});

test("unreferenced Controller hashes are observations, not integrity verification", () => {
  assert.doesNotMatch(bootstrap, /verify (?:its|the Controller) SHA-256/i);
  assert.doesNotMatch(kernelContract, /verify (?:its|the Controller artifact(?:'s)?) SHA-256/i);
  assert.match(bootstrap, /observation identifier/i);
  assert.match(kernelContract, /does not prove file integrity/i);
});

test("Controller documentation classifies external-agent behavior as instructed", () => {
  assert.match(controller, /"behavior_classification":\s*"Instructed"/);
  assert.match(controllerDoc, /Behavior classification: `Instructed`/);
  assert.match(controllerDoc, /does not make an external agent's compliance technically unavoidable/i);
});

test("no-destination resolution asks once, writes nothing, and returns Blocked", () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-destination-"));
  try {
    const first = path.join(fixture, "project-one");
    const second = path.join(fixture, "project-two");
    fs.mkdirSync(first);
    fs.mkdirSync(second);
    const before = fs.readdirSync(fixture, { recursive: true }).sort();
    const result = spawnSync(process.execPath, [
      resolverPath,
      "--target", "codex",
      "--candidate", first,
      "--candidate", second
    ], { cwd: root, encoding: "utf8" });
    const output = `${result.stdout}${result.stderr}`;
    assert.equal(result.status, 2, output);
    assert.equal((output.match(/Which project should receive the WCBS adapter\?/g) ?? []).length, 1);
    assert.match(output, new RegExp(first.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(output, new RegExp(second.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(output, /State: Blocked/);
    assert.match(output, /Missing input: destination project/);
    assert.doesNotMatch(output, /--install/);
    assert.deepEqual(fs.readdirSync(fixture, { recursive: true }).sort(), before);

    const noCandidates = spawnSync(process.execPath, [
      resolverPath,
      "--target", "codex"
    ], { cwd: root, encoding: "utf8" });
    const noCandidateOutput = `${noCandidates.stdout}${noCandidates.stderr}`;
    assert.equal(noCandidates.status, 2, noCandidateOutput);
    assert.match(noCandidateOutput, /No destination project exists yet\./);
    assert.deepEqual(fs.readdirSync(fixture, { recursive: true }).sort(), before);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test("explicit destination resolution emits exact commands without another question", () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-destination-"));
  try {
    const destination = path.join(fixture, "explicit project");
    const conflicting = path.join(fixture, "conflicting project");
    fs.mkdirSync(destination);
    fs.mkdirSync(conflicting);
    const ambiguous = spawnSync(process.execPath, [
      resolverPath,
      "--target", "codex",
      "--dest", destination,
      "--dest", conflicting
    ], { cwd: root, encoding: "utf8" });
    const ambiguousOutput = `${ambiguous.stdout}${ambiguous.stderr}`;
    assert.equal(ambiguous.status, 2, ambiguousOutput);
    assert.match(ambiguousOutput, /exactly one --dest value is required/);

    const result = spawnSync(process.execPath, [
      resolverPath,
      "--target", "codex",
      "--dest", destination
    ], { cwd: root, encoding: "utf8" });
    const output = `${result.stdout}${result.stderr}`;
    const resolved = path.resolve(destination);
    const quoted = process.platform === "win32"
      ? `'${resolved.replaceAll("'", "''")}'`
      : `'${resolved.replaceAll("'", "'\"'\"'")}'`;
    assert.equal(result.status, 0, output);
    assert.doesNotMatch(output, /Which project should receive/);
    assert.match(output, /State: Ready/);
    assert.match(output, new RegExp(`node scripts/install-adapter\\.mjs --target codex --dest ${quoted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} --install`));
    assert.match(output, new RegExp(`node scripts/install-adapter\\.mjs --target codex --dest ${quoted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} --doctor`));
    assert.match(output, new RegExp(`node scripts/install-adapter\\.mjs --target codex --dest ${quoted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} --verify-owned-files`));
    assert.match(output, new RegExp(`node scripts/adapter-smoke-test\\.mjs --target codex --dest ${quoted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    assert.deepEqual(fs.readdirSync(destination), []);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test("public instructions route through the canonical Kernel and Controller", () => {
  assert.match(bootstrap, /00_start_here\/bootstrap-controller\.json/);
  assert.match(bootstrap, /instructed to stop/i);
  assert.match(getStarted, /Read `BOOTSTRAP\.md` and follow its transfer to `00_start_here\/bootstrap-controller\.json`/);
});

test("documented runtime discovery covers every installer target", () => {
  for (const target of supportedTargets) {
    assert.equal(installer.includes(`"${target}"`), true, `installer target missing: ${target}`);
  }
});
