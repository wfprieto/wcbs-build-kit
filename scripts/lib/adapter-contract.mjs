/**
 * Canonical adapter-contract validation for the WCBS Super Build Kit.
 *
 * Manifests are the source of truth. CAPABILITY_MATRIX.md is generated from them.
 * Zero third-party dependencies (package.json must stay dependency-free).
 */

import fs from "node:fs";
import path from "node:path";

export const SUPPORT_LEVELS = ["Full", "Partial", "Manual", "Unsupported"];
export const INTEGRATION_SHAPES = ["session_start_hook","in_process_plugin","always_on_instruction_file","hybrid"];
export const BOOTSTRAP_MODES = ["automatic", "manual"];
export const AVAILABILITY = ["native", "degradable", "unavailable"];
export const ESSENTIAL_CAPABILITIES = ["file_read","file_write","file_edit","execute_command"];
export const OPTIONAL_CAPABILITIES = ["subagents","task_tracking","web_access","browser_verification","durable_artifact_storage","human_approval_gates"];
export const ALL_CAPABILITIES = [...ESSENTIAL_CAPABILITIES, ...OPTIONAL_CAPABILITIES];
export const REQUIRED_ACTIONS = ["read_skill","read_file","write_file","edit_file","execute_command","dispatch_agent","create_task","record_artifact","request_human_approval"];
const REQUIRED_MANIFEST_FIELDS = ["runtime_id","display_name","owner","support_level","integration_shape","native_install_mechanism","install_scope","bootstrap_path","bootstrap_mode","activation_marker","tool_mapping_path","capabilities","fallbacks","supported_runtime_versions","supported_operating_systems","modifies_user_files","install","update","uninstall","rollback","limitations","deprecation"];
class ContractError extends Error {}
const bad = (msg) => { throw new ContractError(msg); };

export function validateManifest(manifest, { root } = {}) {
  if (!manifest || typeof manifest !== "object") bad("manifest must be an object");
  for (const field of REQUIRED_MANIFEST_FIELDS) if (manifest[field] === undefined || manifest[field] === null) bad(`manifest missing required field: ${field}`);
  const id = manifest.runtime_id;
  if (!SUPPORT_LEVELS.includes(manifest.support_level)) bad(`invalid support_level for ${id}: ${manifest.support_level}`);
  if (!INTEGRATION_SHAPES.includes(manifest.integration_shape)) bad(`invalid integration_shape for ${id}: ${manifest.integration_shape}`);
  if (!BOOTSTRAP_MODES.includes(manifest.bootstrap_mode)) bad(`invalid bootstrap_mode for ${id}: ${manifest.bootstrap_mode}`);
  for (const cap of ALL_CAPABILITIES) {
    const value = manifest.capabilities?.[cap];
    if (!value) bad(`manifest ${id} does not classify capability: ${cap}`);
    if (!AVAILABILITY.includes(value)) bad(`manifest ${id} has invalid availability for ${cap}: ${value}`);
  }
  for (const cap of ALL_CAPABILITIES) {
    const value = manifest.capabilities[cap];
    if (value === "native") continue;
    const fallback = manifest.fallbacks?.[cap];
    if (!fallback || String(fallback).trim() === "") bad(`manifest ${id}: capability ${cap} is ${value} but declares no fallback`);
  }
  const essentialMissing = ESSENTIAL_CAPABILITIES.filter((cap) => manifest.capabilities[cap] === "unavailable");
  if (essentialMissing.length > 0 && manifest.support_level !== "Unsupported") bad(`manifest ${id}: essential capability unavailable (${essentialMissing.join(", ")}) so support_level must be Unsupported, not ${manifest.support_level}`);
  if (["Full", "Partial"].includes(manifest.support_level) && manifest.bootstrap_mode !== "automatic") bad(`manifest ${id}: support_level ${manifest.support_level} requires bootstrap_mode "automatic"; a runtime needing a pasted prompt or remembered command is at most Manual`);
  if (manifest.support_level === "Full") {
    const degraded = OPTIONAL_CAPABILITIES.filter((cap) => manifest.capabilities[cap] !== "native");
    if (degraded.length > 0) bad(`manifest ${id}: Full requires all optional capabilities native; degraded or unavailable: ${degraded.join(", ")} (use Partial)`);
  }
  if (typeof manifest.modifies_user_files !== "boolean") bad(`manifest ${id}: modifies_user_files must be a boolean`);
  if (!Array.isArray(manifest.supported_operating_systems) || manifest.supported_operating_systems.length === 0) bad(`manifest ${id}: supported_operating_systems must be a non-empty array`);
  if (root) {
    if (!fs.existsSync(path.join(root, manifest.bootstrap_path))) bad(`manifest ${id}: bootstrap_path does not exist: ${manifest.bootstrap_path}`);
    if (!fs.existsSync(path.join(root, manifest.tool_mapping_path))) bad(`manifest ${id}: tool_mapping_path does not exist: ${manifest.tool_mapping_path}`);
  }
  return true;
}

export function validateToolMapping(mapping) {
  if (!mapping || typeof mapping !== "object") bad("tool mapping must be an object");
  if (!mapping.runtime_id) bad("tool mapping missing runtime_id");
  if (!mapping.actions || typeof mapping.actions !== "object") bad(`tool mapping ${mapping.runtime_id} missing actions`);
  const id = mapping.runtime_id;
  const present = Object.keys(mapping.actions).filter((k) => mapping.actions[k] !== undefined);
  for (const action of REQUIRED_ACTIONS) if (!present.includes(action)) bad(`tool mapping ${id} missing required action: ${action}`);
  for (const action of present) {
    if (!REQUIRED_ACTIONS.includes(action)) bad(`tool mapping ${id} declares an undeclared action: ${action}`);
    const spec = mapping.actions[action];
    if (!AVAILABILITY.includes(spec.availability)) bad(`tool mapping ${id}.${action}: invalid availability: ${spec.availability}`);
    if (!spec.mechanism || String(spec.mechanism).trim() === "") bad(`tool mapping ${id}.${action}: missing mechanism`);
    if (spec.availability !== "native" && (!spec.fallback || String(spec.fallback).trim() === "")) bad(`tool mapping ${id}.${action}: availability is ${spec.availability} but no fallback is declared; agents may not invent a tool`);
  }
  return true;
}

export const CAPABILITY_TO_ACTION = {file_read:"read_file",file_write:"write_file",file_edit:"edit_file",execute_command:"execute_command",subagents:"dispatch_agent",task_tracking:"create_task",durable_artifact_storage:"record_artifact",human_approval_gates:"request_human_approval"};
export function validateManifestMappingConsistency(manifest, mapping) {
  const id = manifest.runtime_id;
  if (mapping.runtime_id !== id) bad(`manifest ${id} is paired with a mapping for ${mapping.runtime_id}`);
  for (const [capability, action] of Object.entries(CAPABILITY_TO_ACTION)) {
    const declared = manifest.capabilities?.[capability];
    const mapped = mapping.actions?.[action]?.availability;
    if (!declared || !mapped) continue;
    if (declared !== mapped) bad(`manifest ${id}: capability ${capability} is "${declared}" but tool mapping action ${action} is "${mapped}". A capability and the action implementing it are the same fact; disagreement overstates support in the generated capability matrix.`);
  }
  return true;
}

export function validateActivationMarkerUniqueness(manifests) {
  const seen = new Map();
  for (const manifest of manifests) {
    const marker = manifest.activation_marker;
    const id = manifest.runtime_id;
    const expected = `WCBS_KIT_ACTIVE:${id}`;
    if (marker !== expected) bad(`manifest ${id}: activation_marker must be exactly "${expected}", got "${marker}". A near-match marker cannot prove which adapter loaded.`);
    if (seen.has(marker)) bad(`activation_marker "${marker}" is not unique: used by both ${seen.get(marker)} and ${id}. A shared marker proves some kit loaded, not which adapter loaded.`);
    seen.set(marker, id);
  }
  return true;
}

export function loadManifests(root) {
  const dir = path.join(root, "runtime_adapters", "manifests");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}
const cell = (manifest, cap) => {
  const value = manifest.capabilities[cap];
  if (value === "native") return "native";
  const fallback = manifest.fallbacks?.[cap] ?? "no fallback declared";
  return `${value} — ${fallback}`;
};
export function renderCapabilityMatrix(manifests) {
  const lines = [];
  lines.push("# Capability Matrix", "", "<!-- GENERATED FILE - DO NOT EDIT BY HAND. Source of truth: runtime_adapters/manifests/*.json. Regenerate with: npm run generate:matrix -->", "", "This file is generated from the runtime manifests. Editing it by hand creates a second source of truth and will fail `npm run verify`.", "", "## Support Levels", "", "| Runtime | Support | Integration shape | Bootstrap | Install scope | Modifies user files |", "|---|---|---|---|---|---|");
  for (const m of manifests) lines.push(`| ${m.display_name} (\`${m.runtime_id}\`) | **${m.support_level}** | ${m.integration_shape} | ${m.bootstrap_mode} | ${m.install_scope} | ${m.modifies_user_files ? "yes" : "no"} |`);
  lines.push("", "A file's existence does not imply Full or Partial support. See `runtime_adapters/PORTABILITY_CONTRACT.md`.", "", "## Essential Capabilities", "", "An adapter with any essential capability unavailable is `Unsupported`.", "", `| Runtime | ${ESSENTIAL_CAPABILITIES.join(" | ")} |`, `|---|${ESSENTIAL_CAPABILITIES.map(() => "---").join("|")}|`);
  for (const m of manifests) lines.push(`| \`${m.runtime_id}\` | ${ESSENTIAL_CAPABILITIES.map((c) => cell(m, c)).join(" | ")} |`);
  lines.push("", "## Optional Capabilities And Exact Fallbacks", "", "Every `degradable` or `unavailable` cell states its exact fallback. Agents may not invent a tool.", "", `| Runtime | ${OPTIONAL_CAPABILITIES.join(" | ")} |`, `|---|${OPTIONAL_CAPABILITIES.map(() => "---").join("|")}|`);
  for (const m of manifests) lines.push(`| \`${m.runtime_id}\` | ${OPTIONAL_CAPABILITIES.map((c) => cell(m, c)).join(" | ")} |`);
  lines.push("", "## Known Limitations", "");
  for (const m of manifests) lines.push(`- **${m.display_name}**: ${m.limitations}`);
  lines.push("");
  return lines.join("\n");
}
export { ContractError };
