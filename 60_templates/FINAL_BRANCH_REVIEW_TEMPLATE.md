# Final Whole-Branch Review

Canonical contract: `skills/subagent-driven-development/prompts/final-reviewer-prompt.md`.

This is APIVR Phase 4 at branch scope. No completion or release claim may be made before it passes, or an authorized non-critical risk is explicitly accepted.

| Field | Value |
|---|---|
| Run ID | |
| Reviewed range | `<plan_base_sha>..<branch_head_sha>` |
| Reviewer capability | Strongest available |
| Reviewer independence | Independent subagent / Fresh-context sequential pass (degraded) |
| Tasks in branch | |
| Date (UTC) | |

## Cumulative Change

| Metric | Value |
|---|---|
| Commits | |
| Files changed | |
| Tests added | |
| Tests changed | |

## Cross-Task Inspection

What only a branch-scope reviewer can see. Task reviewers each saw one slice.

| Check | Result | Evidence |
|---|---|---|
| Cross-task interactions | | |
| Weakened tests (an assertion one task relied on, softened by another) | | |
| Duplicated or conflicting rules introduced across tasks | | |
| Sequencing failures (correct in isolation, wrong in order) | | |
| Drift from the original plan (the sum of tasks not adding up to what was asked) | | |
| Findings marked cleared without real evidence | | |
| `CANNOT_VERIFY_FROM_DIFF` items quietly dropped rather than resolved | | |

## Finding Disposition

| State | Count | Notes |
|---|---|---|
| CLEARED | | |
| OPEN | | |
| CANNOT_VERIFY_FROM_DIFF | | Maps to Unknown; blocks final PASS |
| ACCEPTED_RISK | | Authority: |
| BLOCKED | | |

## Ledger Verification

- [ ] Every ledger claim of a test run has a recorded command, exit status, and result
- [ ] The ledger matches the cumulative diff

## Final Verification Commands

```text
$ <command>
exit status: <n>
```

## Unresolved Implementer Concerns

## Rollback Conditions

## Verdict

**PASS / CONDITIONAL PASS / PARTIAL / FAIL / BLOCKED**

Release-gate status:

Single next required action:
