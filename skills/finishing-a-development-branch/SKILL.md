---
name: finishing-a-development-branch
description: Use when implementation tasks are complete and the branch or worktree needs final verification, merge/PR/keep/discard decision support, cleanup, and release-readiness evidence.
---

# Finishing A Development Branch

Use this skill after plan execution, subagent-driven development, or isolated feature work.

## Required Finish Gate

1. Verify current branch and worktree state.
2. Run the planned verification commands.
3. Run or confirm the final whole-branch review when subagents were used.
4. Check release gates and rollback triggers.
5. Present or execute one explicit finish path:
   - merge locally after verification;
   - create or prepare PR;
   - keep branch/worktree for more iteration;
   - discard branch/worktree after explicit approval.

## Cleanup Rules

- Never remove a worktree you did not create or do not own.
- Never delete a branch before merge/PR status is known.
- For manual `.worktrees/` cleanup: merge or discard first, verify from outside the worktree, remove worktree, then prune.
- For PR flow: keep the worktree until review iteration is complete.

## APIVR Closeout

End with APIVR tier, verification performed, verification not run, release-gate status, cleanup action, residual risks, final verdict, and next required action.
