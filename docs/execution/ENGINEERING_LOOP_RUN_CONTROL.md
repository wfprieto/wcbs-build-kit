# WCBS Engineering Loop Run Control

## Run ID

`wcbs-remediation-2026-07-30`

## Objective

Improve WCBS from the verified `origin/main` baseline using the attached remediation plan, while preserving truthful support boundaries. Completion requires evidence for every internal engineering claim. Live runtime and behavioral-superiority claims require real clean-session evidence and remain blocked until such evidence exists.

## APIVR Tier

Comprehensive. The work changes agent instructions, adapters, installer/release controls, CI, provenance, and support claims.

## Scope

- Allowed: WCBS source, tests, documentation, CI, generated metadata, local clean worktrees, and GitHub repository actions authorized by the user.
- Forbidden: deleting unrelated user work, weakening tests or release gates, fabricating runtime evidence, publishing a runtime-support or superiority claim without independent evidence, and destructive remote changes outside the WCBS repository.

## One-Step Action Rule

Each iteration performs one independently reviewable vertical slice: baseline, plan, a test-first implementation, a review/remediation, or a verification gate.

## Evidence And Stop Conditions

- Evidence: command output, source inspection, generated artifact, GitHub workflow result, or raw clean-session transcript.
- Continue only when the previous slice is recorded and its affected tests are green.
- Stop as `BLOCKED` for unavailable runtime access, immutable model identity, independent evaluator availability, credentials, or a required external provider.
- Stop as `UNSAFE_TO_CONTINUE` for a critical unresolved security or installer defect.
- Iteration budget: 12 implementation slices or 8 hours, whichever occurs first. The run may end earlier when remaining work is exclusively external-evidence blocked.

## Rollback

All code changes occur on `feat/wcbs-engineering-loop-20260730`. Revert individual commits or abandon the branch; do not modify `main` directly.

## Phase Order

0. Reproducible baseline and reconciled branch state.
1. Canonical core and drift detection.
2. Risk-adaptive engineering lifecycle.
3-5. Runtime activation and behavioral evaluation, only where genuine runtime access and independent evidence exist.
6-7. Security, CI, release, and upstream governance.
8. Documentation and honest support boundaries.
9. Independent 20-pass validation and merge decision.

## Final Verdict Rule

`PASS` requires all applicable internal gates to pass and all completion-critical external evidence to be verified. `CONDITIONAL PASS` may be used only for a merge-ready hardening release whose documentation explicitly preserves blocked live-runtime claims. No score overrides a blocked critical evidence gate.
