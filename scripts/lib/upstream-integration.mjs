const dispositions = new Set(["ADOPT", "ADAPT", "MERGE", "REPLACE", "REJECT", "DEFER"]);
const evidenceStates = new Set(["Verified", "Likely", "Suspected", "Unknown", "Not Run", "Blocked"]);
const requiredFields = [
  "capability_id", "upstream_path", "component", "trigger_conditions", "inputs_outputs",
  "dependencies", "runtime_assumptions", "upstream_evidence", "known_limitations",
  "wcbs_equivalent", "wcbs_canonical_owner", "assessment", "disposition", "destination_path",
  "license_attribution", "required_wcbs_tests", "apivr_elite_impact", "runtime_support_impact",
  "migration_compatibility", "verification_state", "final_status"
];

export function validateIntegrationMatrix(matrix, { upstreamCommit, upstreamTree, inventory }) {
  const errors = [];
  if (!matrix || typeof matrix !== "object") return { errors: ["matrix must be an object"] };
  if (matrix.upstream?.repository !== "https://github.com/obra/superpowers.git") errors.push("upstream repository must be obra/superpowers");
  if (matrix.upstream?.commit !== upstreamCommit) errors.push("upstream commit must match the governed pin");
  if (!/^[a-f0-9]{40}$/.test(matrix.upstream?.tree ?? "")) errors.push("upstream tree must be a 40-character SHA");
  if (matrix.upstream?.tree !== upstreamTree) errors.push("upstream tree must match the governed pin");
  if (matrix.upstream?.license !== "MIT") errors.push("upstream license must be MIT");
  if (!Array.isArray(matrix.entries)) return { errors: [...errors, "entries must be an array"] };
  if (!inventory || inventory.upstream?.commit !== upstreamCommit || inventory.upstream?.tree !== upstreamTree) errors.push("path inventory must match the governed upstream pin");
  const knownFiles = new Set(inventory?.files ?? []);
  const knownScopes = new Set(inventory?.scopes ?? []);
  for (const entry of matrix.entries) {
    for (const field of requiredFields) if (!(field in entry) || entry[field] === "") errors.push(`capability ${entry.capability_id ?? "unknown"}: missing ${field}`);
    if (!Number.isInteger(entry.capability_id) || entry.capability_id < 1) errors.push("capability_id must be a positive integer");
    if (!dispositions.has(entry.disposition)) errors.push(`capability ${entry.capability_id}: invalid disposition`);
    if (!evidenceStates.has(entry.verification_state)) errors.push(`capability ${entry.capability_id}: invalid verification state`);
    if (entry.disposition === "DEFER" && entry.verification_state === "Verified") errors.push(`capability ${entry.capability_id}: deferred work cannot be Verified`);
    for (const sourcePath of entry.upstream_path.split(";").map((value) => value.trim()).filter(Boolean)) {
      if (!knownFiles.has(sourcePath) && !knownScopes.has(sourcePath)) errors.push(`capability ${entry.capability_id}: upstream path is absent from the pinned inventory: ${sourcePath}`);
    }
  }
  return { errors };
}
