# Start Here

This is the first file every LLM, coding agent, subagent, reviewer, or automation must read before using the Super Build Kit.

## Non-Negotiable Operating Law

**Audit wide. Fix narrow. Prove everything.**

Do not start from a fix. Start from the APIVR tier router, inspect the real system, identify the applicable Elite Build Goals, then proceed through the scaled APIVR lifecycle.

## Required Startup Sequence

1. Read `00_start_here/SOURCE_OF_TRUTH.md`.
2. Read `00_start_here/LOAD_ORDER.md`.
3. Read `50_audits/AUDIT_TIER_ROUTER.md`.
4. Read `skills/super-build-kit/SKILL.md` when skill invocation, platform activation, planning, implementation, or delegation may affect the task.
5. Classify the request as Rapid, Standard, Comprehensive, or Forensic.
6. Load the smallest complete file set required for the task.
7. State the tier, applicable goals, and evidence requirements before implementation or release claims.

## Mandatory Skill Layer

- Use `skills/writing-plans/SKILL.md` for APIVR Phase 2 implementation, remediation, or handoff plans.
- Use `skills/requirements-grilling-and-alignment/SKILL.md` when requirements are ambiguous, broad, conflicting, or assumption-heavy.
- Use `skills/product-strategy-office-hours/SKILL.md` when product, founder, buyer, user, or strategic decision clarity is needed before planning.
- Use `skills/domain-modeling-and-shared-language/SKILL.md` when domain vocabulary, states, roles, events, or ADRs affect the work.
- Use `skills/product-requirements-and-issue-slicing/SKILL.md` when ideas, PRDs, audits, or plans must become vertical, independently verifiable slices.
- Use `skills/test-driven-development/SKILL.md` for APIVR Phase 3 code work.
- Use `skills/codebase-design-and-deep-modules/SKILL.md` when architecture, module boundaries, adapters, or refactor shape matters.
- Use `skills/engineering-plan-review/SKILL.md` before implementing high-risk or multi-file technical plans.
- Use `skills/code-review-and-review-army/SKILL.md` for APIVR Phase 4 implementation audit and specialist review passes.
- Use `skills/diagnosing-bugs-and-feedback-loops/SKILL.md` before fixing bugs, incidents, regressions, or unknown failures.
- Use `skills/throwaway-prototyping/SKILL.md` when work is a spike, experiment, provider trial, or disposable proof of concept.
- Use `skills/qa-and-browser-verification/SKILL.md` when user-visible workflows, browser behavior, or manual QA evidence are required.
- Use `skills/release-readiness-and-ship-gates/SKILL.md` before merge, deploy, publish, handoff, or done claims.
- Use `skills/devex-and-documentation-review/SKILL.md` when setup, docs, examples, onboarding, API docs, release notes, or handoffs are affected.
- Use `skills/dispatching-parallel-agents/SKILL.md` before splitting work.
- Use `skills/subagent-driven-development/SKILL.md` when delegated agents implement, review, or verify work.
- Use `skills/repeatable-agent-loops/SKILL.md` when work is recurring, iterative, monitor-like, or should repeat until a measurable condition is met or safely stopped.
- Use `skills/long-horizon-agent-runtime/SKILL.md` when work spans many stages, tools, subagents, checkpoints, artifacts, or context windows.
- Use `skills/project-bootstrap-and-setup/SKILL.md` before installing, bootstrapping, configuring, or starting a project.
- Use `skills/mcp-tool-governance/SKILL.md` before enabling, configuring, or auditing MCP servers, plugins, connectors, or tool permissions.
- Use `skills/agent-observability-and-run-tracing/SKILL.md` when serious work needs a durable run trace, tool record, evidence trail, or handoff audit.
- Use `skills/cybersecurity-risk-routing/SKILL.md` when cybersecurity, app security, AI security, MCP/tool security, vulnerability, incident, supply-chain, scanning, red-team, or dual-use work is in scope.
- Use `skills/ai-application-security/SKILL.md` when LLM apps, RAG, vector stores, prompt injection, system prompt leakage, AI tools, or model/data leakage are in scope.
- Use `skills/security-incident-response/SKILL.md` when suspicious activity, alerts, compromise, data leakage, ransomware, unauthorized access, or forensic security work is in scope.
- Use `skills/supply-chain-and-build-provenance/SKILL.md` when dependencies, CI/CD, SBOMs, containers, IaC, artifact signing, provenance, or release trust are in scope.
- Use `skills/ui-ux-design-quality/SKILL.md` when frontend UI, UX, visual design, accessibility, responsive behavior, dashboards, forms, landing pages or interface copy are in scope.
- Use `skills/anti-ai-writing-quality/SKILL.md` when writing must sound human, direct, specific and free of generic AI tone.
- Use `skills/strategist-writing-dna/SKILL.md` when writing must be verdict-first, strategic, scoped, proof-driven or anti-drift.
- Use domain skills when deployment, automation, reporting, external APIs, or media/assets are in scope.

## Stop Conditions

Stop and report instead of guessing when:

- required files, credentials, logs, data, or context are missing;
- a destructive or irreversible action is requested without explicit authorization and rollback planning;
- a material security, privacy, authorization, payment, data-integrity, or production-availability risk appears;
- evidence is unavailable for a required completion claim;
- code implementation is requested but test-first or alternate evidence cannot be established;
- user-facing UI is requested but design direction, accessibility requirements or rendered verification cannot be established;
- content is requested but proof, audience, voice or factual status cannot be established;
- product work lacks user, buyer, pain, success metric, non-goals, or a smallest verifiable slice;
- domain-heavy work lacks canonical terms, state definitions, or an ADR for a durable decision;
- bug work lacks reproduction, observation, trace, or a red-capable feedback loop;
- prototype work is not isolated, marked throwaway, and bounded by a learning question;
- release work has unknown, failed, not-run, or blocked core gates without named risk acceptance;
- a repeatable loop lacks a measurable objective, one-step action rule, evidence check, stop condition, or iteration budget;
- long-horizon work lacks checkpoints, workspace boundaries, trace rules, or artifact locations;
- setup work would inspect secrets, overwrite config, mutate production resources, or exceed the setup boundary;
- MCP/tool work lacks clear auth handling, permission scope, overlap resolution, or harmless verification;
- cybersecurity work lacks scope, authorization, target ownership, safety boundaries, evidence rules, or a dual-use decision;
- live scanning, exploitation, phishing, credential testing, malware execution, MCP probing, prompt extraction, RAG poisoning, vector leakage testing, or third-party target testing is requested without explicit written authorization and rules of engagement;
- delegated work returns `NEEDS_CONTEXT` or `BLOCKED` and no safe reroute exists;
- two sources of truth conflict and the conflict is not resolved by `SOURCE_OF_TRUTH.md`.

## Minimum Output for Any Work Cycle

Even the smallest Rapid task must end with:

- APIVR tier;
- what was inspected;
- what changed or what was found;
- verification performed or marked `Not Run` / `Blocked`;
- final verdict;
- single next required action.
