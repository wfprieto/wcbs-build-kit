import fs from "node:fs";
import path from "node:path";
import { validateAgainstSchema } from "./json-schema.mjs";

export const BOOTSTRAP_ARTIFACTS = Object.freeze({
  certificate: { file: "bootstrap-certificate.json", schema: "bootstrap-certificate.schema.json" },
  capability: { file: "capability-resolution.json", schema: "capability-resolution.schema.json" },
  goals: { file: "elite-goals-ledger.json", schema: "elite-goals-ledger.schema.json" },
  evidence: { file: "evidence-ledger.jsonl", schema: "evidence-ledger.schema.json", jsonl: true },
  team: { file: "engineering-team.json", schema: "engineering-team.schema.json" },
  profile: { file: "project-profile.json", schema: "project-profile.schema.json" },
  risks: { file: "risk-register.json", schema: "risk-register.schema.json" },
  release: { file: "release-state.json", schema: "release-state.schema.json" }
});

const normalizeText = (content) => content.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
const readJson = (file) => JSON.parse(normalizeText(fs.readFileSync(file, "utf8")));

export function certificateInvariantErrors(certificate, goals, controller) {
  const errors = [];
  if (!certificate) return errors;
  if (certificate.initialization_verdict === "PASS") {
    for (const input of certificate.inputs ?? []) {
      if (input.mandatory === true && ["Unknown", "Not Run", "Blocked"].includes(input.state)) {
        errors.push(`PASS forbidden: mandatory input ${input.id} is ${input.state}`);
      }
    }
    if ((certificate.unresolved_blockers ?? []).length > 0) errors.push("PASS forbidden: unresolved blockers remain");
    if ((certificate.degradations ?? []).length > 0) errors.push("PASS forbidden: degradations cap verdict at CONDITIONAL PASS");
    if (goals?.goals?.some((goal) => goal.applicable && goal.evidence_state === "Not Run")) {
      errors.push("PASS forbidden: an applicable Elite Goal is Not Run");
    }
  }
  if (controller && JSON.stringify(certificate.rehydration_set) !== JSON.stringify(controller.rehydration_set)) {
    errors.push("certificate rehydration_set does not match Controller declaration");
  }
  return errors;
}

export function validateBootstrapArtifactSet(root, artifactDir, { requireComplete = false } = {}) {
  const errors = [];
  const documents = {};
  const schemaDir = path.join(root, "runtime_adapters", "schemas");
  const controllerPath = path.join(root, "00_start_here", "bootstrap-controller.json");

  if (!fs.existsSync(artifactDir)) return { errors, documents, present: false };

  for (const [name, contract] of Object.entries(BOOTSTRAP_ARTIFACTS)) {
    const artifactPath = path.join(artifactDir, contract.file);
    if (!fs.existsSync(artifactPath)) {
      if (requireComplete) errors.push(`${artifactPath} is missing required bootstrap artifact ${contract.file}`);
      continue;
    }

    let schema;
    try { schema = readJson(path.join(schemaDir, contract.schema)); }
    catch (error) { errors.push(`${contract.schema} could not be loaded: ${error.message}`); continue; }

    if (contract.jsonl) {
      const raw = normalizeText(fs.readFileSync(artifactPath, "utf8"));
      const lines = raw.split("\n").filter((line) => line.trim() !== "");
      documents[name] = [];
      lines.forEach((line, index) => {
        let value;
        try { value = JSON.parse(line); }
        catch (error) { errors.push(`${artifactPath} line ${index + 1} is not valid JSON: ${error.message}`); return; }
        documents[name].push(value);
        for (const violation of validateAgainstSchema(schema, value)) {
          errors.push(`${artifactPath} line ${index + 1} violates ${contract.schema}: ${violation}`);
        }
      });
      continue;
    }

    let value;
    try { value = readJson(artifactPath); }
    catch (error) { errors.push(`${artifactPath} is not valid JSON: ${error.message}`); continue; }
    documents[name] = value;
    for (const violation of validateAgainstSchema(schema, value)) {
      errors.push(`${artifactPath} violates ${contract.schema}: ${violation}`);
    }
  }

  let controller = null;
  try { controller = readJson(controllerPath); }
  catch (error) { errors.push(`${controllerPath} could not be loaded: ${error.message}`); }
  for (const violation of certificateInvariantErrors(documents.certificate, documents.goals, controller)) {
    errors.push(`${path.join(artifactDir, "bootstrap-certificate.json")} violates bootstrap invariants: ${violation}`);
  }

  return { errors, documents, present: true };
}
