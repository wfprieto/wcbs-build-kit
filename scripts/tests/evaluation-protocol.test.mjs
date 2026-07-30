import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  analyzeAdjudicatedScores,
  canonicalHash,
  canonicalJson,
  createExternalEvidenceRun,
  createAdjudicationLedger,
  createBlindedJudgePackets,
  createCustodyIndex,
  createJudgeLedger,
  createGitInvocation,
  createRandomSchedule,
  deterministicUnitInterval,
  executeProtocol,
  manifestSelfHash,
  preflightProtocol,
  resolveExternalEvidenceRun,
  resolveGitExecutable,
  runGitCommand,
  validateEvaluationProvenance,
  validateBlindedDelivery,
  validateAnalysisSchedule,
  validateScoreLedgers,
  writeEvidenceFile
} from "../lib/evaluation-protocol.mjs";
import { runEval } from "../lib/eval-runner.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const evaluatorHarnessFiles = ["scripts/lib/evaluation-protocol.mjs", "scripts/lib/eval-runner.mjs", "scripts/lib/hardened-git.mjs", "scripts/build-release-artifacts.mjs", "scripts/run-evals.mjs", "scripts/create-blinded-judge-packets.mjs", "scripts/analyze-behavioral-evaluation.mjs"];
function testGit(args, cwd = root) {
  const result = runGitCommand(args, { cwd, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr?.toString().trim() || `git exited ${result.status}`);
  return result.stdout;
}

function makeCleanFixtureSource() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-evaluation-source-"));
  const result = runGitCommand(["clone", "--quiet", root, directory], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 || result.error) throw new Error(result.stderr?.toString().trim() || result.error?.message || "could not create clean fixture source");
  for (const relative of evaluatorHarnessFiles) {
    const destination = path.join(directory, ...relative.split("/"));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(root, ...relative.split("/")), destination);
  }
  const harnessPath = path.join(directory, "evals", "evaluator-harness-manifest.json");
  fs.mkdirSync(path.dirname(harnessPath), { recursive: true });
  fs.writeFileSync(harnessPath, `${JSON.stringify({ schema_version: 1, files: evaluatorHarnessFiles.map((relative) => ({ path: relative, sha256: crypto.createHash("sha256").update(fs.readFileSync(path.join(directory, ...relative.split("/")))).digest("hex") })) }, null, 2)}\n`);
  testGit(["config", "user.email", "fixture@example.invalid"], directory);
  testGit(["config", "user.name", "Fixture"], directory);
  testGit(["add", ...evaluatorHarnessFiles, "evals/evaluator-harness-manifest.json"], directory);
  testGit(["commit", "-m", "fixture evaluator harness"], directory);
  testGit(["checkout", "--detach"], directory);
  return directory;
}

const fixtureRoot = makeCleanFixtureSource();
process.once("exit", () => { fs.rmSync(fixtureRoot, { recursive: true, force: true }); });
const fixtureCandidate = {
  commit: testGit(["rev-parse", "HEAD"], fixtureRoot).trim(),
  tree: testGit(["rev-parse", "HEAD^{tree}"], fixtureRoot).trim()
};
const publishedReleaseCandidate = {
  commit: "5eb0f297702e49a41f63946136b089a2eecfac97",
  tree: "999234aec89d4ab63aa649c5dca56df7236c6b19"
};
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const fixtureRoleKeys = (() => {
  const role = (key_id) => {
    const pair = crypto.generateKeyPairSync("ed25519");
    return { key_id, public_key_pem: pair.publicKey.export({ type: "spki", format: "pem" }), private_key_pem: pair.privateKey.export({ type: "pkcs8", format: "pem" }) };
  };
  return { producer: role("producer-key"), judge_a: role("judge-a-key"), judge_b: role("judge-b-key"), adjudicator: role("adjudicator-key") };
})();
process.env.WCBS_FIXTURE_PRODUCER_KEY = fixtureRoleKeys.producer.private_key_pem;

test("evaluation protocol resolves its root from a native file URL path", () => {
  const windowsUrl = new URL("file:///C:/wcbs/scripts/tests/evaluation-protocol.test.mjs");
  assert.equal(windowsUrl.pathname, "/C:/wcbs/scripts/tests/evaluation-protocol.test.mjs");
  assert.equal(fileURLToPath(windowsUrl, { windows: true }), "C:\\wcbs\\scripts\\tests\\evaluation-protocol.test.mjs");
  const testFile = fileURLToPath(import.meta.url);
  assert.equal(root, path.resolve(path.dirname(testFile), "..", ".."));
  if (process.platform === "win32") {
    assert.match(testFile, /^[A-Za-z]:\\/);
    assert.equal(testFile.startsWith("/"), false);
  }
});

function makeTemporaryDirectory() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-evaluation-protocol-"));
}

function writeStubCommands(directory) {
  const loader = path.join(directory, "loader.mjs");
  const agent = path.join(directory, "agent.mjs");
  const verify = path.join(directory, "verify.mjs");
  const failingAgent = path.join(directory, "failing-agent.mjs");
  const timedAgent = path.join(directory, "timed-agent.mjs");
  fs.writeFileSync(loader, [
    "import fs from 'node:fs';",
    "import path from 'node:path';",
    "const [pluginDir] = process.argv.slice(2);",
    "fs.writeFileSync(path.join(process.cwd(), 'loader-receipt.json'), JSON.stringify({ pluginDir, home: process.env.HOME, userprofile: process.env.USERPROFILE }));",
    "process.stdout.write('loader-ready\\n');"
  ].join("\n"));
  fs.writeFileSync(agent, [
    "import fs from 'node:fs';",
    "import path from 'node:path';",
    "fs.writeFileSync(path.join(process.cwd(), 'agent-output.txt'), 'changed-by-stub');",
    "fs.writeFileSync(path.join(process.cwd(), 'agent-receipt.json'), JSON.stringify({ args: process.argv.slice(2), home: process.env.HOME, userprofile: process.env.USERPROFILE }));",
    "process.stdout.write(`stub-response:${process.argv.at(-1)}\\n`);"
  ].join("\n"));
  fs.writeFileSync(verify, "process.stdout.write('verification-passed\\n');\n");
  fs.writeFileSync(failingAgent, "process.stderr.write('synthetic tool failure\\n'); process.exit(7);\n");
  fs.writeFileSync(timedAgent, "setTimeout(() => process.stdout.write('too late\\n'), 10000);\n");
  return { loader, agent, failingAgent, timedAgent, verify };
}

function fixtureProtocol(stubs, arms = ["neutral", "wcbs"], repetitions = 1, superpowersIdentity = null) {
  return {
    schema_version: 1,
    protocol_id: arms.includes("superpowers") ? "fixture-superpowers" : "fixture-gate-0c",
    runtime_id: "claude",
    expected_total_runs: arms.length * repetitions,
    repetitions,
    arms,
    cases: [{ id: "fixture-case", prompt: "Safely update the fixture.", criteria: ["writes evidence"] }],
    control_project_root: "evals/control-project",
    control_project_manifest: "evals/control-project-manifest.json",
    control_project_manifest_sha256: sha256(fs.readFileSync(path.join(fixtureRoot, "evals", "control-project-manifest.json"))),
    wcbs_candidate: { ...fixtureCandidate },
    evaluation_subject: { ...fixtureCandidate },
    claim_target: { ...fixtureCandidate },
    role_keys: {
      producer: { key_id: fixtureRoleKeys.producer.key_id, public_key_pem: fixtureRoleKeys.producer.public_key_pem, private_key_env: "WCBS_FIXTURE_PRODUCER_KEY" },
      judges: [
        { key_id: fixtureRoleKeys.judge_a.key_id, public_key_pem: fixtureRoleKeys.judge_a.public_key_pem },
        { key_id: fixtureRoleKeys.judge_b.key_id, public_key_pem: fixtureRoleKeys.judge_b.public_key_pem }
      ],
      adjudicator: { key_id: fixtureRoleKeys.adjudicator.key_id, public_key_pem: fixtureRoleKeys.adjudicator.public_key_pem }
    },
    superpowers_source_identity: arms.includes("superpowers") ? superpowersIdentity : null,
    execution_identity: {
      agent_version: "fixture-agent-1.0.0",
      model_id: "fixture-model-2026-07-28",
      credential_name: "WCBS_EVAL_CREDENTIAL",
      agent_command_template: {
        command: process.execPath,
        arguments: [stubs.agent, "{{workspace}}", "{{plugin_dir}}", ...(arms.includes("superpowers") ? ["{{superpowers_dir}}"] : []), "{{prompt}}"]
      }
    },
    arm_loader_templates: Object.fromEntries(arms.filter((arm) => arm !== "neutral").map((arm) => [arm, {
      command: process.execPath,
      arguments: [stubs.loader, arm === "wcbs" ? "{{plugin_dir}}" : "{{superpowers_dir}}"]
    }])),
    verification_command_template: { command: process.execPath, arguments: [stubs.verify] },
    timeout_ms: 5_000,
    failure_policy: { timeout: "failure", tool_error: "failure", invalid_artifact: "failure", missing_score: "failure" },
    scoring_rubric: { path: "evals/behavioral-scoring-rubric.json", sha256: sha256(fs.readFileSync(path.join(fixtureRoot, "evals", "behavioral-scoring-rubric.json"))) },
    evaluator_harness: { path: "evals/evaluator-harness-manifest.json", sha256: sha256(fs.readFileSync(path.join(fixtureRoot, "evals", "evaluator-harness-manifest.json"))) },
    analysis: {
      bootstrap_resamples: 10_000,
      phase5: { treatment_minimum: 0.9, absolute_lift_minimum: 0.2 },
      phase6: { primary_noninferiority_margin: -0.1, safety_noninferiority_margin: -0.05 }
    }
  };
}

function createSuperpowersFixture(directory) {
  const fixture = path.join(directory, "superpowers-source");
  fs.mkdirSync(fixture, { recursive: true });
  testGit(["init"], fixture);
  testGit(["config", "user.email", "fixture@example.invalid"], fixture);
  testGit(["config", "user.name", "Fixture"], fixture);
  fs.writeFileSync(path.join(fixture, "README.md"), "pinned superpowers fixture\n");
  testGit(["add", "README.md"], fixture);
  testGit(["commit", "-m", "pinned fixture"], fixture);
  const identity = {
    commit: testGit(["rev-parse", "HEAD"], fixture).trim(),
    tree: testGit(["rev-parse", "HEAD^{tree}"], fixture).trim()
  };
  const mutateHead = () => {
    fs.writeFileSync(path.join(fixture, "MUTATED.txt"), "must not be archived\n");
    testGit(["add", "MUTATED.txt"], fixture);
    testGit(["commit", "-m", "mutated head"], fixture);
  };
  return { root: fixture, identity, mutateHead };
}

function canonicalSchedule(cases, arms, repetitions) {
  const rows = [];
  for (const entry of cases) for (const arm of arms) for (let repetition = 0; repetition < repetitions; repetition += 1) rows.push(`${entry.id}:${arm}:${repetition}`);
  return rows;
}

function completeScoreFixture({ wcbs = 1, superpowers = 1, neutral = 0, safety = 1 }) {
  const cases = Array.from({ length: 8 }, (_, index) => ({ id: `case-${index + 1}` }));
  const arms = ["neutral", "wcbs", "superpowers"];
  const records = [];
  const judgeA = [], judgeB = [], adjudications = [];
  for (const testCase of cases) {
    for (const arm of arms) {
      for (let repetition = 0; repetition < 10; repetition += 1) {
        const packet_id = `${testCase.id}-${arm}-${repetition}`;
        const successes = arm === "wcbs" ? wcbs : arm === "superpowers" ? superpowers : neutral;
        const success = typeof successes === "function"
          ? successes(testCase, repetition)
          : Array.isArray(successes) ? successes[repetition] : successes;
        const score = { packet_id, success: Boolean(success), safety: Boolean(safety), correctness: Boolean(success) };
        records.push({ packet_id, case_id: testCase.id, arm, repetition });
        judgeA.push({ judge_id: "judge-a", ...score });
        judgeB.push({ judge_id: "judge-b", ...score });
        adjudications.push({ packet_id, ...score, adjudicator_id: "adjudicator", reason: "fixture" });
      }
    }
  }
  return { packet_ids: records.map((record) => record.packet_id), cases, records, judge_ledgers: [judgeA, judgeB], adjudications };
}

function envelopeScoreFixture() {
  const packet_ids = ["packet-a", "packet-b"];
  const binding = {
    run_id: "run-1",
    protocol_sha256: "a".repeat(64),
    run_manifest_sha256: "b".repeat(64),
    schedule_sha256: "c".repeat(64),
    packet_set_sha256: canonicalHash([...packet_ids].sort((left, right) => left.localeCompare(right)))
  };
  const scores = (judge_id, first = true) => packet_ids.map((packet_id, index) => ({
    judge_id,
    packet_id,
    success: first || index === 1,
    safety: true,
    correctness: first || index === 1
  }));
  const judgeA = createJudgeLedger({ binding, judge_id: "judge-a", packet_scores: scores("judge-a", true) });
  const judgeB = createJudgeLedger({ binding, judge_id: "judge-b", packet_scores: scores("judge-b", true) });
  const custody_index = createCustodyIndex({ binding, judge_ledger_sha256: [judgeA.ledger_sha256, judgeB.ledger_sha256] });
  const adjudications = createAdjudicationLedger({
    binding,
    judge_ledger_sha256: [judgeA.ledger_sha256, judgeB.ledger_sha256],
    adjudicator_id: "adjudicator",
    packet_scores: packet_ids.map((packet_id) => ({ packet_id, adjudicator_id: "adjudicator", success: true, safety: true, correctness: true }))
  });
  return { packet_ids, binding, judge_ledgers: [judgeA, judgeB], custody_index, adjudications };
}

function signedEnvelopeScoreFixture() {
  const packet_ids = ["packet-a", "packet-b"];
  const binding = {
    run_id: "signed-run-1",
    protocol_sha256: "a".repeat(64),
    run_manifest_sha256: "b".repeat(64),
    schedule_sha256: "c".repeat(64),
    packet_set_sha256: canonicalHash(packet_ids),
    complete_protocol_sha256: "d".repeat(64),
    delivery_manifest_sha256: "e".repeat(64),
    mapping_sha256: "f".repeat(64),
    producer_freeze_sha256: "1".repeat(64),
    role_keys: {
      producer: { key_id: fixtureRoleKeys.producer.key_id, public_key_pem: fixtureRoleKeys.producer.public_key_pem, private_key_env: "WCBS_FIXTURE_PRODUCER_KEY" },
      judges: [
        { key_id: fixtureRoleKeys.judge_a.key_id, public_key_pem: fixtureRoleKeys.judge_a.public_key_pem },
        { key_id: fixtureRoleKeys.judge_b.key_id, public_key_pem: fixtureRoleKeys.judge_b.public_key_pem }
      ],
      adjudicator: { key_id: fixtureRoleKeys.adjudicator.key_id, public_key_pem: fixtureRoleKeys.adjudicator.public_key_pem }
    }
  };
  const scores = (judge_id) => packet_ids.map((packet_id) => ({ judge_id, packet_id, success: true, safety: true, correctness: true }));
  const judgeA = createJudgeLedger({ binding, judge_id: "judge-a", role_key_id: fixtureRoleKeys.judge_a.key_id, signing_key: fixtureRoleKeys.judge_a.private_key_pem, packet_scores: scores("judge-a") });
  const judgeB = createJudgeLedger({ binding, judge_id: "judge-b", role_key_id: fixtureRoleKeys.judge_b.key_id, signing_key: fixtureRoleKeys.judge_b.private_key_pem, packet_scores: scores("judge-b") });
  const custody_index = createCustodyIndex({ binding, judge_ledger_sha256: [judgeA.ledger_sha256, judgeB.ledger_sha256], signing_keys: { [fixtureRoleKeys.judge_a.key_id]: fixtureRoleKeys.judge_a.private_key_pem, [fixtureRoleKeys.judge_b.key_id]: fixtureRoleKeys.judge_b.private_key_pem } });
  const adjudications = createAdjudicationLedger({ binding, judge_ledger_sha256: [judgeA.ledger_sha256, judgeB.ledger_sha256], adjudicator_id: "adjudicator", role_key_id: fixtureRoleKeys.adjudicator.key_id, signing_key: fixtureRoleKeys.adjudicator.private_key_pem, packet_scores: packet_ids.map((packet_id) => ({ packet_id, adjudicator_id: "adjudicator", success: true, safety: true, correctness: true, reason: "fixture" })) });
  return { packet_ids, binding, judge_ledgers: [judgeA, judgeB], custody_index, adjudications };
}

test("Gate 0C stages the exact pinned Git candidate through V2 wcbs plugin installation", async () => {
  const directory = makeTemporaryDirectory();
  try {
    const stubs = writeStubCommands(directory);
    const protocol = fixtureProtocol(stubs);
    const preflight = preflightProtocol({ root: fixtureRoot, protocol, strict: true });
    assert.equal(preflight.status, "PASS", preflight.blockers.join("\n"));
    const result = await executeProtocol({
      root: fixtureRoot,
      protocol,
      run_id: "fixture-two-arm",
      run_directory: path.join(directory, "run"),
      seed: "fixture-seed-two-arm",
      credential: "synthetic-test-value-not-a-real-credential"
    });
    assert.equal(result.status, "PASS");
    assert.equal(result.manifest.records.length, 2);
    const wcbs = result.manifest.records.find((record) => record.arm === "wcbs");
    assert.ok(wcbs.installation.command.some((part) => part.endsWith(path.join("scripts", "wcbs.mjs"))));
    assert.equal(wcbs.installation.command.join(" ").includes("install-adapter.mjs"), false);
    assert.equal(wcbs.candidate.commit, fixtureCandidate.commit);
    assert.equal(wcbs.candidate.tree, fixtureCandidate.tree);
    const archivedPackage = path.join(directory, "run", wcbs.candidate.source, "package.json");
    assert.equal(fs.readFileSync(archivedPackage, "utf8"), fs.readFileSync(path.join(root, "package.json"), "utf8"));
    assert.ok(wcbs.artifacts.transcript_sha256);
    assert.ok(fs.existsSync(path.join(directory, "run", wcbs.artifacts.workspace_manifest)));
    assert.ok(fs.existsSync(path.join(directory, "run", wcbs.artifacts.workspace_diff)));
    assert.equal(JSON.stringify(result.manifest).includes("synthetic-test-value-not-a-real-credential"), false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("evaluation fixtures derive their WCBS candidate identity from the clean checkout tip", () => {
  assert.equal(fixtureCandidate.commit, testGit(["rev-parse", "HEAD"], fixtureRoot).trim());
  assert.equal(fixtureCandidate.tree, testGit(["rev-parse", "HEAD^{tree}"], fixtureRoot).trim());
});

test("published Phase 5 and Phase 6 preregistrations pin the exact release candidate identity", () => {
  for (const file of ["evals/gate-0c-preregistration.json", "evals/superpowers-comparison-preregistration.json"]) {
    const preregistration = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
    assert.deepEqual(preregistration.wcbs_candidate, publishedReleaseCandidate, file);
    assert.deepEqual(preregistration.evaluation_subject, publishedReleaseCandidate, file);
    assert.deepEqual(preregistration.claim_target, publishedReleaseCandidate, file);
  }
});

test("preflight blocks a changed evaluator harness even when protocol JSON is unchanged", () => {
  const stubsDirectory = makeTemporaryDirectory();
  const harnessFile = path.join(fixtureRoot, "scripts", "lib", "evaluation-protocol.mjs");
  const original = fs.readFileSync(harnessFile, "utf8");
  try {
    const protocol = fixtureProtocol(writeStubCommands(stubsDirectory));
    fs.writeFileSync(harnessFile, `${original}\n// fixture harness mutation\n`);
    const preflight = preflightProtocol({ root: fixtureRoot, protocol, strict: true });
    assert.equal(preflight.status, "BLOCKED");
    assert.ok(preflight.blockers.some((blocker) => blocker.includes("Evaluator harness validation failed")));
  } finally {
    fs.writeFileSync(harnessFile, original);
    fs.rmSync(stubsDirectory, { recursive: true, force: true });
  }
});

test("evaluator Git resolution prefers an explicit configured command", () => {
  const configured = "C:\\WCBS Tools\\git.exe";
  const installedGit = "C:\\Program Files\\Git\\bin\\git.exe";
  const probes = [];
  const executable = resolveGitExecutable({
    env: { WCBS_GIT_EXECUTABLE: configured, ProgramFiles: "C:\\Program Files" },
    platform: "win32",
    exists: (candidate) => candidate === installedGit,
    probe: (candidate) => { probes.push(candidate); return candidate === configured || candidate === installedGit; }
  });
  assert.equal(executable, configured);
  assert.deepEqual(probes, [configured]);
});

test("evaluator Git resolution prefers Git-for-Windows bin before cmd and a false-positive PATH probe", () => {
  const programFiles = "C:\\Program Files";
  const bin = path.win32.join(programFiles, "Git", "bin", "git.exe");
  const cmd = path.win32.join(programFiles, "Git", "cmd", "git.exe");
  const probes = [];
  const executable = resolveGitExecutable({
    env: { ProgramFiles: programFiles, PATH: "C:\\Windows\\System32" },
    platform: "win32",
    exists: (candidate) => candidate === bin || candidate === cmd,
    probe: (candidate) => { probes.push(candidate); return candidate === bin || candidate === cmd || candidate === "git.exe"; }
  });
  assert.equal(executable, bin);
  assert.deepEqual(probes, []);
});

test("evaluator Git resolution falls back to Git-for-Windows cmd when bin is unavailable", () => {
  const programFiles = "C:\\Program Files";
  const bin = path.win32.join(programFiles, "Git", "bin", "git.exe");
  const cmd = path.win32.join(programFiles, "Git", "cmd", "git.exe");
  const probes = [];
  const executable = resolveGitExecutable({
    env: { ProgramFiles: programFiles },
    platform: "win32",
    exists: (candidate) => candidate === cmd,
    probe: (candidate) => { probes.push(candidate); return candidate === cmd; }
  });
  assert.equal(executable, cmd);
  assert.equal(probes.includes(bin), false);
  assert.deepEqual(probes, []);
});

test("evaluator Git resolution considers every Git-for-Windows bin path before any cmd path", () => {
  const programW6432 = "C:\\Program Files";
  const programFiles = "D:\\Program Files";
  const laterBin = path.win32.join(programFiles, "Git", "bin", "git.exe");
  const earlierCmd = path.win32.join(programW6432, "Git", "cmd", "git.exe");
  const probes = [];
  const executable = resolveGitExecutable({
    env: { ProgramW6432: programW6432, ProgramFiles: programFiles },
    platform: "win32",
    exists: (candidate) => candidate === earlierCmd || candidate === laterBin,
    probe: (candidate) => { probes.push(candidate); return candidate === earlierCmd || candidate === laterBin; }
  });
  assert.equal(executable, laterBin);
  assert.deepEqual(probes, []);
});

test("evaluator Git resolution accepts an existing Git-for-Windows executable without a fragile launcher probe", () => {
  const programFiles = "C:\\Program Files";
  const bin = path.win32.join(programFiles, "Git", "bin", "git.exe");
  const executable = resolveGitExecutable({
    env: { ProgramFiles: programFiles },
    platform: "win32",
    exists: (candidate) => candidate === bin,
    probe: () => false
  });
  assert.equal(executable, bin);
});

test("evaluator Git resolution rejects relative and batch Windows executable configurations", () => {
  for (const configured of ["git.exe", "C:\\WCBS Tools\\git.cmd", "C:\\WCBS Tools\\git.bat"]) {
    assert.throws(
      () => resolveGitExecutable({
        env: { WCBS_GIT_EXECUTABLE: configured },
        platform: "win32",
        probe: () => true
      }),
      /absolute Windows .exe path/
    );
  }
});

test("direct Windows Git execution rejects batch bridges before spawn", () => {
  const env = { SystemRoot: "C:\\Windows" };
  assert.throws(
    () => createGitInvocation(["--version"], { git: "C:\\WCBS Tools\\git.cmd", env, platform: "win32" }),
    /absolute Windows .exe path/
  );
  assert.throws(
    () => runGitCommand(["--version"], {
      git: "C:\\WCBS Tools\\git.bat",
      env,
      platform: "win32",
      cwd: "C:\\source",
      spawn: () => { throw new Error("must not spawn"); }
    }),
    /absolute Windows .exe path/
  );
});

test("evaluator Git commands use the direct absolute Git executable from an untrusted source directory", () => {
  const git = "C:\\Program Files\\Git\\bin\\git.exe";
  const systemRoot = "C:\\Windows";
  const source = "C:\\untrusted-source";
  const untrustedCmd = path.win32.join(source, "cmd.exe");
  const systemDirectory = path.win32.join(systemRoot, "System32");
  const gitRuntimePath = [
    systemDirectory,
    "C:\\Program Files\\Git\\bin",
    "C:\\Program Files\\Git\\cmd",
    "C:\\Program Files\\Git\\mingw64\\bin",
    "C:\\Program Files\\Git\\usr\\bin"
  ].join(";");
  const env = {
    SystemRoot: systemRoot,
    SYSTEMROOT: "C:\\spoofed-windows",
    Path: "C:\\trusted-bin",
    PATH: source,
    ComSpec: untrustedCmd
  };
  const calls = [];
  const archive = Buffer.from([0, 255, 17, 0]);
  const result = runGitCommand(["archive", "--format=tar", "a".repeat(40)], {
    git,
    env,
    platform: "win32",
    cwd: source,
    encoding: null,
    spawn: (command, args, options) => {
      calls.push({ command, args, options });
      return { status: 0, stdout: archive, stderr: Buffer.alloc(0) };
    }
  });
  assert.equal(result.stdout, archive);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].command, git);
  assert.notEqual(calls[0].command, untrustedCmd);
  assert.equal(calls[0].options.cwd, source);
  assert.deepEqual(calls[0].args, ["archive", "--format=tar", "a".repeat(40)]);
  assert.equal(calls[0].options.encoding, null);
  assert.equal(calls[0].options.windowsVerbatimArguments, undefined);
  assert.equal(calls[0].options.env.SystemRoot, systemRoot);
  assert.equal(calls[0].options.env.Path, gitRuntimePath);
  assert.equal(calls[0].options.env.Path.includes(source), false);
  assert.equal(calls[0].options.env.WINDIR, systemRoot);
  assert.equal(calls[0].options.env.ComSpec, undefined);
  assert.equal(calls[0].options.env.SYSTEMROOT, undefined);
  assert.equal(calls[0].options.env.PATH, undefined);

  const revisionInvocation = createGitInvocation(["rev-parse", "HEAD^{tree}"], { git, env, platform: "win32" });
  assert.equal(revisionInvocation.command, git);
  assert.deepEqual(revisionInvocation.args, ["rev-parse", "HEAD^{tree}"]);
  assert.deepEqual(
    createGitInvocation(["rev-parse", "HEAD & whoami"], { git, env, platform: "win32" }),
    { command: git, args: ["rev-parse", "HEAD & whoami"] }
  );
});

test("direct Windows Git accepts absolute source paths containing shell characters", () => {
  const git = "C:\\Program Files\\Git\\bin\\git.exe";
  const source = "C:\\Users\\wcbs~fixture\\source & spaces";
  const calls = [];
  const result = runGitCommand(["rev-parse", "HEAD"], {
    git,
    env: { SystemRoot: "C:\\Windows" },
    platform: "win32",
    cwd: source,
    spawn: (command, args, options) => {
      calls.push({ command, args, options });
      return { status: 0, stdout: "a".repeat(40), stderr: "" };
    }
  });
  assert.equal(result.status, 0);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].command, git);
  assert.deepEqual(calls[0].args, ["rev-parse", "HEAD"]);
  assert.equal(calls[0].options.cwd, source);
  assert.throws(
    () => runGitCommand(["rev-parse", "HEAD"], { git, env: { SystemRoot: "C:\\Windows" }, platform: "win32", cwd: "relative-source", spawn: () => { throw new Error("must not spawn"); } }),
    /absolute Windows path/
  );
});

test("evaluator Git commands use the direct absolute Git executable", () => {
  const calls = [];
  const originalSystemRoot = process.env.SYSTEMROOT;
  process.env.SYSTEMROOT = "C:\\Windows";
  try {
    runGitCommand(["--version"], {
      git: "C:\\Program Files\\Git\\bin\\git.exe",
      env: process.env,
      platform: "win32",
      cwd: "C:\\original-source",
      spawn: (command, args, options) => {
        calls.push({ command, args, options });
        return { status: 0, stdout: "git version fixture", stderr: "" };
      }
    });
  } finally {
    if (originalSystemRoot === undefined) delete process.env.SYSTEMROOT;
    else process.env.SYSTEMROOT = originalSystemRoot;
  }
  assert.equal(calls.length, 1);
  assert.equal(calls[0].command, "C:\\Program Files\\Git\\bin\\git.exe");
  assert.equal(calls[0].options.cwd, "C:\\original-source");
  assert.equal(calls[0].options.env.Path, [
    "C:\\Windows\\System32",
    "C:\\Program Files\\Git\\bin",
    "C:\\Program Files\\Git\\cmd",
    "C:\\Program Files\\Git\\mingw64\\bin",
    "C:\\Program Files\\Git\\usr\\bin"
  ].join(";"));
  assert.equal(calls[0].options.env.SystemRoot, "C:\\Windows");
});

test("three-arm protocol rejects a missing fixed Superpowers source identity and emits 240 scheduled records only when all identities are complete", () => {
  const directory = makeTemporaryDirectory();
  try {
    const stubs = writeStubCommands(directory);
    const superpowers = createSuperpowersFixture(directory);
    const protocol = fixtureProtocol(stubs, ["neutral", "wcbs", "superpowers"], 10, superpowers.identity);
    protocol.cases = JSON.parse(fs.readFileSync(path.join(fixtureRoot, "evals", "gate-0c-cases.json"), "utf8")).cases.map((entry) => ({ ...entry, criteria: entry.activation }));
    protocol.expected_total_runs = 240;
    const blocked = preflightProtocol({ root: fixtureRoot, protocol, superpowers_source: null, strict: false });
    assert.equal(blocked.status, "BLOCKED");
    assert.match(blocked.blockers.join("\n"), /superpowers-source/i);
    const ready = preflightProtocol({ root: fixtureRoot, protocol, superpowers_source: superpowers.root, strict: true });
    assert.equal(ready.status, "PASS");
    const schedule = createRandomSchedule({ protocol, cases: protocol.cases, seed: "fixture-seed-three-arm" });
    assert.equal(schedule.records.length, 240);
    assert.equal(new Set(schedule.records.map((record) => record.run_id)).size, 240);
    assert.notDeepEqual(schedule.records.map((record) => `${record.case_id}:${record.arm}:${record.repetition}`), canonicalSchedule(protocol.cases, protocol.arms, 10));
    assert.equal(schedule.schedule_sha256, createRandomSchedule({ protocol, cases: protocol.cases, seed: "fixture-seed-three-arm" }).schedule_sha256);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("judge packets omit arm identity and two independent ledgers plus adjudication are mandatory", async () => {
  const directory = makeTemporaryDirectory();
  try {
    const stubs = writeStubCommands(directory);
    const execution = await executeProtocol({
      root: fixtureRoot,
      protocol: fixtureProtocol(stubs),
      run_id: "fixture-blinding",
      run_directory: path.join(directory, "run"),
      seed: "fixture-seed-blinding",
      credential: "synthetic-test-value-not-a-real-credential"
    });
    const packets = createBlindedJudgePackets({ run_directory: path.join(directory, "run"), manifest: execution.manifest });
    assert.equal(packets.length, 2);
    const packetBody = fs.readFileSync(path.join(directory, "run", packets[0].packet_path), "utf8").toLowerCase();
    assert.equal(packetBody.includes('"arm"'), false);
    assert.equal(packetBody.includes("wcbs"), false);
    assert.equal(packetBody.includes("neutral"), false);
    const packetIds = packets.map((packet) => packet.packet_id);
    const incomplete = validateScoreLedgers({
      packet_ids: packetIds,
      judge_ledgers: [[{ judge_id: "judge-a", packet_id: packetIds[0], success: true, safety: true, correctness: true }]],
      adjudications: []
    });
    assert.equal(incomplete.status, "BLOCKED");
    const complete = validateScoreLedgers({
      packet_ids: packetIds,
      judge_ledgers: [
        packetIds.map((packet_id) => ({ judge_id: "judge-a", packet_id, success: true, safety: true, correctness: true })),
        packetIds.map((packet_id) => ({ judge_id: "judge-b", packet_id, success: true, safety: true, correctness: true }))
      ],
      adjudications: packetIds.map((packet_id) => ({ packet_id, adjudicator_id: "adjudicator", success: true, safety: true, correctness: true, reason: "fixture" }))
    });
    assert.equal(complete.status, "PASS");
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("two complete independent score ledgers produce preregistered inferior, non-inferior, superior, and inconclusive outcomes", () => {
  const protocol = {
    protocol_id: "fixture-superpowers",
    arms: ["neutral", "wcbs", "superpowers"],
    analysis: { bootstrap_resamples: 10_000, phase6: { primary_noninferiority_margin: -0.1, safety_noninferiority_margin: -0.05 } }
  };
  const scenarios = [
    ["superior", { wcbs: 1, superpowers: 0, neutral: 0 }],
    ["non-inferior", { wcbs: 1, superpowers: 1, neutral: 0 }],
    ["inferior", { wcbs: 0, superpowers: 1, neutral: 0 }],
    ["inconclusive", {
      wcbs: (_testCase, repetition) => [0, 0, 0, 0, 0, 1, 1, 1, 1, 1][repetition],
      superpowers: (testCase, repetition) => (["case-1", "case-2", "case-3"].includes(testCase.id)
        ? [0, 0, 0, 0, 1, 1, 1, 1, 1, 1]
        : [0, 0, 0, 0, 0, 1, 1, 1, 1, 1])[repetition],
      neutral: 0
    }]
  ];
  for (const [expected, outcomes] of scenarios) {
    const fixture = completeScoreFixture(outcomes);
    const scores = validateScoreLedgers(fixture);
    assert.equal(scores.status, "PASS");
    const analysis = analyzeAdjudicatedScores({ protocol, cases: fixture.cases, records: fixture.records, adjudications: scores.adjudications, manifest_hash: sha256(expected) });
    assert.equal(analysis.phase6.verdict, expected);
  }
});

test("deterministic sampling reaches the upper half of the unit interval, every Fisher-Yates region, and all ten bootstrap rows", () => {
  const values = Array.from({ length: 512 }, (_, counter) => deterministicUnitInterval("full-range-fixture", counter));
  assert.equal(values.every((value) => value >= 0 && value < 1), true);
  assert.equal(values.some((value) => value >= 0.5), true);
  const bootstrapIndices = Array.from({ length: 512 }, (_, counter) => Math.floor(deterministicUnitInterval("bootstrap-fixture:success:wcbs:0", counter) * 10));
  assert.deepEqual([...new Set(bootstrapIndices)].sort((left, right) => left - right), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const protocol = {
    protocol_id: "rng-schedule",
    arms: ["neutral", "wcbs"],
    repetitions: 1,
    cases: Array.from({ length: 5 }, (_, index) => ({ id: `case-${index}` }))
  };
  const target = "case-0:neutral:0";
  const positions = new Set();
  for (let index = 0; index < 64; index += 1) {
    const schedule = createRandomSchedule({ protocol, seed: `rng-schedule-seed-${index}` });
    positions.add(schedule.records.findIndex((record) => `${record.case_id}:${record.arm}:${record.repetition}` === target));
  }
  assert.equal([...positions].some((position) => position >= 5), true);
});

test("failed attempts, invalid retained artifacts, and missing scores stay blinded as zero-valued data", async () => {
  const directory = makeTemporaryDirectory();
  try {
    const stubs = writeStubCommands(directory);
    const protocol = fixtureProtocol(stubs);
    protocol.execution_identity.agent_command_template.arguments[0] = stubs.failingAgent;
    const execution = await executeProtocol({
      root: fixtureRoot,
      protocol,
      run_id: "fixture-failure-as-data",
      run_directory: path.join(directory, "run"),
      seed: "fixture-seed-failure-as-data",
      credential: "synthetic-test-value-not-a-real-credential"
    });
    assert.equal(execution.status, "PASS");
    assert.equal(execution.manifest.records.every((record) => record.status === "Failed"), true);
    const packets = createBlindedJudgePackets({ run_directory: path.join(directory, "run"), manifest: execution.manifest });
    const failedPacket = JSON.parse(fs.readFileSync(path.join(directory, "run", packets[0].packet_path), "utf8"));
    assert.equal(Object.hasOwn(failedPacket, "failure_as_data"), false, "judge delivery must not expose arm-correlated failure categories");
    assert.equal(execution.manifest.records[0].status, "Failed", "the custody record retains failure-as-data outside judge delivery");
    const packetIds = packets.map((packet) => packet.packet_id);
    const scores = validateScoreLedgers({
      packet_ids: packetIds,
      judge_ledgers: [
        [{ judge_id: "judge-a", packet_id: packetIds[0], success: true, safety: true, correctness: true }],
        [{ judge_id: "judge-b", packet_id: packetIds[0], success: true, safety: true, correctness: true }]
      ],
      adjudications: [{ packet_id: packetIds[0], adjudicator_id: "adjudicator", success: true, safety: true, correctness: true, reason: "fixture" }],
      failed_packet_ids: packetIds
    });
    assert.equal(scores.status, "PASS");
    assert.equal(scores.adjudications.every((entry) => entry.success === false && entry.safety === false && entry.correctness === false), true);
    const records = execution.manifest.records.map((record, index) => ({ ...record, packet_id: packetIds[index] }));
    const analysis = analyzeAdjudicatedScores({ protocol, cases: protocol.cases, records, adjudications: scores.adjudications, manifest_hash: sha256("failure-as-data") });
    assert.equal(analysis.status, "PASS");
    assert.equal(analysis.phase5.treatment_activation, 0);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("a timed-out scheduled attempt is retained as a failure packet rather than blocking the whole evaluation", async () => {
  const directory = makeTemporaryDirectory();
  try {
    const stubs = writeStubCommands(directory);
    const protocol = fixtureProtocol(stubs);
    protocol.timeout_ms = 100;
    protocol.execution_identity.agent_command_template.arguments[0] = stubs.timedAgent;
    const execution = await executeProtocol({
      root: fixtureRoot,
      protocol,
      run_id: "fixture-timeout-as-data",
      run_directory: path.join(directory, "run"),
      seed: "fixture-seed-timeout-as-data",
      credential: "synthetic-test-value-not-a-real-credential"
    });
    assert.equal(execution.status, "PASS");
    assert.equal(execution.manifest.records.every((record) => record.status === "Failed"), true);
    assert.equal(execution.manifest.records.some((record) => record.failure_category === "timeout"), true);
    const packets = createBlindedJudgePackets({ run_directory: path.join(directory, "run"), manifest: execution.manifest });
    assert.equal(packets.length, 2);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("one protected per-record runtime profile links every non-neutral loader to the agent process", async () => {
  const directory = makeTemporaryDirectory();
  try {
    const stubs = writeStubCommands(directory);
    const protocol = fixtureProtocol(stubs);
    const execution = await executeProtocol({
      root: fixtureRoot,
      protocol,
      run_id: "fixture-shared-profile",
      run_directory: path.join(directory, "run"),
      seed: "fixture-seed-shared-profile",
      credential: "synthetic-test-value-not-a-real-credential"
    });
    assert.equal(execution.status, "PASS");
    const wcbs = execution.manifest.records.find((record) => record.arm === "wcbs");
    const workspace = path.join(directory, "run", "workspaces", wcbs.run_id);
    const loaderReceipt = JSON.parse(fs.readFileSync(path.join(workspace, "loader-receipt.json"), "utf8"));
    const agentReceipt = JSON.parse(fs.readFileSync(path.join(workspace, "agent-receipt.json"), "utf8"));
    assert.equal(loaderReceipt.home, agentReceipt.home);
    assert.equal(loaderReceipt.userprofile, agentReceipt.userprofile);
    assert.equal(agentReceipt.args.includes(loaderReceipt.pluginDir), true);
    const adversarial = fixtureProtocol(stubs);
    adversarial.execution_identity.agent_command_template.arguments = [stubs.agent, "{{workspace}}", "{{prompt}}"];
    const blocked = preflightProtocol({ root: fixtureRoot, protocol: adversarial, strict: true });
    assert.equal(blocked.status, "BLOCKED");
    assert.match(blocked.blockers.join("\n"), /plugin_dir/i);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("scoring requires one distinct judge per ledger and an adjudicator who is neither judge", () => {
  const packet_ids = ["packet-a", "packet-b"];
  const score = (judge_id, packet_id) => ({ judge_id, packet_id, success: true, safety: true, correctness: true });
  const adjudications = packet_ids.map((packet_id) => ({ packet_id, adjudicator_id: "adjudicator", success: true, safety: true, correctness: true, reason: "fixture" }));
  const mixedLedger = validateScoreLedgers({
    packet_ids,
    judge_ledgers: [[score("judge-a", "packet-a"), score("judge-b", "packet-b")], [score("judge-a", "packet-a"), score("judge-b", "packet-b")]],
    adjudications
  });
  assert.equal(mixedLedger.status, "BLOCKED");
  const judgeAsAdjudicator = validateScoreLedgers({
    packet_ids,
    judge_ledgers: [packet_ids.map((packet_id) => score("judge-a", packet_id)), packet_ids.map((packet_id) => score("judge-b", packet_id))],
    adjudications: packet_ids.map((packet_id) => ({ packet_id, adjudicator_id: "judge-a", success: true, safety: true, correctness: true, reason: "fixture" }))
  });
  assert.equal(judgeAsAdjudicator.status, "BLOCKED");
});

test("Superpowers archives the preregistered commit even when the source HEAD mutates after preflight", async () => {
  const directory = makeTemporaryDirectory();
  try {
    const stubs = writeStubCommands(directory);
    const superpowers = createSuperpowersFixture(directory);
    const protocol = fixtureProtocol(stubs, ["neutral", "wcbs", "superpowers"], 1, superpowers.identity);
    let mutated = false;
    const execution = await executeProtocol({
      root: fixtureRoot,
      protocol,
      run_id: "fixture-pinned-superpowers",
      run_directory: path.join(directory, "run"),
      seed: "fixture-seed-pinned-superpowers",
      credential: "synthetic-test-value-not-a-real-credential",
      superpowers_source: superpowers.root,
      after_preflight: () => { superpowers.mutateHead(); mutated = true; }
    });
    assert.equal(mutated, true);
    assert.equal(execution.status, "PASS");
    const superpowersRecord = execution.manifest.records.find((record) => record.arm === "superpowers");
    const archived = path.join(directory, "run", superpowersRecord.superpowers.source);
    assert.equal(fs.existsSync(path.join(archived, "README.md")), true);
    assert.equal(fs.existsSync(path.join(archived, "MUTATED.txt")), false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("the final manifest self-hash commits to execution outcome and blocks every downstream processor after tampering", async () => {
  const runId = `manifest-integrity-${process.pid}-${Date.now()}`;
  const stubsDirectory = makeTemporaryDirectory();
  const evidenceRoot = path.join(stubsDirectory, "evidence");
  fs.mkdirSync(evidenceRoot);
  const runDirectory = path.join(evidenceRoot, runId);
  try {
    const stubs = writeStubCommands(stubsDirectory);
    const protocol = fixtureProtocol(stubs);
    const execution = await executeProtocol({
      root: fixtureRoot,
      protocol,
      run_id: runId,
      run_directory: runDirectory,
      seed: "fixture-seed-manifest-integrity",
      credential: "synthetic-test-value-not-a-real-credential"
    });
    assert.equal(execution.status, "PASS");
    const { manifest_sha256, ...finalManifest } = execution.manifest;
    assert.equal(manifest_sha256, sha256(JSON.stringify(finalManifest)), "the stored self-hash must commit to every final manifest field");

    const packets = createBlindedJudgePackets({ run_directory: runDirectory, manifest: execution.manifest });
    const packetIds = packets.map((packet) => packet.packet_id);
    const judgeScore = (judge_id, packet_id) => ({ judge_id, packet_id, success: true, safety: true, correctness: true });
    const adjudication = (packet_id) => ({ adjudicator_id: "adjudicator", packet_id, success: true, safety: true, correctness: true, reason: "fixture" });
    fs.writeFileSync(path.join(runDirectory, "judge-a.json"), JSON.stringify(packetIds.map((packet_id) => judgeScore("judge-a", packet_id))));
    fs.writeFileSync(path.join(runDirectory, "judge-b.json"), JSON.stringify(packetIds.map((packet_id) => judgeScore("judge-b", packet_id))));
    fs.writeFileSync(path.join(runDirectory, "adjudications.json"), JSON.stringify(packetIds.map(adjudication)));
    const baseManifest = JSON.parse(fs.readFileSync(path.join(runDirectory, "run-manifest.json"), "utf8"));
    const mutations = [
      ["execution outcome", (manifest) => { manifest.execution_outcome = "TAMPERED"; }],
      ["retained record", (manifest) => { manifest.records[0].prompt = "tampered retained record"; }]
    ];
    for (const [label, mutate] of mutations) {
      const tampered = structuredClone(baseManifest);
      mutate(tampered);
      fs.writeFileSync(path.join(runDirectory, "run-manifest.json"), JSON.stringify(tampered));
      const commands = [
        ["scripts/create-blinded-judge-packets.mjs", "--run-id", runId, "--evidence-dir", evidenceRoot],
        ["scripts/analyze-behavioral-evaluation.mjs", "--run-id", runId, "--evidence-dir", evidenceRoot, "--judge-ledger", "judge-a.json", "--judge-ledger", "judge-b.json", "--custody-index", "custody.json", "--adjudications", "adjudications.json"],
        ["scripts/publish-activation-evidence.mjs", "--run-id", runId, "--evidence-dir", evidenceRoot]
      ];
      for (const command of commands) {
        const result = spawnSync(process.execPath, command, { cwd: root, encoding: "utf8" });
        assert.equal(result.status, 1, `${label}: ${command[0]} unexpectedly accepted a tampered manifest. ${result.stdout}${result.stderr}`);
        assert.match(`${result.stdout}${result.stderr}`, /manifest self-hash/i, `${label}: ${command[0]} must identify the manifest integrity failure.`);
      }
    }
  } finally {
    fs.rmSync(runDirectory, { recursive: true, force: true });
    fs.rmSync(stubsDirectory, { recursive: true, force: true });
  }
});

test("three-arm judge packages omit nested structural loader and installation fingerprints", () => {
  const directory = makeTemporaryDirectory();
  try {
    const artifacts = path.join(directory, "records", "fixture");
    fs.mkdirSync(artifacts, { recursive: true });
    fs.writeFileSync(path.join(artifacts, "transcript.json"), JSON.stringify({
      command: ["claude", "--plugin-dir", "/private/wcbs-plugin"],
      stdout: "installed from /private/wcbs-source"
    }));
    fs.writeFileSync(path.join(artifacts, "workspace-diff.json"), JSON.stringify({
      added: [{ path: ".wcbs-evaluation/plugins/wcbs/receipt.json", sha256: "a".repeat(64), bytes: 1 }],
      removed: [],
      modified: []
    }));
    fs.writeFileSync(path.join(artifacts, "workspace-manifest.json"), JSON.stringify([]));
    fs.writeFileSync(path.join(artifacts, "failure.json"), JSON.stringify({ reason: "wcbs loader at /private/wcbs-loader failed", failure_as_data: true }));
    const manifest = {
      schema_version: 1,
      protocol_id: "fixture-three-arm",
      protocol_sha256: "c".repeat(64),
      complete_protocol_sha256: "c".repeat(64),
      role_keys: {
        producer: { key_id: fixtureRoleKeys.producer.key_id, public_key_pem: fixtureRoleKeys.producer.public_key_pem, private_key_env: "WCBS_FIXTURE_PRODUCER_KEY" },
        judges: [{ key_id: fixtureRoleKeys.judge_a.key_id, public_key_pem: fixtureRoleKeys.judge_a.public_key_pem }, { key_id: fixtureRoleKeys.judge_b.key_id, public_key_pem: fixtureRoleKeys.judge_b.public_key_pem }],
        adjudicator: { key_id: fixtureRoleKeys.adjudicator.key_id, public_key_pem: fixtureRoleKeys.adjudicator.public_key_pem }
      },
      schedule: { schedule_sha256: "b".repeat(64), records: [{ run_id: "fixture-run", arm: "wcbs", case_id: "case-1", repetition: 0 }] },
      records: [{
        run_id: "fixture-run",
        arm: "wcbs",
        case_id: "case-1",
        repetition: 0,
        prompt: "Perform a neutral task.",
        criteria: ["does the task"],
        status: "Failed",
        loader: { command: ["loader", "/private/wcbs-loader"], stdout: "wcbs" },
        verification: { stdout: "wcbs installation at /private/wcbs-profile", stderr: "wcbs failure" },
        artifacts: {
          transcript: "records/fixture/transcript.json",
          transcript_sha256: sha256(fs.readFileSync(path.join(artifacts, "transcript.json"))),
          workspace_manifest: "records/fixture/workspace-manifest.json",
          workspace_manifest_sha256: sha256(fs.readFileSync(path.join(artifacts, "workspace-manifest.json"))),
          workspace_diff: "records/fixture/workspace-diff.json",
          workspace_diff_sha256: sha256(fs.readFileSync(path.join(artifacts, "workspace-diff.json"))),
          failure: "records/fixture/failure.json"
        }
      }]
    };
    manifest.manifest_sha256 = manifestSelfHash(manifest);
    const packets = createBlindedJudgePackets({ run_directory: directory, manifest });
    const delivery = fs.readFileSync(path.join(directory, packets[0].packet_path), "utf8").toLowerCase();
    for (const forbidden of ["wcbs", "plugin-dir", "private", "loader", "installation", "command", "workspace_diff"]) assert.equal(delivery.includes(forbidden), false, `judge delivery leaked ${forbidden}`);
    assert.equal(fs.existsSync(path.join(directory, "blind-map.json")), false, "blind map must not share the judge-delivery directory");
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("analysis rejects replayed tampered or unreconciled hashed score ledgers", () => {
  const fixture = envelopeScoreFixture();
  const valid = validateScoreLedgers(fixture);
  assert.equal(valid.status, "PASS");
  const cases = [
    ["reordered packet bytes", () => {
      const reordered = { ...fixture.judge_ledgers[0], packet_scores: [...fixture.judge_ledgers[0].packet_scores].reverse() };
      reordered.ledger_sha256 = canonicalHash(Object.fromEntries(Object.entries(reordered).filter(([key]) => key !== "ledger_sha256")));
      return { ...fixture, judge_ledgers: [reordered, fixture.judge_ledgers[1]] };
    }, /canonically sorted/i],
    ["recomputed tampered ledger", () => {
      const tampered = structuredClone(fixture.judge_ledgers[0]);
      tampered.packet_scores[0].success = false;
      tampered.packet_scores[0].correctness = false;
      tampered.ledger_sha256 = canonicalHash(Object.fromEntries(Object.entries(tampered).filter(([key]) => key !== "ledger_sha256")));
      return { ...fixture, judge_ledgers: [tampered, fixture.judge_ledgers[1]] };
    }, /custody/i],
    ["missing custody index", () => ({ ...fixture, custody_index: null }), /custody/i],
    ["replayed ledger hash", () => ({ ...fixture, custody_index: { ...fixture.custody_index, judge_ledger_sha256: [fixture.judge_ledgers[0].ledger_sha256, fixture.judge_ledgers[0].ledger_sha256] } }), /custody/i],
    ["unreconciled disagreement", () => {
      const judgeB = createJudgeLedger({ ...fixture, judge_id: "judge-b", packet_scores: [{ judge_id: "judge-b", packet_id: "packet-a", success: false, safety: true, correctness: false }, { judge_id: "judge-b", packet_id: "packet-b", success: true, safety: true, correctness: true }] });
      const custody_index = createCustodyIndex({ binding: fixture.binding, judge_ledger_sha256: [fixture.judge_ledgers[0].ledger_sha256, judgeB.ledger_sha256] });
      const adjudications = createAdjudicationLedger({ binding: fixture.binding, judge_ledger_sha256: [fixture.judge_ledgers[0].ledger_sha256, judgeB.ledger_sha256], adjudicator_id: "adjudicator", packet_scores: [{ packet_id: "packet-a", adjudicator_id: "adjudicator", success: true, safety: true, correctness: true }, { packet_id: "packet-b", adjudicator_id: "adjudicator", success: true, safety: true, correctness: true }] });
      return { ...fixture, judge_ledgers: [fixture.judge_ledgers[0], judgeB], custody_index, adjudications };
    }, /reconciliation/i]
  ];
  for (const [label, build, reason] of cases) {
    const result = validateScoreLedgers(build());
    assert.equal(result.status, "BLOCKED", label);
    assert.match(result.blockers.join("\n"), reason, label);
  }
});

test("signed custody rejects packet or ledger substitution before score aggregation", () => {
  const fixture = signedEnvelopeScoreFixture();
  assert.equal(validateScoreLedgers(fixture).status, "PASS");
  const substitutedLedger = structuredClone(fixture.judge_ledgers[0]);
  substitutedLedger.packet_scores[0].success = false;
  substitutedLedger.packet_scores[0].correctness = false;
  const substituted = validateScoreLedgers({ ...fixture, judge_ledgers: [substitutedLedger, fixture.judge_ledgers[1]] });
  assert.equal(substituted.status, "BLOCKED");
  assert.match(substituted.blockers.join("\n"), /self-hash|signature|custody/i);
  const wrongKey = structuredClone(fixture.judge_ledgers[0]);
  wrongKey.signature.key_id = fixtureRoleKeys.judge_b.key_id;
  const wrongKeyResult = validateScoreLedgers({ ...fixture, judge_ledgers: [wrongKey, fixture.judge_ledgers[1]] });
  assert.equal(wrongKeyResult.status, "BLOCKED");
  assert.match(wrongKeyResult.blockers.join("\n"), /signature/i);
});

test("contradictory composites remain retained failures in judge adjudication and analysis paths", () => {
  const packet_ids = ["packet-a"];
  const contradictory = { packet_id: "packet-a", success: true, safety: false, correctness: true };
  const result = validateScoreLedgers({
    packet_ids,
    judge_ledgers: [
      [{ judge_id: "judge-a", ...contradictory }],
      [{ judge_id: "judge-b", ...contradictory }]
    ],
    adjudications: [{ adjudicator_id: "adjudicator", ...contradictory, reason: "fixture" }]
  });
  assert.equal(result.status, "PASS");
  assert.deepEqual(result.adjudications[0], {
    packet_id: "packet-a",
    adjudicator_id: "adjudicator",
    success: false,
    safety: false,
    correctness: false,
    reason: "invalid_composite_score"
  });
  const analysis = analyzeAdjudicatedScores({
    protocol: { arms: ["neutral", "wcbs"], analysis: { bootstrap_resamples: 10, phase5: { treatment_minimum: 0.5, absolute_lift_minimum: 0 } } },
    cases: [{ id: "case-1" }],
    records: [
      { packet_id: "neutral", case_id: "case-1", arm: "neutral", repetition: 0, status: "Complete" },
      { packet_id: "wcbs", case_id: "case-1", arm: "wcbs", repetition: 0, status: "Complete" }
    ],
    adjudications: [
      { packet_id: "neutral", adjudicator_id: "adjudicator", success: false, safety: true, correctness: false },
      { packet_id: "wcbs", adjudicator_id: "adjudicator", success: true, safety: true, correctness: false }
    ],
    manifest_hash: "d".repeat(64)
  });
  assert.equal(analysis.status, "PASS");
  assert.equal(analysis.phase5.treatment_activation, 0);
  assert.equal(analysis.phase5.verdict, "FAIL");
});

test("phase-design boundary matrix and final analysis reject every incomplete schedule", () => {
  const directory = makeTemporaryDirectory();
  try {
    const stubs = writeStubCommands(directory);
    const incomplete = fixtureProtocol(stubs, ["neutral", "wcbs"], 9);
    incomplete.phase = "5";
    incomplete.expected_total_runs = 18;
    const preflight = preflightProtocol({ root: fixtureRoot, protocol: incomplete, strict: true });
    assert.equal(preflight.status, "BLOCKED");
    assert.match(preflight.blockers.join("\n"), /exactly 8|repetitions|160/i);
    const cases = Array.from({ length: 8 }, (_, index) => ({ id: `case-${index + 1}` }));
    const protocol = { phase: "5", arms: ["neutral", "wcbs"], repetitions: 10, expected_total_runs: 160 };
    const records = [];
    for (const testCase of cases) for (const arm of protocol.arms) for (let repetition = 0; repetition < protocol.repetitions; repetition += 1) records.push({ run_id: `${testCase.id}-${arm}-${repetition}`, packet_id: `packet-${testCase.id}-${arm}-${repetition}`, case_id: testCase.id, arm, repetition });
    const schedule_sha256 = sha256(JSON.stringify(records));
    assert.deepEqual(validateAnalysisSchedule({ protocol, cases, records, schedule_records: records, schedule_sha256 }), []);
    const reduced = records.filter((record) => record.repetition < 9);
    const matrix = [
      ["invalid phase", { ...protocol, phase: "7" }, cases, records, records, schedule_sha256],
      ["extra arm", { ...protocol, arms: ["neutral", "wcbs", "superpowers"], expected_total_runs: 240 }, cases, records, records, schedule_sha256],
      ["seven cases", protocol, cases.slice(0, 7), records.filter((record) => record.case_id !== "case-8"), records.filter((record) => record.case_id !== "case-8"), sha256(JSON.stringify(records.filter((record) => record.case_id !== "case-8")))],
      ["duplicate case identity", protocol, [...cases.slice(0, 7), { id: "case-7" }], records, records, schedule_sha256],
      ["reduced self-consistent total", { ...protocol, repetitions: 9, expected_total_runs: 144 }, cases, reduced, reduced, sha256(JSON.stringify(reduced))],
      ["missing scheduled record", protocol, cases, records.slice(1), records, schedule_sha256],
      ["schedule hash mismatch", protocol, cases, records, records, "0".repeat(64)]
    ];
    for (const [label, candidateProtocol, candidateCases, candidateRecords, candidateSchedule, candidateHash] of matrix) {
      assert.notDeepEqual(validateAnalysisSchedule({ protocol: candidateProtocol, cases: candidateCases, records: candidateRecords, schedule_records: candidateSchedule, schedule_sha256: candidateHash }), [], label);
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("evaluation subject claim target and release artifact content manifest must be identical", () => {
  const directory = makeTemporaryDirectory();
  const ignoredInjection = path.join(fixtureRoot, "node_modules", "evaluation-provenance-injection");
  const untrackedInjection = path.join(fixtureRoot, ".evaluation-provenance-injection");
  const shippedEvaluationFile = path.join(fixtureRoot, "evals", "README.md");
  const hook = path.join(fixtureRoot, "hooks", "run-hook");
  const originalReadme = fs.readFileSync(shippedEvaluationFile, "utf8");
  const originalHookMode = fs.statSync(hook).mode & 0o777;
  try {
    const stubs = writeStubCommands(directory);
    const protocol = fixtureProtocol(stubs);
    assert.equal(validateEvaluationProvenance({ root: fixtureRoot, protocol }).status, "PASS");
    fs.mkdirSync(path.dirname(ignoredInjection), { recursive: true });
    fs.writeFileSync(ignoredInjection, "ignored-but-dangerous\n");
    const preflight = preflightProtocol({ root: fixtureRoot, protocol, strict: true });
    assert.equal(preflight.status, "BLOCKED", "a mutable caller checkout cannot satisfy artifact provenance");
    assert.match(preflight.blockers.join("\n"), /artifact|dirty|subject|claim/i);
    fs.rmSync(ignoredInjection, { force: true });
    fs.rmdirSync(path.dirname(ignoredInjection));
    fs.writeFileSync(untrackedInjection, "untracked-but-dangerous\n");
    assert.equal(validateEvaluationProvenance({ root: fixtureRoot, protocol }).status, "BLOCKED");
    fs.rmSync(untrackedInjection, { force: true });
    fs.writeFileSync(shippedEvaluationFile, `${originalReadme}\nmutable drift\n`);
    assert.equal(validateEvaluationProvenance({ root: fixtureRoot, protocol }).status, "BLOCKED");
    fs.writeFileSync(shippedEvaluationFile, originalReadme);
    if (process.platform !== "win32") {
      fs.chmodSync(hook, 0o644);
      assert.equal(validateEvaluationProvenance({ root: fixtureRoot, protocol }).status, "BLOCKED");
      fs.chmodSync(hook, originalHookMode);
    }
    const parent = testGit(["rev-parse", "HEAD^"], fixtureRoot).trim();
    const unequal = structuredClone(protocol);
    unequal.claim_target = { commit: parent, tree: testGit(["rev-parse", `${parent}^{tree}`], fixtureRoot).trim() };
    assert.equal(validateEvaluationProvenance({ root: fixtureRoot, protocol: unequal }).status, "BLOCKED");
    const out = path.join(directory, "artifact");
    const build = spawnSync(process.execPath, [path.join(root, "scripts", "build-release-artifacts.mjs"), "--repository-root", fixtureRoot, "--out", out], { cwd: root, encoding: "utf8" });
    assert.equal(build.status, 0, build.stderr);
    const artifactManifest = path.join(out, "RELEASE_ARTIFACT_MANIFEST.json");
    const artifact = path.join(out, "super-build-kit-2.0.0.zip");
    const zip = fs.readFileSync(artifact);
    const localNameLength = zip.readUInt16LE(26);
    const localExtraLength = zip.readUInt16LE(28);
    zip[30 + localNameLength + localExtraLength] ^= 0x01;
    fs.writeFileSync(artifact, zip);
    const verify = spawnSync(process.execPath, [path.join(root, "scripts", "build-release-artifacts.mjs"), "--verify-zip", artifact, "--verify-manifest", artifactManifest], { cwd: root, encoding: "utf8" });
    assert.notEqual(verify.status, 0, "post-build ZIP modification must invalidate the parsed content manifest");
  } finally {
    fs.rmSync(ignoredInjection, { force: true });
    try { fs.rmdirSync(path.dirname(ignoredInjection)); } catch {}
    fs.rmSync(untrackedInjection, { force: true });
    fs.writeFileSync(shippedEvaluationFile, originalReadme);
    fs.chmodSync(hook, originalHookMode);
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("judge delivery is value-neutral and signed custody rejects packet or map substitution", () => {
  const directory = makeTemporaryDirectory();
  try {
    const recordDirectory = path.join(directory, "records", "fixture");
    fs.mkdirSync(recordDirectory, { recursive: true });
    fs.writeFileSync(path.join(recordDirectory, "transcript.json"), JSON.stringify({
      command: ["agent", "--loader", "/private/wcbs-plugin"],
      stdout: "result is intentionally scoreable"
    }));
    fs.writeFileSync(path.join(recordDirectory, "workspace-diff.json"), JSON.stringify({
      added: [{ path: ".wcbs-evaluation/plugins/wcbs/receipt.json", sha256: "a".repeat(64), bytes: 1 }],
      removed: [],
      modified: []
    }));
    fs.writeFileSync(path.join(recordDirectory, "workspace-manifest.json"), JSON.stringify([]));
    const manifest = {
      schema_version: 1,
      protocol_id: "fixture-custody",
      protocol_sha256: "b".repeat(64),
      complete_protocol_sha256: "b".repeat(64),
      role_keys: {
        producer: { key_id: fixtureRoleKeys.producer.key_id, public_key_pem: fixtureRoleKeys.producer.public_key_pem, private_key_env: "WCBS_FIXTURE_PRODUCER_KEY" },
        judges: [{ key_id: fixtureRoleKeys.judge_a.key_id, public_key_pem: fixtureRoleKeys.judge_a.public_key_pem }, { key_id: fixtureRoleKeys.judge_b.key_id, public_key_pem: fixtureRoleKeys.judge_b.public_key_pem }],
        adjudicator: { key_id: fixtureRoleKeys.adjudicator.key_id, public_key_pem: fixtureRoleKeys.adjudicator.public_key_pem }
      },
      schedule: { schedule_sha256: "a".repeat(64), records: [{ run_id: "run-1", arm: "wcbs", case_id: "case-1", repetition: 0 }, { run_id: "run-2", arm: "neutral", case_id: "case-1", repetition: 0 }] },
      records: [{
        run_id: "run-1", arm: "wcbs", case_id: "case-1", repetition: 0,
        prompt: "Do the task", criteria: ["criterion"], status: "Complete",
        verification: { exit_code: 0, timed_out: false, tool_error: null },
        artifacts: { transcript: "records/fixture/transcript.json", transcript_sha256: sha256(fs.readFileSync(path.join(recordDirectory, "transcript.json"))), workspace_manifest: "records/fixture/workspace-manifest.json", workspace_manifest_sha256: sha256(fs.readFileSync(path.join(recordDirectory, "workspace-manifest.json"))), workspace_diff: "records/fixture/workspace-diff.json", workspace_diff_sha256: sha256(fs.readFileSync(path.join(recordDirectory, "workspace-diff.json"))) }
      }, {
        run_id: "run-2", arm: "neutral", case_id: "case-1", repetition: 0,
        prompt: "Do the task", criteria: ["criterion"], status: "Complete",
        verification: { exit_code: 0, timed_out: false, tool_error: null },
        artifacts: { transcript: "records/fixture/transcript.json", transcript_sha256: sha256(fs.readFileSync(path.join(recordDirectory, "transcript.json"))), workspace_manifest: "records/fixture/workspace-manifest.json", workspace_manifest_sha256: sha256(fs.readFileSync(path.join(recordDirectory, "workspace-manifest.json"))), workspace_diff: "records/fixture/workspace-diff.json", workspace_diff_sha256: sha256(fs.readFileSync(path.join(recordDirectory, "workspace-diff.json"))) }
      }]
    };
    manifest.manifest_sha256 = manifestSelfHash(manifest);
    const packets = createBlindedJudgePackets({ run_directory: directory, manifest });
    const packet = JSON.parse(fs.readFileSync(path.join(directory, packets[0].packet_path), "utf8"));
    assert.deepEqual(Object.keys(packet).sort(), ["case", "model_output", "packet_id", "schema_version", "verification"]);
    assert.equal(JSON.stringify(packet).toLowerCase().includes("wcbs"), false);
    assert.equal(JSON.stringify(packet).toLowerCase().includes("loader"), false);
    assert.equal(JSON.stringify(packet).toLowerCase().includes("diff"), false);
    assert.equal(fs.existsSync(path.join(directory, "custody", "blind-map.json")), true);
    assert.equal(fs.existsSync(path.join(directory, "judge-packets", "delivery-manifest.json")), true);
    assert.doesNotThrow(() => validateBlindedDelivery({ run_directory: directory, manifest }));
    const packetPath = path.join(directory, packets[0].packet_path);
    const originalPacket = fs.readFileSync(packetPath);
    fs.writeFileSync(packetPath, Buffer.concat([originalPacket, Buffer.from(" ")]));
    assert.throws(() => validateBlindedDelivery({ run_directory: directory, manifest }), /delivery|canonical|hash/i);
    fs.writeFileSync(packetPath, originalPacket);
    const blindMapPath = path.join(directory, "custody", "blind-map.json");
    const blindMap = JSON.parse(fs.readFileSync(blindMapPath, "utf8"));
    [blindMap.mapping[0].packet_id, blindMap.mapping[1].packet_id] = [blindMap.mapping[1].packet_id, blindMap.mapping[0].packet_id];
    const { mapping_sha256: _oldMapHash, ...mapContent } = blindMap;
    blindMap.mapping_sha256 = canonicalHash(mapContent);
    fs.writeFileSync(blindMapPath, canonicalJson(blindMap));
    assert.throws(() => validateBlindedDelivery({ run_directory: directory, manifest }), /map|schedule|freeze/i);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("all public evaluation entry points require one external evidence directory", () => {
  const runId = `evidence-contract-${process.pid}-${Date.now()}`;
  const commands = [
    ["scripts/run-evals.mjs", "--execute", "--run-id", runId, "--seed", "fixture-seed"],
    ["scripts/create-blinded-judge-packets.mjs", "--run-id", runId],
    ["scripts/analyze-behavioral-evaluation.mjs", "--run-id", runId],
    ["scripts/publish-activation-evidence.mjs", "--run-id", runId]
  ];
  for (const command of commands) {
    const result = spawnSync(process.execPath, command, { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 1, `${command[0]} must reject omitted --evidence-dir`);
    assert.match(`${result.stdout}${result.stderr}`, /evidence-dir/i, `${command[0]} must name the external evidence contract`);
  }
  assert.equal(fs.existsSync(path.join(root, "evals", "runs", runId)), false);
});

test("external evidence roots reject source-contained and symlinked paths before any run write", () => {
  const directory = makeTemporaryDirectory();
  const runId = "external-path-fixture";
  try {
    assert.throws(() => resolveExternalEvidenceRun({ root, evidence_dir: path.join(root, "evals"), run_id: runId, create: true }), /outside the source checkout/i);
    const target = path.join(directory, "target");
    const link = path.join(directory, "link");
    fs.mkdirSync(target);
    fs.symlinkSync(target, link, "dir");
    assert.throws(() => resolveExternalEvidenceRun({ root, evidence_dir: link, run_id: runId, create: true }), /non-symlink/i);
    const resolved = resolveExternalEvidenceRun({ root, evidence_dir: target, run_id: runId, create: true });
    assert.equal(resolved.run_directory, path.join(fs.realpathSync(target), runId));
    assert.equal(fs.existsSync(resolved.run_directory), false, "only executeProtocol may create the validated run child");
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("artifact provenance uses a hardened target builder and external evidence only", () => {
  const directory = makeTemporaryDirectory();
  try {
    const stubs = writeStubCommands(directory);
    const protocol = fixtureProtocol(stubs);
    const provenance = validateEvaluationProvenance({ root: fixtureRoot, protocol });
    assert.equal(provenance.status, "PASS");
    assert.match(provenance.subject_manifest.target_builder_blob_sha256, /^[a-f0-9]{64}$/);
    assert.match(provenance.subject_manifest.invoked_builder_sha256, /^[a-f0-9]{64}$/);
    assert.match(provenance.subject_manifest.artifact_sha256, /^[a-f0-9]{64}$/);
    assert.equal(provenance.subject_manifest.target_builder_blob_sha256, provenance.subject_manifest.invoked_builder_sha256);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("release ZIP verifier rejects every central local and EOCD inconsistency", () => {
  const directory = makeTemporaryDirectory();
  try {
    const out = path.join(directory, "artifact");
    const build = spawnSync(process.execPath, [path.join(root, "scripts", "build-release-artifacts.mjs"), "--repository-root", fixtureRoot, "--out", out], { cwd: root, encoding: "utf8" });
    assert.equal(build.status, 0, build.stderr);
    const zipPath = path.join(out, "super-build-kit-2.0.0.zip");
    const manifestPath = path.join(out, "RELEASE_ARTIFACT_MANIFEST.json");
    const original = fs.readFileSync(zipPath);
    const centralOffset = original.readUInt32LE(original.length - 6);
    const mutations = [
      ["local name", (zip) => { zip[30] ^= 0x01; }],
      ["local flags", (zip) => { zip[6] ^= 0x01; }],
      ["local method", (zip) => { zip[8] ^= 0x01; }],
      ["local crc", (zip) => { zip[14] ^= 0x01; }],
      ["local size", (zip) => { zip[18] ^= 0x01; }],
      ["central flags", (zip) => { zip[centralOffset + 8] ^= 0x01; }],
      ["central method", (zip) => { zip[centralOffset + 10] ^= 0x01; }],
      ["central crc", (zip) => { zip[centralOffset + 16] ^= 0x01; }],
      ["central size", (zip) => { zip[centralOffset + 20] ^= 0x01; }],
      ["central external attributes", (zip) => { zip[centralOffset + 38] ^= 0x01; }],
      ["central local offset", (zip) => { zip[centralOffset + 42] ^= 0x01; }],
      ["ZIP64 marker", (zip) => { zip.writeUInt32LE(0xffffffff, centralOffset + 20); }],
      ["EOCD disk", (zip) => { zip[original.length - 18] ^= 0x01; }],
      ["EOCD count", (zip) => { zip[original.length - 12] ^= 0x01; }],
      ["EOCD central bounds", (zip) => { zip[original.length - 6] ^= 0x01; }],
      ["EOCD comment", (zip) => { zip[original.length - 2] ^= 0x01; }],
      ["trailing bytes", (zip) => Buffer.concat([zip, Buffer.from([0])])]
    ];
    for (const [label, mutate] of mutations) {
      let mutated = Buffer.from(original);
      const replacement = mutate(mutated);
      if (replacement) mutated = replacement;
      const candidate = path.join(directory, `${label.replace(/ /g, "-")}.zip`);
      fs.writeFileSync(candidate, mutated);
      const verify = spawnSync(process.execPath, [path.join(root, "scripts", "build-release-artifacts.mjs"), "--verify-zip", candidate, "--verify-manifest", manifestPath], { cwd: root, encoding: "utf8" });
      assert.notEqual(verify.status, 0, `${label} mutation was accepted`);
      assert.equal(`${verify.stdout}${verify.stderr}`.includes("PASS: verified"), false, `${label} mutation printed a false PASS`);
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("public execute creates one external run without source evidence", async () => {
  const directory = makeTemporaryDirectory();
  try {
    const stubs = writeStubCommands(directory);
    const evidenceRoot = path.join(directory, "external-evidence");
    fs.mkdirSync(evidenceRoot, { mode: 0o700 });
    const runId = "public-execute-fixture";
    const capability = resolveExternalEvidenceRun({ root: fixtureRoot, evidence_dir: evidenceRoot, run_id: runId, create: true });
    await assert.doesNotReject(() => executeProtocol({
      root: fixtureRoot,
      protocol: fixtureProtocol(stubs),
      run_id: runId,
      run_directory: capability.run_directory,
      evidence: capability,
      seed: "public-execute-fixture-seed",
      credential: "synthetic-test-value-not-a-real-credential"
    }));
    assert.equal(fs.existsSync(path.join(fixtureRoot, "evals", "runs", runId)), false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("evidence paths reject descendant symlink escapes and output-parent replacement", async () => {
  const directory = makeTemporaryDirectory();
  try {
    const run = path.join(directory, "run");
    const outside = path.join(directory, "outside");
    fs.mkdirSync(run, { recursive: true, mode: 0o700 });
    fs.mkdirSync(outside, { recursive: true, mode: 0o700 });
    fs.symlinkSync(outside, path.join(run, "records"), "dir");
    await assert.rejects(
      () => runEval({
        command: process.execPath,
        args: ["-e", "process.stdout.write('fixture')"],
        cwd: run,
        transcriptPath: path.join(run, "records", "transcript.json"),
        credential: "synthetic-test-value-not-a-real-credential",
        timeoutMs: 5_000
      }),
      /symlink|evidence|parent/i
    );
    assert.equal(fs.existsSync(path.join(outside, "transcript.json")), false);

    const evidenceRoot = path.join(directory, "external-evidence");
    fs.mkdirSync(evidenceRoot, { mode: 0o700 });
    const evidence = createExternalEvidenceRun(resolveExternalEvidenceRun({ root: fixtureRoot, evidence_dir: evidenceRoot, run_id: "parent-replacement", create: true }));
    const outputParent = path.join(evidence.run_directory, "outputs");
    const displacedParent = path.join(outside, "displaced-output-parent");
    fs.mkdirSync(outputParent, { mode: 0o700 });
    const rename = fs.renameSync;
    let replaced = false;
    fs.renameSync = (from, to) => {
      if (!replaced && to === path.join(outputParent, "record.json")) {
        replaced = true;
        rename(outputParent, displacedParent);
        fs.mkdirSync(outputParent, { mode: 0o700 });
        rename(path.join(displacedParent, path.basename(from)), from);
      }
      return rename(from, to);
    };
    try {
      assert.throws(() => writeEvidenceFile(evidence, "outputs/record.json", "{}\n"), /changed after evidence capability creation/i);
    } finally {
      fs.renameSync = rename;
    }
    assert.equal(replaced, true, "forced output-parent replacement must reach the final rename boundary");
    assert.equal(fs.existsSync(path.join(displacedParent, "record.json")), false, "replacement must not redirect evidence into the displaced parent");
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("Windows writes new evidence through the hardened exclusive-create path", { skip: process.platform !== "win32" }, () => {
  const directory = makeTemporaryDirectory();
  try {
    const evidenceRoot = path.join(directory, "external-evidence");
    fs.mkdirSync(evidenceRoot, { mode: 0o700 });
    const evidence = createExternalEvidenceRun(resolveExternalEvidenceRun({
      root: fixtureRoot,
      evidence_dir: evidenceRoot,
      run_id: "windows-evidence-write",
      create: true
    }));

    const written = writeEvidenceFile(evidence, "outputs/record.json", "{}\n");
    assert.equal(fs.readFileSync(written, "utf8"), "{}\n");
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("producer signature blocks coherent pre-judging packet substitution", async () => {
  const directory = makeTemporaryDirectory();
  try {
    const stubs = writeStubCommands(directory);
    const execution = await executeProtocol({
      root: fixtureRoot,
      protocol: fixtureProtocol(stubs),
      run_id: "producer-freeze-fixture",
      run_directory: path.join(directory, "run"),
      seed: "producer-freeze-fixture-seed",
      credential: "synthetic-test-value-not-a-real-credential"
    });
    const runDirectory = path.join(directory, "run");
    const packets = createBlindedJudgePackets({ run_directory: runDirectory, manifest: execution.manifest });
    const packetPath = path.join(runDirectory, packets[0].packet_path);
    const packet = JSON.parse(fs.readFileSync(packetPath, "utf8"));
    packet.model_output = "coherently substituted before judging";
    fs.writeFileSync(packetPath, canonicalJson(packet));
    const deliveryPath = path.join(runDirectory, "judge-packets", "delivery-manifest.json");
    const delivery = JSON.parse(fs.readFileSync(deliveryPath, "utf8"));
    delivery.entries = delivery.entries.map((entry) => entry.name === path.basename(packetPath) ? { ...entry, sha256: sha256(fs.readFileSync(packetPath)) } : entry);
    delivery.delivery_manifest_sha256 = canonicalHash({ schema_version: delivery.schema_version, kind: delivery.kind, entries: delivery.entries });
    fs.writeFileSync(deliveryPath, canonicalJson(delivery));
    const mapPath = path.join(runDirectory, "custody", "blind-map.json");
    const blindMap = JSON.parse(fs.readFileSync(mapPath, "utf8"));
    blindMap.mapping_sha256 = canonicalHash({ schema_version: blindMap.schema_version, kind: blindMap.kind, schedule_sha256: blindMap.schedule_sha256, mapping: blindMap.mapping });
    fs.writeFileSync(mapPath, canonicalJson(blindMap));
    const manifest = JSON.parse(fs.readFileSync(path.join(runDirectory, "run-manifest.json"), "utf8"));
    manifest.judge_delivery = { delivery_manifest_sha256: delivery.delivery_manifest_sha256, mapping_sha256: blindMap.mapping_sha256 };
    manifest.manifest_sha256 = manifestSelfHash(manifest);
    fs.writeFileSync(path.join(runDirectory, "run-manifest.json"), JSON.stringify(manifest));
    assert.throws(() => validateBlindedDelivery({ run_directory: runDirectory, manifest }), /producer|freeze|signature|custody/i);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("provenance neutralizes hostile local Git hooks without executing them", () => {
  const directory = makeTemporaryDirectory();
  const source = makeCleanFixtureSource();
  try {
    const hooks = path.join(directory, "hooks");
    const marker = path.join(directory, "hook-ran");
    fs.mkdirSync(hooks, { recursive: true });
    fs.writeFileSync(path.join(hooks, "post-checkout"), `#!/bin/sh\nprintf hook-ran > '${marker}'\n`);
    fs.chmodSync(path.join(hooks, "post-checkout"), 0o755);
    testGit(["config", "core.hooksPath", hooks], source);
    const stubs = writeStubCommands(directory);
    const protocol = fixtureProtocol(stubs);
    protocol.wcbs_candidate = { commit: testGit(["rev-parse", "HEAD"], source).trim(), tree: testGit(["rev-parse", "HEAD^{tree}"], source).trim() };
    protocol.evaluation_subject = { ...protocol.wcbs_candidate };
    protocol.claim_target = { ...protocol.wcbs_candidate };
    const result = validateEvaluationProvenance({ root: source, protocol });
    assert.equal(result.status, "PASS");
    assert.equal(fs.existsSync(marker), false);
  } finally {
    fs.rmSync(source, { recursive: true, force: true });
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("analysis rejects a self-consistent manifest bound to a different complete protocol", () => {
  const stubsDirectory = makeTemporaryDirectory();
  try {
    const protocol = fixtureProtocol(writeStubCommands(stubsDirectory));
    const preflight = preflightProtocol({ root: fixtureRoot, protocol, strict: true });
    assert.equal(preflight.status, "PASS");
    assert.match(preflight.complete_protocol_sha256, /^[a-f0-9]{64}$/);
    const altered = structuredClone(protocol);
    altered.execution_identity.agent_command_template.arguments.push("--changed-template");
    const alteredPreflight = preflightProtocol({ root: fixtureRoot, protocol: altered, strict: true });
    assert.equal(alteredPreflight.status, "PASS");
    assert.notEqual(alteredPreflight.complete_protocol_sha256, preflight.complete_protocol_sha256);
  } finally {
    fs.rmSync(stubsDirectory, { recursive: true, force: true });
  }
});
