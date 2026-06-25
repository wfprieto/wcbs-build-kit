**System Operations Command Center**

**P0 Critical**

**Command Center \> Diagnostics Dashboard**

**What it does:** Provides the master health summary across the entire application.

**Why it is important:** This is the first screen an admin should check. It quickly answers whether the system is healthy, degraded, or actively broken.

**How to use it:** Open this first when something feels wrong. Review overall status, critical warnings, failed checks, recent incidents, and suggested next investigation areas.

**Command Center \> Live Incident Dashboard**

**What it does:** Shows all active incidents in one place.

**Why it is important:** Prevents problems from being scattered across error logs, chats, screenshots, or memory. It gives admins one operational truth source.

**How to use it:** Review active P0/P1/P2/P3 incidents, affected services, first detected time, related deploy, current status, assigned owner, and latest notes.

**Command Center \> Error Spike Detection**

**What it does:** Detects sudden increases in backend errors, frontend errors, auth failures, DB timeouts, webhook failures, and AI provider failures.

**Why it is important:** A single error may not matter. A sudden spike usually means something changed or broke.

**How to use it:** Check spike alerts when the system looks unstable. Use the affected route, first spike time, and related deploy/event to begin diagnosis.

**Command Center \> Uptime Monitors**

**What it does:** Checks whether critical pages and API endpoints are reachable.

**Why it is important:** Confirms whether the system is actually available, not just technically running.

**How to use it:** Monitor homepage, login, dashboard, /api/health, /api/me, admin health routes, webhook routes, AI routes, and payment/checkout routes.

**Command Center \> Synthetic Workflow Monitoring**

**What it does:** Tests real user/admin workflows end-to-end.

**Why it is important:** The app can be “up” while login, checkout, saving, admin access, downloads, or AI responses are broken.

**How to use it:** Review automated workflow tests for login, dashboard access, key form saves, checkout path, admin route access, AI endpoint response, and file/download routes.

**Command Center \> Open Tickets / Work Queue**

**What it does:** Shows active operational tickets created from monitoring, diagnostics, audits, ideas, or reports.

**Why it is important:** Turns findings into tracked work with priority, owner, status, and verification.

**How to use it:** Review New, Triaged, In Progress, Blocked, Ready for Review, Verified, Closed, Deferred, and Won’t Fix tickets.

**Health & Monitoring \> System Health**

**What it does:** Shows core application/server status.

**Why it is important:** Confirms whether the app process is alive, stable, and connected to required services.

**How to use it:** Check uptime, environment, current deploy/version, memory usage, CPU/process health, API reachability, and DB reachability.

**Health & Monitoring \> Database Health**

**What it does:** Shows sanitized database availability and persistence status.

**Why it is important:** Database problems are among the most common causes of app instability, slow performance, login problems, and failed saves.

**How to use it:** Check DB reachable status, connection pool usage, open connections, slow query indicators, migration status, backup freshness, and read/write latency.

**Health & Monitoring \> API / Webhook Health**

**What it does:** Monitors registered API routes and webhook endpoints.

**Why it is important:** APIs and webhooks often fail silently while the front-end still appears normal.

**How to use it:** Review route inventory, route latency, route failure rate, webhook received count, webhook validation status, signature failures, and retry status.

**Health & Monitoring \> Frontend Runtime Health**

**What it does:** Detects browser-side failures.

**Why it is important:** Backend monitoring will not catch blank screens, broken page transitions, JavaScript crashes, or failed client requests.

**How to use it:** Review JavaScript errors, failed client API calls, blank screen detection, hydration/render crashes, route failures, and chunk loading errors after deploy.

**Health & Monitoring \> Auth and Session Health**

**What it does:** Monitors login, session, admin access, and permission health.

**Why it is important:** Login failure is one of the most damaging user-facing failures. Admin access failure also slows recovery.

**How to use it:** Check login success/failure rate, session creation failures, session persistence status, admin access failures, role mismatch warnings, and suspicious auth attempts.

**Diagnostics & Root Cause \> Error Reports**

**What it does:** Shows recent backend, frontend, and blocked operational failures.

**Why it is important:** Gives admins direct visibility into what is breaking, where it is breaking, and how often it is happening.

**How to use it:** Review sanitized errors by route/page, severity, occurrence count, first seen, last seen, related deploy, and affected service.

**Diagnostics & Root Cause \> Incident Timeline / Event Correlation**

**What it does:** Combines deploys, admin actions, config changes, errors, traffic spikes, DB issues, webhook failures, and dependency failures into one timeline.

**Why it is important:** Answers the most important root-cause question: what changed right before the problem started?

**How to use it:** Open during any active incident. Review events immediately before the first failure and look for deploys, config changes, admin actions, or provider failures.

**Diagnostics & Root Cause \> Deploy Health / Release Monitor**

**What it does:** Tracks production deploy status and post-deploy system health.

**Why it is important:** Many production bugs start immediately after a deploy.

**How to use it:** Check current commit, deploy timestamp, build status, migration status, changed files summary, new errors since deploy, worsened routes, and first 15/30/60-minute health windows.

**Diagnostics & Root Cause \> Connection Tests**

**What it does:** Tests live connectivity to required services.

**Why it is important:** Quickly separates internal app problems from unreachable dependencies.

**How to use it:** Run sanitized checks for database, SMTP/email, AI provider, Stripe/payment provider, Google APIs, file storage, DNS, and domain status.

**Diagnostics & Root Cause \> Environment Configuration Audit**

**What it does:** Checks whether environment configuration is complete and safe.

**Why it is important:** Missing or incorrect environment variables cause many production failures.

**How to use it:** Review required env vars as present/missing only. Check unsafe defaults, debug mode, production/dev mismatch, public/private key separation, and missing provider config. Never display secret values.

**Audit & Security \> Audit Logs**

**What it does:** Tracks admin, security, business, and system audit events.

**Why it is important:** Provides traceability when investigating incidents, data changes, admin actions, or suspicious behavior.

**How to use it:** Filter by category, status, actor, target, severity, entity, and date range. Link related audit events to tickets or incidents.

**Audit & Security \> Security Analysis Audits**

**What it does:** Reviews security posture across sessions, auth/admin access, dependencies, environment config, deployment hardening, CORS/origin rules, and secrets exposure risk.

**Why it is important:** Security weaknesses can become uptime, trust, data, or compliance issues.

**How to use it:** Run read-only security reviews. Use findings to create tickets for hardening work. Never expose secrets or raw credentials.

**Audit & Security \> Production Readiness Checklist**

**What it does:** Verifies the app is safe for launch, major deploy, or production operation.

**Why it is important:** Prevents avoidable launch failures and confirms critical safeguards are in place.

**How to use it:** Review auth/session checks, security headers, CORS/origin rules, dependency status, DB migration status, backup status, critical route checks, alert routing, and admin access verification.

**Work Queue / Tickets \> Create Ticket**

**What it does:** Creates a tracked ticket from any monitoring, diagnostic, audit, workflow, idea, or report.

**Why it is important:** Ensures issues and ideas are not lost. Every meaningful finding gets priority, owner, status, and verification.

**How to use it:** Click **Create Ticket** from any tool or detail page. Choose ticket type, severity, affected area, owner, and description. The system should auto-attach safe diagnostic context.

**Work Queue / Tickets \> Attach to Existing Ticket**

**What it does:** Links a new finding to an existing ticket instead of creating duplicates.

**Why it is important:** Keeps related issues together and prevents scattered duplicate work.

**How to use it:** Use when a new error, audit event, workflow failure, or idea is part of an already-known issue.

**Work Queue / Tickets \> Operations Work Queue**

**What it does:** Central list of all active operational work.

**Why it is important:** Creates accountability and gives admins a single place to manage fixes, investigations, ideas, and follow-ups.

**How to use it:** Filter by priority, status, source tool, owner, project, incident-related, bugs, ideas, security, performance, data cleanup, and needs verification.

**P1 High**

**Health & Monitoring \> External Dependency Health**

**What it does:** Monitors third-party providers and integrations.

**Why it is important:** Prevents wasting time debugging your app when Stripe, OpenAI, Google, email, file storage, DNS, or another provider is the actual source of failure.

**How to use it:** Check current provider status, last successful call, last failed call, failure count, latency, and provider-specific outage indicators where available.

**Health & Monitoring \> Performance / Latency Dashboard**

**What it does:** Tracks speed and degradation across the app.

**Why it is important:** Slow systems often become broken systems. Latency issues can reveal DB, API, provider, or scaling problems before full failure.

**How to use it:** Review p50, p95, and p99 API latency, slowest routes, slowest DB queries, memory trend, CPU trend, cold starts, queue/backpressure, payload warnings, and rate-limit pressure.

**Health & Monitoring \> Notification Delivery Health**

**What it does:** Checks whether system emails, alerts, and notifications are being delivered.

**Why it is important:** Alerting is useless if email/SMS/notification delivery is broken.

**How to use it:** Review email provider status, alert delivery status, failed notification count, bounce/error tracking, last successful system alert, and last failed alert.

**Diagnostics & Root Cause \> Database Deep Diagnostics**

**What it does:** Provides advanced DB troubleshooting.

**Why it is important:** DB issues often appear as random application failures, slow pages, failed saves, auth issues, or timeout spikes.

**How to use it:** Check connection pool saturation, long-running queries, blocked queries, slow query logs, table growth, index health, failed migrations, pending migrations, schema drift, and restore-readiness.

**Diagnostics & Root Cause \> Job Queue Reliability**

**What it does:** Monitors jobs, automations, retries, and stuck processes.

**Why it is important:** Reports, emails, imports, AI jobs, summaries, and scheduled tasks can fail silently without dedicated visibility.

**How to use it:** Review failed jobs, stuck jobs, retry counts, skipped jobs, disabled jobs, oldest pending job, average duration, last successful run, last failed run, lock conflicts, and retry exhaustion.

**Diagnostics & Root Cause \> Webhook Reliability Center**

**What it does:** Provides deeper webhook monitoring beyond basic endpoint health.

**Why it is important:** Billing, subscriptions, automations, and external integrations often rely on webhooks. One missed webhook can create major data or access issues.

**How to use it:** Review webhook received count, success/failure rate, signature validation failures, duplicate webhook detection, unprocessed events, retry attempts, event type breakdown, and last successful/failed webhook.

**Audit & Security \> Admin Action Log**

**What it does:** Shows every sensitive or system-impacting admin action.

**Why it is important:** During incidents, you need to know whether an admin setting, override, manual change, or recovery action contributed to the issue.

**How to use it:** Review actor, action, target, timestamp, before/after summary where safe, reason, related ticket/incident, and IP/device metadata if available.

**Data Quality & Integrity \> Data Integrity Checks**

**What it does:** Runs read-only checks for database consistency.

**Why it is important:** Many bugs are caused by bad records, broken relationships, duplicate data, stale statuses, or invalid state transitions.

**How to use it:** Run checks for orphaned records, missing relationships, duplicate records, invalid enums/statuses, mismatched rollups, and stale legacy data indicators.

**Data Quality & Integrity \> Data Cleanup / Legacy Risk Monitor**

**What it does:** Identifies old, stale, test, duplicate, deprecated, or legacy data risks.

**Why it is important:** Legacy data creates confusing bugs, false reports, broken dashboards, and inconsistent user experiences.

**How to use it:** Review test data, orphaned legacy records, deprecated field usage, old status values, duplicate users/accounts/entities, and legacy paths. Use dry-run reports before cleanup.

**Jobs & Integrations \> Background Jobs**

**What it does:** Shows registered startup tasks, scheduled jobs, manual jobs, and automation status.

**Why it is important:** Background work can fail independently from the main app.

**How to use it:** Review registered jobs, enabled/disabled status, last run, last success, last failure, current running status, failed job count, stuck detection, retry count, and scheduler status.

**Jobs & Integrations \> Job Queue Reliability**

**What it does:** Monitors reliability of queued jobs and automations.

**Why it is important:** If queued work backs up or fails, users may not see results, emails, reports, AI outputs, imports, or notifications.

**How to use it:** Use it to diagnose failed, stuck, retried, skipped, delayed, or locked jobs.

**Jobs & Integrations \> API / Webhook Health**

**What it does:** Shows integration-facing route health.

**Why it is important:** This is where outside systems connect to your app.

**How to use it:** Review route status, webhook status, integration availability, latency, failure rate, and validation status.

**Jobs & Integrations \> External Dependency Health**

**What it does:** Tracks availability and latency of external platforms.

**Why it is important:** AI, email, billing, storage, auth, and Google integrations can all fail outside your codebase.

**How to use it:** Check provider status before assuming the app itself is broken.

**Jobs & Integrations \> Notification Delivery Health**

**What it does:** Tracks delivery of alerts, emails, and operational notifications.

**Why it is important:** Important workflows may depend on notification delivery.

**How to use it:** Check failed deliveries, provider failures, alert delivery status, and last successful sends.

**Deploys & Recovery \> Rollback / Recovery**

**What it does:** Shows recovery posture and rollback reference information.

**Why it is important:** When a deploy breaks production, admins need to know the latest known good deploy and the safe recovery path.

**How to use it:** Review latest known good version, current deploy, rollback documentation, backup status, recovery runbooks, and last recovery drill date. Keep destructive actions gated elsewhere.

**Deploys & Recovery \> Safe Recovery Actions**

**What it does:** Provides controlled admin actions for common recovery tasks.

**Why it is important:** Improves fix speed while preserving safety and auditability.

**How to use it:** Use only with confirmation and required reason. Possible actions include retry failed job, retry failed webhook, trigger health recheck, clear safe cache, pause risky job, disable noncritical feature flag, export diagnostic bundle, or mark incident resolved.

**Deploys & Recovery \> Maintenance / Degraded Mode Monitor**

**What it does:** Shows when the app or parts of it are intentionally limited.

**Why it is important:** Prevents confusion between planned degradation and unplanned failure.

**How to use it:** Review maintenance mode status, degraded mode status, disabled features, user-facing banner status, start time, expected end time, affected services, and audit trail.

**Deploys & Recovery \> Runbook Library**

**What it does:** Stores step-by-step response guides for common incidents.

**Why it is important:** Reduces panic, speeds response, and standardizes troubleshooting.

**How to use it:** Use runbooks for site down, login broken, DB unreachable, Stripe webhook failing, AI provider failing, frontend blank screen, background jobs stuck, deploy regression, data integrity issue, email failure, error spike, and slow response.

**Work Queue / Tickets \> Incident Tickets**

**What it does:** Tracks active or historical incidents as structured tickets.

**Why it is important:** Incidents need ownership, timeline, severity, impact, resolution, and follow-up.

**How to use it:** Create or review tickets for P0/P1 incidents. Attach related diagnostics, timeline events, deploys, errors, and resolution notes.

**Work Queue / Tickets \> Bug Reports**

**What it does:** Tracks confirmed defects.

**Why it is important:** Separates true bugs from ideas, investigations, and operational tasks.

**How to use it:** Create bug tickets with steps to reproduce, expected behavior, actual behavior, affected area, priority, acceptance criteria, and verification notes.

**Work Queue / Tickets \> Follow-Up Investigations**

**What it does:** Tracks issues that need research before they can become a confirmed bug, fix, or improvement.

**Why it is important:** Some findings are not immediately actionable but should not be lost.

**How to use it:** Use when logs, errors, user reports, or data checks suggest a possible issue but more diagnosis is needed.

**Work Queue / Tickets \> Technical Debt**

**What it does:** Tracks cleanup, refactoring, legacy retirement, hardening, and non-urgent engineering improvements.

**Why it is important:** Technical debt becomes production risk if it is never tracked.

**How to use it:** Create tickets for deprecated code paths, stale data models, repeated workarounds, brittle workflows, missing tests, and unsafe legacy patterns.

**P2 Medium**

**Audit & Security \> Environment Configuration Audit**

**What it does:** Also belongs here as a security/compliance review tool.

**Why it is important:** Config mistakes can expose risk or break production.

**How to use it:** Use during launch checks, deploy reviews, security sweeps, and when an environment behaves differently than expected.

**Audit & Security \> Auth and Session Health**

**What it does:** Also belongs here because it monitors access control and identity/session behavior.

**Why it is important:** Auth failures can be both uptime problems and security problems.

**How to use it:** Use for permission issues, admin access failures, suspicious login patterns, and session persistence problems.

**Data Quality & Integrity \> Database Health**

**What it does:** Also belongs here as a basic data availability check.

**Why it is important:** Database availability and integrity are tightly connected.

**How to use it:** Use when data is not saving, reports look wrong, dashboards fail, or workflows show inconsistent values.

**Data Quality & Integrity \> Database Deep Diagnostics**

**What it does:** Also belongs here as the advanced data health layer.

**Why it is important:** Slow, blocked, or drifting database structures can damage data reliability.

**How to use it:** Use when standard DB health is not enough to explain the issue.

**Deploys & Recovery \> Feature Flag Health**

**What it does:** Shows enabled/disabled features and rollout status.

**Why it is important:** Feature flags are powerful, but they can create confusing behavior if not visible and audited.

**How to use it:** Review feature flag inventory, current state, owner, environment, rollout percentage, last changed by, last changed time, and related deploy.

**Deploys & Recovery \> Diagnostic Bundle Export**

**What it does:** Exports a sanitized diagnostic package for engineering review.

**Why it is important:** Speeds handoff to developers, support, or AI-assisted troubleshooting.

**How to use it:** Export incident summary, recent errors, related deploy, audit events, system health snapshot, DB health snapshot, workflow failures, and dependency status. Never include secrets, tokens, passwords, request bodies, or raw credentials.

**Work Queue / Tickets \> Feature / Improvement Ideas**

**What it does:** Captures new ideas, enhancement requests, admin feedback, and future improvements.

**Why it is important:** Good ideas should be tracked, prioritized, and evaluated instead of being lost in conversation.

**How to use it:** Create an idea ticket with objective, proposed improvement, affected area, priority, expected value, and whether it should be reviewed now, later, or deferred.

**Work Queue / Tickets \> UX / Workflow Issues**

**What it does:** Tracks friction, confusing flows, bad redirects, broken back behavior, unclear labels, and workflow inefficiencies.

**Why it is important:** Not every problem is a code crash. Poor UX creates user frustration and operational drag.

**How to use it:** Create tickets with page, user role, current behavior, expected behavior, screenshot if safe, and verification requirements.

**Work Queue / Tickets \> Security Review Tickets**

**What it does:** Tracks security findings that need investigation or hardening.

**Why it is important:** Security work needs prioritization, ownership, and auditability.

**How to use it:** Create tickets from Security Analysis Audits, Auth and Session Health, Audit Logs, or Environment Configuration Audit.

**Work Queue / Tickets \> Performance Issue Tickets**

**What it does:** Tracks slow pages, slow APIs, latency spikes, provider delays, and bottlenecks.

**Why it is important:** Performance problems can become uptime problems.

**How to use it:** Create tickets from Performance / Latency Dashboard, Error Spike Detection, Database Deep Diagnostics, or Synthetic Workflow Monitoring.

**Work Queue / Tickets \> Data Integrity Tickets**

**What it does:** Tracks bad data, duplicate records, orphaned relationships, incorrect rollups, and legacy data risks.

**Why it is important:** Data problems often produce confusing bugs and incorrect reports.

**How to use it:** Create tickets from Data Integrity Checks, Database Health, Database Deep Diagnostics, or Data Cleanup / Legacy Risk Monitor.

**P3 Low**

**Deploys & Recovery \> Post-Incident Review Log**

**What it does:** Stores incident retrospectives after resolution.

**Why it is important:** Helps prevent repeat incidents and improves system maturity over time.

**How to use it:** Complete after major incidents. Record severity, start/end time, root cause, detection source, user impact, resolution steps, what went well, what failed, follow-up tasks, owner, and due dates.

**Work Queue / Tickets \> Deferred Tickets**

**What it does:** Stores valid work that is intentionally not being done now.

**Why it is important:** Prevents low-priority items from cluttering active work while keeping them visible for future planning.

**How to use it:** Move tickets here when they are real but not urgent. Revisit during roadmap planning or cleanup cycles.

**Work Queue / Tickets \> Won’t Fix Tickets**

**What it does:** Stores reviewed items that will not be fixed.

**Why it is important:** Creates a decision record so the same issue is not repeatedly reopened without new evidence.

**How to use it:** Use when the issue is invalid, too low value, expected behavior, not worth the risk, or intentionally out of scope.

**Work Queue / Tickets \> Documentation Tasks**

**What it does:** Tracks missing or outdated documentation.

**Why it is important:** Documentation is useful, but usually less urgent than system health, incident response, and production stability.

**How to use it:** Create tickets for missing runbook updates, stale admin instructions, outdated architecture notes, and post-fix documentation needs.

**Best Tree View Summary**

**System Operations**

**Command Center**

**P0 Critical**

- Diagnostics Dashboard  
    
- Live Incident Dashboard  
    
- Error Spike Detection  
    
- Uptime Monitors  
    
- Synthetic Workflow Monitoring  
    
- Open Tickets / Work Queue

**Health & Monitoring**

**P0 Critical**

- System Health  
    
- Database Health  
    
- API / Webhook Health  
    
- Frontend Runtime Health  
    
- Auth and Session Health

**P1 High**

- External Dependency Health  
    
- Performance / Latency Dashboard  
    
- Notification Delivery Health

**Diagnostics & Root Cause**

**P0 Critical**

- Error Reports  
    
- Incident Timeline / Event Correlation  
    
- Deploy Health / Release Monitor  
    
- Connection Tests  
    
- Environment Configuration Audit

**P1 High**

- Database Deep Diagnostics  
    
- Job Queue Reliability  
    
- Webhook Reliability Center

**Audit & Security**

**P0 Critical**

- Audit Logs  
    
- Security Analysis Audits  
    
- Production Readiness Checklist

**P2 Medium**

- Environment Configuration Audit  
    
- Auth and Session Health

**Data Quality & Integrity**

**P1 High**

- Data Integrity Checks  
    
- Data Cleanup / Legacy Risk Monitor

**P2 Medium**

- Database Health  
    
- Database Deep Diagnostics

**Jobs & Integrations**

**P1 High**

- Background Jobs  
    
- Job Queue Reliability  
    
- API / Webhook Health  
    
- External Dependency Health  
    
- Notification Delivery Health

**Deploys & Recovery**

**P1 High**

- Rollback / Recovery  
    
- Safe Recovery Actions  
    
- Maintenance / Degraded Mode Monitor  
    
- Runbook Library

**P2 Medium**

- Feature Flag Health  
    
- Diagnostic Bundle Export

**P3 Low**

- Post-Incident Review Log

**Work Queue / Tickets**

**P0 Critical**

- Create Ticket  
    
- Attach to Existing Ticket  
    
- Operations Work Queue

**P1 High**

- Incident Tickets  
    
- Bug Reports  
    
- Follow-Up Investigations  
    
- Technical Debt

**P2 Medium**

- Feature / Improvement Ideas  
    
- UX / Workflow Issues  
    
- Security Review Tickets  
    
- Performance Issue Tickets  
    
- Data Integrity Tickets

**P3 Low**

- Deferred Tickets  
    
- Won’t Fix Tickets  
    
- Documentation Tasks
