import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildClaudeInvocation } from "../claude-eval-agent.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-claude-agent-test-"));
test.after(() => fs.rmSync(root, { recursive: true, force: true }));
const executable = path.join(root, "claude.exe");
fs.writeFileSync(executable, "fixture executable");
const executableSha256 = crypto.createHash("sha256").update(fs.readFileSync(executable)).digest("hex");
const workspace = path.join(root, "workspace");
const wcbsPlugin = path.join(workspace, "wcbs-plugin");
const superpowersPlugin = path.join(workspace, "superpowers-plugin");
fs.mkdirSync(wcbsPlugin, { recursive: true });
fs.mkdirSync(superpowersPlugin, { recursive: true });

const base = { executable, executableSha256, workspace, wcbsPlugin, superpowersPlugin, model: "claude-sonnet-5", prompt: "Implement the task." };

test("Claude evaluation arms differ only in the assigned plugin directory", () => {
  const neutral = buildClaudeInvocation({ ...base, arm: "neutral" });
  const wcbs = buildClaudeInvocation({ ...base, arm: "wcbs" });
  const superpowers = buildClaudeInvocation({ ...base, arm: "superpowers" });
  const pluginArgs = (args) => args.flatMap((value, index) => value === "--plugin-dir" ? [args[index + 1]] : []);
  assert.deepEqual(pluginArgs(neutral.args), []);
  assert.deepEqual(pluginArgs(wcbs.args), [wcbsPlugin]);
  assert.deepEqual(pluginArgs(superpowers.args), [superpowersPlugin]);
  const common = (args) => args.filter((value, index) => value !== "--plugin-dir" && args[index - 1] !== "--plugin-dir");
  assert.deepEqual(common(neutral.args), common(wcbs.args));
  assert.deepEqual(common(neutral.args), common(superpowers.args));
  assert.equal(neutral.command, executable);
  assert.ok(neutral.args.includes("--max-budget-usd"));
  assert.ok(neutral.args.includes("--no-session-persistence"));
});

test("Claude evaluation rejects a mismatched executable and missing arm plugin", () => {
  assert.throws(() => buildClaudeInvocation({ ...base, arm: "wcbs", executableSha256: "0".repeat(64) }), /hash mismatch/i);
  assert.throws(() => buildClaudeInvocation({ ...base, arm: "superpowers", superpowersPlugin: path.join(root, "missing") }), /plugin directory/i);
  assert.throws(() => buildClaudeInvocation({ ...base, arm: "invalid" }), /arm/i);
});
