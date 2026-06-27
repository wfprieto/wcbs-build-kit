# External API Integration Guidance

Use this module with `skills/external-api-integration/SKILL.md`.

## Integration Route

| Integration | Required Controls |
|---|---|
| Read-only API | auth scope, timeout, cache, rate limit |
| Write/action API | idempotency, validation, rollback/compensation |
| Webhook receiver | signature verification, replay protection, safe logs |
| OAuth integration | least privilege scopes, token refresh, revocation |
| Batch sync | checkpoints, backoff, reconciliation |
| Payment/auth/private data | Comprehensive or Forensic APIVR controls |

## Secret Management

- Store secrets only in approved secret managers or environment systems.
- Never commit, print, log, screenshot, or prompt-inject secrets.
- Use least privilege and separate environments.
- Rotate secrets after suspected exposure.

## Reliability Controls

Set bounded timeouts, bounded retries, exponential backoff with jitter, rate-limit handling, circuit breaker/fallback where appropriate, and observable failure states.

## Verification

Prefer provider sandbox/test mode. Verify both request success and downstream business effect. Record provider limits and dependency failure behavior.
