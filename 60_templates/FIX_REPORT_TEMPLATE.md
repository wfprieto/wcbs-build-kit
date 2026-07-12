# Fix Report

Canonical contract: `skills/subagent-driven-development/prompts/fix-agent-prompt.md`.

| Field | Value |
|---|---|
| Run ID | |
| Task ID | |
| Finding ID | |
| Repair round | n of 3 |
| Status | FIXED_PENDING_REVIEW / BLOCKED |
| Date (UTC) | |

A fix agent may **never** return `CLEARED`. A fix attempt does not clear a finding.

## Cause Addressed

Explain the cause, not merely the lines changed. A change that suppresses a symptom is not a fix.

## Changes Made

| File | Change |
|---|---|

## Regression Test

Added / Not applicable, with reason.

## Named Covering Tests Rerun

```text
$ <exact command>
exit status: <n>
<result>
```

Raw output: `test-evidence.txt`

## Test Integrity Statement

- [ ] No test was weakened, skipped, muted, or deleted to make this finding go away

## Repair Budget

Rounds used: n of 3. If exhausted, this returns `BLOCKED` and requires controller or human disposition. Severity may not be downgraded to escape the budget.

## Next

Requires independent re-review of the same scope before the finding may be `CLEARED`.
