# Release Gates

Source authority: `10_governance/source_of_truth/Elite_Build_Goals_v3.md`.

A release is Done only when all applicable gates pass or non-critical residual risk is explicitly accepted with owner, reason, compensating control, expiration, and reversal trigger.

## Gate A: Objective And Scope

- Objective, audience, outcome, scope, non-goals, and acceptance criteria are explicit.
- Actual implementation matches approved scope.
- Product/user/buyer premise, highest-risk assumption, success metric, and vertical slice are explicit when product strategy affects the work.
- Ambiguous requirements have been grilled to a decision or marked blocked.

## Gate B: Architecture And Source Of Truth

- Canonical sources are used.
- No unjustified parallel system or conflicting business rule exists.
- Dependencies and migration effects are understood.
- Domain vocabulary, state names, events, and durable decisions use the canonical glossary or ADR when applicable.
- Module boundaries, adapter boundaries, dependency direction, and deletion-test risk are acceptable for the tier.

## Gate C: Security, Privacy, And Permissions

- Inputs and permissions are enforced at trusted boundaries.
- Secrets and private data are protected.
- No unaccepted release-blocking exposure remains.
- Cybersecurity work has documented authorization, scope, and dual-use decision when applicable.
- AI apps, MCP/tools, external APIs, auth, webhooks, and security-sensitive integrations have applicable security evidence.
- Unknown core security evidence blocks release unless a decision owner explicitly accepts non-critical residual risk.

## Gate D: Data Integrity

- Writes, migrations, concurrency, duplication, and recovery are safely handled.
- Critical data is reconciled or verifiably preserved.

## Gate E: Reliability And Operations

- Primary and adverse states are handled.
- Material failures are observable.
- Recovery and rollback are available according to risk.
- Bugs and incidents have a red-capable feedback loop or documented evidence-first substitute before fix claims.

## Gate F: Product, Accessibility, Visual, And Commercial Quality

- Primary users can complete the task.
- Rendered experience matches the approved standard.
- Accessibility obligations are met or explicitly governed.
- Commercial and brand requirements are preserved.
- QA matrix covers happy path, adverse states, responsive behavior, and accessibility when user-visible workflows are affected.

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
- Security evidence, incident records, provenance checks, vulnerability exceptions, and authorization/scope records are included when applicable.
- Supply-chain releases identify dependency, CI/CD, artifact, SBOM, signing, or provenance evidence, or explicitly record approved gaps.
- Release readiness dashboard, changelog/release note, rollback trigger, post-release checks, QA health report, ADRs, and domain glossary are included when applicable.
- Developer-facing setup, docs, examples, API docs, release notes, and handoffs are accurate, redacted, and reference canonical artifacts.
