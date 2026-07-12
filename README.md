# LLM-Agnostic Super Build Kit

Portable operating system for AI-assisted software work.

Operating law: **Audit wide. Fix narrow. Prove everything.**

This kit merges the permanent APIVR execution loop, the 16 Elite Build Goals, the reusable specialist/audit structure from `wfprieto/wcbs-build-kit`, and the portable skill/workflow mechanics from `obra/Superpowers`.

## Start Here

Every agent must begin with:

1. `00_start_here/START_HERE.md`
2. `00_start_here/SOURCE_OF_TRUTH.md`
3. `00_start_here/LOAD_ORDER.md`
4. `50_audits/AUDIT_TIER_ROUTER.md`

Then load only the task-specific governance, agent, audit, and template files named by the load order.

Core operational skills:

- `skills/super-build-kit/SKILL.md` - always-first orientation and skill invocation logic.
- `skills/writing-plans/SKILL.md` - zero-placeholder APIVR implementation plans.
- `skills/requirements-grilling-and-alignment/SKILL.md` - one-question-at-a-time clarification for ambiguous work.
- `skills/product-strategy-office-hours/SKILL.md` - product premise, user, buyer, alternatives, and smallest verifiable slice.
- `skills/domain-modeling-and-shared-language/SKILL.md` - canonical vocabulary, states, events, invariants, and ADR routing.
- `skills/product-requirements-and-issue-slicing/SKILL.md` - PRD/spec/audit conversion into vertical issue slices.
- `skills/test-driven-development/SKILL.md` - APIVR Phase 3 test-first implementation gate.
- `skills/codebase-design-and-deep-modules/SKILL.md` - architecture, deep modules, adapters, locality, and deletion tests.
- `skills/engineering-plan-review/SKILL.md` - pre-implementation engineering review for executable technical plans.
- `skills/code-review-and-review-army/SKILL.md` - APIVR Phase 4 specialist code review passes.
- `skills/diagnosing-bugs-and-feedback-loops/SKILL.md` - root-cause diagnosis with red-capable feedback loops.
- `skills/qa-and-browser-verification/SKILL.md` - workflow QA, browser checks, issue taxonomy, and QA health reports.
- `skills/release-readiness-and-ship-gates/SKILL.md` - release dashboards, changelog, rollback, and post-release checks.
- `skills/devex-and-documentation-review/SKILL.md` - setup/docs/examples/API docs/release note/handoff review.
- `skills/compound-learning-capture/SKILL.md` - evidence-backed lessons from solved problems, releases, audits, and incidents.
- `skills/knowledge-refresh-and-drift-control/SKILL.md` - stale guidance, duplicate truth, and knowledge refresh control.
- `skills/throwaway-prototyping/SKILL.md` - isolated disposable spikes and provider trials.
- `skills/dispatching-parallel-agents/SKILL.md` - safe parallelization decision protocol.
- `skills/subagent-driven-development/SKILL.md` - delegated implementation, status handling, and two-stage review.
- `skills/repeatable-agent-loops/SKILL.md` - bounded recurring, iterative, monitor-like, and repeat-until-stable workflows with receipts and stop conditions.
- `skills/long-horizon-agent-runtime/SKILL.md` - staged long-running agent work with checkpoints, artifact boundaries, and handoff control.
- `skills/project-bootstrap-and-setup/SKILL.md` - safe install, bootstrap, config, first-run, and setup-boundary handling.
- `skills/mcp-tool-governance/SKILL.md` - MCP, plugin, connector, tool auth, permission, overlap, and evidence governance.
- `skills/agent-observability-and-run-tracing/SKILL.md` - durable run traces, tool records, evidence trails, redactions, and artifact records.
- `skills/cybersecurity-risk-routing/SKILL.md` - cybersecurity routing, tier selection, and dual-use authorization gates.
- `skills/ai-application-security/SKILL.md` - LLM app, RAG, vector store, prompt, model, and AI tool security.
- `skills/security-incident-response/SKILL.md` - incident triage, evidence preservation, containment, recovery, and forensic security routing.
- `skills/supply-chain-and-build-provenance/SKILL.md` - dependencies, CI/CD, SBOMs, containers, IaC, signatures, and provenance.
- `skills/ui-ux-design-quality/SKILL.md` - frontend UI, UX, visual direction, accessibility and anti-generic design quality.
- `skills/anti-ai-writing-quality/SKILL.md` - human, direct, non-generic writing quality.
- `skills/strategist-writing-dna/SKILL.md` - verdict-first strategic communication and anti-drift prompt writing.
- Domain skills for deployment, scheduling, reporting, external APIs, media/assets, and cybersecurity.

## Permanent Authority Order

1. `20_skills/apivr.skill` and `20_skills/apivr/`
2. `10_governance/source_of_truth/Elite_Build_Goals_v3.md`
3. Canonical merged files in this repository
4. Archived upstream provenance notes

No adapter, agent persona, prompt template, convenience workflow, or older repository file may weaken APIVR or the 16 Elite Build Goals.

## Layout

- `00_start_here/` - source of truth, load order, activation rules
- `10_governance/` - APIVR, Elite Build Goals, evidence rules, release gates
- `20_skills/` - portable skill definitions and packaged APIVR skill
- `skills/` - runtime-loadable operational skills
- `30_agents/` - merged specialist agent roles
- `40_knowledge/` - reusable knowledge and workflow source material
- `50_audits/` - light through forensic audit protocols
- `60_templates/` - evidence ledgers, plans, completion reports, rollback records
- `90_archive/` - provenance and superseded-source mapping

## Completion Standard

Work is not done until the applicable APIVR phases have run, evidence is recorded, release gates are classified, and the final verdict honestly reflects reality: `PASS`, `CONDITIONAL PASS`, `PARTIAL`, `FAIL`, or `BLOCKED`.

## Verification

This kit includes a private, zero-dependency `package.json` only for verification commands. It is not an application runtime package and does not add build dependencies.

Run from the kit root:

```bash
npm run check
npm run verify
```

`npm run check` executes the doctor, generated capability-matrix check, complete Node suite, and Python review-package suite. The npm gate launches Python through `scripts/run-python-tests.mjs`, which selects `python3`, `python`, or `py -3` without invoking a shell, so the same gate can run on Linux, macOS, and Windows when Python 3 is installed.

`npm run verify` runs the doctor in strict mode. Missing document references that are warnings in ordinary doctor mode become failures in strict mode.

For independent diagnosis, the component commands remain available as `npm run doctor`, `npm run check:matrix`, `npm run test:node`, and `npm run test:python`.

## Runtime Adapters

The kit includes direct adapter files for common agent runtimes, including `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `REPLIT.md`, and `Manus.md`.
