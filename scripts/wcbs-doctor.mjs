#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import {
  loadManifests, renderCapabilityMatrix, validateManifest, validateToolMapping,
  validateManifestMappingConsistency, validateActivationMarkerUniqueness
} from "./lib/adapter-contract.mjs";
import { validateAgainstSchema } from "./lib/json-schema.mjs";
import { validateBootstrapArtifactSet } from "./lib/bootstrap-artifacts.mjs";

const root = process.cwd();
const strict = process.argv.includes("--strict");
const errors = [];
const warnings = [];
const display = p => p.replaceAll("\\", "/");
const resolve = p => path.join(root, ...p.split("/"));
const exists = p => fs.existsSync(resolve(p));
const normalizeText = content => content.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
const read = p => normalizeText(fs.readFileSync(resolve(p), "utf8"));
const fail = message => errors.push(message);
const warn = message => warnings.push(message);
const ignoredDirectoryNames = new Set([".git", ".agents", ".wcbs", "node_modules", "90_archive", "Updates"]);
const registryPath = "runtime_adapters/adapter-registry.yaml";

const requiredFiles = [
  "README.md", "INSTALL.md", "GET_STARTED.md", "MANIFEST.md", "DISTRIBUTION_POLICY.md", "SUPPORT_MATRIX.md", "CHANGELOG.md", "RELEASE_PROCESS.md", "VERSIONING.md", "SECURITY.md", "GET_STARTED.md",
  "BOOTSTRAP.md", "AGENTS.md", "CLAUDE.md", "GEMINI.md", "REPLIT.md", "Manus.md",
  "00_start_here/START_HERE.md", "00_start_here/SOURCE_OF_TRUTH.md", "00_start_here/LOAD_ORDER.md", "00_start_here/KERNEL_CONTRACT.md", "00_start_here/bootstrap-controller.json", "00_start_here/BOOTSTRAP_CONTROLLER.md", "00_start_here/capability-routing.json", "00_start_here/CERTIFICATE_CANONICALIZATION.md",
  "10_governance/APIVR_EXECUTION_LIFECYCLE.md", "10_governance/ELITE_BUILD_GOALS_SUMMARY.md", "10_governance/RELEASE_GATES.md", "10_governance/DUPLICATE_GUIDANCE_BASELINE.json",
  "50_audits/AUDIT_TIER_ROUTER.md", "50_audits/CANONICAL_AUDIT_PROTOCOLS.md",
  "skills/super-build-kit/SKILL.md", "skills/subagent-driven-development/SKILL.md", "skills/writing-skills/SKILL.md",
  "skills/subagent-driven-development/ARTIFACT_CONTRACT.md", "skills/subagent-driven-development/scripts/make-review-package.py",
  ...["implementer", "task-reviewer", "fix-agent", "final-reviewer"].map(x => `skills/subagent-driven-development/prompts/${x}-prompt.md`),
  ...["task-artifact", "review-finding", "progress-ledger"].map(x => `skills/subagent-driven-development/schemas/${x}.schema.json`),
  "skills/subagent-driven-development/tests/test_make_review_package.py",
  ...["PRE_FLIGHT_CONFLICT_REPORT", "TASK_BRIEF", "IMPLEMENTER_REPORT", "TASK_REVIEW_REPORT", "FIX_REPORT", "FINAL_BRANCH_REVIEW"].map(x => `60_templates/${x}_TEMPLATE.md`),
  "60_templates/PROGRESS_LEDGER_TEMPLATE.jsonl",
  "runtime_adapters/README.md", "runtime_adapters/PORTABILITY_CONTRACT.md", "runtime_adapters/PORTING_GUIDE.md", "runtime_adapters/ADAPTER_PULL_REQUEST_CHECKLIST.md", "runtime_adapters/adapter-registry.yaml", "runtime_adapters/CAPABILITY_MATRIX.md", "runtime_adapters/VERIFIED_SUPPORT_LEVELS.md", "runtime_adapters/INSTALLATION_MATRIX.md", "runtime_adapters/ACTIVATION_TESTS.md", "runtime_adapters/generated/using-wcbs-bootstrap.md", "runtime_adapters/generated/runtime-startup-contract.md", "runtime_adapters/generated/skill-catalog.json",
  ...["adapter-manifest", "tool-mapping", "bootstrap-controller", "handoff-envelope", "capability-routing", "bootstrap-certificate", "capability-resolution", "elite-goals-ledger", "evidence-ledger", "project-profile", "engineering-team", "risk-register", "release-state"].map(x => `runtime_adapters/schemas/${x}.schema.json`),
  "60_templates/RELEASE_CANDIDATE_REPORT_TEMPLATE.md", "60_templates/STABLE_RELEASE_REPORT_TEMPLATE.md",
  "docs/USING_THE_SUPER_BUILD_KIT.md", "docs/COMMON_WORKFLOWS.md", "docs/V2_RUNTIME_EVIDENCE.md", "docs/V2_MIGRATION.md", "evals/README.md", "evals/v2-core-skill-preregistration.json", "evals/v2-core-skill-cases.json",
  "scripts/generate-capability-matrix.mjs", "scripts/generate-v2-metadata.mjs", "scripts/render-session-bootstrap.mjs", "scripts/generate-bootstrap-controller.mjs", "scripts/generate-load-order.mjs", "scripts/check-whitespace.mjs", "scripts/run-python-tests.mjs", "scripts/wcbs-system-test.mjs", "scripts/check-install.mjs", "scripts/install-adapter.mjs", "scripts/wcbs.mjs", "scripts/adapter-smoke-test.mjs", "scripts/verify-v2-eval-design.mjs", "scripts/lib/adapter-contract.mjs", "scripts/lib/json-schema.mjs", "scripts/lib/bootstrap-artifacts.mjs", "scripts/lib/certificate-canonicalization.mjs", "scripts/audit-duplicate-guidance.mjs", "scripts/audit-skill-size.mjs", "scripts/audit-skill-contract.mjs", "scripts/audit-layer-budgets.mjs", "scripts/run-evals.mjs", "scripts/publish-activation-evidence.mjs",
  "tests/system/routing-fixtures.json", "tests/system/activation-scenarios.json",
  ...["controller-contract", "adapter-contract", "schema-enforcement", "schema-keyword-support", "bootstrap-fixtures", "long-horizon-memory-contract", "wcbs-doctor", "artifact-bundle", "kernel-contract", "bootstrap-controller", "activation-marker-reachability", "runtime-entry-contract", "skill-contract", "npm-script-entry-points", "v2-registry", "v2-bootstrap-renderer", "wcbs-cli", "native-adapter-packages", "hook-transport", "v2-eval-design"].map(x => `scripts/tests/${x}.test.mjs`),
  "scripts/tests/fixtures/run-bundle/findings.json", "scripts/tests/fixtures/run-bundle/progress-ledger.jsonl", "scripts/tests/fixtures/run-bundle/tasks/T-01/task-artifact.json", "scripts/tests/fixtures/run-bundle/tasks/T-02/task-artifact.json",
  ...["bootstrap-certificate.json", "capability-resolution.json", "elite-goals-ledger.json", "evidence-ledger.jsonl", "engineering-team.json", "project-profile.json", "risk-register.json", "release-state.json"].map(x => `scripts/tests/fixtures/bootstrap/${x}`),
  ".gitattributes", ".gitignore", ".codex-plugin/plugin.json", ".claude-plugin/plugin.json", ".claude-plugin/marketplace.json", ".agents/plugins/marketplace.json", ".kimi-plugin/plugin.json", ".opencode/plugins/wcbs.js", ".pi/extensions/wcbs.ts", ".cursor/rules/super-build-kit.mdc", ".cursor/hooks.json", ".github/copilot-instructions.md", ".github/hooks/wcbs-session-start.json", "hooks/session-start", "hooks/run-hook", "hooks/run-hook.cmd", "hooks/hooks.json",
  ".github/workflows/verify.yml", ".github/workflows/release-check.yml", ".github/RELEASE_CANDIDATE_CHECKLIST.md", ".github/CODEOWNERS", ".github/dependabot.yml",
  "scripts/tests/repository-governance.test.mjs"
];

function json(p) {
  if (!exists(p)) return null;
  try { return JSON.parse(read(p)); }
  catch (error) { fail(`Invalid JSON in ${display(p)}: ${error.message}`); return null; }
}
function checkRequiredFiles() { for (const p of requiredFiles) if (!exists(p)) fail(`Missing required file: ${display(p)}`); }
function checkPackage() {
  const p = json("package.json"); if (!p) return;
  if (p.private !== true) fail("package.json must remain private.");
  for (const key of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"])
    if (p[key] && Object.keys(p[key]).length) fail(`package.json should not add install dependencies; found ${key}.`);
  const expectedScripts = {
    doctor: "node scripts/wcbs-doctor.mjs",
    verify: "node scripts/wcbs-doctor.mjs --strict",
    "check:matrix": "node scripts/generate-capability-matrix.mjs --check",
    "generate:v2-metadata": "node scripts/generate-v2-metadata.mjs",
    "check:v2-metadata": "node scripts/generate-v2-metadata.mjs --check",
    "check:controller": "node scripts/generate-bootstrap-controller.mjs --check",
    "check:load-order": "node scripts/generate-load-order.mjs --check",
    "check:whitespace": "node scripts/check-whitespace.mjs",
    "test:node": "node --test scripts/tests/*.test.mjs",
    "test:python": "node scripts/run-python-tests.mjs",
    "system-test": "node scripts/wcbs-system-test.mjs",
    "check-install": "node scripts/check-install.mjs",
    "behavior-test": "node scripts/run-behavior-fixtures.mjs",
    wcbs: "node scripts/wcbs.mjs",
    eval: "node scripts/run-evals.mjs",
    "eval:strict": "node scripts/run-evals.mjs --strict",
    "eval:publish-evidence": "node scripts/publish-activation-evidence.mjs",
    "eval:core-skills": "node scripts/verify-v2-eval-design.mjs",
    "version:audit": "node scripts/audit-version-drift.mjs",
    "codex:marketplace-check": "node scripts/check-codex-marketplace.mjs",
    "audit:duplicates": "node scripts/audit-duplicate-guidance.mjs",
    "audit:skill-contract": "node scripts/audit-skill-contract.mjs",
    "audit:layers": "node scripts/audit-layer-budgets.mjs",
    "audit:governance": "npm run audit:duplicates && npm run audit:skill-contract && npm run audit:layers",
    test: "npm run test:node && npm run test:python",
    check: "npm run doctor && npm run check:v2-metadata && npm run check:matrix && npm run check:controller && npm run check:load-order && npm run check:whitespace && npm run version:audit && npm run audit:skill-contract && npm run audit:layers && npm run audit:governance && npm run eval && npm run eval:core-skills && npm run behavior-test && npm run test",
    "release-check": "npm run check && npm run system-test && npm run check-install && npm run build:release-artifacts"
  };
  for (const [name, command] of Object.entries(expectedScripts)) if (p.scripts?.[name] !== command) fail(`package.json script ${name} must be exactly: ${command}`);
  for (const manifestPath of [".codex-plugin/plugin.json", ".claude-plugin/plugin.json", ".claude-plugin/marketplace.json", ".agents/plugins/marketplace.json", ".kimi-plugin/plugin.json"]) {
    const manifest = json(manifestPath);
    const versions = manifestPath.endsWith("marketplace.json") && Array.isArray(manifest?.plugins) ? manifest.plugins.map(x => x.version).filter(Boolean) : [manifest?.version].filter(Boolean);
    for (const version of versions) if (version !== p.version) fail(`${manifestPath} version (${version}) must match package.json version (${p.version}).`);
    if (manifestPath.endsWith("marketplace.json") && Array.isArray(manifest?.plugins)) {
      for (const plugin of manifest.plugins) {
        const source = typeof plugin?.source === "string" ? plugin.source : (plugin?.source?.url ?? plugin?.source?.path);
        if (typeof source !== "string") { fail(`${manifestPath} plugin ${plugin?.name ?? "(unnamed)"} must declare a string source.`); continue; }
        if (/^[a-z][a-z0-9+.-]*:\/\//i.test(source)) continue;
        // Codex marketplace local source.path is relative to the marketplace
        // root, whereas Claude's string source is relative to its manifest.
        const isCodexMarketplace = manifestPath === ".agents/plugins/marketplace.json" && plugin?.source?.source === "local";
        const resolved = path.resolve(isCodexMarketplace ? root : path.dirname(resolve(manifestPath)), source);
        if (resolved !== root && !resolved.startsWith(root + path.sep)) fail(`${manifestPath} plugin ${plugin?.name ?? "(unnamed)"} source (${source}) resolves outside the repository root.`);
      }
    }
  }
  if (json(".codex-plugin/plugin.json")?.hooks && JSON.stringify(json(".codex-plugin/plugin.json").hooks) !== "{}") fail(".codex-plugin/plugin.json hooks must be exactly {} to prevent hook auto-discovery.");
}
function checkSkills() {
  const dir = resolve("skills"); if (!fs.existsSync(dir)) { fail("Missing skills directory."); return; }
  const walk = current => { for (const entry of fs.readdirSync(current, { withFileTypes: true })) { const file = path.join(current, entry.name); if (entry.isDirectory()) walk(file); else if (entry.name === "SKILL.md") { const content = normalizeText(fs.readFileSync(file, "utf8")); const relative = display(path.relative(root, file)); if (!content.startsWith("---\n")) fail(`Skill missing YAML frontmatter: ${relative}`); if (!/^name:\s*[a-z0-9-]+$/m.test(content)) fail(`Skill missing valid name field: ${relative}`); if (!/^description:\s*\S.+$/m.test(content)) fail(`Skill missing description field: ${relative}`); } } };
  walk(dir);
}
function checkWiring() {
  const required = new Map([
    ["00_start_here/LOAD_ORDER.md", ["skills/subagent-driven-development/SKILL.md", "runtime_adapters/PORTABILITY_CONTRACT.md", "runtime_adapters/PORTING_GUIDE.md"]],
    ["00_start_here/START_HERE.md", ["Audit wide. Fix narrow. Prove everything.", "skills/subagent-driven-development/SKILL.md", "runtime_adapters/PORTABILITY_CONTRACT.md"]],
    ["runtime_adapters/README.md", ["runtime_adapters/PORTABILITY_CONTRACT.md", "runtime_adapters/PORTING_GUIDE.md", "runtime_adapters/CAPABILITY_MATRIX.md", "runtime_adapters/ADAPTER_PULL_REQUEST_CHECKLIST.md"]],
    ["skills/subagent-driven-development/SKILL.md", ["A fix attempt does not clear a finding", "FIXED_PENDING_REVIEW", "CANNOT_VERIFY_FROM_DIFF", "plan_base_sha..branch_head_sha", "pre-flight conflict scan", "repair budget", "neutrality", "verbatim", "file-based handoff", "skills/subagent-driven-development/prompts/final-reviewer-prompt.md"]],
    ["skills/subagent-driven-development/ARTIFACT_CONTRACT.md", ["task-artifact.json", "task-artifact.schema.json", "exact command, the exit status, and the result"]],
    ["BOOTSTRAP.md", ["00_start_here/bootstrap-controller.json", "handoff envelope", "fail closed"]],
    ["00_start_here/SOURCE_OF_TRUTH.md", ["WCBS Engineering Operating System", "Delivery plane", "Evidence plane"]]
  ]);
  for (const [file, terms] of required) { if (!exists(file)) continue; const content = read(file); for (const term of terms) if (!content.toLowerCase().includes(term.toLowerCase())) fail(`${display(file)} does not define the ${term === "A fix attempt does not clear a finding" ? "material-finding re-review" : `required activation text: ${term}`}.`); }
  const source = read("skills/subagent-driven-development/scripts/make-review-package.py");
  if (source.includes('"--diff"')) fail("skills/subagent-driven-development/scripts/make-review-package.py still accepts a hand-supplied --diff; the review range must be generated from base..head.");
  for (const file of ["skills/subagent-driven-development/SKILL.md", "skills/subagent-driven-development/ARTIFACT_CONTRACT.md", ...requiredFiles.filter(x => x.includes("/prompts/"))]) if (exists(file)) for (const line of read(file).split("\n")) if (line.includes("HEAD~1") && !/prohibit|forbidden|must not|never|reject|do not/i.test(line)) fail(`${display(file)} recommends a shortcut review range (HEAD~1) outside a prohibition.`);
}
function checkEvidenceVocabulary() {
  const source = read("00_start_here/SOURCE_OF_TRUTH.md");
  for (const state of ["Verified", "Likely", "Suspected", "Unknown", "Not Run", "Blocked"]) if (!source.includes(state)) fail(`SOURCE_OF_TRUTH.md does not define evidence state: ${state}`);
  for (const file of ["00_start_here/START_HERE.md", "00_start_here/LOAD_ORDER.md", "skills/super-build-kit/SKILL.md", "skills/subagent-driven-development/SKILL.md"]) if (exists(file)) for (const term of ["Inconclusive", "Not Applicable"]) if (read(file).includes(term)) fail(`${display(file)} uses non-canonical evidence term: ${term}`);
  const kernel = read("BOOTSTRAP.md");
  for (const term of ["PASS", "CONDITIONAL PASS", "PARTIAL", "FAIL", "BLOCKED", "Verified", "Likely", "Suspected", "Unknown", "Not Run", "Blocked"]) if (kernel.includes(term)) fail(`BOOTSTRAP.md contains forbidden lifecycle vocabulary: ${term}`);
}
function loadRegistry() {
  const registry = json(registryPath);
  if (!registry) return null;
  if (registry.schema_version !== 1 || !Array.isArray(registry.adapters) || !Array.isArray(registry.core_skills)) {
    fail(`${registryPath} must define schema_version 1 with adapter and core-skill arrays.`);
    return null;
  }
  return registry;
}
const ACTIVATION_INSTRUCTION_FILES = new Map([
  ["claude", "CLAUDE.md"],
  ["codex", "AGENTS.md"],
  ["cursor", ".cursor/rules/super-build-kit.mdc"],
  ["gemini", "GEMINI.md"],
  ["generic-agent", "BOOTSTRAP.md"],
  ["github-copilot", ".github/copilot-instructions.md"],
  ["manus", "Manus.md"],
  ["replit", "REPLIT.md"]
]);
const NATIVE_ADAPTER_ARTIFACTS = new Map([
  ["kimi", ".kimi-plugin/plugin.json"],
  ["opencode", ".opencode/plugins/wcbs.js"],
  ["pi", ".pi/extensions/wcbs.ts"]
]);
function checkActivationMarkerReachability() {
  const registry = loadRegistry();
  if (!registry) return;
  for (const adapter of registry.adapters) {
    const manifest = adapter.manifest;
    if (!manifest) { fail(`registry adapter ${adapter.runtime_id ?? "(unnamed)"} has no manifest.`); continue; }
    const id = manifest.runtime_id, marker = manifest.activation_marker;
    const file = ACTIVATION_INSTRUCTION_FILES.get(id);
    const nativeArtifact = NATIVE_ADAPTER_ARTIFACTS.get(id);
    if (!file && !nativeArtifact) { fail(`runtime ${id} has no activation artifact; its marker cannot be observed.`); continue; }
    if (nativeArtifact) {
      if (!exists(nativeArtifact)) { fail(`runtime ${id} native activation artifact is missing: ${nativeArtifact}`); continue; }
      const content = read(nativeArtifact);
      if (!content.includes(marker)) fail(`${nativeArtifact} does not contain the activation marker ${marker}; the marker is unreachable for runtime ${id}.`);
      if (!/using-wcbs|using-wcbs-bootstrap/i.test(content)) fail(`${nativeArtifact} does not route runtime ${id} through the using-wcbs bootstrap.`);
      if (id === "kimi" && (!/emit this exact string/i.test(content) || !/first response/i.test(content))) fail(`${nativeArtifact} does not direct the Kimi runtime to emit its marker in the first response.`);
      continue;
    }
    if (!exists(file)) { fail(`runtime ${id} activation instruction file is missing: ${file}`); continue; }
    const content = read(file);
    if (!content.includes(marker)) fail(`${display(file)} does not contain the activation marker ${marker}; the marker is unreachable for runtime ${id}.`);
    if (!/emit this exact string/i.test(content)) fail(`${display(file)} does not instruct the agent to emit its activation marker.`);
    if (!/first response/i.test(content)) fail(`${display(file)} does not state when the activation marker must be emitted.`);
  }
}
function checkHookTransport() {
  for (const relative of ["hooks/session-start", "hooks/run-hook"]) {
    if (!exists(relative)) { fail(`Missing hook transport file: ${relative}`); continue; }
    if (process.platform !== "win32" && (fs.statSync(resolve(relative)).mode & 0o111) === 0) fail(`${relative} is not executable; a bare-path hook invocation receives exit 126.`);
  }
  const posixWrapper = exists("hooks/run-hook") ? read("hooks/run-hook") : "";
  if (!posixWrapper.startsWith("#!/bin/sh\n")) fail("hooks/run-hook must use a direct-execution POSIX sh shebang.");
  if (!/exec bash --noprofile --norc/.test(posixWrapper)) fail("hooks/run-hook must delegate to the canonical Bash transport without adding output.");
  if (posixWrapper.includes("\r\n")) fail("hooks/run-hook must remain LF-only because POSIX parses its shebang.");
  const cmdWrapper = exists("hooks/run-hook.cmd") ? read("hooks/run-hook.cmd") : "";
  if (!cmdWrapper.startsWith(": << 'CMDBLOCK'")) fail("hooks/run-hook.cmd must use the cmd/bash polyglot guard.");
  if (cmdWrapper.includes("\r\n")) fail("hooks/run-hook.cmd must remain LF-only because bash parses its polyglot guard.");
  const claude = json("hooks/hooks.json");
  const claudeCommand = claude?.hooks?.SessionStart?.[0]?.hooks?.[0]?.command ?? "";
  if (!/"\$\{CLAUDE_PLUGIN_ROOT\}\/hooks\/run-hook\.cmd"/.test(claudeCommand) || !/--runtime claude/.test(claudeCommand)) fail("hooks/hooks.json must invoke the quoted Claude transport with --runtime claude.");
  const cursor = json(".cursor/hooks.json");
  if (cursor?.version !== 1 || !Array.isArray(cursor?.hooks?.sessionStart) || cursor.hooks.sessionStart[0]?.command !== "./hooks/run-hook session-start --runtime cursor") fail(".cursor/hooks.json must declare Cursor's POSIX project sessionStart transport.");
  const copilot = json(".github/hooks/wcbs-session-start.json");
  if (!Array.isArray(copilot?.hooks?.sessionStart) || copilot.hooks.sessionStart[0]?.type !== "command" || copilot.hooks.sessionStart[0]?.bash !== "./hooks/run-hook session-start --runtime github-copilot") fail(".github/hooks/wcbs-session-start.json must declare Copilot's POSIX project sessionStart transport.");
  const plugin = json(".claude-plugin/plugin.json");
  if (plugin?.hooks !== "./hooks/hooks.json" || plugin?.skills !== "./skills/") fail(".claude-plugin/plugin.json component paths must resolve from the plugin root without parent traversal.");
}
function schema(p) { return json(p); }
function checkAdapters() {
  const manifestSchema = schema("runtime_adapters/schemas/adapter-manifest.schema.json"), mappingSchema = schema("runtime_adapters/schemas/tool-mapping.schema.json"); if (!manifestSchema || !mappingSchema) return;
  const registry = loadRegistry(); if (!registry) return;
  const manifests = [];
  for (const adapter of registry.adapters) {
    const id = adapter.runtime_id;
    const manifestPath = `runtime_adapters/manifests/${id}.json`, mappingPath = `runtime_adapters/tool_mappings/${id}.json`;
    if (!exists(manifestPath)) { fail(`Missing adapter manifest for claimed runtime: ${manifestPath}`); continue; }
    if (!exists(mappingPath)) { fail(`Missing tool mapping for claimed runtime: ${mappingPath}`); continue; }
    const manifest = json(manifestPath), mapping = json(mappingPath); if (!manifest || !mapping) continue; manifests.push(manifest);
    for (const error of validateAgainstSchema(manifestSchema, manifest)) fail(`${manifestPath} violates adapter-manifest.schema.json: ${error}`);
    for (const error of validateAgainstSchema(mappingSchema, mapping)) fail(`${mappingPath} violates tool-mapping.schema.json: ${error}`);
    try { validateManifest(manifest, { root }); } catch (error) { fail(`Adapter contract violation: ${error.message}`); }
    try { validateToolMapping(mapping); } catch (error) { fail(`Tool mapping violation: ${error.message}`); }
    try { validateManifestMappingConsistency(manifest, mapping); } catch (error) { fail(`Adapter consistency violation: ${error.message}`); }
  }
  try { validateActivationMarkerUniqueness(manifests); } catch (error) { fail(`Activation marker violation: ${error.message}`); }
  const matrix = "runtime_adapters/CAPABILITY_MATRIX.md";
  if (exists(matrix)) { const content = read(matrix); if (!/GENERATED FILE/i.test(content)) fail(`${matrix} is missing its generated-file warning; it must not be hand-authored.`); else if (content.trim() !== renderCapabilityMatrix(loadManifests(root)).trim()) fail(`${matrix} is stale or hand-edited. The adapter registry is canonical. Regenerate with: npm run generate:v2-metadata`); }
}
function checkController() {
  const pairs = [
    ["runtime_adapters/schemas/bootstrap-controller.schema.json", "00_start_here/bootstrap-controller.json"],
    ["runtime_adapters/schemas/capability-routing.schema.json", "00_start_here/capability-routing.json"]
  ];
  for (const [schemaPath, valuePath] of pairs) { const contract = schema(schemaPath), value = json(valuePath); if (!contract || !value) continue; for (const error of validateAgainstSchema(contract, value)) fail(`${valuePath} violates ${schemaPath}: ${error}`); }
  const controller = json("00_start_here/bootstrap-controller.json");
  const expected = ["DISCOVER", "VALIDATE", "VALIDATE_RUNTIME", "LOAD_AUTHORITY", "LOAD_GOVERNANCE", "INITIALIZE_STATE", "CLASSIFY_PROJECT", "RESOLVE_CAPABILITIES", "ASSEMBLE_TEAM", "RUN_PREFLIGHT", "CERTIFY", "HAND_OFF_TO_LIFECYCLE"];
  if (controller && JSON.stringify(controller.states.map(x => x.id)) !== JSON.stringify(expected)) fail("bootstrap-controller.json must define the canonical twelve-state sequence.");
}
function checkVerifiedSupportLevels() {
  const file = "runtime_adapters/VERIFIED_SUPPORT_LEVELS.md"; if (!exists(file)) return; const body = read(file);
  for (const level of ["Documented", "Structurally Verified", "Installed In Isolated Fixture", "Behaviorally Verified", "Runtime Verified"]) if (!body.includes(level)) fail(`${file} must define verified support level: ${level}`);
  const registry = loadRegistry(); if (!registry) return;
  for (const adapter of registry.adapters) if (!body.includes(`| \`${adapter.runtime_id}\` `)) fail(`${file} must include runtime row for ${adapter.runtime_id}.`);
  if (!body.includes("Do not report a runtime as `Runtime Verified`")) fail(`${file} must include the runtime-verification claim rule.`);
}
function checkV2Metadata() {
  const result = spawnSync(process.execPath, [resolve("scripts/generate-v2-metadata.mjs"), "--check"], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) {
    const detail = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
    fail(`V2 generated metadata is stale or invalid. ${detail || "Run: npm run generate:v2-metadata"}`);
  }
}
function checkBundles() {
  const taskSchema = schema("skills/subagent-driven-development/schemas/task-artifact.schema.json"), findingSchema = schema("skills/subagent-driven-development/schemas/review-finding.schema.json"), ledgerSchema = schema("skills/subagent-driven-development/schemas/progress-ledger.schema.json"); if (!taskSchema || !findingSchema || !ledgerSchema) return;
  const bundles = ["scripts/tests/fixtures/run-bundle"], live = resolve(".wcbs/runs"); if (fs.existsSync(live)) for (const name of fs.readdirSync(live)) if (fs.statSync(path.join(live, name)).isDirectory()) bundles.push(`.wcbs/runs/${name}`);
  for (const bundle of bundles) {
    const findingsPath = `${bundle}/findings.json`, ledgerPath = `${bundle}/progress-ledger.jsonl`, tasks = resolve(`${bundle}/tasks`); const ledgerTaskIds = new Set();
    if (exists(findingsPath)) { const findings = json(findingsPath); if (findings) for (const finding of findings) for (const error of validateAgainstSchema(findingSchema, finding)) fail(`${findingsPath} finding ${finding.finding_id} violates review-finding.schema.json: ${error}`); }
    if (exists(ledgerPath)) read(ledgerPath).split("\n").filter(Boolean).forEach((line, index) => { let value; try { value = JSON.parse(line); } catch (error) { fail(`${ledgerPath} line ${index + 1} is not valid JSON: ${error.message}`); return; } ledgerTaskIds.add(value.task_id); for (const error of validateAgainstSchema(ledgerSchema, value)) fail(`${ledgerPath} line ${index + 1} violates progress-ledger.schema.json: ${error}`); });
    if (!fs.existsSync(tasks)) { fail(`${bundle} is missing its tasks directory and machine-readable task artifacts.`); continue; }
    const artifactTaskIds = new Set();
    for (const entry of fs.readdirSync(tasks, { withFileTypes: true })) if (entry.isDirectory()) { const artifactPath = `${bundle}/tasks/${entry.name}/task-artifact.json`; if (!exists(artifactPath)) { fail(`Missing required task artifact: ${artifactPath}`); continue; } const task = json(artifactPath); if (task) { artifactTaskIds.add(task.task_id); for (const error of validateAgainstSchema(taskSchema, task)) fail(`${artifactPath} violates task-artifact.schema.json: ${error}`); } }
    for (const taskId of ledgerTaskIds) if (!artifactTaskIds.has(taskId)) fail(`${bundle} progress ledger references task ${taskId} without a matching task-artifact.json.`);
  }
}
function checkBootstrapArtifacts() {
  const sets = [
    { dir: resolve("scripts/tests/fixtures/bootstrap"), requireComplete: true },
    { dir: resolve(".wcbs"), requireComplete: false }
  ];
  for (const set of sets) {
    const result = validateBootstrapArtifactSet(root, set.dir, { requireComplete: set.requireComplete });
    for (const error of result.errors) fail(display(error));
  }
}
function checkWorkflowFiles() {
  const dir = resolve(".github/workflows"); if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) if (/\.ya?ml$/i.test(entry)) { const file = `.github/workflows/${entry}`, content = read(file); if (!content.includes("permissions:")) fail(`${file} must define permissions.`); }
  if (exists(".github/workflows/verify.yml") && !read(".github/workflows/verify.yml").includes("npm run verify")) fail(".github/workflows/verify.yml must run npm run verify.");
  if (exists(".github/workflows/release-check.yml")) {
    const release = read(".github/workflows/release-check.yml");
    const activeLines = release.split("\n").filter((line) => !line.trimStart().startsWith("#"));
    const pullRequest = activeLines.indexOf("  pull_request:");
    const nextTrigger = pullRequest < 0 ? -1 : activeLines.findIndex((line, index) => index > pullRequest && /^  [A-Za-z_][A-Za-z0-9_-]*:$/.test(line));
    const pullRequestBlock = pullRequest < 0 ? [] : activeLines.slice(pullRequest + 1, nextTrigger < 0 ? activeLines.length : nextTrigger);
    if (!pullRequestBlock.includes("    branches:") || !pullRequestBlock.includes("      - main")) fail(".github/workflows/release-check.yml must actively trigger on pull requests targeting main.");
    if (!activeLines.some((line) => /^\s*run:\s*npm run release-check\s*(?:#.*)?$/.test(line))) fail(".github/workflows/release-check.yml must run the authoritative npm run release-check command.");
  }
}
function checkRepositoryGovernance() {
  const codeowners = exists(".github/CODEOWNERS") ? read(".github/CODEOWNERS") : "";
  for (const entry of [
    "/scripts/install-adapter.mjs @wfprieto", "/scripts/check-install.mjs @wfprieto", "/scripts/wcbs.mjs @wfprieto", "/scripts/wcbs-doctor.mjs @wfprieto", "/scripts/build-release-artifacts.mjs @wfprieto",
    "/scripts/lib/evaluation-protocol.mjs @wfprieto", "/scripts/lib/hardened-git.mjs @wfprieto", "/runtime_adapters/adapter-registry.yaml @wfprieto", "/.github/workflows/ @wfprieto", "/.github/RELEASE_CANDIDATE_CHECKLIST.md @wfprieto", "/evals/ @wfprieto", "/SECURITY.md @wfprieto", "/RELEASE_PROCESS.md @wfprieto", "/10_governance/RELEASE_GATES.md @wfprieto"
  ]) if (!codeowners.split("\n").includes(entry)) fail(`.github/CODEOWNERS must own critical path: ${entry}`);
  const dependabot = exists(".github/dependabot.yml") ? read(".github/dependabot.yml") : "";
  if (!/^version: 2$/m.test(dependabot)) fail(".github/dependabot.yml must declare version 2.");
  for (const ecosystem of ["npm", "github-actions"]) {
    const block = new RegExp(`- package-ecosystem: ${ecosystem}\\n\\s+directory: "\\/"\\n\\s+schedule:\\n\\s+interval: weekly`);
    if (!block.test(dependabot)) fail(`.github/dependabot.yml must schedule weekly root updates for ${ecosystem}.`);
  }
}
function checkSecretPatterns() {
  const highSignal = /(gho_[A-Za-z0-9_]+|gh[pousr]_[A-Za-z0-9]{16,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{16,}|AIza[0-9A-Za-z_-]{20,}|xox[abposr]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|OPENAI_API_KEY\s*=)/;
  const lowSignal = /(password\s*=|secret\s*=)/;
  const walk = current => { for (const entry of fs.readdirSync(current, { withFileTypes: true })) { if (ignoredDirectoryNames.has(entry.name)) continue; const file = path.join(current, entry.name); if (entry.isDirectory()) walk(file); else if (/\.(md|mjs|js|json|jsonl|log|yaml|yml|py|txt|ps1)$/i.test(entry.name)) { const relative = display(path.relative(root, file)); const body = normalizeText(fs.readFileSync(file, "utf8")); if (highSignal.test(body) || (!relative.startsWith("evals/") && lowSignal.test(body))) fail(`Potential secret pattern found in active file: ${relative}`); } } };
  walk(root);
}
function checkMarkdown() {
  const pathPattern = /`((?:00_|10_|20_|30_|40_|50_|60_|90_|skills\/|runtime_adapters\/|hooks\/|evals\/|scripts\/|\.claude-plugin\/|\.agents\/|\.codex-plugin\/|\.cursor\/|\.github\/|BOOTSTRAP\.md|AGENTS\.md|CLAUDE\.md|GEMINI\.md|REPLIT\.md|README\.md|INSTALL\.md|QUICKSTART\.md|MANIFEST\.md|SECURITY\.md|VERSIONING\.md|RELEASE_PROCESS\.md|CHANGELOG\.md|DISTRIBUTION_POLICY\.md|SUPPORT_MATRIX\.md|docs\/)[^`]+)`/g;
  const walk = current => { for (const entry of fs.readdirSync(current, { withFileTypes: true })) { if (ignoredDirectoryNames.has(entry.name)) continue; const file = path.join(current, entry.name); if (entry.isDirectory()) walk(file); else if (entry.name.endsWith(".md")) { const content = normalizeText(fs.readFileSync(file, "utf8")); for (const match of content.matchAll(pathPattern)) { const target = match[1]; if (!target.includes("*") && !target.endsWith("/") && !target.includes("{") && !target.includes("<runtime>") && !exists(target)) warn(`${display(path.relative(root, file))} references missing path: ${target}`); } } } };
  walk(root);
}

checkRequiredFiles();
json(".codex-plugin/plugin.json");
checkPackage();
checkWorkflowFiles();
checkRepositoryGovernance();
checkSkills();
checkWiring();
checkEvidenceVocabulary();
checkActivationMarkerReachability();
checkHookTransport();
checkAdapters();
checkController();
checkVerifiedSupportLevels();
checkV2Metadata();
checkBundles();
checkBootstrapArtifacts();
checkMarkdown();
checkSecretPatterns();
if (strict) for (const warning of warnings) fail(`Strict mode rejects warning: ${warning}`);
console.log("WCBS Engineering Operating System Doctor");
console.log(`Mode: ${strict ? "verify" : "doctor"}`);
console.log(`Root: ${root}\n`);
if (warnings.length) { console.log("Warnings:"); for (const warning of warnings) console.log(`- ${warning}`); console.log(); }
if (errors.length) { console.log("Failures:"); for (const error of errors) console.log(`- ${error}`); process.exitCode = 1; }
else console.log("PASS: EOS Kernel, Controller, governance, activation wiring, skills, adapters, artifacts, package gates, and evidence controls passed.");
