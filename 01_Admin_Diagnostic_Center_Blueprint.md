# Admin Diagnostic Center Blueprint

## Purpose
Build an admin-facing System Operations Command Center that keeps the app stable after launch by making health, incidents, diagnostics, deployments, data integrity, security posture, jobs, integrations, and recovery visible.

## Operating Objective
1. Detect problems before users report them.
2. Diagnose root cause quickly by correlating errors, deploys, audits, workflows, jobs, and dependencies.
3. Recover safely with gated, auditable operator actions.
4. Improve long-term reliability through runbooks, tickets, post-incident reviews, and production readiness checks.

## Non-Negotiable Guardrails
- No raw secrets, tokens, passwords, cookies, private keys, connection strings, private request bodies, or sensitive user data in admin UI or exports.
- Read-only diagnostics must remain separate from write-capable recovery actions.
- Recovery actions must require admin access, confirmation, reason, result capture, and audit logging.
- Potentially destructive actions require dry-run, backup/restore consideration, and explicit approval.
- Every P0 diagnostic tool must be tested through the browser and fail safely.

## Recommended Navigation Structure
### Overview
- Diagnostics Dashboard
- Live Incidents
- Open Tickets / Work Queue

### Health & Monitoring
- System Health
- Database Health
- API / Webhook Health
- Frontend Runtime Health
- Auth and Session Health
- Uptime Monitors
- Synthetic Workflow Monitoring
- External Dependency Health
- Performance / Latency Dashboard
- Notification Delivery Health

### Diagnostics & Root Cause
- Error Reports
- Error Spike Detection
- Incident Timeline / Event Correlation
- Deploy Health / Release Monitor
- Connection Tests
- Environment Configuration Audit
- Database Deep Diagnostics
- Job Queue Reliability
- Webhook Reliability Center

### Audit & Security
- Audit Logs
- Security Analysis Audits
- Admin Action Log
- Production Readiness Checklist

### Data Quality & Integrity
- Data Integrity Checks
- Data Cleanup / Legacy Risk Monitor

### Jobs & Integrations
- Background Jobs
- Job Queue Reliability
- API / Webhook Health
- External Dependency Health
- Notification Delivery Health

### Deploys & Recovery
- Rollback / Recovery
- Safe Recovery Actions
- Maintenance / Degraded Mode Monitor
- Feature Flag Health
- Diagnostic Bundle Export
- Runbook Library
- Post-Incident Review Log

### Work Queue / Tickets
- Create Ticket
- Attach to Existing Ticket
- Operations Work Queue
- Incident Tickets
- Bug Reports
- Follow-Up Investigations
- Technical Debt
- Feature / Improvement Ideas
- UX / Workflow Issues
- Security Review Tickets
- Performance Issue Tickets
- Data Integrity Tickets
- Deferred Tickets
- Won't Fix Tickets
- Documentation Tasks

## P0 Minimum Build
The minimum production-readiness command center should include:
1. Diagnostics Dashboard
2. Live Incident Dashboard
3. Error Reports
4. Error Spike Detection
5. Uptime Monitors
6. Synthetic Workflow Monitoring
7. Open Tickets / Work Queue
8. System Health
9. Database Health
10. API / Webhook Health
11. Frontend Runtime Health
12. Auth and Session Health
13. Deploy Health / Release Monitor
14. Incident Timeline / Event Correlation
15. Connection Tests
16. Environment Configuration Audit
17. Audit Logs
18. Security Analysis Audits
19. Production Readiness Checklist
20. Admin Action Log

## Required Diagnostic Data Shape
Each diagnostic result should include:
- Status: healthy / degraded / failing / unknown.
- Severity: P0 / P1 / P2 / P3 / info.
- First detected timestamp.
- Last checked timestamp.
- Affected route/service/job/provider.
- Safe summary.
- Related deploy if known.
- Related incident/ticket if known.
- Recommended next action.
- Evidence without secrets.

## Completion Criteria
Admin Diagnostic Center work is not complete until:
- Admin-only access is verified server-side.
- No secrets or private data are exposed.
- P0 tools render and fail safely.
- Each tool has a clear empty, loading, success, degraded, and failure state.
- Each write-capable action is separated, gated, confirmed, reason-required, and audit-logged.
- Browser verification proves navigation, refresh, error state, and permission-restricted behavior.
