# Incident Response Runbook

## Purpose
Guide admins and Claude Code / Claude Coworks through stable, evidence-based incident response.

## Incident Severity
### P0 Critical
Production unavailable, data loss risk, auth broken, payment broken, security incident, widespread workflow failure.

### P1 High
Major workflow degraded, significant error spike, webhook/job failures, admin unable to complete critical operations.

### P2 Medium
Localized bug, performance degradation, stale data, broken noncritical workflow.

### P3 Low
Minor UX issue, documentation gap, low-risk defect.

## First Five Actions
1. Open Diagnostics Dashboard.
2. Check Live Incident Dashboard.
3. Check Error Spike Detection and Error Reports.
4. Check Deploy Health / Incident Timeline.
5. Create or update an Incident Ticket.

## Diagnosis Checklist
- [ ] When did it start?
- [ ] What changed before it started?
- [ ] Which users/workflows are affected?
- [ ] Is the app down or only a workflow broken?
- [ ] Is DB reachable?
- [ ] Is auth/session working?
- [ ] Are external providers healthy?
- [ ] Did a deploy, config change, admin action, migration, or provider outage occur?
- [ ] Are jobs/webhooks failing?
- [ ] Is data integrity involved?

## Response Rules
- Stabilize before optimizing.
- Prefer reversible mitigation.
- Do not run destructive actions without explicit approval.
- Keep read-only diagnostics separate from recovery actions.
- Record all sensitive admin actions in audit log.
- Never expose secrets in incident notes.

## Recovery Options
Allowed only when scoped and gated:
- Retry failed job.
- Retry failed webhook.
- Trigger health recheck.
- Disable noncritical feature flag.
- Enter maintenance/degraded mode.
- Clear safe cache.
- Export diagnostic bundle.
- Roll back to known good deploy if approved.

## Incident Closure
Do not close until:
- Root cause is identified or clearly marked unknown.
- Impact is documented.
- Resolution is verified.
- Regression checks are run.
- Follow-up tickets are created.
- Post-incident review is scheduled for P0/P1.
