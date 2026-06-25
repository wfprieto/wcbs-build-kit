# Claude Audit Prompt Template

## TITLE
[Project] — [Audit Area] Audit

## READ-FIRST INSTRUCTION
Read this entire prompt before taking any action. This is audit-only unless explicitly stated otherwise. Do not modify code, data, routes, schemas, tests, generated files, or documentation. Inspect the repository, verify evidence, and report findings.

## OBJECTIVE
Perform an evidence-based audit of [specific area]. Identify risks, defects, gaps, stale paths, missing verification, and recommended next steps. Do not implement fixes.

## CURRENT CONTEXT
- Project:
- Known issue or concern:
- Priority area:
- Source-of-truth file:
- Locked rules:

## GUARDRAILS
- Audit only.
- Do not mutate data.
- Do not run destructive commands.
- Do not expose secrets or private data.
- Do not mark anything broken, safe, unused, or complete without evidence.
- If evidence is incomplete, label Needs Human Review.

## DISCOVERY REQUIRED
- Project structure.
- Stack.
- Source-of-truth files.
- Functional surface.
- Routes/APIs.
- Data/schema if relevant.
- Tests/scripts.
- Existing behavior.
- Risks/blockers/unknowns.

## FINDING FORMAT
`~/.claude/wcbs-kit/``text
Finding ID:
Severity:
Category:
Location:
Evidence:
Impact:
Recommended Action:
Risk of Fix:
Tests Needed:
Manual Verification Needed:
Human Approval Required:
`~/.claude/wcbs-kit/``

## REQUIRED OUTPUT
- Final Status.
- Executive Summary.
- Discovery Summary.
- Commands run and results.
- Findings Index.
- Detailed Findings.
- Recommended Fix Order.
- Items Requiring Human Approval.
- Items Not Touched.
- Next Implementation Prompt Candidates.

---
## 21-Pass Improvement Certification
Initial draft plus 20 internal challenge-and-improvement passes were conducted for this file.

Improvement focus across passes: precision, single-purpose scope, stronger guardrails, source-of-truth hierarchy, canonical-path enforcement, anti-duplication controls, evidence labeling, verification gates, checklist discipline, failure handling, and completion-lock clarity.


**Score: 9.2 / 10**

Reason: Strong general audit template. Remaining limitation: specific audits should still use the deeper specialized audit files.

---

# Build Kit Integration Contract

This file is part of the Claude World-Class Build Kit and must not be used in isolation when the task touches multiple domains.

Before using this file for a build, audit, fix, diagnostic, prompt, or completion review:

1. Load `00_Master_Operating_System.md` first.
2. Load `01_Agent_Activation_Matrix.md`.
3. Load `02_Specialist_Prompt_Writing_Collaboration_Protocol.md` for prompt-writing or reusable-instruction work.
4. Activate every specialist agent whose domain is touched.
5. Require each activated specialist to provide its role-specific risks, requirements, acceptance criteria, and verification needs.
6. Activate Elite Senior ScrumMaster 3 for Important or Critical decisions and for any completion-lock claim.
7. Require ScrumMaster 3 to challenge assumptions, scope, evidence, shortcuts, duplicate paths, and proof quality repeatedly, not just once.
8. Escalate Critical decisions, unresolved agent conflicts, release readiness, or risk acceptance to the VP of Engineering.
9. Maintain a live checklist using `02_Task_Checklist_and_Lock_Protocol.md`.
10. Do not mark anything complete or locked without evidence.

## Prompt-Writing Requirement

If this file is used to create or improve a Claude prompt, agent instruction, audit prompt, diagnostic prompt, or implementation prompt:

- Elite Prompt Engineer must lead the prompt structure.
- Every affected specialist must contribute its domain-specific requirements.
- The Master Prompt Writing System must be followed when elite/high-stakes quality is requested: initial draft, 20 internal improvement passes, final compression, honest score, and clear remaining limitations.
- Do not claim 20 passes unless they were actually completed.

## Cooperation Requirement

The agents must behave like a senior engineering team:

- Product defines the outcome.
- Architecture defines boundaries.
- Principal Engineering challenges technical tradeoffs.
- Frontend, Backend, Database, UI, Security, UX, and QA specialists define their domain requirements.
- ScrumMaster 3 challenges quality and proof.
- VP of Engineering decides critical tradeoffs.
- Source-of-Truth Guardian prevents documentation and decision drift.

## v3 Synergy Review

This file was included in the v3 full-kit synergy review and updated with cross-agent cooperation, source-routing, ScrumMaster challenge, and prompt-writing governance requirements.

## 21-Pass Certification

Initial draft plus 20 internal challenge-and-improvement passes were conducted for this file or for its v3 integration upgrade.

## Required Active-Agent Section

Every prompt built from this template must include:

`~/.claude/wcbs-kit/``text
ACTIVE AGENTS:
- Master Agent Orchestrator:
- Elite Prompt Engineer, if this is prompt-writing work:
- Domain specialists activated:
- ScrumMaster 3 challenge required: Yes/No and why
- VP of Engineering final decision required: Yes/No and why
- Source-of-Truth Guardian required: Yes/No and why
`~/.claude/wcbs-kit/``

Every activated specialist must contribute domain-specific requirements, acceptance criteria, verification checks, and do-not-touch boundaries.

## Required Prompt Refinement Section

When the user requests elite/world-class prompt quality, include:

`~/.claude/wcbs-kit/``text
PROMPT REFINEMENT REQUIREMENT:
Create initial draft, complete 20 internal improvement passes, use each prior version as the baseline, run final compression, score honestly, and disclose remaining limitations. Do not claim the passes were completed unless they were actually completed.
`~/.claude/wcbs-kit/``


---

## Claude Native Integration Contract

This file is part of the Claude World-Class Build Kit. When used in Claude Code or Claude Cowork:

- Prefer `CLAUDE.md` as the always-loaded project memory entry point.
- Use `@path` imports or explicit file references to load only the kit files needed for the current task.
- For Claude Code, prefer native project subagents in `~/.claude/agents/` for isolated specialist work and native skills in `~/.claude/skills/` for reusable workflows.
- Manage context aggressively. Do not load the entire kit when a small routed subset is enough.
- Explore first, then plan, then implement for non-trivial work.
- Give Claude a verifiable check: test command, build command, lint/typecheck command, browser proof, screenshot comparison, API check, or concrete completion evidence.
- Use the ScrumMaster challenge and VP decision gates for important and critical decisions.
- Do not claim work is complete, verified, safe, or locked without evidence.
