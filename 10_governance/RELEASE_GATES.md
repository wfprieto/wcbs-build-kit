# Release Gates

Source authority: `10_governance/source_of_truth/Elite_Build_Goals_v3.md`.

A release is Done only when all applicable gates pass or non-critical residual risk is explicitly accepted with owner, reason, compensating control, expiration, and reversal trigger.

## Gate A: Objective And Scope

- Objective, audience, outcome, scope, non-goals, and acceptance criteria are explicit.
- Actual implementation matches approved scope.

## Gate B: Architecture And Source Of Truth

- Canonical sources are used.
- No unjustified parallel system or conflicting business rule exists.
- Dependencies and migration effects are understood.

## Gate C: Security, Privacy, And Permissions

- Inputs and permissions are enforced at trusted boundaries.
- Secrets and private data are protected.
- No unaccepted release-blocking exposure remains.

## Gate D: Data Integrity

- Writes, migrations, concurrency, duplication, and recovery are safely handled.
- Critical data is reconciled or verifiably preserved.

## Gate E: Reliability And Operations

- Primary and adverse states are handled.
- Material failures are observable.
- Recovery and rollback are available according to risk.

## Gate F: Product, Accessibility, Visual, And Commercial Quality

- Primary users can complete the task.
- Rendered experience matches the approved standard.
- Accessibility obligations are met or explicitly governed.
- Commercial and brand requirements are preserved.

## Gate G: Performance, SEO, And Cost

- Approved experience class and thresholds are met.
- Material compromises are optimized, measured, approved, and reversible where possible.
- No unbounded cost or delivery risk exists.

## Gate H: Verification And Handoff

- Required checks were run.
- Evidence ledger is complete.
- Documentation reflects durable behavior.
- Owners, known risks, and next actions are clear.
- No unrelated change remains hidden.

