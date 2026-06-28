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
3. If the work includes security testing, live probing, abuse testing, or third-party target assessment, load `skills/cybersecurity-risk-routing/SKILL.md` and require authorization/scope.
4. Define auth, secret handling, validation, logging, retry, timeout, idempotency, rate-limit, and fallback behavior.
5. Apply OWASP API checks when API security matters: BOLA/IDOR, broken auth, BFLA, mass assignment, SSRF, unsafe consumption, inventory, abuse controls, and rate limits.
6. Verify in sandbox or with safe test data when available.
7. Record external dependency risk, provider limits, and recovery path.

## Decision Graph

```mermaid
flowchart TD
  A["Third-party integration"] --> B{"Privileged action or private data?"}
  B -- "Yes" --> C["Comprehensive/Forensic tier as risk warrants"]
  B -- "No" --> D["Standard tier unless low-risk read-only"]
  C --> E{"Auth type?"}
  D --> E
  E -- "API key/secret" --> F["Server-side secret storage"]
  E -- "OAuth" --> G["Scopes, consent, token refresh, revocation"]
  E -- "Webhook" --> H["Signature verification and replay protection"]
  F --> I["Timeout, retry, idempotency, rate limits"]
  G --> I
  H --> I
  I --> J["Sandbox or contract verification"]
```

## Guardrails

- Do not hardcode secrets or expose them in logs, screenshots, commits, prompts, or reports.
- Do not trust client-side API calls for privileged operations.
- Do not implement unbounded retries or polling.
- Do not accept webhooks without signature verification when provider supports it.
- Treat payments, auth, private data, destructive actions, and revenue-critical integrations as Comprehensive or Forensic when warranted.
- Do not run live BOLA/IDOR, auth bypass, fuzzing, SSRF, or rate-limit tests against systems outside owned/authorized scope.
- Do not log full tokens, API keys, webhook secrets, session IDs, or sensitive provider payloads.

## Good / Bad

<Bad>
Put the provider API key in frontend code and retry every failed request until it succeeds.
</Bad>

<Good>
Store the provider secret server-side, call the provider through a backend boundary, set a timeout, retry only safe transient failures with a capped backoff, and record rate-limit behavior in the evidence ledger.
</Good>

## Worked Example

Scenario: Add a CRM contact sync.

- APIVR tier: Comprehensive if private customer data is written to a provider.
- Plan: failing test proves a duplicate provider response does not create duplicate local records.
- Implementation: server-side token use, scoped permissions, capped retries, idempotency key, safe logs.
- Verification: sandbox sync, duplicate test, rate-limit simulation or documented provider limit, rollback for disabling sync.
- Verdict: `PASS` only when auth, data integrity, rate limits, logging, and recovery evidence are Verified.

## Closeout

Report integration contract, secret handling, rate-limit strategy, failure behavior, verification evidence, and APIVR verdict.
