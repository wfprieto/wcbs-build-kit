import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel) => fs.readFileSync(path.join(root, ...rel.split("/")), "utf8");

test("subagent skill routes to task-brief, review-package, and finishing branch", () => {
  const body = read("skills/subagent-driven-development/SKILL.md");
  assert.match(body, /scripts\/task-brief\.mjs/);
  assert.match(body, /scripts\/review-package\.mjs/);
  assert.match(body, /skills\/finishing-a-development-branch\/SKILL\.md/);
});

test("load order includes sequential execution and finishing branch skills", () => {
  const body = read("00_start_here/LOAD_ORDER.md");
  assert.match(body, /skills\/executing-plans\/SKILL\.md/);
  assert.match(body, /skills\/finishing-a-development-branch\/SKILL\.md/);
});

test("task-brief extracts a task section to a durable file", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-brief-"));
  try {
    const plan = path.join(dir, "plan.md");
    fs.writeFileSync(plan, "# Plan\n\n## Task 1 - Add check\n\nExact requirement.\n\n## Task 2 - Other\n\nNope.\n", "utf8");
    const result = spawnSync(process.execPath, [path.join(root, "scripts", "task-brief.mjs"), "--plan", plan, "--task", "1", "--out-dir", dir], { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    const output = result.stdout.trim();
    assert.ok(fs.existsSync(output));
    const body = fs.readFileSync(output, "utf8");
    assert.match(body, /Exact requirement/);
    assert.doesNotMatch(body, /Nope/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("review-package rejects shortcut refs", () => {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", "review-package.mjs"), "--base", "HEAD~1", "--head", "HEAD", "--brief", "README.md"], { cwd: root, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}${result.stderr}`, /Shortcut refs are prohibited/);
});
