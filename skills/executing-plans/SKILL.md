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

Execute an approved plan one verifiable slice at a time. A plan authorizes only
the stated change, not improvisation around a failing command or vague scope.

## Before the First Task

```bash
git status --short --branch
git log -1 --oneline
```

Confirm the branch, worktree, plan revision, target behavior, and rollback
point. Read all task dependencies before starting, then start only the first
independently testable slice.

## Process

1. Copy the exact task objective and acceptance check into a task receipt.
2. Write or identify the focused failing test. Run it and capture Red evidence.
3. Make the smallest production change that can make that test pass.
4. Re-run the focused test, then its direct neighbors. Refactor only while
   they remain Green.
5. Inspect the diff for unplanned files, generated artifacts, and weakened
   tests. If scope drift appears, stop and return to the plan owner.
6. Commit or checkpoint only a coherent task boundary. Do not batch unrelated
   “while here” cleanup into a verified slice.

## Per-Task Receipt

```text
Task and plan section:
Behavior and preserved behavior:
Red command and observed failure:
Green command and result:
Files changed:
Diff / scope audit:
Rollback point:
Evidence state and next step:
```

## Worked Example

```bash
node --test scripts/tests/v2-registry.test.mjs
# Expected before implementation: missing registry or stale generated metadata.

node scripts/generate-v2-metadata.mjs
node --test scripts/tests/v2-registry.test.mjs
# Expected after implementation: pass.

git diff --check
git diff -- scripts/generate-v2-metadata.mjs runtime_adapters/
```

If the generator changes an unrelated manifest, that is a scope failure, not a
reason to update the plan silently.

## Stop Conditions

- A required test fails for a different reason: repair the test setup first.
- A task needs new architecture, authority, credential, or user-file change:
  return to `writing-plans`.
- A checkpoint reveals a security or data-integrity risk: escalate APIVR tier.

When every task receipt is complete, use `verification-before-completion`, then
`finishing-a-development-branch` for the branch decision.
