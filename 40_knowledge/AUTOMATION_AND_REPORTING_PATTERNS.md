# Automation And Reporting Patterns

Use this module with `scheduling-and-automation-routing` and `data-output-and-reporting`.

## Automation Route

| Need | Prefer |
|---|---|
| Run at known times | cron/scheduler |
| React to external system | verified webhook |
| React to internal event | event-driven function or queue |
| Process expensive/slow work | queue + worker |
| Maintain live connection/state | always-on worker |
| Human-controlled operation | admin/manual trigger |
| Watch for condition | monitor with bounded polling or event source |

## Automation Controls

Every material automation should define:

- trigger;
- idempotency key or duplicate prevention;
- retry and timeout limits;
- failure visibility;
- safe replay/backfill;
- owner and escalation path;
- cost/rate bounds;
- data integrity checks.

## Reporting Route

| Need | Prefer |
|---|---|
| Operational monitoring | dashboard |
| Recurring stakeholder update | scheduled report |
| User-controlled analysis | export |
| Machine consumer | API endpoint |
| Compliance/audit | immutable evidence record |
| Immediate alert | notification summary |

## Reporting Controls

Define source of truth, data freshness, permissions, metric definitions, reconciliation method, and outcome horizon.

