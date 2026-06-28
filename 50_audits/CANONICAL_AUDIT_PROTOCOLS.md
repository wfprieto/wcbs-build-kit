# Canonical Audit Protocols

Use these as merged audit modules. Apply only the relevant modules for the selected APIVR tier.

## Foundation / Build Readiness

Check objective, source of truth, setup, configuration, dependencies, environment, commands, ownership, and acceptance criteria.

## Master System Audit

Check architecture, boundaries, data flow, duplication, routing, integration points, critical workflows, and source-of-truth conflicts.

## Security / Privacy / Access Control

Check authentication, authorization, trusted-boundary validation, secrets, sensitive data, logs, webhooks, abuse protection, retention, and deletion.

## Architecture / Module Boundary / Scalability

Check module ownership, coupling, business-rule centralization, dependency direction, scale assumptions, operational limits, and migration paths.

## Workflow / Clickpath / UI Interaction

Check primary user tasks, navigation, labels, feedback, loading/empty/error/success states, keyboard behavior, responsiveness, and accessibility.

## Frontend Design / UX / Visual Quality

Check design brief, audience fit, page or screen job, visual direction, design-system consistency, anti-generic UI risk, hierarchy, typography, palette, spacing, signature element, responsive layout, accessibility, interface copy, rendered verification, and whether the design serves the actual subject.

## Clean Code / Technical Debt

Check maintainability, complexity, naming, obsolete paths, hidden behavior, duplicated logic, casual error suppression, and local pattern consistency.

## Testing / QA / Verification

Check test coverage by risk, test-first order, Red-Green-Refactor evidence, regression paths, manual workflow evidence, browser verification for UI, build/type/lint checks, and unrun verification.

## Data Integrity / Legacy Records / Cleanup Safety

Check writes, migrations, null/legacy handling, idempotency, transactions, duplicate prevention, reconciliation, backups, restore path, and irreversible actions.

## Operations / Observability

Check logs, metrics, health checks, alerts, queues/jobs, incident response, rollback, recovery, and administrative repair paths.

## Deployment / Hosting / Runtime Placement

Check hosting tier, environment separation, persistent versus ephemeral workload routing, build/deploy commands, rollback, DNS/domains, cost drivers, scaling assumptions, and post-deploy verification.

## Scheduling / Automation / Reporting

Check cron/scheduler, webhook, queue, event-driven, worker, monitor, and always-on workload fit; retry, timeout, idempotency, duplicate prevention, observability, backfill, data freshness, output accuracy, permissions, and reporting horizon.

## Repeatable Agent Loops

Check loop objective, scope, non-scope, one-step action rule, evidence check, continue condition, stop conditions, iteration budget, receipt quality, approval boundaries, no-progress detection, unsafe-to-continue handling, and whether the loop remains subordinate to APIVR.

## External API / Third-Party Integration

Check provider contract, auth method, secret storage, scopes, validation, timeout, retry, rate-limit handling, idempotency, webhook verification, safe logging, sandbox/test mode, quota/cost, and dependency failure behavior.

## Media / Asset Pipeline

Check asset provenance, rights/licensing, generate versus retrieve versus reference decision, transformation, optimization, responsive delivery, caching/CDN, accessibility metadata, fallback behavior, and rendered output.

## Prompt / Skill / Agent Audit

Check activation clarity, authority order, portability, missing inputs, output contracts, evidence requirements, skill invocation logic, subagent dispatch safety, review gates, and whether reusable instructions can trigger reliably.

## Writing / Copy / Voice Quality

Check audience, purpose, proof standard, generic AI tells, filler, hype, fake certainty, unsupported claims, rhythm, client-facing credibility, verdict-first structure, anti-drift scope, and whether the writing ends with a clear action or boundary.
