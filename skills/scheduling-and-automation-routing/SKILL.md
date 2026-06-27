---
name: scheduling-and-automation-routing
description: Use when designing, auditing, or implementing scheduled jobs, cron tasks, webhooks, queues, event-driven workflows, background workers, always-on processes, recurring automations, monitors, reminders, data refreshes, or operational automations.
---

# Scheduling And Automation Routing

Use this skill to decide how automation should run and how it should be verified.

## Required Inputs

- Trigger source and timing requirement.
- Required freshness, latency, retry, idempotency, and failure behavior.
- Data writes, external API calls, cost limits, and user/business impact.
- Current hosting/runtime constraints.

## Routing Workflow

1. Read `40_knowledge/AUTOMATION_AND_REPORTING_PATTERNS.md`.
2. Select the automation shape:
   - cron/scheduled task;
   - webhook;
   - event-driven function;
   - queue/worker;
   - always-on process;
   - manual/admin-triggered job;
   - monitor/reminder/follow-up.
3. Define idempotency, retry, timeout, duplicate prevention, observability, and recovery behavior.
4. Decide whether the job requires deployment/hosting guidance or external API integration guidance.
5. Verify both technical execution and the intended operational/business outcome.

## Guardrails

- Do not create unbounded retries, unbounded queues, or unbounded polling.
- Do not use always-on workers when scheduled or event-driven execution satisfies the objective.
- Do not process external webhooks without verification, replay protection, and safe logging.
- Do not mark automation complete until failure handling and observability are addressed.

## Closeout

Report selected automation pattern, why alternatives were rejected, verification horizon, evidence state, and APIVR verdict.
