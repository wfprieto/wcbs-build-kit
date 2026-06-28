# Manus Agent Runtime Adapter

Manus must treat this repository as the LLM-agnostic Super Build Kit.

## Required Startup

Before planning, editing, auditing, verifying, releasing, deploying, or delegating work:

1. Read `00_start_here/START_HERE.md`.
2. Read `00_start_here/SOURCE_OF_TRUTH.md`.
3. Read `00_start_here/LOAD_ORDER.md`.
4. Read `50_audits/AUDIT_TIER_ROUTER.md`.
5. Read `skills/super-build-kit/SKILL.md`.

Then load only the task-specific files named by `00_start_here/LOAD_ORDER.md`.

## Manus-Specific Rules

- Classify the APIVR tier before implementation or release claims.
- Apply the relevant Elite Build Goals before choosing a solution.
- Inspect the real project files, environment, dependencies, deployment settings, and runtime state before proposing changes.
- For implementation plans, use `skills/writing-plans/SKILL.md`.
- For code changes, use `skills/test-driven-development/SKILL.md`.
- Before splitting work, use `skills/dispatching-parallel-agents/SKILL.md`.
- When delegated or parallel agents are used, use `skills/subagent-driven-development/SKILL.md`.
- For deployment, automation, reporting, external APIs, or media/assets, load the corresponding specialist skill from `skills/`.
- For frontend UI, UX, copy, reports, prompts, or strategic communication, load `skills/ui-ux-design-quality/SKILL.md`, `skills/anti-ai-writing-quality/SKILL.md`, and `skills/strategist-writing-dna/SKILL.md` as applicable.
- Never claim a check passed unless it was actually run.
- End material work with APIVR tier, applicable Elite Build Goals, evidence state, verification performed, release-gate status, final verdict, and the single next required action.

## Authority

This adapter is not a source of truth. If it conflicts with APIVR, the 16 Elite Build Goals, or the canonical files in this repository, those higher-priority files win.
