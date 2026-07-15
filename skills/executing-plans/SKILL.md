---
name: executing-plans
description: Use when executing an approved APIVR implementation plan sequentially in the current session without subagents, while preserving TDD, review, ledger, and release gates.
---

# Executing Plans

Use this skill when a plan is approved but subagents are unavailable, unsafe, or unnecessary.

## Rules

- Keep APIVR and the 16 Elite Build Goals active.
- Execute one independently verifiable slice at a time.
- Use `skills/test-driven-development/SKILL.md` for code changes.
- Record progress in the evidence ledger or run trace.
- Stop on ambiguous requirements, failed baseline, missing evidence, or release-blocking unknowns.
- After all slices, use `skills/finishing-a-development-branch/SKILL.md`.

## Loop

1. Read the plan and pre-flight conflict report.
2. Confirm exact slice, files, tests, and rollback trigger.
3. Run Red-Green-Refactor or evidence-first substitute.
4. Audit the implementation against the slice.
5. Verify targeted and relevant broader checks.
6. Record evidence state and continue only if no material finding remains open.

## Final Output

Report APIVR tier, completed slices, tests and checks run, evidence state, release-gate status, remaining risks, final verdict, and next action.
