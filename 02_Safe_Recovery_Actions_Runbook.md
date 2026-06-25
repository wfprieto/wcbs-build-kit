# Safe Recovery Actions Runbook

## Purpose
Define recovery actions that may be useful during incidents while preserving auditability and safety.

## Required Controls for Every Recovery Action
- Admin-only access.
- Confirmation step.
- Required reason field.
- Clear description of action.
- Risk warning.
- Dry-run when applicable.
- Result capture.
- Audit log entry.
- Related incident/ticket link.

## Safer Recovery Actions
These may be considered when implemented with controls:
- Trigger health recheck.
- Retry failed job.
- Retry failed webhook.
- Pause noncritical job.
- Disable noncritical feature flag.
- Clear safe application cache.
- Rebuild diagnostic snapshot.
- Export diagnostic bundle.
- Mark incident resolved after verification.

## High-Risk Recovery Actions
Require VP/user approval and stronger safeguards:
- Rollback deploy.
- Run migration.
- Data repair/backfill.
- Delete/archive records.
- Change auth/role/permission settings.
- Reprocess payment/webhook events.
- Restore from backup.

## Prohibited Without Separate Approval
- DELETE/TRUNCATE/DROP/ALTER production data.
- Reset database.
- Seed production.
- Rotate credentials inside chat output.
- Expose env values.
- Force role changes without audit log.

## Completion Evidence
Each recovery action must record:
- Who initiated it.
- When.
- Why.
- What changed.
- Result.
- Follow-up required.
- Whether user-facing workflow recovered.
