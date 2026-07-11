# Agent Activation Matrix

Use the smallest complete specialist set. Agents advise and challenge; APIVR and the Elite Build Goals govern.

## Always Present Roles

- **Orchestrator** - selects tier, load order, specialists, and evidence path.
- **Verifier** - checks that claims are supported and release gates are honestly classified.

## Build Or Feature Work

Activate:

- Product Lead for objective, audience, acceptance criteria, and outcome.
- Product Strategist for premise challenge, buyer/user clarity, alternatives, and smallest verifiable product slice.
- Requirements Grill Lead for ambiguous, broad, conflicting, or assumption-heavy requirements.
- Domain Modeler for canonical terms, states, events, roles, invariants, and ADR discipline.
- Architect for source of truth, boundaries, dependencies, and scale fit.
- Deep Module Architect for module depth, adapter boundaries, locality, deletion tests, and dependency direction.
- Principal Engineer for implementation shape and maintainability.
- Engineering Plan Reviewer for pre-implementation plan review, risk review, and executable technical detail.
- Code Review Captain for APIVR Phase 4 review-army routing and specialist finding synthesis.
- QA Lead for test plan and verification evidence.
- Browser QA Lead for manual workflow, rendered, responsive, accessibility, and adverse-state verification.
- TDD Lead for Red-Green-Refactor order, test quality, and evidence states when code changes.
- Bug Diagnosis Lead for reproduction, root cause, hypothesis testing, and red-capable feedback loops.

Add when applicable:

- Security Engineer for auth, permissions, privacy, secrets, abuse, integrations.
- Security Architect for cross-system security boundaries, threat model, release-blocking security risk, and authorization scope.
- AppSec Lead for API, auth, input/output, OWASP, and application vulnerability review.
- AI Security Lead for LLM apps, RAG, vector stores, prompt injection, system prompt leakage, and AI tool abuse.
- Incident Commander for suspected compromise, containment, evidence preservation, communication, and recovery.
- Supply Chain Security Lead for dependencies, CI/CD, containers, IaC, SBOMs, signatures, and provenance.
- Vulnerability Triage Lead for CVE/SSVC prioritization, remediation urgency, and accepted-risk records.
- Data Engineer for migrations, writes, consistency, retention, reconciliation.
- UX/UI Lead for user-facing workflows, accessibility, visual quality, responsive behavior.
- Design Quality Lead for visual direction, anti-generic UI, design-system discipline, UI copy, and rendered review.
- Writing Quality Lead for anti-AI tone, human rhythm, client-ready clarity, and copy evidence.
- Strategist Voice Lead for verdict-first structure, executive clarity, anti-drift prompts, and proof-driven communication.
- Operations Lead for logging, monitoring, rollback, health, incident response.
- Deployment/Infrastructure Lead for hosting tier, runtime placement, environments, deployment, rollback, scaling, and cost.
- Automation Lead for cron, webhooks, event-driven work, queues, workers, monitors, and recurring jobs.
- Reporting/Data Output Lead for dashboards, exports, analytics outputs, compliance reports, and evidence artifacts.
- Release Readiness Lead for gate dashboard, changelog, rollback, canary/post-release checks, and done-claim enforcement.
- DevEx Documentation Lead for setup, docs, examples, API docs, release notes, and handoff quality.
- Prototype Steward for isolated throwaway experiments, spike budgets, and delete/archive/absorb decisions.
- Issue Slicing Lead for PRDs, vertical issue slicing, acceptance criteria, and independently verifiable slices.
- Integration Lead for third-party APIs, SDKs, OAuth, API keys, rate limits, provider failures, and webhooks.
- External Integration Gatekeeper for provider callback route contracts, deployed provider smoke tests, webhook/auth callback reachability, deployment-protection checks, and sandbox/live environment separation.
- Media/Asset Lead for generated/retrieved assets, media delivery, CDN/cache, rights, optimization, and rendered asset quality.
- Loop Steward for recurring audits, iterative remediation, monitors, bounded retries, stop conditions, receipts, and no-progress detection.
- Long-Horizon Runtime Lead for staged work, checkpoints, context preservation, artifact boundaries, and handoff control.
- Bootstrap/Setup Lead for install, dependency, first-run, local service, config, and setup-boundary safety.
- Tool Governance Lead for MCP servers, plugin tools, connectors, tool auth, permission scope, overlap, and traceability.
- Run Trace Custodian for run ids, trace completeness, evidence survival, redaction, and artifact records.
- Subagent Orchestrator for parallel dispatch, scoped delegation, status handling, and review gates.

## Audit Work

Activate:

- Orchestrator
- QA Lead
- Architect
- Relevant domain specialist
- Security/Data/Operations roles when risk-triggered

For Forensic audits, add:

- Independent Challenger
- Decision Owner
- Evidence Custodian
- Code Review Captain, Release Readiness Lead, and QA Lead for any implementation, release, or handoff with user, revenue, security, data, or production impact
- Security Architect, Incident Commander, AppSec Lead, AI Security Lead, Supply Chain Security Lead, and Security/Data/Operations specialists for any API, automation, reporting, deployment, AI system, tool, supply-chain path, or asset pipeline with private data, money, auth, or regulated impact
- External Integration Gatekeeper for any audit involving Stripe, Resend, Supabase Auth, OAuth, cron, SMS/provider queues, provider dashboards, webhooks, callbacks, or Preview/Production environment splits

## Critical Decisions

Critical work requires:

- explicit decision owner;
- challenge review;
- test-first evidence or documented non-applicability rationale for code changes;
- two-stage review for delegated implementation;
- rollback or restoration method;
- no release on unknown core safety evidence.

## Writing Or UI Work

For user-facing interface or content work, activate:

- UX/UI Lead;
- Design Quality Lead;
- Writing Quality Lead when copy, labels, reports, emails, prompts, or client-facing text are involved;
- Strategist Voice Lead when the output must guide a decision, prevent drift, or define proof.
