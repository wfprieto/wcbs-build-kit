#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { RUNTIME_PROOF_TIER_IDS, buildRuntimeProofPacks } from "./generate-runtime-proof-packs.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const option = (name, fallback) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
};
const catalogPath = path.resolve(option("catalog", path.join(root, "runtime_adapters", "RUNTIME_PROOF_PACKS.json")));
const blockers = [];
let catalog;
try { catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8")); }
catch (error) { blockers.push(`catalog cannot be read: ${error.message}`); }

if (catalog) {
  const expected = buildRuntimeProofPacks();
  if (catalog.schema_version !== 1) blockers.push("catalog schema_version must equal 1.");
  if (JSON.stringify(catalog.evidence_tier_order) !== JSON.stringify(RUNTIME_PROOF_TIER_IDS)) blockers.push("catalog must declare the five ordered evidence tiers.");
  const expectedIds = expected.packs.map((entry) => entry.runtime_id);
  const expectedByRuntime = new Map(expected.packs.map((entry) => [entry.runtime_id, entry]));
  const actualIds = Array.isArray(catalog.packs) ? catalog.packs.map((entry) => entry?.runtime_id).sort() : [];
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) blockers.push("catalog must contain exactly one proof pack for every registry runtime.");
  for (const pack of catalog.packs ?? []) {
    const expectedPack = expectedByRuntime.get(pack?.runtime_id);
    if (JSON.stringify(pack?.evidence_tiers?.map((tier) => tier?.id)) !== JSON.stringify(RUNTIME_PROOF_TIER_IDS)) blockers.push(`${pack?.runtime_id ?? "unknown runtime"} must contain the five ordered evidence tiers.`);
    if (!pack?.clean_install?.required || !/no prior WCBS-owned state/i.test(pack.clean_install.acceptance_criterion ?? "")) blockers.push(`${pack?.runtime_id ?? "unknown runtime"} clean-install procedure is incomplete.`);
    if (!expectedPack || JSON.stringify(pack.native_lifecycle) !== JSON.stringify(expectedPack.native_lifecycle)) blockers.push(`${pack?.runtime_id ?? "unknown runtime"} native lifecycle must match the canonical adapter registry.`);
    if (!expectedPack || JSON.stringify(pack.runtime_registration) !== JSON.stringify(expectedPack.runtime_registration)) blockers.push(`${pack?.runtime_id ?? "unknown runtime"} runtime registration must match the canonical adapter registry.`);
    if (!expectedPack || JSON.stringify(pack.representative_invocation) !== JSON.stringify(expectedPack.representative_invocation)) blockers.push(`${pack?.runtime_id ?? "unknown runtime"} representative invocation must match the canonical tool mapping.`);
    if (!/WCBS-owned/i.test(pack?.uninstall?.acceptance_criterion ?? "")) blockers.push(`${pack?.runtime_id ?? "unknown runtime"} uninstall criterion must protect non-WCBS files.`);
    if (!Array.isArray(pack?.evidence_manifest?.required_fields) || !["runtime_version", "wcbs_package_identity", "evidence_location_or_sha256", "reviewer", "evidence_state"].every((field) => pack.evidence_manifest.required_fields.includes(field))) blockers.push(`${pack?.runtime_id ?? "unknown runtime"} evidence manifest is incomplete.`);
    if (!["Verified", "Likely", "Suspected", "Unknown", "Not Run", "Blocked"].includes(pack?.clean_session_evidence?.state)) blockers.push(`${pack?.runtime_id ?? "unknown runtime"} clean-session evidence state is invalid.`);
  }
}

if (blockers.length) {
  for (const blocker of blockers) console.error(`FAIL: ${blocker}`);
  process.exit(1);
}
console.log(`PASS: ${catalog.packs.length} runtime proof packs are complete and fail-closed.`);
