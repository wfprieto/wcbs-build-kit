# Operations Command Center Build Order

## Purpose
Sequence the Admin Diagnostic Center so Claude builds the highest-value operational stability tools first.

## Phase 1: P0 Foundation
Build first:
- Audit Logs
- System Health
- Database Health
- API / Webhook Health
- Frontend Runtime Health
- Auth and Session Health
- Error Reports
- Diagnostics Dashboard
- Connection Tests
- Environment Configuration Audit
- Production Readiness Checklist
- Open Tickets / Work Queue

Definition of done:
- Admin-only access verified.
- Read-only diagnostics only, unless a recovery action is explicitly scoped.
- No raw secrets or private data displayed.
- Browser verified.

## Phase 2: Critical Monitoring
Build second:
- Live Incident Dashboard
- Uptime Monitors
- Synthetic Workflow Monitoring
- Error Spike Detection
- Deploy Health / Release Monitor
- Incident Timeline / Event Correlation
- Alert Rules and Escalation
- Admin Action Log

Definition of done:
- Incidents correlate to deploys, errors, failed workflows, affected services, and tickets.
- Synthetic checks cover login, dashboard access, key saves, downloads/files, admin access, and provider-dependent critical workflows where applicable.

## Phase 3: Deep Diagnostics
Build third:
- Performance / Latency Dashboard
- Database Deep Diagnostics
- Job Queue Reliability
- Webhook Reliability Center
- External Dependency Health
- Notification Delivery Health

Definition of done:
- Each tool explains whether failure is internal or provider/dependency-related.
- Slowest routes, slow queries, failed jobs, stuck jobs, webhook failures, and provider outages are visible without exposing sensitive data.

## Phase 4: Recovery Controls
Build fourth:
- Rollback / Recovery
- Safe Recovery Actions
- Maintenance / Degraded Mode Monitor
- Diagnostic Bundle Export
- Runbook Library

Definition of done:
- Recovery actions are admin-only, confirmation-gated, reason-required, audit-logged, and scoped.
- Destructive actions are excluded unless separately approved with dry-run and rollback planning.

## Phase 5: Data and Governance
Build fifth:
- Data Integrity Checks
- Data Cleanup / Legacy Risk Monitor
- Feature Flag Health
- Post-Incident Review Log
- Documentation Tasks
- Deferred/Won't Fix ticket flows

Definition of done:
- Data checks are read-only.
- Cleanup generates dry-run reports only.
- Post-incident reviews create follow-up tickets.

## Build Rule
Do not build recovery actions before read-only diagnostics. Do not build cleanup actions before dry-run visibility. Do not build dashboards that show raw secrets or private user data.
