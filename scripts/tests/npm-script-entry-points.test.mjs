import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-eval-entry-"));
  fs.cpSync(root, dir, { recursive: true, filter: (source) => ![".git", "node_modules", "__pycache__"].includes(path.basename(source)) });
  return dir;
}

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

test("default eval mode performs a truthful, non-paid preflight", () => {
  const result = spawnSync(process.execPath, ["scripts/run-evals.mjs"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  assert.match(result.stdout, /Cases registered: \d+/);
  assert.match(result.stdout, /Execution state is Blocked/i);
  assert.doesNotMatch(result.stdout, /activation rate|absolute lift/i);
});

test("strict eval mode does not pass without a recorded execution identity", () => {
  const result = spawnSync(process.execPath, ["scripts/run-evals.mjs", "--strict"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 1, `${result.stdout}${result.stderr}`);
  assert.match(result.stderr, /requires a recorded execution identity/i);
});

test("evidence publication blocks safely for a nonexistent run", () => {
  const result = spawnSync(process.execPath, ["scripts/publish-activation-evidence.mjs", "--run-id", "missing-run"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 1, `${result.stdout}${result.stderr}`);
  assert.match(result.stderr, /BLOCKED/i);
});

test("evidence publication rejects an incomplete run manifest even when its only transcript contains the marker", () => {
  const runId = `incomplete-${process.pid}-${Date.now()}`;
  const runDir = path.join(root, "evals", "runs", runId);
  try {
    fs.mkdirSync(runDir, { recursive: true });
    fs.writeFileSync(path.join(runDir, "spec-before-code.treatment.0.json"), JSON.stringify({ exit_code: 0, stdout: "WCBS_KIT_ACTIVE:claude\n", stderr: "" }));
    fs.writeFileSync(path.join(runDir, "run-manifest.json"), JSON.stringify({
      run_id: runId,
      treatment_runtime_id: "claude",
      runs_per_case_per_arm: 10,
      transcripts: [{ case: "spec-before-code", arm: "treatment", index: 0, transcript: `evals/runs/${runId}/spec-before-code.treatment.0.json`, exit_code: 0 }]
    }));
    const result = spawnSync(process.execPath, ["scripts/publish-activation-evidence.mjs", "--run-id", runId], { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 1, `${result.stdout}${result.stderr}`);
    assert.match(result.stderr, /incomplete|missing/i);
    assert.equal(fs.existsSync(path.join(runDir, "activation-evidence.json")), false);
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test("execute mode writes a blocked run manifest when treatment staging fails", () => {
  const dir = fixture();
  try {
    const preregistrationPath = path.join(dir, "evals", "gate-0c-preregistration.json");
    const preregistration = JSON.parse(fs.readFileSync(preregistrationPath, "utf8"));
    preregistration.execution_identity.agent_version = "test-agent-1";
    preregistration.execution_identity.model_id = "test-model-2026-07-28";
    preregistration.runs_per_case_per_arm = 1;
    fs.writeFileSync(preregistrationPath, `${JSON.stringify(preregistration, null, 2)}\n`);
    const casesPath = path.join(dir, "evals", "gate-0c-cases.json");
    const cases = JSON.parse(fs.readFileSync(casesPath, "utf8"));
    cases.runs_per_case_per_arm = 1;
    cases.cases = [cases.cases[0]];
    fs.writeFileSync(casesPath, `${JSON.stringify(cases, null, 2)}\n`);
    fs.writeFileSync(path.join(dir, "scripts", "install-adapter.mjs"), "process.exit(1);\n");
    const runId = "staging-failure";
    const result = spawnSync(process.execPath, ["scripts/run-evals.mjs", "--execute", "--agent-command", process.execPath, "--run-id", runId], {
      cwd: dir,
      encoding: "utf8",
      env: { ...process.env, WCBS_EVAL_CREDENTIAL: "test-credential-that-is-long-enough" }
    });
    assert.equal(result.status, 1, `${result.stdout}${result.stderr}`);
    const runManifest = JSON.parse(fs.readFileSync(path.join(dir, "evals", "runs", runId, "run-manifest.json"), "utf8"));
    assert.equal(runManifest.transcripts.length, 2);
    assert.equal(runManifest.transcripts.some((record) => record.arm === "treatment" && record.activation === "Blocked"), true);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("execute mode rejects an unbounded evaluation timeout before it creates a run", () => {
  const dir = fixture();
  try {
    const preregistrationPath = path.join(dir, "evals", "gate-0c-preregistration.json");
    const preregistration = JSON.parse(fs.readFileSync(preregistrationPath, "utf8"));
    preregistration.execution_identity.agent_version = "test-agent-1";
    preregistration.execution_identity.model_id = "test-model-2026-07-28";
    preregistration.runs_per_case_per_arm = 1;
    fs.writeFileSync(preregistrationPath, `${JSON.stringify(preregistration, null, 2)}\n`);
    const casesPath = path.join(dir, "evals", "gate-0c-cases.json");
    const cases = JSON.parse(fs.readFileSync(casesPath, "utf8"));
    cases.runs_per_case_per_arm = 1;
    cases.cases = [cases.cases[0]];
    fs.writeFileSync(casesPath, `${JSON.stringify(cases, null, 2)}\n`);
    const result = spawnSync(process.execPath, ["scripts/run-evals.mjs", "--execute", "--agent-command", process.execPath, "--timeout-ms", "3600001", "--run-id", "too-long"], {
      cwd: dir,
      encoding: "utf8",
      env: { ...process.env, WCBS_EVAL_CREDENTIAL: "test-credential-that-is-long-enough" }
    });
    assert.equal(result.status, 1, `${result.stdout}${result.stderr}`);
    assert.match(result.stderr, /timeout-ms.*at most/i);
    assert.equal(fs.existsSync(path.join(dir, "evals", "runs", "too-long")), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("eval runner serializes transcript paths with platform-safe POSIX separators", () => {
  const runner = fs.readFileSync(path.join(root, "scripts", "run-evals.mjs"), "utf8");
  assert.match(runner, /path\.relative\(root, transcript\)\.split\(path\.sep\)\.join\("\/"\)/);
});

test("evidence publisher refuses a preregistration path that escapes the repository", () => {
  const dir = fixture();
  const outside = path.join(path.dirname(dir), `wcbs-external-registry-${process.pid}-${Date.now()}.json`);
  try {
    fs.writeFileSync(outside, JSON.stringify({ runs_per_case_per_arm: 1, cases: [{ id: "single-case", prompt: "hello", activation: ["marker"] }] }));
    const preregistrationPath = path.join(dir, "evals", "gate-0c-preregistration.json");
    const preregistration = JSON.parse(fs.readFileSync(preregistrationPath, "utf8"));
    preregistration.case_registry = `../${path.basename(outside)}`;
    preregistration.runs_per_case_per_arm = 1;
    fs.writeFileSync(preregistrationPath, `${JSON.stringify(preregistration, null, 2)}\n`);
    const runId = "escaped-registry";
    const runDir = path.join(dir, "evals", "runs", runId);
    fs.mkdirSync(runDir, { recursive: true });
    for (const arm of ["baseline", "treatment"]) {
      const name = `single-case.${arm}.0.json`;
      fs.writeFileSync(path.join(runDir, name), JSON.stringify({ exit_code: 0, stdout: arm === "treatment" ? "WCBS_KIT_ACTIVE:claude\n" : "", stderr: "" }));
    }
    fs.writeFileSync(path.join(runDir, "run-manifest.json"), JSON.stringify({
      run_id: runId,
      treatment_runtime_id: "claude",
      runs_per_case_per_arm: 1,
      transcripts: [
        { case: "single-case", arm: "baseline", index: 0, transcript: `evals/runs/${runId}/single-case.baseline.0.json`, exit_code: 0 },
        { case: "single-case", arm: "treatment", index: 0, transcript: `evals/runs/${runId}/single-case.treatment.0.json`, exit_code: 0 }
      ]
    }));
    const result = spawnSync(process.execPath, ["scripts/publish-activation-evidence.mjs", "--run-id", runId], { cwd: dir, encoding: "utf8" });
    assert.equal(result.status, 1, `${result.stdout}${result.stderr}`);
    assert.match(result.stderr, /escapes the repository root/i);
    assert.equal(fs.existsSync(path.join(runDir, "activation-evidence.json")), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(outside, { force: true });
  }
});

test("the Gate 0C runbook distinguishes safe preflight from paid execution and human scoring", () => {
  const guide = fs.readFileSync(path.join(root, "evals", "README.md"), "utf8");
  assert.match(guide, /npm run eval/);
  assert.match(guide, /npm run eval:strict/);
  assert.match(guide, /npm run eval:publish-evidence/);
  assert.match(guide, /paid/i);
  assert.match(guide, /human scoring/i);
});
