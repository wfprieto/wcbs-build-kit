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
- Use `skills/test-driven-development/SKILL.md` for APIVR Phase 3 code work.
- Use `skills/dispatching-parallel-agents/SKILL.md` before splitting work.
- Use `skills/subagent-driven-development/SKILL.md` when delegated agents implement, review, or verify work.
- Use `skills/repeatable-agent-loops/SKILL.md` when work is recurring, iterative, monitor-like, or should repeat until a measurable condition is met or safely stopped.
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
- a repeatable loop lacks a measurable objective, one-step action rule, evidence check, stop condition, or iteration budget;
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
