# Observability and Monitoring Requirements

## Purpose
Define the minimum observability needed for stable, senior-engineered Claude applications.

## Required Signals
### Application Health
- App process status.
- API health route status.
- Frontend runtime health.
- DB connectivity.
- Auth/session health.
- Critical route reachability.

### Errors
- Backend error count and rate.
- Frontend runtime errors.
- Failed client API calls.
- 4xx/5xx route breakdown.
- First seen / last seen timestamps.
- Related deploy correlation.
- Sanitized stack/error summary without secrets.

### Performance
- API p50/p95/p99 latency.
- Slowest routes.
- Slowest DB query categories where safely available.
- Provider latency.
- Job duration.
- Payload size warnings.

### Jobs and Automations
- Registered jobs.
- Enabled/disabled status.
- Last run.
- Last success.
- Last failure.
- Current running status.
- Retry count.
- Stuck/locked detection.

### External Dependencies
Track health for applicable providers:
- Database
- Auth provider
- Email/SMTP
- AI provider
- Stripe/payment
- Google APIs
- File storage
- DNS/domain
- Webhook receivers

### Data Quality
- Orphan counts.
- Duplicate indicators.
- Invalid statuses/enums.
- Mismatched rollups.
- Stale legacy data indicators.
- Test/demo data leakage risk.

## Redaction Rules
Never store or display:
- Raw tokens
- API keys
- Cookies
- Auth headers
- Private keys
- Connection strings
- Full request bodies containing private data
- Payment data
- Private user/customer/member content

## Alerting Rules
Create alerts for:
- App unavailable.
- DB unreachable.
- Login failures spike.
- Admin access failures spike.
- 5xx error spike.
- Frontend blank screen/runtime crash spike.
- Webhook failures spike.
- Job failures/stuck jobs.
- Payment/subscription sync failure.
- AI provider failure if AI is critical.
- Synthetic workflow failure.

## Dashboard Rule
Every dashboard card must answer:
1. Is it healthy?
2. What changed?
3. What is affected?
4. When did it start?
5. What should be checked next?
6. Is there an open incident or ticket?

## Verification
Monitoring work is not complete until at least one healthy state, one degraded/failure state, and one permission-restricted state are browser verified.
