---
name: writing-plans
description: Use when creating implementation plans, audit-remediation plans, agent handoff plans, issue plans, feature plans, refactor plans, or any APIVR Phase 2 plan that must be executable by another agent without placeholders. Requires exact file paths, test steps, evidence states, rollback criteria, and APIVR/Elite Build Goals alignment.
---

# Writing Plans

Use this skill during APIVR Phase 2. A plan is acceptable only when a competent agent can execute it without inventing missing decisions.

<HARD-GATE>
Do not produce a vague plan. Do not use placeholders such as TBD, later, as needed, fix tests, update files, or handle edge cases. If information is unknown, name the exact discovery step that will make it known.
</HARD-GATE>

## Required Inputs

- APIVR tier and applicable Elite Build Goals.
- Objective, non-goals, acceptance criteria, and affected users/systems.
- Product premise, user/buyer, highest-risk assumption, success metric, and vertical slice when product strategy is involved.
- Canonical domain terms, states, events, and ADR requirements when durable vocabulary or decisions are involved.
- Exact files, commands, APIs, routes, schemas, assets, providers, jobs, or deployment surfaces in scope.
- Evidence required for each material claim.
- Rollback or restoration path for Standard and above.

## Plan Structure

1. State APIVR tier and why that tier is sufficient.
2. List applicable Elite Build Goals and their effect on the plan.
3. Summarize current state from observed files or systems.
4. Define in scope, out of scope, preserved behavior, and smallest safe change.
5. Define domain glossary or ADR outputs when language or durable decisions affect the work.
6. Split large work into vertical, independently verifiable slices.
7. Write concrete implementation steps with exact file paths.
8. For code work, embed the failing test or test-case skeleton before production-code steps.
9. Add engineering plan review, code review, QA, release readiness, and DevEx review steps when applicable.
10. Add verification commands, manual checks, evidence states, and expected results.
11. Add rollback triggers and restoration steps.
12. Add challenge-review questions for Important, Critical, Comprehensive, or Forensic work.

## Decision Flow

```mermaid
flowchart TD
  A["Need to plan work?"] --> B{"Does work change code, data, infra, prompts, or agent behavior?"}
  B -- "No" --> C["Use Rapid notes with evidence state"]
  B -- "Yes" --> D["Select APIVR tier"]
  D --> E{"Will code be implemented?"}
  E -- "Yes" --> F["Load test-driven-development and embed vertical tracer test steps"]
  E -- "No" --> G["Define evidence-first verification"]
  F --> H{"Can work be safely split?"}
  G --> H
  H -- "Yes" --> I["Load dispatching-parallel-agents and subagent-driven-development"]
  H -- "No" --> J["Write sequential APIVR blueprint"]
  I --> K["Write subagent scopes and review gates"]
  J --> L["Validate zero-placeholder plan"]
  K --> L
```

## Embedded Test Requirement

For implementation plans, include this section before production changes:

```text
Failing test first:
- File:
- Test name:
- Behavior being proved:
- Expected failing result before implementation:
- Command to run:
- Evidence state after red phase:
```

If the work is not testable with an automated test, write an evidence-first substitute and explain why automation is not the smallest safe route.

## Product And Domain Requirements

When the work is broad, ambiguous, or product-sensitive, load `requirements-grilling-and-alignment`, `product-strategy-office-hours`, and `product-requirements-and-issue-slicing` before finalizing the plan.

When naming, data states, business rules, or durable decisions matter, add:

- domain glossary entries using `60_templates/DOMAIN_GLOSSARY_TEMPLATE.md`;
- ADR entries using `60_templates/ADR_TEMPLATE.md`;
- acceptance criteria that use the canonical terms.

## Review And Release Requirements

For Standard and above, include applicable review steps:

- Engineering plan review before implementation for high-risk, multi-file, migration, architecture, or integration work.
- APIVR Phase 4 code review and specialist review passes after implementation.
- QA health report for rendered or user-visible workflows.
- Release readiness dashboard before merge, deploy, publish, handoff, or done claims.
- DevEx/documentation review when setup, docs, examples, API docs, release notes, or handoffs change.

## Good / Bad

<Bad>
Update the API handler and add tests.
</Bad>

<Good>
1. Add failing test in `tests/billing/renewal.test.ts` named `renews annual plan without duplicate invoice`.
2. Run `npm test -- tests/billing/renewal.test.ts`; expected result: fails because duplicate invoice guard is missing.
3. Update `src/billing/renewal.ts` to check existing invoice by customer, plan, and billing period before creating a new one.
4. Re-run the same test; expected result: pass.
5. Run `npm test -- tests/billing/renewal.test.ts tests/billing/webhook.test.ts`; expected result: pass.
</Good>

## Worked Example

Scenario: Add webhook retry protection for a payment provider.

- APIVR tier: Comprehensive because money, external API, and duplicate writes are involved.
- Skills loaded: `external-api-integration`, `test-driven-development`, `subagent-driven-development` if delegated.
- Plan writes a failing test proving duplicate webhook delivery creates one payment record.
- Implementation step updates the webhook handler idempotency key.
- Verification includes engineering plan review, specialist API/security review, test pass, safe replay check, log redaction check, QA if user-visible, and release gate review.
- APIVR verdict can be `PASS` only when duplicate prevention, secret handling, and replay evidence are Verified.

## Completion Standard

A plan is complete when every action has an owner or executing agent, exact target, expected evidence state, and stop condition. Mark the plan `BLOCKED` instead of filling gaps with assumptions.
