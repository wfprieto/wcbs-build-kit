#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const p = relative => path.join(root, ...relative.split("/"));
const exists = relative => fs.existsSync(p(relative));
const read = relative => fs.readFileSync(p(relative), "utf8").replace(/\r\n?/g, "\n");
const write = (relative, content) => {
  fs.mkdirSync(path.dirname(p(relative)), { recursive: true });
  fs.writeFileSync(p(relative), content.endsWith("\n") ? content : `${content}\n`);
};
const replaceFile = (relative, transform) => {
  if (!exists(relative)) return;
  const before = read(relative);
  const after = transform(before);
  if (after !== before) write(relative, after);
};

function amendMetaGoalZero() {
  const file = "10_governance/source_of_truth/Elite_Build_Goals_v3.md";
  replaceFile(file, body => {
    body = body.replace("**Version:** 3.0 Tightened", "**Version:** 3.1 Meta-Initialized");
    if (body.includes("## Meta Goal 0 — Deterministic Autonomous Initialization")) return body;
    const marker = "# 3. Absolute Guardrails";
    const section = `# 3.0 Meta Goal 0 — Deterministic Autonomous Initialization\n\nWhen a user provides the WCBS Engineering Operating System to a supported LLM before beginning a project, the LLM must discover, load, validate, and activate the system before producing architecture, implementation, deployment, or launch work.\n\nThe system must:\n\n1. not depend on the user knowing which internal file to name;\n2. not depend on the model voluntarily exploring the repository correctly when a native delivery mechanism exists;\n3. not silently continue when a required file cannot be loaded;\n4. report delivery environment, substantiated activation tier, Kernel and Controller version, capability resolution, degraded modes, and initialized controls;\n5. confirm that the 16 Elite Build Goals are active and name any goal with no execution or verification path;\n6. block production implementation until required pre-build gates pass;\n7. state its activation tier honestly and never report a best-effort tier as enforced; and\n8. distinguish activation from initialization and never report one as the other.\n\nThe 16 goals define product quality. Meta Goal 0 ensures the system reaches the model and governs its behavior. A build satisfying all 16 goals while Meta Goal 0 was never satisfied is unverified, because the controls were never demonstrably active.\n\n---\n\n`;
    return body.replace(marker, `${section}${marker}`);
  });
}

function collapseOnboarding() {
  fs.mkdirSync(p("90_archive/superseded"), { recursive: true });
  const moves = [
    ["QUICKSTART.md", "90_archive/superseded/QUICKSTART.md"],
    ["docs/FIRST_10_MINUTES.md", "90_archive/superseded/FIRST_10_MINUTES.md"]
  ];
  for (const [source, target] of moves) {
    if (exists(source) && !exists(target)) fs.renameSync(p(source), p(target));
  }
  write("90_archive/superseded/README.md", `# Superseded Onboarding\n\nThe former quick-start documents were consolidated into \`GET_STARTED.md\` during EOS initialization remediation. They remain here for provenance only and carry no active authority.\n`);
  const roots = ["."];
  const skip = new Set([".git", "node_modules", "90_archive"]);
  const walk = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(md|mjs|js|json|yml|yaml|txt)$/i.test(entry.name)) {
        let body = fs.readFileSync(full, "utf8");
        body = body.replaceAll("docs/FIRST_10_MINUTES.md", "GET_STARTED.md").replaceAll("QUICKSTART.md", "GET_STARTED.md");
        fs.writeFileSync(full, body);
      }
    }
  };
  for (const directory of roots) walk(p(directory));
}

function routeAdaptersToKernel() {
  const files = ["AGENTS.md", "CLAUDE.md", "GEMINI.md", "REPLIT.md", "Manus.md", ".github/copilot-instructions.md", ".cursor/rules/super-build-kit.mdc"];
  for (const file of files) replaceFile(file, body => {
    if (body.includes("BOOTSTRAP.md") && body.includes("WCBS EOS Kernel")) return body;
    const preamble = `WCBS EOS Kernel route: read and execute \`BOOTSTRAP.md\` before any project work. Do not restate Kernel or governance logic here. If the Kernel or Controller cannot be loaded, stop and report the transport failure.\n\n`;
    if (body.startsWith("---\n")) {
      const end = body.indexOf("\n---\n", 4);
      if (end >= 0) return `${body.slice(0, end + 5)}\n${preamble}${body.slice(end + 5).replace(/^\n+/, "")}`;
    }
    return `${preamble}${body}`;
  });
}

function backfillSkillContracts() {
  const skillsRoot = p("skills");
  for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const relative = `skills/${entry.name}/SKILL.md`;
    if (!exists(relative)) continue;
    let body = read(relative);
    if (!body.startsWith("---\n")) continue;
    const end = body.indexOf("\n---\n", 4);
    if (end < 0) continue;
    const headerLines = body.slice(4, end).split("\n");
    const fields = new Map();
    for (const line of headerLines) {
      const match = line.match(/^([a-z_]+):\s*(.*)$/);
      if (match) fields.set(match[1], match[2]);
    }
    const existingDescription = (fields.get("description") ?? `Use when ${entry.name.replaceAll("-", " ")} work is required.`).trim();
    let description = existingDescription;
    if (!/use when|activate when|trigger/i.test(description)) description = `Use when ${description.charAt(0).toLowerCase()}${description.slice(1)}`;
    if (description.length < 40) description = `${description} Apply the canonical WCBS workflow and evidence gates.`;
    if (description.length > 500) description = `${description.slice(0, 496).trimEnd()}...`;
    fields.set("name", entry.name);
    fields.set("description", description);
    if (!fields.has("activation")) fields.set("activation", "Activate when the description trigger applies to the current task.");
    if (!fields.has("required_inputs")) fields.set("required_inputs", "Task request, relevant repository context, constraints, and authority dependencies.");
    if (!fields.has("required_outputs")) fields.set("required_outputs", "Skill-specific artifact, verification evidence, canonical verdict, and next action.");
    if (!fields.has("authority_dependencies")) fields.set("authority_dependencies", "00_start_here/SOURCE_OF_TRUTH.md; 10_governance/APIVR_EXECUTION_LIFECYCLE.md; 10_governance/source_of_truth/Elite_Build_Goals_v3.md.");
    if (!fields.has("evidence_requirements")) fields.set("evidence_requirements", "Executed checks or an honest Unknown, Not Run, or Blocked state for every material claim.");
    const order = ["name", "description", "activation", "required_inputs", "required_outputs", "authority_dependencies", "evidence_requirements"];
    const header = order.map(key => `${key}: ${fields.get(key)}`).join("\n");
    let rest = body.slice(end + 5).replace(/^\n+/, "");
    if (!/<HARD-GATE>|Excuse.*Reality|Decision Flow|## Workflow|## Process/is.test(rest)) {
      rest += `\n\n## Process\n\n1. Load only the authority and task context required by this skill.\n2. Execute the narrow workflow without bypassing APIVR, Elite Build Goals, or evidence requirements.\n3. Verify the result and report a canonical verdict with remaining risk and next action.\n`;
    }
    write(relative, `---\n${header}\n---\n\n${rest}`);
  }
}

function strengthenSkillContent() {
  const requirements = "skills/requirements-grilling-and-alignment/SKILL.md";
  replaceFile(requirements, body => {
    if (body.includes("DESIGN-BEFORE-CODE HARD GATE")) return body;
    return `${body.trimEnd()}\n\n## DESIGN-BEFORE-CODE HARD GATE\n\n<HARD-GATE>\nDo not invoke implementation skills, create source files, scaffold code, or modify production behavior until a design specification exists in \`docs/specs/YYYY-MM-DD-<topic>-design.md\`, is committed, and is explicitly approved. This applies regardless of perceived simplicity. Read-only questions, audits, code reading, and execution of an already approved plan are exempt.\n</HARD-GATE>\n\n| Excuse | Reality |\n|---|---|\n| “The user already told me what to build.” | Requirements are not an approved design. |\n| “It is a one-line change.” | Small changes can still violate architecture or preserved behavior. |\n| “I will write the spec after.” | A post-hoc spec cannot govern the implementation it follows. |\n| “Asking again wastes time.” | Approval may be concise; silent assumptions waste more time. |\n| “This is a bug fix, not a feature.” | The fix still needs an approved behavioral design or an existing approved plan. |\n`;
  });

  const debugging = "skills/diagnosing-bugs-and-feedback-loops/SKILL.md";
  replaceFile(debugging, body => {
    if (body.includes("RED-CAPABLE LOOP GATE")) return body;
    return `${body.trimEnd()}\n\n## RED-CAPABLE LOOP GATE\n\n<HARD-GATE>\nDo not implement a fix until a targeted check reproduces the current defect and fails for the right reason, unless reproduction is technically blocked and recorded as \`Blocked\`.\n</HARD-GATE>\n\n## Root-Cause Workflow\n\n1. Stabilize the observation and remove timing ambiguity.\n2. Trace the failing value or state backward to the earliest incorrect transition.\n3. Minimize the reproducer and identify the smallest production change that should turn it green.\n4. Add defense at the trusted boundary, not only where the symptom surfaced.\n5. Replace fixed sleeps with condition-based waiting.\n6. Run the reproducer, adjacent regressions, and the broader suite required by risk.\n\n| Excuse | Reality |\n|---|---|\n| “The fix is obvious.” | Obvious fixes frequently treat symptoms. |\n| “The test is flaky.” | A flaky reproducer means the observation is not yet controlled. |\n| “A retry solves it.” | Retries can conceal corruption and unbounded cost. |\n| “I cannot reproduce locally.” | Record \`Blocked\`, gather production evidence, and do not claim the fix is Verified. |\n\nSee \`skills/diagnosing-bugs-and-feedback-loops/references/root-cause-tracing.md\`, \`condition-based-waiting.md\`, and \`defense-in-depth.md\`.\n`;
  });

  const tdd = "skills/test-driven-development/SKILL.md";
  replaceFile(tdd, body => {
    if (body.includes("TEST FALSIFIABILITY GATE")) return body;
    return `${body.trimEnd()}\n\n## TEST FALSIFIABILITY GATE\n\n<HARD-GATE>\nFor every new test, name the exact production change that would make it fail. If no production change can make it fail, it is not behavioral evidence.\n</HARD-GATE>\n\n| Excuse | Reality |\n|---|---|\n| “Tests after are faster.” | Tests written after implementation tend to prove the implementation rather than the requirement. |\n| “It is too simple to test.” | Simple regressions are still regressions. |\n| “The type system covers it.” | Types do not prove runtime behavior or side effects. |\n| “Tests can come in the next PR.” | That leaves the current behavior unprotected and unverified. |\n\nRead \`skills/test-driven-development/references/writing-good-tests.md\`. Repository text checks are structural drift controls, never behavioral evidence.\n`;
  });

  const longHorizon = "skills/long-horizon-agent-runtime/SKILL.md";
  replaceFile(longHorizon, body => body.includes("EOS Rehydration Contract") ? body : `${body.trimEnd()}\n\n## EOS Rehydration Contract\n\nAfter compaction, interruption, model change, or agent handoff, resume through Controller state \`INITIALIZE_STATE\`. Re-read the ordered \`rehydration_set\` from \`00_start_here/bootstrap-controller.json\`, recompute the certificate content hash, and force full re-initialization on mismatch or when project artifacts exist without a certificate. Do not continue from conversational memory alone.\n`);
}

function createNewReferencesAndDocs() {
  write("docs/specs/README.md", `# Design Specifications\n\nBefore implementation, write and approve \`YYYY-MM-DD-<topic>-design.md\` using \`60_templates/DESIGN_SPEC_TEMPLATE.md\`. Read-only analysis and execution of an already approved plan are exempt.\n`);
  write("60_templates/DESIGN_SPEC_TEMPLATE.md", `# Design Specification: <Topic>\n\n- Date:\n- Owner:\n- Approver:\n- Status: Draft | Approved | Superseded\n\n## Objective\n\n## Users And Outcomes\n\n## Scope And Non-Goals\n\n## Existing System And Source Of Truth\n\n## Proposed Design\n\n## Data, Security, Privacy, Accessibility, And Operations\n\n## Preserved Behavior\n\n## Acceptance Criteria\n\n## Verification Plan\n\n## Rollback Or Restoration\n\n## Explicit Approval\n`);
  write("skills/diagnosing-bugs-and-feedback-loops/references/root-cause-tracing.md", `# Root-Cause Tracing\n\nStart at the observed failure and trace each value, event, and state transition backward. Stop at the earliest point where actual state diverges from required state. Fix that boundary or the source that feeds it, then prove the original symptom and adjacent paths.\n`);
  write("skills/diagnosing-bugs-and-feedback-loops/references/condition-based-waiting.md", `# Condition-Based Waiting\n\nWait for an observable condition with a deadline and useful timeout evidence. Do not use fixed sleeps as synchronization. Poll at a bounded interval, stop on success, fail with the last observed state, and keep total waiting bounded.\n`);
  write("skills/diagnosing-bugs-and-feedback-loops/references/defense-in-depth.md", `# Defense In Depth\n\nAfter correcting the source defect, add narrow checks at trusted boundaries where corrupted or unsafe state could enter. Do not scatter duplicate validation. Prefer one canonical validation rule reused by callers.\n`);
  write("skills/test-driven-development/references/writing-good-tests.md", `# Writing Good Tests\n\nA test is behavioral evidence only when a production behavior change can make it fail.\n\n## String-Presence Trap\n\nGrepping a file for a phrase proves text exists, not that the system follows it. \`scripts/wcbs-system-test.mjs\` and \`scripts/run-behavior-fixtures.mjs\` are structural wiring checks and must be described that way.\n\n## Change-Detector Trap\n\nA constant assertion or snapshot disconnected from production behavior can fail while protecting nothing. Name the exact production change the test detects.\n\n## Drift Controls\n\nText, path, schema, and generated-file assertions are valuable structural drift controls. Label them accurately and never count them as model-behavior evidence.\n`);
  write("skills/writing-skills/references/testing-skills-with-subagents.md", `# Testing Skills With Agents\n\n1. Run the relevant natural-language pressure case before the skill change.\n2. Record model, runtime, date, run count, and adherence rate.\n3. Change one variable.\n4. Re-run the same case in an isolated session.\n5. Keep the change only when adherence does not regress and false positives remain bounded.\n`);
  write("40_knowledge/AGENT_SUPPLY_CHAIN_RISKS.md", `# Agent Supply-Chain Risks\n\nHooks, plugin manifests, always-on instructions, skills, and eval fixtures deliver code or high-authority context to agents. Treat them as a supply chain.\n\nRequired controls include neutralizing \`BASH_ENV\`, absolute plugin-root commands, rejecting symlinked or root-escaping Kernel inputs, never splicing stderr into model context, SHA-pinning CI actions, isolating eval credentials, and reviewing injected-context paths through CODEOWNERS.\n\nThe runtime certificate is a drift seal, not attestation. The agent controls its inputs. Release signatures can attest distributed artifacts because they have an external maintainer key.\n`);
  write("docs/windows-hooks.md", `# Windows Hook Delivery\n\nThe launcher uses \`cmd.exe\` only to find Bash and invokes \`bash --noprofile --norc\` with an absolute quoted script path. Missing Bash returns a valid transport envelope and exit code 0. Paths containing spaces or parentheses must remain quoted.\n`);
}

function patchPackageAndDoctorReferences() {
  replaceFile("scripts/wcbs-doctor.mjs", body => body.replace('"README.md", "INSTALL.md", "GET_STARTED.md",', '"README.md", "INSTALL.md", "GET_STARTED.md",').replaceAll('"QUICKSTART.md", ', "").replaceAll('|QUICKSTART\\.md', ''));
  replaceFile("MANIFEST.md", body => body.includes("WCBS Engineering Operating System") ? body : `${body.trimEnd()}\n\n## WCBS Engineering Operating System\n\nThe Build Kit distribution delivers the EOS Kernel, Controller, four-plane architecture, capability routing, initialization certificate, and behavioral-evidence gates. Canonical entry: \`BOOTSTRAP.md\`.\n`);
  replaceFile(".gitignore", body => body.includes(".wcbs/") ? body : `${body.trimEnd()}\n.wcbs/\n`);
}

function generateDerived() {
  for (const [script, args] of [["scripts/generate-bootstrap-controller.mjs", []], ["scripts/generate-load-order.mjs", []], ["scripts/generate-capability-matrix.mjs", []]]) {
    const result = spawnSync(process.execPath, [script, ...args], { cwd: root, stdio: "inherit" });
    if (result.status !== 0) throw new Error(`${script} failed with status ${result.status}`);
  }
}

amendMetaGoalZero();
collapseOnboarding();
routeAdaptersToKernel();
backfillSkillContracts();
strengthenSkillContent();
createNewReferencesAndDocs();
patchPackageAndDoctorReferences();
generateDerived();
console.log("EOS remediation migration applied.");
