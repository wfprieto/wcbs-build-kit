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

## Clean Code / Technical Debt

Check maintainability, complexity, naming, obsolete paths, hidden behavior, duplicated logic, casual error suppression, and local pattern consistency.

## Testing / QA / Verification

Check test coverage by risk, regression paths, manual workflow evidence, browser verification for UI, build/type/lint checks, and unrun verification.

## Data Integrity / Legacy Records / Cleanup Safety

Check writes, migrations, null/legacy handling, idempotency, transactions, duplicate prevention, reconciliation, backups, restore path, and irreversible actions.

## Operations / Observability

Check logs, metrics, health checks, alerts, queues/jobs, incident response, rollback, recovery, and administrative repair paths.

## Prompt / Skill / Agent Audit

Check activation clarity, authority order, portability, missing inputs, output contracts, evidence requirements, and whether reusable instructions can trigger reliably.

