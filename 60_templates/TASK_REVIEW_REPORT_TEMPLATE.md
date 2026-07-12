# Task Review Report

Canonical contract: `skills/subagent-driven-development/prompts/task-reviewer-prompt.md`.

| Field | Value |
|---|---|
| Run ID | |
| Task ID | |
| Reviewed range | `<base_sha>..<head_sha>` |
| Reviewer independence | Independent subagent / Fresh-context sequential pass (degraded) |
| Date (UTC) | |

If independence is degraded, say so plainly. A fresh-context pass is a substitute, not an equal.

## Findings

| ID | Severity | File:line | Evidence | Required fix | State |
|---|---|---|---|---|---|
| F-1 | BLOCKING / CRITICAL / IMPORTANT / MINOR / OBSERVATION | | | | OPEN |

Every finding needs file-and-line evidence. A finding without a location is not a finding.

`BLOCKING`, `CRITICAL`, and `IMPORTANT` findings are material: each must complete fix -> named covering tests -> recorded result -> same-scope re-review before it can be `CLEARED`.

## Cannot Verify From Diff

| ID | What could not be established | Evidence required | Maps to |
|---|---|---|---|
| | | | Unknown |

These block a final `PASS` until resolved or explicitly accepted. They may not silently disappear.

## Stage 1: Spec Compliance

Objective, scope, non-goals, preserved behavior, source-of-truth order, acceptance criteria.

## Stage 2: Quality And Evidence

Test-first evidence, code quality, security, data safety, rollback, observability, release gates.

## Test Integrity Check

- [ ] No test skipped, deleted, weakened, muted, or rewritten merely to pass

## Evidence States

| Claim | State |
|---|---|
| | Verified / Likely / Suspected / Unknown / Not Run / Blocked |

## Verdict

**PASS / CONDITIONAL PASS / PARTIAL / FAIL / BLOCKED**

Next required action:
