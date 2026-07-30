import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function render(runtime, shape) {
  return spawnSync(process.execPath, ["scripts/render-session-bootstrap.mjs", "--runtime", runtime, "--shape", shape], { cwd: root, encoding: "utf8" });
}

function parse(result) {
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  return JSON.parse(result.stdout);
}

test("the session bootstrap renderer emits only the Claude hook contract", () => {
  const payload = parse(render("claude", "claude"));
  assert.deepEqual(Object.keys(payload), ["hookSpecificOutput"]);
  assert.equal(payload.hookSpecificOutput.hookEventName, "SessionStart");
  assert.match(payload.hookSpecificOutput.additionalContext, /WCBS_KIT_ACTIVE:claude/);
  assert.doesNotMatch(payload.hookSpecificOutput.additionalContext, /WCBS_KIT_ACTIVE:(?!claude\b)/);
});

test("the session bootstrap renderer emits only the Cursor hook contract", () => {
  const payload = parse(render("cursor", "cursor"));
  assert.deepEqual(Object.keys(payload), ["additional_context"]);
  assert.match(payload.additional_context, /WCBS_KIT_ACTIVE:cursor/);
  assert.doesNotMatch(payload.additional_context, /hookSpecificOutput|additionalContext/);
});

test("the session bootstrap renderer emits only the SDK-standard contract", () => {
  const payload = parse(render("github-copilot", "sdk"));
  assert.deepEqual(Object.keys(payload), ["additionalContext"]);
  assert.match(payload.additionalContext, /WCBS_KIT_ACTIVE:github-copilot/);
  assert.doesNotMatch(payload.additionalContext, /hookSpecificOutput|additional_context/);
});

test("an invalid runtime or output shape fails closed without emitting an activation marker", () => {
  for (const args of [["missing-runtime", "sdk"], ["claude", "invalid-shape"]]) {
    const result = render(...args);
    assert.notEqual(result.status, 0, `${result.stdout}${result.stderr}`);
    assert.doesNotMatch(`${result.stdout}${result.stderr}`, /WCBS_KIT_ACTIVE:/);
    assert.match(result.stderr, /blocked|invalid|unknown/i);
  }
});
