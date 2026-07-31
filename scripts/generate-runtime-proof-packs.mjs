#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(root, "runtime_adapters", "adapter-registry.yaml");
const outputPath = path.join(root, "runtime_adapters", "RUNTIME_PROOF_PACKS.json");
const tierIds = ["package_integrity", "structural_lifecycle", "registration", "clean_session_activation", "clean_session_invocation"];
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

function packFor(adapter) {
  const support = adapter.support ?? {};
  const manifest = adapter.manifest ?? {};
  const readSkill = adapter.tool_mapping?.actions?.read_skill ?? {};
  return {
    runtime_id: adapter.runtime_id,
    display_name: adapter.manifest?.display_name ?? adapter.runtime_id,
    designed_support: support.designed ?? "Unknown",
    public_label: support.label ?? "Unknown",
    evidence_tiers: [
      { id: "package_integrity", acceptance_criterion: "The exact WCBS package or project-scoped installer identity validates with its owned-file manifest and checksum." },
      { id: "structural_lifecycle", acceptance_criterion: "Install, doctor, smoke, uninstall, and no-residue lifecycle checks pass in an isolated destination." },
      { id: "registration", acceptance_criterion: "A runtime-native registration step is recorded with the exact runtime version and package identity; package presence alone does not satisfy this tier." },
      { id: "clean_session_activation", acceptance_criterion: "A new authenticated vendor session displays the exact runtime marker and canonical startup route without a pasted WCBS prompt." },
      { id: "clean_session_invocation", acceptance_criterion: "The same clean session routes one representative skill or workflow through the runtime-native mechanism, with evidence that distinguishes real routing from text-only file presence." }
    ],
    clean_install: {
      required: true,
      acceptance_criterion: `The target has no prior WCBS-owned state or cached activation; perform the canonical install route: ${manifest.install ?? "not recorded"}. User-owned sentinel files retain their pre-install hashes.`
    },
    native_lifecycle: {
      install_scope: manifest.install_scope ?? "not recorded",
      install: manifest.install ?? "not recorded",
      update: manifest.update ?? "not recorded",
      uninstall: manifest.uninstall ?? "not recorded",
      rollback: manifest.rollback ?? "not recorded"
    },
    runtime_registration: {
      native_install_mechanism: manifest.native_install_mechanism ?? "not recorded",
      bootstrap_path: manifest.bootstrap_path ?? "not recorded",
      bootstrap_mode: manifest.bootstrap_mode ?? "not recorded",
      activation_marker: manifest.activation_marker ?? "not recorded",
      tool_mapping_path: manifest.tool_mapping_path ?? "not recorded",
      package_paths: Object.fromEntries(Object.entries(adapter.packaging ?? {}).filter(([key, value]) => /path$/.test(key) && typeof value === "string"))
    },
    representative_invocation: {
      action: "read_skill",
      mechanism: readSkill.mechanism ?? "not recorded",
      required_parameters: readSkill.required_parameters ?? [],
      evidence_produced: readSkill.evidence_produced ?? "not recorded"
    },
    evidence_manifest: {
      required_fields: ["runtime_id", "runtime_version", "operating_system", "wcbs_package_identity", "timestamp_utc", "command", "expected_result", "actual_result", "evidence_location_or_sha256", "reviewer", "evidence_state"],
      redaction_rule: "Retain only redacted paths, hashes, and replay instructions. Never store credentials, private prompts, or user data in the repository."
    },
    uninstall: {
      acceptance_criterion: `Uninstall and rollback remove only WCBS-owned files while preserving the recorded user-owned sentinels. Canonical uninstall: ${manifest.uninstall ?? "not recorded"} Rollback: ${manifest.rollback ?? "not recorded"}`
    },
    failure_and_rollback: ["partial install", "unsupported runtime", "failed activation", "unavailable credentials or vendor session"],
    clean_session_evidence: {
      state: support.verified === "Runtime Verified" ? "Verified" : "Blocked",
      blocker: support.verified === "Runtime Verified" ? "See retained independent replay evidence in the approved external evidence store." : "A clean authenticated vendor session and independent reviewer record have not been retained."
    }
  };
}

export function buildRuntimeProofPacks(registry = JSON.parse(fs.readFileSync(registryPath, "utf8"))) {
  if (!Array.isArray(registry.adapters) || !registry.adapters.length) throw new Error("adapter registry must contain at least one adapter.");
  return {
    schema_version: 1,
    generated_from: "runtime_adapters/adapter-registry.yaml",
    registry_sha256: sha256(fs.readFileSync(registryPath)),
    evidence_tier_order: tierIds,
    packs: registry.adapters.map(packFor).sort((left, right) => left.runtime_id.localeCompare(right.runtime_id))
  };
}

export const RUNTIME_PROOF_TIER_IDS = tierIds;

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const rendered = `${JSON.stringify(buildRuntimeProofPacks(), null, 2)}\n`;
  if (process.argv.includes("--check")) {
    const actual = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : "";
    if (actual !== rendered) {
      console.error("FAIL: RUNTIME_PROOF_PACKS.json is stale. Run npm run generate:runtime-proof-packs.");
      process.exit(1);
    }
    console.log("PASS: runtime proof packs are current.");
  } else {
    fs.writeFileSync(outputPath, rendered);
    console.log(`Wrote ${path.relative(root, outputPath)}.`);
  }
}
