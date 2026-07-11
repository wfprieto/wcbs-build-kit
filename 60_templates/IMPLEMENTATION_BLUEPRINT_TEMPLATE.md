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

Required for bugs, incidents, regressions, flaky behavior, or unknown failures:

- Symptom:
- Expected behavior:
- Observed behavior:
- Reproduction or trace:
- Red-capable feedback loop:
- Hypotheses tested:
- Supported cause:

## Product / Requirements Alignment

Complete when product strategy, requirements, PRD, issue slicing, or ambiguous scope is in play.

- User:
- Buyer / decision owner:
- Pain or job:
- Highest-risk assumption:
- Alternatives considered:
- Success metric:
- Smallest verifiable vertical slice:
- Non-goals:

## Domain Glossary / ADR Plan

Complete when domain terms, states, events, roles, architecture, providers, data, security, operations, cost, or reversibility affect the work.

- Domain glossary location:
- Canonical terms introduced or changed:
- ADR location:
- Decision requiring ADR:
- Reversal trigger:

## In Scope

## Out Of Scope

## Preserved Behavior

## Smallest Safe Change

## Issue Slices

Required when the plan is larger than one independently verifiable unit.

| Slice | User/System Outcome | Files Likely Affected | Evidence | Dependencies |
|---|---|---|---|---|
|  |  |  |  |  |

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

## Architecture / Module Boundary Plan

Complete when architecture, modules, adapters, refactors, dependency direction, or deep module design are in scope.

- Source-of-truth module:
- Public interface:
- Adapter boundary:
- Dependency direction:
- Deletion test:
- Locality risk:
- Codebase design evidence:

## UI / UX / Writing Requirements

Complete when user-facing interface, copy, reports, prompts, client-facing communication, dashboards, forms, landing pages or visual design are in scope.

- Design brief:
- UI/UX review checklist:
- Writing quality skill:
- Strategist voice requirement:
- Audience:
- Voice:
- Proof standard:
- Accessibility gates:
- Responsive viewports:
- Rendered verification:

## Dependencies

## External Integration Launch Gate

Complete when an outside system calls the app or the work touches provider callbacks, webhooks, OAuth/Auth redirects, cron/scheduler calls, SMS/provider queues, payment/email providers, provider dashboard URLs, deployment protection, sandbox/live mode, or Preview/Production environment variables.

- External integration launch gate skill:
- Provider/caller:
- Provider account/environment:
- Deployed callback URL:
- Route contract location:
- Human login required: Yes / No
- Machine protection:
- Middleware/layout/deployment protection expectation:
- Provider dashboard test:
- Expected success response:
- Expected missing/invalid protection response:
- Database effect:
- User-visible effect:
- Idempotency/retry evidence:
- Production value:
- Preview value:
- Local value:
- Blocking unknowns:

## Cybersecurity / Authorization / Supply Chain Plan

Complete when cybersecurity, app security, AI security, MCP/tool security, incidents, dependencies, CI/CD, containers, IaC, SBOMs, live testing, or dual-use work is in scope.

- Cybersecurity risk routing skill:
- Security framework mapping:
- Authorization/scope record:
- Security evidence ledger:
- Dual-use decision:
- Security tests/checks:
- AI security checks:
- Incident response or containment plan:
- Supply-chain/provenance checks:
- Release-blocking unknowns:

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

## Repeatable Loop Plan

Required when work is recurring, iterative, monitor-like, or repeat-until-stable.

- Loop design file or section:
- One-step action rule:
- Evidence check:
- Continue condition:
- Stop conditions:
- Iteration budget:
- Receipt location:

## Long-Horizon / Setup / Tooling Plan

Complete when work spans multiple stages, tools, subagents, artifacts, context windows, setup steps, or MCP/tool governance.

- Long-horizon run-control template:
- Run trace template:
- Workspace/scratch/evidence/final-output boundaries:
- Checkpoint cadence:
- Context that must not be summarized away:
- Setup boundary and files not to read/overwrite:
- MCP/tool permissions and auth handling:
- Harmless verification command:

## QA Health Plan

Complete when user-visible workflow, browser behavior, rendered UI, manual QA, or adverse states matter.

- QA health report:
- Happy path:
- Empty/loading/error states:
- Permission/auth boundary:
- Responsive viewports:
- Accessibility checks:
- Screenshot/video evidence:
- Retest loop:

## Release Readiness Plan

Complete before merge, deploy, publish, handoff, or done claims.

- Release readiness dashboard:
- Gate A-H status:
- Changelog/release note:
- Rollback trigger:
- Post-release checks:
- Accepted risks:

## DevEx / Documentation Plan

Complete when setup, docs, examples, API docs, release notes, or handoffs are affected.

- Docs to update:
- Commands to verify:
- Examples to verify:
- Redaction requirements:
- Canonical artifacts to reference:

## Challenge Review

Required for Important, Critical, Comprehensive, and Forensic work.

## Zero-Placeholder Check

- [ ] No TBD, later, as needed, or vague file references remain.
- [ ] Exact files or discovery steps are named.
- [ ] Tests or evidence-first substitutes are embedded.
- [ ] Product/requirements, domain glossary, ADR, issue slicing, architecture, QA, release, and DevEx sections are completed or intentionally non-applicable.
- [ ] Rollback trigger and restore path are defined.
- [ ] Release gates are known or explicitly blocked.
