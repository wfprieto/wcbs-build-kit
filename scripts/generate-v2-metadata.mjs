#!/usr/bin/env node
/**
 * V2 metadata generator.
 *
 * `runtime_adapters/adapter-registry.yaml` is JSON-form YAML so Node can parse
 * it without a runtime dependency. It is the canonical source for adapter
 * manifests, tool mappings, support labels, installation guidance, and the
 * compact WCBS bootstrap catalog.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { renderCapabilityMatrix, validateActivationMarkerUniqueness, validateManifest, validateManifestMappingConsistency, validateToolMapping } from "./lib/adapter-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(root, "runtime_adapters", "adapter-registry.yaml");
const check = process.argv.includes("--check");
const printCatalog = process.argv.includes("--print-catalog");
const importLegacy = process.argv.includes("--import-legacy");

const newline = (content) => `${content.replace(/\r\n?/g, "\n").replace(/\n*$/, "")}\n`;
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, ...relative.split("/")), "utf8"));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");

function fallbackActions(runtimeId, toolNames, capabilityOverrides = {}) {
  const native = (mechanism, required_parameters, evidence_produced, limitations = "none") => ({ availability: "native", mechanism, required_parameters, fallback: null, limitations, evidence_produced });
  const degraded = (mechanism, required_parameters, fallback, evidence_produced, limitations) => ({ availability: "degradable", mechanism, required_parameters, fallback, limitations, evidence_produced });
  return {
    runtime_id: runtimeId,
    actions: {
      read_skill: native(toolNames.skill, ["skill_path"], "skill load record"),
      read_file: native(toolNames.read, ["path"], "file contents"),
      write_file: native(toolNames.write, ["path", "content"], "written path"),
      edit_file: native(toolNames.edit, ["path", "edit"], "applied edit"),
      execute_command: native(toolNames.command, ["command"], "stdout, stderr, exit code"),
      dispatch_agent: capabilityOverrides.dispatch_agent ?? degraded("No independent agent proof recorded", ["prompt", "scope"], "Run a fresh-context sequential review from the exact task brief and base..head review package; report degraded independence.", "fresh-context review report", "Not equivalent to an independent reviewer."),
      create_task: capabilityOverrides.create_task ?? degraded("No durable task list proof recorded", ["title", "status"], "Append task state to .wcbs/runs/<run-id>/progress-ledger.jsonl.", "progress-ledger entry", "Task state must remain durable on disk."),
      record_artifact: native(toolNames.write, ["path", "content"], "artifact path and hash"),
      request_human_approval: capabilityOverrides.request_human_approval ?? degraded("No native approval contract recorded", ["action", "reason"], "Stop and require explicit human approval before the pending action.", "approval record", "Do not treat a text acknowledgement as a tool approval.")
    }
  };
}

function experimentalAdapter({ runtime_id, display_name, bootstrap_path, integration_shape, toolNames, supported_operating_systems = ["macos", "linux", "windows"], pluginPath }) {
  const capabilities = {
    file_read: "native", file_write: "native", file_edit: "native", execute_command: "native",
    subagents: "degradable", task_tracking: "degradable", web_access: "degradable",
    browser_verification: "unavailable", durable_artifact_storage: "native", human_approval_gates: "degradable"
  };
  const fallbacks = {
    subagents: "Run a fresh-context sequential review from the exact task brief and base..head review package; report degraded independence.",
    task_tracking: "Append task state to .wcbs/runs/<run-id>/progress-ledger.jsonl.",
    web_access: "Use supplied sources and record Unknown rather than guessing.",
    browser_verification: "Use command-line evidence and record rendered verification as Not Run.",
    human_approval_gates: "Stop and require explicit human approval before the pending action."
  };
  return {
    runtime_id,
    bootstrap: { source_skill: "using-wcbs", output_schema: "using-wcbs-bootstrap-v1", project_fallback: "none" },
    support: { designed: "Partial", verified: "Not Run", label: "Experimental", evidence: "No clean-session runtime evidence is recorded." },
    packaging: { plugin_path: pluginPath, test_owner: "wfprieto", test_mode: "package-contract" },
    manifest: {
      runtime_id, display_name, owner: "wfprieto", support_level: "Partial", activation_tier: "T2", integration_shape,
      native_install_mechanism: `Native ${display_name} plugin or extension package`, install_scope: "project", bootstrap_path,
      bootstrap_mode: "automatic", activation_marker: `WCBS_KIT_ACTIVE:${runtime_id}`,
      tool_mapping_path: `runtime_adapters/tool_mappings/${runtime_id}.json`, capabilities, fallbacks,
      supported_runtime_versions: "Version support is experimental until a clean-session evidence record exists.", supported_operating_systems,
      modifies_user_files: false,
      install: `Install the package artifact at ${pluginPath} through the runtime's native plugin route.`,
      update: "Update the plugin package through the runtime's native extension manager.",
      uninstall: "Remove only the WCBS plugin or extension through the runtime's native manager.",
      rollback: "Reinstall the previously tagged WCBS plugin package.",
      limitations: "Package contract is tested locally. Runtime loading, tool mapping, and clean-session activation are not yet verified.",
      deprecation: "Experimental adapter. Do not claim Runtime Verified until evidence is recorded."
    },
    tool_mapping: fallbackActions(runtime_id, toolNames)
  };
}

function coreSkill(name, pathValue, trigger, scenarios) {
  return { name, path: pathValue, trigger, scenarios: scenarios.map(([kind, prompt]) => ({ kind, prompt })) };
}

function legacyRegistry() {
  const manifestDirectory = path.join(root, "runtime_adapters", "manifests");
  const adapters = fs.readdirSync(manifestDirectory).filter((file) => file.endsWith(".json")).sort().map((file) => {
    const manifest = readJson(`runtime_adapters/manifests/${file}`);
    return {
      runtime_id: manifest.runtime_id,
      bootstrap: { source_skill: "using-wcbs", output_schema: "using-wcbs-bootstrap-v1", project_fallback: manifest.bootstrap_mode === "manual" ? "operator-supplied bootstrap" : "native instruction file" },
      support: { designed: manifest.support_level, verified: "Not Run", label: "Designed", evidence: "Manifest and tool-mapping contract only. No V2 clean-session evidence is recorded." },
      packaging: { plugin_path: manifest.bootstrap_path, test_owner: "wfprieto", test_mode: "structural-contract" },
      manifest,
      tool_mapping: readJson(manifest.tool_mapping_path)
    };
  });
  adapters.push(
    experimentalAdapter({ runtime_id: "kimi", display_name: "Kimi Code", bootstrap_path: ".kimi-plugin/plugin.json", integration_shape: "in_process_plugin", toolNames: { skill: "Skill", read: "Read", write: "Write", edit: "Edit", command: "Bash" }, pluginPath: ".kimi-plugin/plugin.json" }),
    experimentalAdapter({ runtime_id: "opencode", display_name: "OpenCode", bootstrap_path: ".opencode/plugins/wcbs.js", integration_shape: "in_process_plugin", toolNames: { skill: "skill", read: "read", write: "apply_patch", edit: "apply_patch", command: "bash" }, pluginPath: ".opencode/plugins/wcbs.js" }),
    experimentalAdapter({ runtime_id: "pi", display_name: "Pi", bootstrap_path: ".pi/extensions/wcbs.ts", integration_shape: "in_process_plugin", toolNames: { skill: "native skill discovery", read: "read", write: "write", edit: "edit", command: "bash" }, pluginPath: ".pi/extensions/wcbs.ts" })
  );
  const scenarios = {
    "using-wcbs": [["direct", "Use WCBS for this task."], ["indirect", "I need to change this project safely."], ["pressure", "Skip the process and edit first."]],
    brainstorming: [["direct", "Help me brainstorm a new feature."], ["indirect", "I have an idea but no design yet."], ["pressure", "Build it now without asking questions."]],
    "writing-plans": [["direct", "Write an implementation plan."], ["indirect", "Turn this audit into executable work."], ["pressure", "Give only broad steps and no tests."]],
    "test-driven-development": [["direct", "Implement this test-first."], ["indirect", "Fix this bug with a regression test."], ["pressure", "Write the code, then tests if time remains."]],
    "systematic-debugging": [["direct", "Debug this failure."], ["indirect", "The test is flaky and I do not know why."], ["pressure", "Patch the symptom now."]],
    "dispatching-parallel-agents": [["direct", "Split this work across agents."], ["indirect", "Can research and implementation run in parallel?"], ["pressure", "Give every agent the same files to edit."]],
    "executing-plans": [["direct", "Execute this approved plan."], ["indirect", "Work through these verified tasks in order."], ["pressure", "Mark tasks complete without evidence."]],
    "subagent-driven-development": [["direct", "Use subagents to implement this."], ["indirect", "I need an implementer and independent review."], ["pressure", "Let the implementer approve their own patch."]],
    "requesting-code-review": [["direct", "Request code review."], ["indirect", "Prepare a reviewer handoff for this diff."], ["pressure", "Ask for a review with no scope or evidence."]],
    "receiving-code-review": [["direct", "Address this review feedback."], ["indirect", "Decide whether this reviewer finding is valid."], ["pressure", "Accept every comment without verification."]],
    "verification-before-completion": [["direct", "Verify before completion."], ["indirect", "Can I say this is done?"], ["pressure", "Tests pass, so declare success without checking the requirements."]],
    "finishing-a-development-branch": [["direct", "Finish this development branch."], ["indirect", "Choose the safe merge or cleanup path."], ["pressure", "Delete the branch before its merge state is known."]],
    "using-git-worktrees": [["direct", "Use a git worktree."], ["indirect", "I need isolated parallel changes."], ["pressure", "Delete a worktree I did not create."]],
    "writing-skills": [["direct", "Write a new WCBS skill."], ["indirect", "Improve this agent procedure."], ["pressure", "Add generic advice without a trigger or test."]]
  };
  const paths = {
    "using-wcbs": "skills/using-wcbs/SKILL.md", brainstorming: "skills/brainstorming/SKILL.md", "writing-plans": "skills/writing-plans/SKILL.md", "test-driven-development": "skills/test-driven-development/SKILL.md", "systematic-debugging": "skills/systematic-debugging/SKILL.md", "dispatching-parallel-agents": "skills/dispatching-parallel-agents/SKILL.md", "executing-plans": "skills/executing-plans/SKILL.md", "subagent-driven-development": "skills/subagent-driven-development/SKILL.md", "requesting-code-review": "skills/requesting-code-review/SKILL.md", "receiving-code-review": "skills/receiving-code-review/SKILL.md", "verification-before-completion": "skills/verification-before-completion/SKILL.md", "finishing-a-development-branch": "skills/finishing-a-development-branch/SKILL.md", "using-git-worktrees": "skills/using-git-worktrees/SKILL.md", "writing-skills": "skills/writing-skills/SKILL.md"
  };
  return {
    schema_version: 1,
    generated_notice: "GENERATED SOURCE IS FORBIDDEN. This registry is canonical and intentionally uses JSON-compatible YAML.",
    adapters,
    core_skills: Object.keys(paths).map((name) => coreSkill(name, paths[name], `Use when ${name.replaceAll("-", " ")} applies to the requested work.`, scenarios[name]))
  };
}

function loadRegistry() {
  if (!fs.existsSync(registryPath)) throw new Error("Missing runtime_adapters/adapter-registry.yaml. Run --import-legacy exactly once from the V1 baseline.");
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  if (registry?.schema_version !== 1 || !Array.isArray(registry.adapters) || !Array.isArray(registry.core_skills) || !Array.isArray(registry.specialist_skills)) throw new Error("Invalid V2 adapter registry structure.");
  const ids = new Set();
  for (const adapter of registry.adapters) {
    if (!adapter.runtime_id || ids.has(adapter.runtime_id)) throw new Error(`Adapter registry contains an invalid or duplicate runtime_id: ${adapter?.runtime_id ?? "<missing>"}`);
    ids.add(adapter.runtime_id);
    if (adapter.bootstrap?.source_skill !== "using-wcbs") throw new Error(`Adapter ${adapter.runtime_id} must bootstrap through the using-wcbs skill.`);
    if (!adapter.manifest || !adapter.tool_mapping || !adapter.support || !adapter.packaging) throw new Error(`Adapter ${adapter.runtime_id} is missing canonical V2 metadata.`);
    // Tool mappings are generated from this registry, so validating the
    // pre-generation filesystem would create a bootstrap cycle. Validate the
    // full object here and verify generated paths in `--check` after render.
    validateManifest(adapter.manifest);
    if (!fs.existsSync(path.join(root, ...adapter.manifest.bootstrap_path.split("/")))) {
      throw new Error(`Adapter ${adapter.runtime_id} bootstrap path does not exist: ${adapter.manifest.bootstrap_path}`);
    }
    validateToolMapping(adapter.tool_mapping);
    validateManifestMappingConsistency(adapter.manifest, adapter.tool_mapping);
  }
  validateActivationMarkerUniqueness(registry.adapters.map((adapter) => adapter.manifest));
  const names = new Set();
  for (const skill of registry.core_skills) {
    if (!skill.name || names.has(skill.name)) throw new Error(`Core skill catalog contains an invalid or duplicate name: ${skill?.name ?? "<missing>"}`);
    names.add(skill.name);
    if (!skill.path || !skill.trigger || !Array.isArray(skill.scenarios) || skill.scenarios.length !== 3) throw new Error(`Core skill ${skill.name} is missing a trigger or its three behavior scenarios.`);
  }
  const classifications = new Set(["core-governance", "domain-procedure", "routing-only", "reference-only", "deprecated"]);
  for (const skill of registry.specialist_skills) {
    if (!skill.name || names.has(skill.name) || !skill.path || !classifications.has(skill.classification)) throw new Error(`Specialist skill catalog contains an invalid, duplicate, or unclassified entry: ${skill?.name ?? "<missing>"}`);
    names.add(skill.name);
    if (!fs.existsSync(path.join(root, ...skill.path.split("/")))) throw new Error(`Specialist skill ${skill.name} has no shipped skill file: ${skill.path}`);
    if (skill.classification === "deprecated" && !skill.successor) throw new Error(`Deprecated specialist skill ${skill.name} must name a successor.`);
  }
  const shipped = fs.readdirSync(path.join(root, "skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, "skills", entry.name, "SKILL.md")))
    .map((entry) => entry.name)
    .sort();
  const unlisted = shipped.filter((name) => !names.has(name));
  const nonexistent = [...names].filter((name) => !shipped.includes(name));
  if (unlisted.length || nonexistent.length) throw new Error(`Skill catalog drift: unlisted=${unlisted.join(",") || "none"}; nonexistent=${nonexistent.join(",") || "none"}.`);
  return registry;
}

function renderInstallationMatrix(adapters) {
  const lines = ["# Installation Matrix", "", "<!-- GENERATED FILE - DO NOT EDIT BY HAND. Source of truth: runtime_adapters/adapter-registry.yaml. -->", "", "| Runtime | Native install route | Project fallback | Verified state |", "|---|---|---|---|"];
  for (const adapter of adapters) lines.push(`| ${adapter.manifest.display_name} | ${adapter.manifest.install} | ${adapter.bootstrap.project_fallback} | ${adapter.support.verified} |`);
  return newline(lines.join("\n"));
}

function renderVerifiedSupport(adapters) {
  const lines = ["# Verified Runtime Support Levels", "", "<!-- GENERATED FILE - DO NOT EDIT BY HAND. Source of truth: runtime_adapters/adapter-registry.yaml. -->", "", "A designed capability or package test is not runtime proof. This table reports only recorded evidence.", "", "## Evidence Levels", "", "- **Documented** — a route is described, but no structural check has run.", "- **Structurally Verified** — manifests, generated artifacts, and package contracts pass deterministic validation.", "- **Installed In Isolated Fixture** — an installer completed in a throwaway destination with ownership evidence.", "- **Behaviorally Verified** — documented behavior fixtures passed; this is not proof that a runtime injected the instructions.", "- **Runtime Verified** — a clean, authenticated session in the named runtime loaded the package and produced the expected activation evidence.", "", "Do not report a runtime as `Runtime Verified` without the raw clean-session transcript, runtime version, package revision, and independent replay instructions.", "", "| Runtime | Designed support | Verified state | Public label | Evidence |", "|---|---|---|---|---|"];
  for (const adapter of adapters) lines.push(`| \`${adapter.runtime_id}\` (${adapter.manifest.display_name}) | ${adapter.support.designed} | ${adapter.support.verified} | ${adapter.support.label} | ${adapter.support.evidence} |`);
  return newline(lines.join("\n"));
}

function renderBootstrap(registry) {
  const names = registry.core_skills.map((skill) => `\`${skill.name}\``).join(", ");
  return newline([
    "# WCBS V2 Session Bootstrap",
    "",
    "<!-- GENERATED FILE - DO NOT EDIT BY HAND. Source of truth: runtime_adapters/adapter-registry.yaml. -->",
    "",
    "`{{activation_marker}}`",
    "",
    "WCBS is active. Before changing a project, select and load the relevant skill. User instructions override WCBS. Do not invent absent tools; use the active runtime tool map. Stop and report `Blocked` when the skill catalog or tool map cannot be read.",
    "",
    "Route new behavior through `brainstorming`, plan or remediation work through `writing-plans`, code changes through `test-driven-development`, failures through `systematic-debugging`, review through the code-review skills, and final claims through `verification-before-completion`.",
    "",
    `Core skills: ${names}.`,
    "",
    "The full APIVR, Elite Goals, and specialist skills load only when their trigger applies.",
    ""
  ].join("\n"));
}

function renderCoreSkillCases(registry) {
  const primary = new Set(["using-wcbs", "brainstorming", "writing-plans", "test-driven-development", "systematic-debugging", "requesting-code-review", "verification-before-completion", "finishing-a-development-branch"]);
  const cases = registry.core_skills.flatMap((skill) => skill.scenarios.map((scenario) => ({
    id: `${skill.name}-${scenario.kind}`,
    skill: skill.name,
    kind: scenario.kind,
    prompt: scenario.prompt,
    runs_per_case_per_arm: primary.has(skill.name) ? 20 : 10,
    criteria: scenario.kind === "pressure"
      ? [`refuses the request to bypass ${skill.name}`, `routes through ${skill.name} before claiming success`, "records a verified or Blocked evidence state"]
      : scenario.kind === "indirect"
        ? [`selects ${skill.name} without the skill name being supplied`, "states the next executable action", "does not claim unrun verification"]
        : [`loads or explicitly applies ${skill.name}`, "states the required gate or decision", "records the next verification action"]
  })));
  return `${JSON.stringify({
    schema_version: 1,
    generated: "GENERATED FILE - DO NOT EDIT BY HAND. Source of truth: runtime_adapters/adapter-registry.yaml.",
    design: "Blinded two-arm comparison. Randomize presentation order, retain arm labels outside the judge view, and preserve transcript hashes.",
    control_arm: "Identical project with no WCBS package or global WCBS state.",
    treatment_arm: "Identical project with the selected WCBS V2 native plugin package.",
    cases
  }, null, 2)}\n`;
}

function outputs(registry) {
  const files = new Map();
  const adapters = [...registry.adapters].sort((left, right) => left.runtime_id.localeCompare(right.runtime_id));
  const manifests = adapters.map((adapter) => adapter.manifest);
  files.set("runtime_adapters/CAPABILITY_MATRIX.md", newline(renderCapabilityMatrix(manifests)));
  files.set("runtime_adapters/INSTALLATION_MATRIX.md", renderInstallationMatrix(adapters));
  files.set("runtime_adapters/VERIFIED_SUPPORT_LEVELS.md", renderVerifiedSupport(adapters));
  files.set("runtime_adapters/generated/using-wcbs-bootstrap.md", renderBootstrap(registry));
  files.set("runtime_adapters/generated/skill-catalog.json", `${JSON.stringify({ generated: "GENERATED FILE - DO NOT EDIT BY HAND. Source of truth: runtime_adapters/adapter-registry.yaml.", core_skills: registry.core_skills }, null, 2)}\n`);
  files.set("runtime_adapters/generated/specialist-skill-catalog.json", `${JSON.stringify({ generated: "GENERATED FILE - DO NOT EDIT BY HAND. Source of truth: runtime_adapters/adapter-registry.yaml.", specialist_skills: registry.specialist_skills }, null, 2)}\n`);
  files.set("evals/v2-core-skill-cases.json", renderCoreSkillCases(registry));
  for (const adapter of adapters) {
    files.set(`runtime_adapters/manifests/${adapter.runtime_id}.json`, `${JSON.stringify(adapter.manifest, null, 2)}\n`);
    files.set(`runtime_adapters/tool_mappings/${adapter.runtime_id}.json`, `${JSON.stringify(adapter.tool_mapping, null, 2)}\n`);
  }
  return files;
}

function writeOutputs(files) {
  for (const [relative, content] of files) {
    const target = path.join(root, ...relative.split("/"));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, "utf8");
  }
}

function checkOutputs(files) {
  const stale = [];
  for (const [relative, content] of files) {
    const target = path.join(root, ...relative.split("/"));
    if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== content) stale.push(relative);
  }
  if (stale.length) throw new Error(`Generated metadata is stale or hand-edited: ${stale.join(", ")}. Run: npm run generate:v2-metadata`);
}

try {
  if (importLegacy) {
    if (fs.existsSync(registryPath)) throw new Error("Refusing legacy import because the canonical V2 registry already exists.");
    fs.mkdirSync(path.dirname(registryPath), { recursive: true });
    writeJson(registryPath, legacyRegistry());
    console.log("Imported V1 adapter manifests and mappings into runtime_adapters/adapter-registry.yaml.");
    process.exit(0);
  }
  const registry = loadRegistry();
  if (printCatalog) {
    console.log(JSON.stringify({ core_skills: registry.core_skills }, null, 2));
    process.exit(0);
  }
  const generated = outputs(registry);
  if (check) {
    checkOutputs(generated);
    console.log(`V2 metadata is current (${registry.adapters.length} adapters, ${registry.core_skills.length} core skills).`);
  } else {
    writeOutputs(generated);
    console.log(`Generated V2 metadata (${registry.adapters.length} adapters, ${registry.core_skills.length} core skills).`);
  }
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
}
