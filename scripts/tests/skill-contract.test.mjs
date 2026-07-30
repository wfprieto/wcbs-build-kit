import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-skill-contract-"));
  fs.cpSync(root, dir, { recursive: true, filter: (source) => ![".git", "node_modules", "__pycache__"].includes(path.basename(source)) });
  return dir;
}

test("skill contract rejects a malformed 'Use when use ...' trigger", () => {
  const dir = fixture();
  try {
    const skill = path.join(dir, "skills", "engineering-plan-review", "SKILL.md");
    const body = fs.readFileSync(skill, "utf8");
    fs.writeFileSync(skill, body.replace(/^description:.*$/m, "description: Use when use a malformed trigger sentence for a high-stakes plan review."));
    const result = spawnSync(process.execPath, ["scripts/audit-skill-contract.mjs"], { cwd: dir, encoding: "utf8" });
    assert.notEqual(result.status, 0, `${result.stdout}${result.stderr}`);
    assert.match(`${result.stdout}${result.stderr}`, /malformed/i);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
