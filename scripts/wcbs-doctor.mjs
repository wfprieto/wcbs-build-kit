#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const strict = process.argv.includes("--strict");

const requiredFiles = [
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
  "GEMINI.md",
  "REPLIT.md",
  "Manus.md",
  "00_start_here/START_HERE.md",
  "00_start_here/SOURCE_OF_TRUTH.md",
  "00_start_here/LOAD_ORDER.md",
  "10_governance/APIVR_EXECUTION_LIFECYCLE.md",
  "10_governance/ELITE_BUILD_GOALS_SUMMARY.md",
  "10_governance/RELEASE_GATES.md",
  "10_governance/source_of_truth/Elite_Build_Goals_v3.md",
  "20_skills/apivr.skill",
  "20_skills/apivr/SKILL.md",
  "20_skills/apivr/references/playbook.md",
  "30_agents/AGENT_ACTIVATION_MATRIX.md",
  "40_knowledge/SYSTEMATIC_WORKFLOWS.md",
  "50_audits/AUDIT_TIER_ROUTER.md",
  "50_audits/CANONICAL_AUDIT_PROTOCOLS.md",
  "60_templates/IMPLEMENTATION_BLUEPRINT_TEMPLATE.md",
  "60_templates/EVIDENCE_LEDGER_TEMPLATE.md",
  "60_templates/COMPLETION_REPORT_TEMPLATE.md",
  "skills/super-build-kit/SKILL.md",
  "skills/writing-plans/SKILL.md",
  "skills/requirements-grilling-and-alignment/SKILL.md",
  "skills/product-strategy-office-hours/SKILL.md",
  "skills/domain-modeling-and-shared-language/SKILL.md",
  "skills/product-requirements-and-issue-slicing/SKILL.md",
  "skills/test-driven-development/SKILL.md",
  "skills/test-driven-development/references/testing-anti-patterns.md",
  "skills/codebase-design-and-deep-modules/SKILL.md",
  "skills/engineering-plan-review/SKILL.md",
  "skills/code-review-and-review-army/SKILL.md",
  "skills/diagnosing-bugs-and-feedback-loops/SKILL.md",
  "skills/qa-and-browser-verification/SKILL.md",
  "skills/release-readiness-and-ship-gates/SKILL.md",
  "skills/devex-and-documentation-review/SKILL.md",
  "skills/compound-learning-capture/SKILL.md",
  "skills/knowledge-refresh-and-drift-control/SKILL.md",
  "skills/throwaway-prototyping/SKILL.md",
  "skills/dispatching-parallel-agents/SKILL.md",
  "skills/subagent-driven-development/SKILL.md",
  "skills/subagent-driven-development/scripts/make-review-package.py",
  "skills/repeatable-agent-loops/SKILL.md",
  "skills/long-horizon-agent-runtime/SKILL.md",
  "skills/project-bootstrap-and-setup/SKILL.md",
  "skills/mcp-tool-governance/SKILL.md",
  "skills/agent-observability-and-run-tracing/SKILL.md",
  "skills/cybersecurity-risk-routing/SKILL.md",
  "skills/ai-application-security/SKILL.md",
  "skills/security-incident-response/SKILL.md",
  "skills/supply-chain-and-build-provenance/SKILL.md",
  "skills/ui-ux-design-quality/SKILL.md",
  "skills/anti-ai-writing-quality/SKILL.md",
  "skills/strategist-writing-dna/SKILL.md",
  "skills/using-git-worktrees/SKILL.md",
  "skills/deployment-and-hosting-guidance/SKILL.md",
  "skills/scheduling-and-automation-routing/SKILL.md",
  "skills/data-output-and-reporting/SKILL.md",
  "skills/external-api-integration/SKILL.md",
  "skills/media-and-asset-pipeline/SKILL.md",
  "40_knowledge/REPEATABLE_AGENT_LOOP_PATTERNS.md",
  "40_knowledge/LONG_HORIZON_AGENT_RUNTIME_PATTERNS.md",
  "40_knowledge/AGENT_WORKSPACE_AND_ARTIFACT_BOUNDARIES.md",
  "40_knowledge/UI_UX_DESIGN_SYSTEM_GUIDANCE.md",
  "40_knowledge/DOMAIN_MODELING_AND_ADR_GUIDANCE.md",
  "40_knowledge/CODEBASE_DESIGN_DEEP_MODULES.md",
  "40_knowledge/COMPOUND_LEARNING_GUIDANCE.md",
  "40_knowledge/CYBERSECURITY_RISK_ROUTING_INDEX.md",
  "40_knowledge/SECURITY_FRAMEWORK_MAPPING.md",
  "60_templates/LOOP_DESIGN_TEMPLATE.md",
  "60_templates/LOOP_RUN_RECEIPT_TEMPLATE.md",
  "60_templates/LONG_HORIZON_RUN_CONTROL_TEMPLATE.md",
  "60_templates/AGENT_RUN_TRACE_TEMPLATE.md",
  "60_templates/DESIGN_DIRECTION_BRIEF_TEMPLATE.md",
  "60_templates/UI_UX_REVIEW_CHECKLIST.md",
  "60_templates/DOMAIN_GLOSSARY_TEMPLATE.md",
  "60_templates/ADR_TEMPLATE.md",
  "60_templates/QA_HEALTH_REPORT_TEMPLATE.md",
  "60_templates/RELEASE_READINESS_DASHBOARD_TEMPLATE.md",
  "60_templates/SOLVED_PROBLEM_LEARNING_TEMPLATE.md",
  "60_templates/KNOWLEDGE_REFRESH_REPORT_TEMPLATE.md",
  "60_templates/SECURITY_EVIDENCE_LEDGER_TEMPLATE.md",
  "60_templates/SECURITY_AUTHORIZATION_AND_SCOPE_TEMPLATE.md",
  "runtime_adapters/README.md",
  "runtime_adapters/NATIVE_GIT_WORKTREES.md",
  ".codex-plugin/plugin.json",
  ".cursor/rules/super-build-kit.mdc",
  ".github/copilot-instructions.md"
];

const requiredMentions = new Map([
  ["00_start_here/LOAD_ORDER.md", [
    "skills/super-build-kit/SKILL.md",
    "skills/writing-plans/SKILL.md",
    "skills/requirements-grilling-and-alignment/SKILL.md",
    "skills/product-strategy-office-hours/SKILL.md",
    "skills/domain-modeling-and-shared-language/SKILL.md",
    "skills/product-requirements-and-issue-slicing/SKILL.md",
    "skills/test-driven-development/SKILL.md",
    "skills/codebase-design-and-deep-modules/SKILL.md",
    "skills/engineering-plan-review/SKILL.md",
    "skills/code-review-and-review-army/SKILL.md",
    "skills/diagnosing-bugs-and-feedback-loops/SKILL.md",
    "skills/qa-and-browser-verification/SKILL.md",
    "skills/release-readiness-and-ship-gates/SKILL.md",
    "skills/devex-and-documentation-review/SKILL.md",
    "skills/compound-learning-capture/SKILL.md",
    "skills/knowledge-refresh-and-drift-control/SKILL.md",
    "skills/throwaway-prototyping/SKILL.md",
    "skills/dispatching-parallel-agents/SKILL.md",
    "skills/subagent-driven-development/SKILL.md",
    "skills/repeatable-agent-loops/SKILL.md",
    "skills/long-horizon-agent-runtime/SKILL.md",
    "skills/project-bootstrap-and-setup/SKILL.md",
    "skills/mcp-tool-governance/SKILL.md",
    "skills/agent-observability-and-run-tracing/SKILL.md",
    "skills/cybersecurity-risk-routing/SKILL.md",
    "skills/ai-application-security/SKILL.md",
    "skills/security-incident-response/SKILL.md",
    "skills/supply-chain-and-build-provenance/SKILL.md",
    "skills/ui-ux-design-quality/SKILL.md",
    "skills/anti-ai-writing-quality/SKILL.md",
    "skills/strategist-writing-dna/SKILL.md"
  ]],
  ["00_start_here/START_HERE.md", [
    "Audit wide. Fix narrow. Prove everything.",
    "skills/writing-plans/SKILL.md",
    "skills/test-driven-development/SKILL.md",
    "skills/dispatching-parallel-agents/SKILL.md",
    "skills/subagent-driven-development/SKILL.md",
    "skills/cybersecurity-risk-routing/SKILL.md"
  ]],
  ["skills/super-build-kit/SKILL.md", [
    "Skill Invocation Flow",
    "Platform Activation",
    "Rationalization Rebuttals",
    "APIVR verdict"
  ]],
  ["60_templates/IMPLEMENTATION_BLUEPRINT_TEMPLATE.md", [
    "Test-First Implementation Plan",
    "Product / Requirements Alignment",
    "Domain Glossary / ADR Plan",
    "Architecture / Module Boundary Plan",
    "QA Health Plan",
    "Release Readiness Plan",
    "DevEx / Documentation Plan",
    "Red Phase",
    "Green Phase",
    "Refactor Phase",
    "Cybersecurity / Authorization / Supply Chain Plan",
    "Zero-Placeholder Check"
  ]]
]);

const allowedEvidenceStates = [
  "Verified",
  "Likely",
  "Suspected",
  "Unknown",
  "Not Run",
  "Blocked"
];

const errors = [];
const warnings = [];

function display(relativePath) {
  return relativePath.replaceAll("\\", "/");
}

function resolve(relativePath) {
  return path.join(root, ...relativePath.split("/"));
}

function exists(relativePath) {
  return fs.existsSync(resolve(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(resolve(relativePath), "utf8");
}

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function checkRequiredFiles() {
  for (const file of requiredFiles) {
    if (!exists(file)) fail(`Missing required file: ${display(file)}`);
  }
}

function checkJson(file) {
  if (!exists(file)) return;
  try {
    JSON.parse(read(file));
  } catch (error) {
    fail(`Invalid JSON in ${display(file)}: ${error.message}`);
  }
}

function checkSkillFrontmatter() {
  const skillsDir = resolve("skills");
  if (!fs.existsSync(skillsDir)) {
    fail("Missing skills directory.");
    return;
  }

  const skillFiles = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      if (entry.isFile() && entry.name === "SKILL.md") skillFiles.push(full);
    }
  };
  walk(skillsDir);

  for (const file of skillFiles) {
    const relative = path.relative(root, file).replaceAll(path.sep, "/");
    const content = fs.readFileSync(file, "utf8");
    if (!content.startsWith("---\n")) {
      fail(`Skill missing YAML frontmatter: ${relative}`);
      continue;
    }
    if (!/^name:\s*[a-z0-9-]+$/m.test(content)) {
      fail(`Skill missing valid name field: ${relative}`);
    }
    if (!/^description:\s*\S.+$/m.test(content)) {
      fail(`Skill missing description field: ${relative}`);
    }
  }
}

function checkRequiredMentions() {
  for (const [file, mentions] of requiredMentions.entries()) {
    if (!exists(file)) continue;
    const content = read(file);
    for (const mention of mentions) {
      if (!content.includes(mention)) {
        fail(`${display(file)} does not mention required activation text: ${mention}`);
      }
    }
  }
}

function checkPackageIsSafe() {
  if (!exists("package.json")) return;
  const pkg = JSON.parse(read("package.json"));
  if (pkg.private !== true) fail("package.json must remain private.");
  for (const key of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
    if (pkg[key] && Object.keys(pkg[key]).length > 0) {
      fail(`package.json should not add install dependencies; found ${key}.`);
    }
  }
  if (!pkg.scripts?.doctor || !pkg.scripts?.verify) {
    fail("package.json must expose doctor and verify scripts.");
  }
}

function checkEvidenceVocabulary() {
  const filesToScan = [
    "00_start_here/START_HERE.md",
    "00_start_here/SOURCE_OF_TRUTH.md",
    "00_start_here/LOAD_ORDER.md",
    "skills/super-build-kit/SKILL.md",
    "skills/test-driven-development/SKILL.md",
    "skills/subagent-driven-development/SKILL.md",
    "60_templates/IMPLEMENTATION_BLUEPRINT_TEMPLATE.md"
  ];

  const forbiddenEvidenceTerms = ["Inconclusive", "Not Applicable"];
  for (const file of filesToScan) {
    if (!exists(file)) continue;
    const content = read(file);
    for (const term of forbiddenEvidenceTerms) {
      if (content.includes(term)) {
        fail(`${display(file)} uses non-canonical evidence term: ${term}`);
      }
    }
  }

  const sourceOfTruth = exists("00_start_here/SOURCE_OF_TRUTH.md")
    ? read("00_start_here/SOURCE_OF_TRUTH.md")
    : "";
  for (const state of allowedEvidenceStates) {
    if (!sourceOfTruth.includes(state)) {
      fail(`SOURCE_OF_TRUTH.md does not define evidence state: ${state}`);
    }
  }
}

function checkMarkdownReferences() {
  const markdownFiles = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if ([".git", ".agents", "node_modules", "90_archive"].includes(entry.name)) continue;
        walk(full);
      }
      if (entry.isFile() && entry.name.endsWith(".md")) markdownFiles.push(full);
    }
  };
  walk(root);

  const referencePattern = /`((?:00_|10_|20_|30_|40_|50_|60_|90_|skills\/|runtime_adapters\/|\.codex-plugin\/|\.cursor\/|\.github\/|AGENTS\.md|CLAUDE\.md|GEMINI\.md|REPLIT\.md|README\.md)[^`]+)`/g;
  for (const file of markdownFiles) {
    const content = fs.readFileSync(file, "utf8");
    for (const match of content.matchAll(referencePattern)) {
      const reference = match[1];
      if (reference.includes("*") || reference.endsWith("/")) continue;
      if (!exists(reference)) {
        const relative = path.relative(root, file).replaceAll(path.sep, "/");
        warn(`${relative} references missing path: ${reference}`);
      }
    }
  }
}

function main() {
  checkRequiredFiles();
  checkJson("package.json");
  checkJson(".codex-plugin/plugin.json");
  checkPackageIsSafe();
  checkSkillFrontmatter();
  checkRequiredMentions();
  checkEvidenceVocabulary();
  checkMarkdownReferences();

  console.log("WCBS Super Build Kit Doctor");
  console.log(`Mode: ${strict ? "verify" : "doctor"}`);
  console.log(`Root: ${root}`);
  console.log("");

  if (warnings.length) {
    console.log("Warnings:");
    for (const item of warnings) console.log(`- ${item}`);
    console.log("");
  }

  if (errors.length) {
    console.log("Failures:");
    for (const item of errors) console.log(`- ${item}`);
    process.exitCode = 1;
    return;
  }

  console.log("PASS: kit files, activation wiring, skill frontmatter, JSON, evidence terms, and optional package safety checks passed.");
}

main();
