---
name: external-api-integration
description: Use when calling, adding, auditing, replacing, or troubleshooting third-party APIs, SDKs, webhooks, OAuth flows, API keys, rate limits, retries, idempotency, external data syncs, or integration failure handling.
---

# External API Integration

Use this skill for third-party service integration under APIVR.

## Required Inputs

- Provider, endpoint/SDK, authentication method, data exchanged, and business purpose.
- Secret storage location and permission boundary.
- Rate limits, timeout/retry expectations, webhook behavior, and failure impact.
- Sandbox/test mode availability.

## Routing Workflow

1. Read `40_knowledge/EXTERNAL_API_INTEGRATION_GUIDANCE.md`.
2. Classify the integration:
   - read-only data retrieval;
   - write/action API;
   - webhook receiver;
   - OAuth/user-authorized integration;
   - payment/revenue/security/data-critical integration;
   - batch sync or scheduled polling.
3. Define auth, secret handling, validation, logging, retry, timeout, idempotency, rate-limit, and fallback behavior.
4. Verify in sandbox or with safe test data when available.
5. Record external dependency risk, provider limits, and recovery path.

## Guardrails

- Do not hardcode secrets or expose them in logs, screenshots, commits, prompts, or reports.
- Do not trust client-side API calls for privileged operations.
- Do not implement unbounded retries or polling.
- Do not accept webhooks without signature verification when provider supports it.
- Treat payments, auth, private data, destructive actions, and revenue-critical integrations as Comprehensive or Forensic when warranted.

## Closeout

Report integration contract, secret handling, rate-limit strategy, failure behavior, verification evidence, and APIVR verdict.
