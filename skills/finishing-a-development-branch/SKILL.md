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

## Process

1. Load only the authority and task context required by this skill.
2. Execute the narrow workflow without bypassing APIVR, Elite Build Goals, or evidence requirements.
3. Verify the result and report a canonical verdict with remaining risk and next action.
