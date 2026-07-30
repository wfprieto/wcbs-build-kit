---
name: finishing-a-development-branch
description: Use when implementation tasks are complete and the branch or worktree needs final verification, merge/PR/keep/discard decision support, cleanup, and release-readiness evidence.
activation: Activate when the description trigger applies to the current task.
required_inputs: Task request, relevant repository context, constraints, and authority dependencies.
required_outputs: Skill-specific artifact, verification evidence, canonical verdict, and next action.
authority_dependencies: 00_start_here/SOURCE_OF_TRUTH.md; 10_governance/APIVR_EXECUTION_LIFECYCLE.md; 10_governance/source_of_truth/Elite_Build_Goals_v3.md.
evidence_requirements: Executed checks or an honest Unknown, Not Run, or Blocked state for every material claim.
---

# Finishing A Development Branch

Choose an explicit finish path only after the branch proves its claimed
behavior. “The implementation looks complete” is not a merge decision.

## Process

```bash
git status --short --branch
git log --oneline --decorate origin/main..HEAD
git diff --check origin/main...HEAD
```

Then complete, in order:

1. Run every verification command named by the plan and list anything Not Run.
2. Re-read the complete `origin/main...HEAD` diff for scope, user-file safety,
   generated artifact drift, secrets, and weakened assertions.
3. Run the final review path. If a runtime has no independent reviewer, label
   the fresh-context substitute as degraded independence.
4. Check release gates, hosted CI requirements, rollback trigger, and support
   claims. A local pass does not replace a required hosted or authenticated
   runtime check.
5. Select exactly one path: open PR, merge after verified protected CI, retain
   branch for iteration, or discard after explicit approval.

## Worked Example

```bash
npm run release-check
git diff --check origin/main...HEAD
git status --short
```

If all local checks pass but the Windows matrix is still queued, the correct
status is `CONDITIONAL PASS`, not merge-ready. Keep the branch and wait for the
required hosted evidence. If a runtime clean-session test is Blocked, lower the
adapter’s verified support label rather than weakening the test.

## Cleanup Rules

- Never remove a worktree you did not create or cannot identify as yours.
- Never delete a branch until merge/PR state and remote protection are known.
- For a discard path, verify from outside the worktree, preserve the commit or
  patch needed for recovery, remove the worktree, then run `git worktree prune`.
- For a PR path, retain the worktree until review and re-review are complete.

## Final Receipt

```text
Branch and immutable head:
Verification run / not run:
Review and re-review state:
Release-gate status:
Chosen finish path:
Rollback trigger:
Evidence state and APIVR verdict:
Single next action:
```
