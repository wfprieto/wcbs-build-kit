import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

test("every npm script that invokes a local scripts file references an existing file", () => {
  const missing = [];
  for (const [name, command] of Object.entries(packageJson.scripts ?? {})) {
    for (const match of command.matchAll(/(?:^|\s)(scripts\/[\w./-]+\.(?:mjs|js|py|sh))/g)) {
      const relative = match[1];
      if (!fs.existsSync(path.join(root, ...relative.split("/")))) missing.push(`${name} -> ${relative}`);
    }
  }
  assert.deepEqual(missing, [], `npm scripts reference missing files: ${missing.join(", ")}`);
});

test("default Gate 0C evaluation is non-paid and truthfully blocked pending immutable execution identity", () => {
  const result = spawnSync(process.execPath, ["scripts/run-evals.mjs"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  assert.match(result.stdout, /Scheduled runs: 160/);
  assert.match(result.stdout, /Preflight: BLOCKED/);
  assert.match(result.stdout, /No paid run, score, support-label update, or comparison claim was produced/i);
});

test("strict evaluation fails before a run directory is created when identity or loader is incomplete", () => {
  const runId = `blocked-preflight-${process.pid}-${Date.now()}`;
  const runDirectory = path.join(root, "evals", "runs", runId);
  const result = spawnSync(process.execPath, ["scripts/run-evals.mjs", "--strict", "--execute", "--run-id", runId, "--seed", "safe-test-seed"], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, WCBS_EVAL_CREDENTIAL: "synthetic-test-value-not-a-real-credential" }
  });
  assert.equal(result.status, 1, `${result.stdout}${result.stderr}`);
  assert.match(`${result.stdout}${result.stderr}`, /strict preflight|immutable execution identity|runtime loader/i);
  assert.equal(fs.existsSync(runDirectory), false);
});

test("the three-arm comparison preflight is non-paid and blocks without a fixed Superpowers source", () => {
  const result = spawnSync(process.execPath, ["scripts/run-evals.mjs", "--protocol", "evals/superpowers-comparison-preregistration.json"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  assert.match(result.stdout, /Scheduled runs: 240/);
  assert.match(result.stdout, /superpowers-source/i);
  assert.match(result.stdout, /No paid run/i);
});

test("evidence publication blocks safely for a nonexistent V2 run", () => {
  const result = spawnSync(process.execPath, ["scripts/publish-activation-evidence.mjs", "--run-id", "missing-run"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 1, `${result.stdout}${result.stderr}`);
  assert.match(result.stderr, /BLOCKED/i);
});

test("evaluation command surfaces use V2 WCBS staging and do not retain the V1 adapter installer path", () => {
  const runner = fs.readFileSync(path.join(root, "scripts", "run-evals.mjs"), "utf8");
  const protocol = fs.readFileSync(path.join(root, "scripts", "lib", "evaluation-protocol.mjs"), "utf8");
  assert.match(protocol, /scripts", "wcbs\.mjs/);
  assert.doesNotMatch(`${runner}\n${protocol}`, /install-adapter\.mjs/);
  assert.match(packageJson.scripts["eval:create-judge-packets"], /create-blinded-judge-packets/);
  assert.match(packageJson.scripts["eval:analyze"], /analyze-behavioral-evaluation/);
});

test("the runbook distinguishes blocked preflight, blinded scoring, and behavioral evidence from runtime activation", () => {
  const guide = fs.readFileSync(path.join(root, "evals", "README.md"), "utf8");
  assert.match(guide, /npm run eval:strict/);
  assert.match(guide, /npm run eval:create-judge-packets/);
  assert.match(guide, /exactly two ledgers/i);
  assert.match(guide, /failure-as-data/i);
  assert.match(guide, /does not prove a native runtime activation/i);
  assert.match(guide, /inconclusive/i);
});
