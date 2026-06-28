---
name: release-readiness-and-ship-gates
description: Use before merging, shipping, deploying, publishing, handing off, or declaring done. Applies release readiness dashboards, changelog discipline, deploy/canary/post-release checks, rollback readiness, evidence classification, and APIVR release-gate enforcement.
---

# Release Readiness And Ship Gates

Use during APIVR Phase 5 Verify Implementation and Phase 6 Re-Audit.

<HARD-GATE>
Do not say shipped, done, ready, or PASS while any applicable release gate is failed, unknown, not run, or blocked without named risk acceptance.
</HARD-GATE>

## Ship Flow

```mermaid
flowchart TD
  A["Candidate ready"] --> B["Classify release gates A-H"]
  B --> C{"Any failed or unknown core gate?"}
  C -- "Yes" --> D["Block release or get explicit accepted risk"]
  C -- "No" --> E["Run final verification"]
  E --> F["Prepare rollback and changelog"]
  F --> G{"Deployment needed?"}
  G -- "Yes" --> H["Canary or post-deploy checks"]
  G -- "No" --> I["Completion report"]
  H --> I
```

## Required Outputs

- Release gate table.
- Evidence ledger or security evidence ledger when applicable.
- Rollback trigger and restoration path.
- Changelog or user-facing note when behavior changes.
- Post-release verification horizon for production changes.

## Worked Example

Scenario: Shipping a subscription cancellation fix.

- Gate C: auth and permission tests verified.
- Gate D: duplicate cancellation and billing reconciliation verified.
- Gate E: rollback is feature-flag disable plus previous handler restore.
- Gate H: evidence ledger complete.
- Verdict: `PASS` after targeted tests and provider sandbox replay are Verified.

