import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { inspectHardenedGitPolicy, requireHardenedGit, runHardenedGit } from "../lib/hardened-git.mjs";

function git(args, cwd) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  return result.stdout.trim();
}

test("hardened Git rejects hostile local configuration before a hook or filter can run", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-hardened-git-"));
  try {
    git(["init", "--quiet"], directory);
    git(["config", "user.email", "fixture@example.invalid"], directory);
    git(["config", "user.name", "Fixture"], directory);
    fs.writeFileSync(path.join(directory, "README.md"), "fixture\n");
    git(["add", "README.md"], directory);
    git(["commit", "--quiet", "-m", "fixture"], directory);
    const hooks = path.join(directory, "hostile-hooks");
    const marker = path.join(directory, "hook-ran");
    fs.mkdirSync(hooks);
    fs.writeFileSync(path.join(hooks, "post-checkout"), `#!/bin/sh\nprintf hook-ran > '${marker}'\n`);
    fs.chmodSync(path.join(hooks, "post-checkout"), 0o755);
    git(["config", "core.hooksPath", hooks], directory);
    git(["config", "filter.hostile.clean", "sh -c 'touch should-not-run'"], directory);
    assert.throws(() => inspectHardenedGitPolicy(directory), /checkout-affecting/i);
    assert.equal(fs.existsSync(marker), false);
    const result = runHardenedGit(["rev-parse", "HEAD"], { cwd: directory, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /^[a-f0-9]{40}\n?$/);
    assert.equal(fs.existsSync(marker), false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("hardened Git uses direct argv and reports a policy version for a clean repository", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-hardened-git-clean-"));
  try {
    git(["init", "--quiet"], directory);
    git(["config", "user.email", "fixture@example.invalid"], directory);
    git(["config", "user.name", "Fixture"], directory);
    fs.writeFileSync(path.join(directory, "README.md"), "fixture\n");
    git(["add", "README.md"], directory);
    git(["commit", "--quiet", "-m", "fixture"], directory);
    const policy = inspectHardenedGitPolicy(directory);
    assert.equal(policy.policy_version, "2");
    assert.deepEqual(policy.blocked_local_config, []);
    assert.equal(requireHardenedGit(["rev-parse", "--is-inside-work-tree"], { cwd: directory }, "fixture Git check").trim(), "true");
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("hardened Git records but safely overrides local core transport settings", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-hardened-git-overrides-"));
  try {
    git(["init", "--quiet"], directory);
    git(["config", "user.email", "fixture@example.invalid"], directory);
    git(["config", "user.name", "Fixture"], directory);
    fs.writeFileSync(path.join(directory, "README.md"), "fixture\n");
    git(["add", "README.md"], directory);
    git(["commit", "--quiet", "-m", "fixture"], directory);
    git(["config", "core.autocrlf", "false"], directory);
    git(["config", "core.attributesFile", path.join(directory, "external-attributes")], directory);

    const policy = inspectHardenedGitPolicy(directory);
    assert.deepEqual(policy.blocked_local_config, []);
    assert.deepEqual(policy.neutralized_local_config, ["core.attributesfile", "core.autocrlf"]);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("hardened Git never reuses a predictable empty-hooks directory", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-hardened-git-private-hooks-"));
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-hardened-git-tmp-"));
  const oldTmpdir = process.env.TMPDIR;
  try {
    git(["init", "--quiet"], directory);
    git(["config", "user.email", "fixture@example.invalid"], directory);
    git(["config", "user.name", "Fixture"], directory);
    fs.writeFileSync(path.join(directory, "README.md"), "fixture\n");
    git(["add", "README.md"], directory);
    git(["commit", "--quiet", "-m", "fixture"], directory);
    const legacy = path.join(temporaryRoot, "wcbs-empty-git-hooks");
    const marker = path.join(directory, "legacy-hook-ran");
    fs.mkdirSync(legacy);
    fs.writeFileSync(path.join(legacy, "post-checkout"), `#!/bin/sh\nprintf hook-ran > '${marker}'\n`);
    fs.chmodSync(path.join(legacy, "post-checkout"), 0o755);
    process.env.TMPDIR = temporaryRoot;
    const target = path.join(temporaryRoot, "target");
    const result = runHardenedGit(["worktree", "add", "--detach", target, "HEAD"], { cwd: directory, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.existsSync(marker), false);
    const removal = runHardenedGit(["worktree", "remove", "--force", target], { cwd: directory, encoding: "utf8" });
    assert.equal(removal.status, 0, removal.stderr);
  } finally {
    if (oldTmpdir === undefined) delete process.env.TMPDIR;
    else process.env.TMPDIR = oldTmpdir;
    fs.rmSync(directory, { recursive: true, force: true });
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});
