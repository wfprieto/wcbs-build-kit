# Canonical Audit Protocols

Use these as merged audit modules. Apply only the relevant modules for the selected APIVR tier.

## Foundation / Build Readiness

Check objective, source of truth, setup, configuration, dependencies, environment, commands, ownership, and acceptance criteria.

## Product Strategy / Requirements Alignment

Check user, buyer, pain, urgency, success metric, premise evidence, alternatives, highest-risk assumption, non-goals, acceptance criteria, and smallest verifiable product slice.

## Domain Modeling / ADR Discipline

Check canonical terms, synonyms, entities, events, states, roles, invariants, bounded contexts, source-of-truth vocabulary, ADRs for durable decisions, and whether code/tests/UI/reporting use the shared language.

## Master System Audit

Check architecture, boundaries, data flow, duplication, routing, integration points, critical workflows, and source-of-truth conflicts.

## Security / Privacy / Access Control

Check authentication, authorization, trusted-boundary validation, secrets, sensitive data, logs, webhooks, abuse protection, retention, and deletion.

## Cybersecurity Risk Routing / Dual-Use Safety

Check security objective, target ownership, written authorization, rules of engagement, scope/non-scope, dual-use activity, live-system impact, evidence handling, stop conditions, and whether the work must be planning-only.

## Application Security / API Security

Check OWASP API risks, BOLA/IDOR, broken authentication, broken function-level authorization, mass assignment, SSRF, unsafe consumption of APIs, inventory, rate limits, abuse controls, input validation, output encoding, logging, and sensitive data exposure.

## AI Application Security

Check prompt boundaries, system prompt leakage, secrets in prompts, prompt injection, indirect injection through retrieved content, RAG corpus trust, vector/embedding leakage, tenant isolation, retrieval poisoning, model routing, tool abuse, output leakage, and regression probes.

## Architecture / Module Boundary / Scalability

Check module ownership, coupling, business-rule centralization, dependency direction, scale assumptions, operational limits, and migration paths.

## Codebase Design / Deep Modules

Check module depth, interface simplicity, adapter boundaries, dependency direction, locality, deletion test, provider leakage, public-interface testability, domain naming, and whether indirection hides real complexity.

## Workflow / Clickpath / UI Interaction

Check primary user tasks, navigation, labels, feedback, loading/empty/error/success states, keyboard behavior, responsiveness, and accessibility.

## Frontend Design / UX / Visual Quality

Check design brief, audience fit, page or screen job, visual direction, design-system consistency, anti-generic UI risk, hierarchy, typography, palette, spacing, signature element, responsive layout, accessibility, interface copy, rendered verification, and whether the design serves the actual subject.

## Clean Code / Technical Debt

Check maintainability, complexity, naming, obsolete paths, hidden behavior, duplicated logic, casual error suppression, and local pattern consistency.

## Testing / QA / Verification

Check test coverage by risk, test-first order, Red-Green-Refactor evidence, regression paths, manual workflow evidence, browser verification for UI, build/type/lint checks, and unrun verification.

Check QA workflow matrix, happy path, empty/loading/error states, permission boundaries, responsive viewports, accessibility, screenshots or recordings when relevant, issue taxonomy, fix loop, QA health report, and retest evidence.

## Debugging / Root Cause / Feedback Loop

Check symptom, expected behavior, observed behavior, reproduction, red-capable feedback loop, scope lock, hypotheses tested, cause versus contributing factor, smallest fix, and collateral regression scan.

## Data Integrity / Legacy Records / Cleanup Safety

Check writes, migrations, null/legacy handling, idempotency, transactions, duplicate prevention, reconciliation, backups, restore path, and irreversible actions.

## Operations / Observability

Check logs, metrics, health checks, alerts, queues/jobs, incident response, rollback, recovery, and administrative repair paths.

## Deployment / Hosting / Runtime Placement

Check hosting tier, environment separation, persistent versus ephemeral workload routing, build/deploy commands, rollback, DNS/domains, cost drivers, scaling assumptions, and post-deploy verification.

## Scheduling / Automation / Reporting

Check cron/scheduler, webhook, queue, event-driven, worker, monitor, and always-on workload fit; retry, timeout, idempotency, duplicate prevention, observability, backfill, data freshness, output accuracy, permissions, and reporting horizon.

## External Integration Launch Gate

Check every route that an outside system calls: provider dashboard URL, deployed environment, hosting/deployment protection, middleware, app layouts, route handler, provider signature or shared-secret validation, idempotency, database effect, user-visible effect, logs, and retry/replay behavior. Verify machine callers are not forced through human login, and verify Preview/Production environment values intentionally separate sandbox/test and live provider modes.

## Repeatable Agent Loops

Check loop objective, scope, non-scope, one-step action rule, evidence check, continue condition, stop conditions, iteration budget, receipt quality, approval boundaries, no-progress detection, unsafe-to-continue handling, and whether the loop remains subordinate to APIVR.

## Long-Horizon Agent Runtime / Traceability

Check stage plan, checkpoints, context preservation, handoff summaries, subagent boundaries, loop boundaries, workspace/scratch/evidence/final-output separation, generated artifacts, run id, trace completeness, redaction, stop reasons, and whether final claims are backed by durable evidence instead of chat memory.

## Project Bootstrap / Setup Safety

Check package manager evidence, lockfiles, setup scripts, config preservation, secret-bearing files, environment examples, install/build commands, generated files, local services, production/resource mutation risk, exact next command, and whether setup claims are limited to verified setup evidence.

## MCP / Tool Governance

Check tool purpose, permission scope, filesystem/network/database/API reach, auth and secret handling, overlapping tool capabilities, destructive action gates, logging/redaction, harmless verification, and which tool produced which evidence.

Check MCP/tool poisoning, tool shadowing, rug-pull description changes, toxic tool flows, unauthenticated MCP exposure, SSRF-capable tools, allowlisted tool schemas, least-privilege identity binding, and human approval gates for high-impact tool calls.

## Security Incident Response

Check alert source, timeline, affected assets/users, severity, evidence preservation, containment, eradication, recovery, communication, owner/signoff, related authentication/network/endpoint events, residual indicators, and post-incident lessons.

## Supply Chain / Build Provenance

Check dependency changes, lockfiles, secret scans, container/image scans, IaC scans, SBOM, license/security policy, CI/CD workflow permissions, action pinning, OIDC, artifact signing, SLSA/Sigstore provenance, registry trust, and accepted CVE exceptions.

## Vulnerability Triage

Check exploitation status, public PoC, CISA KEV/EPSS where applicable, technical impact, automatability, asset prevalence, business criticality, public/regulated impact, remediation SLA, compensating controls, and owner.

## External API / Third-Party Integration

Check provider contract, auth method, secret storage, scopes, validation, timeout, retry, rate-limit handling, idempotency, webhook verification, safe logging, sandbox/test mode, quota/cost, and dependency failure behavior.

For inbound provider routes, also apply the External Integration Launch Gate: direct handler tests are insufficient unless the deployed provider-to-app path is verified or explicitly blocked with owner-approved risk.

## Media / Asset Pipeline

Check asset provenance, rights/licensing, generate versus retrieve versus reference decision, transformation, optimization, responsive delivery, caching/CDN, accessibility metadata, fallback behavior, and rendered output.

## Prompt / Skill / Agent Audit

Check activation clarity, authority order, portability, missing inputs, output contracts, evidence requirements, skill invocation logic, subagent dispatch safety, review gates, and whether reusable instructions can trigger reliably.

## 20 Pass Protocol Audit

Check whether high-stakes prompts, agents, skills, source files, plans, audits, runbooks, templates, release instructions, and final reports received a full or justified compressed 20 Pass Protocol review. Verify the pass summary is honest, source-of-truth discipline is intact, verification requirements are explicit, and remaining limitations are named.

## Engineering Plan Review / Specialist Code Review

Check zero-placeholder plan quality, file/path specificity, source-of-truth alignment, architecture fit, risk review, review-army specialist passes, scope drift, finding severity, and whether Blocking findings route back through APIVR before release.

## Release Readiness / Ship Gates

Check release gate dashboard, changelog, rollback trigger, post-release horizon, canary or deploy verification where applicable, owner signoff, accepted-risk records, and whether done claims match evidence.

## DevEx / Documentation / Handoff

Check setup instructions, command accuracy, examples, README/API docs, release notes, handoff references, redaction, artifact links, stale duplication, and whether docs reference canonical sources instead of becoming parallel truth.

## Compound Learning / Knowledge Refresh

Check whether completed work produced reusable verified learning, whether that learning belongs in a canonical file or solved-problem entry, whether active guidance is stale or duplicated, whether refresh outcomes are Keep/Update/Consolidate/Replace/Archive/Delete From Active Use, whether private data and secrets are redacted, and whether future agents can find the lesson through load order or relevant skills.

## Prototype / Spike Safety

Check prototype question, isolation, budget, one command to run, evidence produced, delete/archive/absorb decision, and whether prototype code is blocked from production until APIVR review.

## Writing / Copy / Voice Quality

Check audience, purpose, proof standard, generic AI tells, filler, hype, fake certainty, unsupported claims, rhythm, client-facing credibility, verdict-first structure, anti-drift scope, and whether the writing ends with a clear action or boundary.
