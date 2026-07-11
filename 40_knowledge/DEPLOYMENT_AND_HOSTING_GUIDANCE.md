# Deployment And Hosting Guidance

Use this module with `skills/deployment-and-hosting-guidance/SKILL.md`.

## Hosting Route

| Workload | Prefer | Avoid |
|---|---|---|
| Static marketing/docs | static hosting, CDN, edge | always-on servers without need |
| SSR web app | managed app platform, serverless SSR, container | static-only hosting when runtime is required |
| API/service | managed app platform, container, serverless API | browser-only secrets or client-trusted auth |
| Scheduled job | scheduler/cron, workflow runner | always-on worker unless needed |
| Queue worker | managed worker/container | serverless if job exceeds execution limits |
| Realtime/socket | persistent process/container | short-lived serverless functions |
| Data-heavy app | provider near database/storage | cross-region chatty architecture |

## Cost Guidance

- Prefer static/edge for read-heavy public content.
- Prefer scheduled/event-driven execution for intermittent work.
- Use always-on compute only for persistent state, realtime connections, long-running workers, or latency requirements.
- Record recurring cost drivers: compute, storage, bandwidth, logs, image/video delivery, external API calls, database egress.

## Environment Guidance

Standard and above should define:

- local setup;
- preview/staging when feasible;
- production config;
- secret handling;
- domain/DNS;
- rollback;
- health checks/logs;
- post-deploy verification.

## External Caller Guidance

When a deployed route is called by Stripe, Resend, Supabase Auth, OAuth, Vercel Cron, SMS gateways, provider webhooks, or another machine caller, also use `skills/external-integration-launch-gate/SKILL.md`.

Required checks:

- exact provider dashboard URL matches the intended deployed route;
- machine callers do not require browser login;
- middleware, route groups, layouts, domain redirects, and deployment protection do not block the call;
- provider signature, shared secret, state/nonce, or platform auth still protects the route;
- Preview and Production use intentionally separate sandbox/live values;
- provider delivery logs, app logs, database proof, and user-visible proof are recorded.

## APIVR Evidence

Deployment is not verified until the deployed service or URL is observed in the intended environment. A successful build is only build evidence.
For provider-facing routes, deployment is not verified until the provider or sandbox successfully reaches the deployed route and the downstream state change is proven.

