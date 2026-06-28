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

## APIVR Evidence

Deployment is not verified until the deployed service or URL is observed in the intended environment. A successful build is only build evidence.

