import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { execFileSync, spawnSync } from "node:child_process";
import test from "node:test";

import {
  analyzeAdjudicatedScores,
  createBlindedJudgePackets,
  createRandomSchedule,
  deterministicUnitInterval,
  executeProtocol,
  preflightProtocol,
  resolveGitExecutable,
  validateScoreLedgers
} from "../lib/evaluation-protocol.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const gitExecutable = resolveGitExecutable();
const fixtureCandidate = {
  commit: execFileSync(gitExecutable, ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
  tree: execFileSync(gitExecutable, ["rev-parse", "HEAD^{tree}"], { cwd: root, encoding: "utf8" }).trim()
};
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

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
    control_project_manifest_sha256: sha256(fs.readFileSync(path.join(root, "evals", "control-project-manifest.json"))),
    wcbs_candidate: { ...fixtureCandidate },
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
    scoring_rubric: { path: "evals/behavioral-scoring-rubric.json", sha256: sha256(fs.readFileSync(path.join(root, "evals", "behavioral-scoring-rubric.json"))) },
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
  execFileSync(gitExecutable, ["init"], { cwd: fixture, stdio: "pipe" });
  execFileSync(gitExecutable, ["config", "user.email", "fixture@example.invalid"], { cwd: fixture, stdio: "pipe" });
  execFileSync(gitExecutable, ["config", "user.name", "Fixture"], { cwd: fixture, stdio: "pipe" });
  fs.writeFileSync(path.join(fixture, "README.md"), "pinned superpowers fixture\n");
  execFileSync(gitExecutable, ["add", "README.md"], { cwd: fixture, stdio: "pipe" });
  execFileSync(gitExecutable, ["commit", "-m", "pinned fixture"], { cwd: fixture, stdio: "pipe" });
  const identity = {
    commit: execFileSync(gitExecutable, ["rev-parse", "HEAD"], { cwd: fixture, encoding: "utf8" }).trim(),
    tree: execFileSync(gitExecutable, ["rev-parse", "HEAD^{tree}"], { cwd: fixture, encoding: "utf8" }).trim()
  };
  const mutateHead = () => {
    fs.writeFileSync(path.join(fixture, "MUTATED.txt"), "must not be archived\n");
    execFileSync(gitExecutable, ["add", "MUTATED.txt"], { cwd: fixture, stdio: "pipe" });
    execFileSync(gitExecutable, ["commit", "-m", "mutated head"], { cwd: fixture, stdio: "pipe" });
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

test("Gate 0C treatment staging uses a Git-archived candidate and V2 wcbs plugin installation, never the V1 adapter installer", async () => {
  const directory = makeTemporaryDirectory();
  try {
    const stubs = writeStubCommands(directory);
    const result = await executeProtocol({
      root,
      protocol: fixtureProtocol(stubs),
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
    assert.ok(wcbs.artifacts.transcript_sha256);
    assert.ok(fs.existsSync(path.join(directory, "run", wcbs.artifacts.workspace_manifest)));
    assert.ok(fs.existsSync(path.join(directory, "run", wcbs.artifacts.workspace_diff)));
    assert.equal(JSON.stringify(result.manifest).includes("synthetic-test-value-not-a-real-credential"), false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("evaluation fixtures derive their WCBS candidate identity from the checkout tip", () => {
  assert.equal(fixtureCandidate.commit, execFileSync(gitExecutable, ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim());
  assert.equal(fixtureCandidate.tree, execFileSync(gitExecutable, ["rev-parse", "HEAD^{tree}"], { cwd: root, encoding: "utf8" }).trim());
});

test("evaluator Git resolution prefers an explicit configured command", () => {
  const configured = "C:\\WCBS Tools\\git.exe";
  const installedGit = "C:\\Program Files\\Git\\cmd\\git.exe";
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

test("evaluator Git resolution prefers a verified Git-for-Windows ProgramFiles path before a false-positive PATH probe", () => {
  const programFiles = "C:\\Program Files";
  const expected = path.win32.join(programFiles, "Git", "cmd", "git.exe");
  const probes = [];
  const executable = resolveGitExecutable({
    env: { ProgramFiles: programFiles, PATH: "C:\\Windows\\System32" },
    platform: "win32",
    exists: (candidate) => candidate === expected,
    probe: (candidate) => { probes.push(candidate); return candidate === expected || candidate === "git.exe"; }
  });
  assert.equal(executable, expected);
  assert.deepEqual(probes, [expected]);
});

test("three-arm protocol rejects a missing fixed Superpowers source identity and emits 240 scheduled records only when all identities are complete", () => {
  const directory = makeTemporaryDirectory();
  try {
    const stubs = writeStubCommands(directory);
    const superpowers = createSuperpowersFixture(directory);
    const protocol = fixtureProtocol(stubs, ["neutral", "wcbs", "superpowers"], 10, superpowers.identity);
    protocol.cases = JSON.parse(fs.readFileSync(path.join(root, "evals", "gate-0c-cases.json"), "utf8")).cases.map((entry) => ({ ...entry, criteria: entry.activation }));
    protocol.expected_total_runs = 240;
    const blocked = preflightProtocol({ root, protocol, superpowers_source: null, strict: false });
    assert.equal(blocked.status, "BLOCKED");
    assert.match(blocked.blockers.join("\n"), /superpowers-source/i);
    const ready = preflightProtocol({ root, protocol, superpowers_source: superpowers.root, strict: true });
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
      root,
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
      root,
      protocol,
      run_id: "fixture-failure-as-data",
      run_directory: path.join(directory, "run"),
      seed: "fixture-seed-failure-as-data",
      credential: "synthetic-test-value-not-a-real-credential"
    });
    assert.equal(execution.status, "PASS");
    assert.equal(execution.manifest.records.every((record) => record.status === "Failed"), true);
    const corrupt = execution.manifest.records[0];
    fs.writeFileSync(path.join(directory, "run", corrupt.artifacts.workspace_manifest), "not-json");
    const packets = createBlindedJudgePackets({ run_directory: path.join(directory, "run"), manifest: execution.manifest });
    const failedPacket = JSON.parse(fs.readFileSync(path.join(directory, "run", packets[0].packet_path), "utf8"));
    assert.equal(failedPacket.failure_as_data, true);
    assert.equal(failedPacket.artifact_errors.length, 1);
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
      root,
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
      root,
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
    const blocked = preflightProtocol({ root, protocol: adversarial, strict: true });
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
      root,
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
  const runDirectory = path.join(root, "evals", "runs", runId);
  const stubsDirectory = makeTemporaryDirectory();
  try {
    const stubs = writeStubCommands(stubsDirectory);
    const protocol = fixtureProtocol(stubs);
    const execution = await executeProtocol({
      root,
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
    fs.writeFileSync(path.join(runDirectory, "case-registry.json"), JSON.stringify({ cases: protocol.cases.map((entry) => ({ id: entry.id, prompt: entry.prompt, activation: entry.criteria })) }));
    const cliProtocol = { ...protocol, case_registry: `evals/runs/${runId}/case-registry.json` };
    delete cliProtocol.cases;
    fs.writeFileSync(path.join(runDirectory, "protocol.json"), JSON.stringify(cliProtocol));
    const protocolPath = `evals/runs/${runId}/protocol.json`;
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
        ["scripts/create-blinded-judge-packets.mjs", "--run-id", runId],
        ["scripts/analyze-behavioral-evaluation.mjs", "--run-id", runId, "--protocol", protocolPath, "--judge-ledger", `evals/runs/${runId}/judge-a.json`, "--judge-ledger", `evals/runs/${runId}/judge-b.json`, "--adjudications", `evals/runs/${runId}/adjudications.json`],
        ["scripts/publish-activation-evidence.mjs", "--run-id", runId, "--protocol", protocolPath]
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
