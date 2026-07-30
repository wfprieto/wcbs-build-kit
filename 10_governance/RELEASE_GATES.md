# Release Gates

Source authority: `10_governance/source_of_truth/Elite_Build_Goals_v3.md`.

A release is Done only when all applicable gates pass or non-critical residual risk is explicitly accepted with owner, reason, compensating control, expiration, and reversal trigger.

A numeric or percentage score is informational only. It cannot override a failed, unknown, not-run, or blocked release-critical control.

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
- Composite audits coordinate specialists without duplicating or weakening their authoritative controls.

## Gate C: Security, Privacy, And Permissions

- Inputs and permissions are enforced at trusted boundaries.
- Secrets and private data are protected.
- No unaccepted release-blocking exposure remains.
- Cybersecurity work has documented authorization, scope, and dual-use decision when applicable.
- AI apps, MCP/tools, external APIs, auth, webhooks, and security-sensitive integrations have applicable security evidence.
- Provider-facing routes, including Stripe, Resend, OAuth/Auth callbacks, cron, SMS/provider queues, and external webhooks, have explicit route contracts: no human-login dependency for machine callers, correct provider signature/secret protection, and documented expected success/failure responses.
- Browser-delivered applications with authentication, private data, tenancy, uploads, payments, OAuth, webhooks, AI/tools, or production security controls use `50_audits/WEB_APPLICATION_SECURITY_AUDIT.md` and its evidence ledger.
- Protected pages and private APIs reject unauthenticated access at trusted server-side boundaries.
- Object, action, role, ownership, membership, delegation, and tenant authorization are negatively tested when applicable.
- Core cross-user, cross-role, and cross-tenant isolation is `Verified`; `Unknown`, `Not Run`, or `Blocked` core isolation blocks release.
- Session, cookie, token, password-reset, and account-recovery behavior is verified according to risk.
- Context-aware output encoding and sanitization prevent executable untrusted content.
- Upload and object-storage controls cover type, content, size, path, archive, authorization, privacy, malware risk, expiration, retention, and deletion when applicable.
- Browser and HTTP controls are verified from deployed responses when runtime verification is available.
- Unknown core security evidence blocks release unless a decision owner explicitly accepts non-critical residual risk. Core authentication, authorization, tenant isolation, active secret exposure, exploitable injection, and material payment integrity are not non-critical.

## Gate D: Data Integrity

- Writes, migrations, concurrency, duplication, and recovery are safely handled.
- Critical data is reconciled or verifiably preserved.
- Material web workflows verify idempotency, replay handling, duplicate-event behavior, stale state, race conditions, and ownership or role transitions when applicable.
- RLS or an equivalent trusted-boundary tenant and ownership control is verified when multi-tenant data is in scope.

## Gate E: Reliability And Operations

- Primary and adverse states are handled.
- Material failures are observable.
- Recovery and rollback are available according to risk.
- Bugs and incidents have a red-capable feedback loop or documented evidence-first substitute before fix claims.
- Outside-provider workflows are verified through the deployed URL path from provider to hosting/deployment protection to middleware to route handler to downstream state. Handler-only tests do not satisfy this gate for provider callbacks, webhooks, cron routes, or auth redirects.
- Logs, traces, errors, screenshots, support bundles, and evidence artifacts are reviewed for passwords, tokens, cookies, authorization headers, API keys, private prompts, retrieved private content, payment data, and unnecessary personal data.
- Backup restoration or a documented blocked state is included when recovery is a core safety requirement.

## Gate F: Product, Accessibility, Visual, And Commercial Quality

- Primary users can complete the task.
- Rendered experience matches the approved standard.
- Accessibility obligations are met or explicitly governed.
- Commercial and brand requirements are preserved.
- QA matrix covers happy path, adverse states, responsive behavior, and accessibility when user-visible workflows are affected.
- Authentication, permission, expiration, denial, error, upload, and recovery states are understandable and consistent for user-facing security workflows.

## Gate G: Performance, SEO, And Cost

- Approved experience class and thresholds are met.
- Material compromises are optimized, measured, approved, and reversible where possible.
- No unbounded cost or delivery risk exists.
- Rate limits, request sizes, query complexity, upload expansion, retries, background work, logs, storage, and AI/tool usage are bounded according to risk.

## Gate H: Verification And Handoff

- Required checks were run.
- Evidence ledger is complete.
- Documentation reflects durable behavior.
- Owners, known risks, and next actions are clear.
- For external integrations, the handoff records provider account/environment, deployed callback URL, provider event IDs or delivery logs, app logs, database/user-visible proof, and Preview/Production environment separation.
- No unrelated change remains hidden.
- Security evidence, incident records, provenance checks, vulnerability exceptions, and authorization/scope records are included when applicable.
- Web application releases include the completed `60_templates/WEB_APPLICATION_SECURITY_EVIDENCE_LEDGER_TEMPLATE.md` or an equivalent evidence artifact when the composite audit applies.
- Supply-chain releases identify dependency, CI/CD, artifact, SBOM, signing, or provenance evidence, or explicitly record approved gaps.
- Release readiness dashboard, changelog/release note, rollback trigger, post-release checks, QA health report, ADRs, and domain glossary are included when applicable.
- Developer-facing setup, docs, examples, API docs, release notes, and handoffs are accurate, redacted, and reference canonical artifacts.
