import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const order = ["T4", "T3", "T2", "T1"];
const stateFor = { T1: "ENFORCED", T2: "INSTRUCTED", T3: "REQUESTED", T4: "MANUAL" };
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

export function attestActivationTier({ root, manifest, handoff, env = process.env }) {
  const asserted = handoff.asserted_activation_tier;
  let substantiated = "T4";
  const degradations = [];

  const kernelPresent = fs.existsSync(path.join(root, "BOOTSTRAP.md"));
  if (kernelPresent) substantiated = "T3";

  const instructionPath = path.join(root, manifest.bootstrap_path);
  if (manifest.activation_tier === "T2" && fs.existsSync(instructionPath)) substantiated = "T2";
  if (manifest.activation_tier === "T1") {
    const pluginVar = handoff.delivery_environment === "cursor" ? "CURSOR_PLUGIN_ROOT" : "CLAUDE_PLUGIN_ROOT";
    const pluginRoot = env[pluginVar];
    const expectedAdapter = handoff.tier_asserted_by ? path.join(root, ...handoff.tier_asserted_by.split("/")) : null;
    const rootMatches = pluginRoot && path.resolve(pluginRoot) === path.resolve(root);
    const adapterMatches = expectedAdapter && fs.existsSync(expectedAdapter) && (!handoff.delivery_adapter_sha256 || hash(expectedAdapter) === handoff.delivery_adapter_sha256);
    if (rootMatches && adapterMatches) substantiated = "T1";
    else if (fs.existsSync(instructionPath)) substantiated = "T2";
  }

  if (!order.includes(asserted)) throw new Error(`Unknown asserted activation tier: ${asserted}`);
  const assertedIndex = order.indexOf(asserted), substantiatedIndex = order.indexOf(substantiated);
  const recorded = assertedIndex <= substantiatedIndex ? asserted : substantiated;
  if (recorded !== asserted) {
    degradations.push({
      from: asserted,
      to: recorded,
      reason: "activation assertion was not substantiated by the delivery environment and adapter evidence"
    });
  }
  return { activation_tier: recorded, activation_state: stateFor[recorded], degradations };
}
