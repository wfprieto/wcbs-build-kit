import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { attestActivationTier } from "../lib/tier-attestation.mjs";

const digest = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-tier-"));
  fs.mkdirSync(path.join(root, "hooks"), { recursive: true });
  fs.writeFileSync(path.join(root, "BOOTSTRAP.md"), "kernel\n");
  fs.writeFileSync(path.join(root, "CLAUDE.md"), "instruction\n");
  fs.writeFileSync(path.join(root, "hooks/session-start"), "adapter\n");
  return root;
}
const manifest = { activation_tier: "T1", bootstrap_path: "CLAUDE.md" };

test("over-asserted T1 degrades without plugin root evidence", () => {
  const root = fixture();
  try {
    const result = attestActivationTier({ root, manifest, handoff: { asserted_activation_tier: "T1", delivery_environment: "claude", tier_asserted_by: "hooks/session-start" }, env: {} });
    assert.equal(result.activation_tier, "T2");
    assert.equal(result.activation_state, "INSTRUCTED");
    assert.equal(result.degradations.length, 1);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("hash mismatch degrades asserted T1", () => {
  const root = fixture();
  try {
    const result = attestActivationTier({ root, manifest, handoff: { asserted_activation_tier: "T1", delivery_environment: "claude", tier_asserted_by: "hooks/session-start", delivery_adapter_sha256: "0".repeat(64) }, env: { CLAUDE_PLUGIN_ROOT: root } });
    assert.equal(result.activation_tier, "T2");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("substantiated T1 remains T1", () => {
  const root = fixture();
  try {
    const adapter = path.join(root, "hooks/session-start");
    const result = attestActivationTier({ root, manifest, handoff: { asserted_activation_tier: "T1", delivery_environment: "claude", tier_asserted_by: "hooks/session-start", delivery_adapter_sha256: digest(adapter) }, env: { CLAUDE_PLUGIN_ROOT: root } });
    assert.equal(result.activation_tier, "T1");
    assert.equal(result.activation_state, "ENFORCED");
    assert.deepEqual(result.degradations, []);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
