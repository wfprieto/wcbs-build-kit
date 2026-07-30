import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runEval } from "../lib/eval-runner.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const stub = path.join(root, "scripts", "tests", "fixtures", "eval-runner", "credential-echo-stub.mjs");

function scratch() { return fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-eval-test-")); }

function emittedRepresentations(credential) {
  return [
    credential,
    Buffer.from(credential, "utf8").toString("base64"),
    encodeURIComponent(credential),
    JSON.stringify(credential).slice(1, -1),
    Buffer.from(`agent:${credential}`, "utf8").toString("base64")
  ];
}

test("credential-echoing stub leaves zero credential representations in transcript", async () => {
  const dir = scratch();
  const credential = "wcbs-test-secret-DO-NOT-LEAK-7419";
  const transcriptPath = path.join(dir, "transcript.json");
  try {
    process.env.WCBS_EVAL_SHOULD_NOT_PASS = "inherited-secret-probe";
    const transcript = await runEval({ command: process.execPath, args: [stub], transcriptPath, credential });
    const raw = fs.readFileSync(transcriptPath, "utf8");
    for (const representation of emittedRepresentations(credential)) {
      assert.equal(raw.includes(representation), false, `credential representation leaked: ${representation}`);
    }
    assert.ok((raw.match(/\[REDACTED\]/g) ?? []).length >= 5, "every emitted credential representation must be redacted");
    assert.equal(transcript.exit_code, 0);
    assert.equal(raw.includes("inherited-secret-probe"), false, "non-allowlisted environment variable reached the stub");
  } finally {
    delete process.env.WCBS_EVAL_SHOULD_NOT_PASS;
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("runner blocks protected credential values shorter than twelve characters before execution", async () => {
  const dir = scratch();
  const marker = path.join(dir, "spawned.txt");
  const transcriptPath = path.join(dir, "transcript.json");
  try {
    await assert.rejects(
      runEval({
        command: process.execPath,
        args: ["-e", `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'spawned')`],
        transcriptPath,
        credential: "test"
      }),
      /Blocked: protected credential values must be at least 12 characters/
    );
    assert.equal(fs.existsSync(marker), false, "short credential reached child-process execution");
    assert.equal(fs.existsSync(transcriptPath), false, "blocked run wrote a transcript");
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("runner uses and removes an isolated temporary HOME", async () => {
  const dir = scratch();
  const transcriptPath = path.join(dir, "transcript.json");
  try {
    const transcript = await runEval({ command: process.execPath, args: [stub], transcriptPath, credential: "another-test-secret" });
    const line = transcript.stdout.split("\n").find((entry) => entry.startsWith("{"));
    const payload = JSON.parse(line);
    assert.match(payload.home, /wcbs-eval-home-/);
    assert.equal(fs.existsSync(payload.home), false, "temporary HOME survived runner cleanup");
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("runner publishes transcript atomically without temporary siblings", async () => {
  const dir = scratch();
  const transcriptPath = path.join(dir, "nested", "transcript.json");
  try {
    await runEval({ command: process.execPath, args: [stub], transcriptPath, credential: "atomic-test-secret" });
    assert.equal(fs.existsSync(transcriptPath), true);
    assert.deepEqual(fs.readdirSync(path.dirname(transcriptPath)), ["transcript.json"]);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
