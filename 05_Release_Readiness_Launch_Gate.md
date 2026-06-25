# Release Readiness and Launch Gate

## Purpose
Prevent public release or major deployment until the app is stable, secure, observable, recoverable, and verified through real workflows.

## Required Agents
- VP of Engineering
- QA Director
- Security Engineer
- Manual Workflow QA
- Principal Engineer
- Chief Architect for major releases
- Database Engineer if schema/data changed
- Master Agent Orchestrator
- Elite Senior ScrumMaster 3

## Launch Checklist
- [ ] Source-of-truth release scope confirmed.
- [ ] All P0/P1 bugs closed or explicitly accepted by VP.
- [ ] Typecheck/build/lint passing or exceptions documented.
- [ ] Relevant unit/API/component/E2E tests passing.
- [ ] Critical browser workflows manually verified.
- [ ] Auth/session/admin access verified.
- [ ] Security headers/CORS/origin posture reviewed.
- [ ] Secrets not exposed.
- [ ] Database reachable and migrations verified.
- [ ] Backup/restore posture reviewed where applicable.
- [ ] Webhooks/payment/provider integrations verified where applicable.
- [ ] Error logging and runtime failure visibility present.
- [ ] Uptime/health checks present or explicitly deferred.
- [ ] Rollback path documented.
- [ ] Admin diagnostic center minimum P0 tools planned or present.
- [ ] User-facing copy and empty/error states reviewed.
- [ ] Mobile/narrow viewport smoke checked where relevant.
- [ ] Completion report written.
- [ ] VP launch decision recorded.

## VP Verdict Options
- Launch Approved
- Launch Approved With Known Risks
- Launch Blocked
- Launch Deferred
- Audit First

## Required Launch Decision Record
`~/.claude/wcbs-kit/``text
Release Decision:
Scope:
Evidence reviewed:
P0/P1 status:
Known risks:
Accepted risks:
Rollback path:
Monitoring/diagnostics readiness:
VP verdict:
`~/.claude/wcbs-kit/``
