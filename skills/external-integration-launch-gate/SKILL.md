---
name: external-integration-launch-gate
description: Use before planning, building, auditing, debugging, testing, deploying, or declaring done for any feature where an outside system calls the app or the app depends on provider callbacks, including Stripe payments/webhooks, Resend webhooks, Supabase Auth callbacks, OAuth redirects, Vercel Cron, SMS gateways, provider webhooks, callback URLs, API keys, Preview/Production environment variables, deployment protection, and provider sandbox/live mode.
---

# External Integration Launch Gate

Use this skill when the real outside world must reach the app. This is a hard gate for payments, auth callbacks, email webhooks, cron, SMS queues, provider callbacks, and any Preview/Production environment split.

<HARD-GATE>
Do not claim done, ready, PASS, fixed, or launch-safe until the provider-to-deployed-app round trip is verified through the real deployed URL, not only through unit tests or direct route-handler tests.
</HARD-GATE>

## Required Inputs

- Provider, account/environment, and dashboard location.
- Exact deployed URL the provider calls.
- Route path and source file.
- Caller type: human, provider, scheduler, admin, or internal system.
- Required security: human login, provider signature, shared secret, admin role, or public-safe behavior.
- Environment values by tier: Production, Preview, Local.
- Expected provider events, callbacks, redirects, or scheduled calls.
- Expected database writes, user-visible result, logs, and retry behavior.

## Activation Checklist

Trigger this gate when any task mentions or touches:

- Stripe, payments, subscriptions, checkout, customer portal, refunds, disputes, premium access.
- Resend, transactional email, delivery/open webhooks, OTP/email delivery.
- Supabase Auth, OAuth, Google/Facebook login, callback URLs, redirect URLs, session cookies.
- Vercel Cron, scheduled routes, queues, reminders, background jobs, monitors.
- Webhooks, callbacks, provider events, API keys, secrets, rate limits, sandbox/test mode.
- Vercel Preview, Production, deployment protection, custom domains, `NEXT_PUBLIC_APP_URL`, provider dashboard URLs.

## Route Classification

Classify every relevant route before planning or fixing.

| Route type | Human login? | Required protection | Never allowed |
|---|---:|---|---|
| Human app page | As needed | session and role checks | provider-only secret as sole control |
| Admin page/API | Yes | session plus admin role | public access |
| Public page/API | No | safe public behavior and input limits | private data leakage |
| Stripe webhook | No | Stripe signature and idempotency | redirect to login, Vercel auth block |
| Resend webhook | No | Resend signature and idempotency | redirect to login, Vercel auth block |
| Cron/scheduler route | No | cron secret or platform auth | redirect to login, browser-only auth |
| SMS/provider queue route | No | provider/shared secret, allowlist if applicable | redirect to login |
| Auth/OAuth callback | No | provider/state/session validation | redirect loop, wrong domain |

## Route Contract

For every provider-facing route, write a contract before implementation or release. Use `references/route-contract-template.md`.

Minimum contract:

```text
Route:
Caller:
Environment:
Human login required:
Machine protection:
Expected success:
Expected failure:
Never allowed:
Provider dashboard test:
Database effect:
User-visible effect:
Log evidence:
```

## Gate Workflow

1. Inventory every outside caller and every callback/webhook/cron route.
2. Write route contracts for each provider-facing route.
3. Audit middleware, app layouts, route groups, deployment protection, and host/domain redirects.
4. Confirm the route reaches the handler without human login when the caller is a machine.
5. Confirm the handler still rejects missing or invalid provider signatures/secrets.
6. Confirm Production and Preview use intentionally separate provider values when sandbox/live testing is needed.
7. Test from the provider dashboard or provider sandbox into the deployed URL.
8. Verify database writes or deliberate no-op behavior.
9. Verify user-visible result.
10. Verify logs show success without leaking secrets or sensitive payloads.
11. Verify retry/idempotency by replaying or simulating duplicate delivery when safe.
12. Record a pass/fail verdict and remaining human actions.

## Required Tests

For provider inbound routes, require tests or a documented evidence-first substitute for:

- The real route path does not redirect to `/login`.
- The real route path is not blocked by app middleware, route groups, layouts, or deployment protection.
- Missing/invalid provider signature or secret returns the expected failure, usually 400 or 401.
- Valid provider event returns the expected success, usually 200.
- Duplicate provider event does not duplicate writes or user effects.
- Production env values do not leak into Preview sandbox tests.
- Preview callback/login flow does not send users to Production unless that is the stated contract.

## Deployed Smoke Standard

A provider integration is not complete until this full path is verified:

```text
Provider dashboard or sandbox
-> deployed URL
-> hosting/deployment protection
-> middleware
-> route handler
-> provider signature/secret check
-> database or state change
-> user-visible result
-> provider delivery log
-> app log
```

Direct unit tests are useful but insufficient. Handler-only tests do not prove middleware, deployment protection, domains, or provider dashboard configuration.

## Blocking Findings

Treat any of these as release-blocking unless a decision owner explicitly accepts non-critical risk:

- Provider webhook/callback returns 301, 302, 307, or 308 unexpectedly.
- Provider webhook/callback redirects to `/login`.
- Provider webhook/callback returns Vercel or host deployment-protection 401/403.
- Provider dashboard points to stale, wrong, production, preview, or local URL.
- Provider sandbox uses live keys, live webhook secret, or live price/product accidentally.
- Production uses sandbox/test keys accidentally.
- `NEXT_PUBLIC_APP_URL` or equivalent points Preview to Production during sandbox testing.
- Webhook handler accepts events without provider signature/secret verification.
- Webhook handler cannot prove idempotency for duplicate provider delivery.
- Provider route tests bypass middleware and no real deployed smoke evidence exists.

## APIVR Phase Rules

- Phase 1 Assess: build the external route inventory and current-state contract table.
- Phase 2 Plan: include route contracts, environment split, provider dashboard steps, tests, rollback, and human actions.
- Phase 3 Implement: fix the smallest route, middleware, env, or handler discrepancy. Do not weaken provider security.
- Phase 4 Verify: run contract tests plus provider/dashboard or deployed smoke tests.
- Phase 5 Release: record provider event IDs, deployment URL, database proof, logs, and rollback trigger.
- Phase 6 Re-Audit: replay or recheck all affected provider routes and confirm no adjacent route regressed.

## Closeout

Report:

- route contracts created or updated;
- provider dashboard URL status;
- environment split status;
- middleware/layout/deployment protection verdict;
- provider delivery result;
- database/user-visible proof;
- tests run;
- residual risks and human-only actions;
- final APIVR verdict.
