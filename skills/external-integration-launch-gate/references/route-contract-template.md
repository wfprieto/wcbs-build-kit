# External Route Contract Template

Use one section per provider-facing route.

```text
Route:
Source file:
Caller:
Provider account/environment:
Deployed URL:
Human login required: Yes / No
Machine protection:
Expected success response:
Expected missing/invalid protection response:
Never allowed:
Middleware/layout/deployment protection expectation:
Provider dashboard test source:
Provider event names:
Database effect:
User-visible effect:
Idempotency/retry behavior:
Log evidence:
Preview value:
Production value:
Local value:
Owner:
Release verdict: PASS / FAIL / BLOCKED / ACCEPTED RISK
```

## Example: Stripe Webhook

```text
Route: /api/payments/webhook
Source file: src/app/api/payments/webhook/route.ts
Caller: Stripe
Provider account/environment: Stripe Sandbox and Stripe Live
Deployed URL: https://example-preview.vercel.app/api/payments/webhook
Human login required: No
Machine protection: Stripe signature using STRIPE_WEBHOOK_SECRET
Expected success response: 200 for valid signed event
Expected missing/invalid protection response: 400 for missing/invalid Stripe signature
Never allowed: 307 /login redirect, Vercel protected deployment 401, accepting unsigned events
Middleware/layout/deployment protection expectation: bypass human session auth; deployment protection disabled or bypassed for provider
Provider dashboard test source: Stripe Workbench/Webhooks resend event
Provider event names: checkout.session.completed, customer.subscription.updated
Database effect: payment/subscription/premium record updated exactly once
User-visible effect: premium or payment status updates after refresh
Idempotency/retry behavior: duplicate event ignored or safely upserted
Log evidence: provider event ID logged without secrets
Preview value: sandbox keys and sandbox webhook secret
Production value: live keys and live webhook secret
Local value: Stripe CLI webhook secret if used
Owner: release owner
Release verdict: PASS only after provider delivery and app state are verified
```
