---
name: executing-plans
description: Use when executing an approved APIVR implementation plan sequentially in the current session without subagents, while preserving TDD, review, ledger, and release gates.
activation: Activate when the description trigger applies to the current task.
required_inputs: Task request, relevant repository context, constraints, and authority dependencies.
required_outputs: Skill-specific artifact, verification evidence, canonical verdict, and next action.
authority_dependencies: 00_start_here/SOURCE_OF_TRUTH.md; 10_governance/APIVR_EXECUTION_LIFECYCLE.md; 10_governance/source_of_truth/Elite_Build_Goals_v3.md.
evidence_requirements: Executed checks or an honest Unknown, Not Run, or Blocked state for every material claim.
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

## Process

1. Load only the authority and task context required by this skill.
2. Execute the narrow workflow without bypassing APIVR, Elite Build Goals, or evidence requirements.
3. Verify the result and report a canonical verdict with remaining risk and next action.
