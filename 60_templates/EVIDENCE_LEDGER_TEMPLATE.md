# Evidence Ledger Template

Use for all Standard, Comprehensive, and Forensic work. Use a compressed version for Rapid when the final claim would otherwise be ambiguous.

| Claim | Goal | Applicability | Evidence State | Confidence | Evidence | Threshold | Result | Remaining Risk | Owner |
|---|---:|---|---|---|---|---|---|---|---|
|  |  | Universal / Conditional / Risk-Triggered / Not Applicable | Verified / Likely / Suspected / Unknown / Not Run / Blocked | High / Medium / Low |  |  | Pass / Partial / Fail / Blocked |  |  |

## Rules

- One material claim per row.
- Record failed, blocked, and not-run checks.
- Do not use one artifact as proof for unrelated claims.
- Separate observed result from interpretation.
- Redact secrets and private data.
- Update the ledger when later evidence changes the verdict.
- For provider-facing routes, use one row per route and include deployed URL, provider account/environment, provider event ID or delivery log, app log, database effect, user-visible effect, and Preview/Production separation evidence.

