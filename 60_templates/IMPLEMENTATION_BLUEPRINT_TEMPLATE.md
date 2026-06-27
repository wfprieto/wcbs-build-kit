# Implementation Blueprint Template

Use during APIVR Phase 2 for Standard and above.

## Objective

## APIVR Tier

Rapid / Standard / Comprehensive / Forensic

## Applicable Elite Build Goals

| Goal | Applicability | Reason |
|---:|---|---|
|  |  |  |

## Current-State Summary

## Root Cause

## In Scope

## Out Of Scope

## Preserved Behavior

## Smallest Safe Change

## Test-First Implementation Plan

Required for code changes unless marked non-applicable with APIVR reason and alternate evidence.

### Red Phase

- Test file:
- Test name:
- Behavior or regression proved:
- Test code or exact test skeleton:

```text

```

- Command:
- Expected failing result before implementation:
- Evidence state: Verified / Likely / Suspected / Unknown / Not Run / Blocked
- Applicability note, if non-applicable:

### Green Phase

- Production files to change:
- Smallest implementation step:
- Command:
- Expected passing result:
- Evidence state: Verified / Likely / Suspected / Unknown / Not Run / Blocked
- Applicability note, if non-applicable:

### Refactor Phase

- Refactor target, if any:
- Behavior that must remain unchanged:
- Regression command:
- Evidence state: Verified / Likely / Suspected / Unknown / Not Run / Blocked
- Applicability note, if non-applicable:

## Interfaces / Files / Systems

## Dependencies

## Rollback Or Restoration

- Backup:
- Restore point:
- Rollback owner:
- Rollback trigger:

## Acceptance Criteria

| Criterion | Evidence Required | Horizon |
|---|---|---|
|  |  | Immediate / Leading-indicator / 30-day / 60-day / 90-day |

## Evidence Ledger Entries

| Claim | Evidence Source | State | Owner | Notes |
|---|---|---|---|---|
|  |  | Verified / Likely / Suspected / Unknown / Not Run / Blocked |  |  |

## Subagent / Parallel Work Plan

Required when any work is delegated.

| Agent Role | Scope | Editable Files | Forbidden Files | Required Evidence | Status |
|---|---|---|---|---|---|
|  |  |  |  |  | Pending / DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED |

## Challenge Review

Required for Important, Critical, Comprehensive, and Forensic work.

## Zero-Placeholder Check

- [ ] No TBD, later, as needed, or vague file references remain.
- [ ] Exact files or discovery steps are named.
- [ ] Tests or evidence-first substitutes are embedded.
- [ ] Rollback trigger and restore path are defined.
- [ ] Release gates are known or explicitly blocked.
