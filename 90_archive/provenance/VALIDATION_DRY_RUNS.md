# Validation Dry Runs

These dry runs verify that the finished kit routes work through APIVR, Elite Goals, evidence, release gates, and final verdicts.

## Dry Run 1: Rapid / Light Fix

Scenario: broken favicon path on a static page.

- Tier: Rapid
- Applicable goals: 1 Reliability, 5 Fast Safe Delivery, 9 Engineering Standards, 11 Product Consistency
- Audit: favicon request returns 404; page head points to wrong path. Evidence L1, confidence High, risk Low.
- Plan: correct the path only.
- Implement: update one reference.
- Audit implementation: changed path matches plan; no unrelated files.
- Verify: reload page and network panel shows favicon 200.
- Verdict: PASS when verified; otherwise PARTIAL or BLOCKED with evidence state.

## Dry Run 2: Standard Feature Implementation

Scenario: add a contact form to a marketing site.

- Tier: Standard
- Applicable goals: 1, 2, 3, 5, 6, 7, 8, 11, 13, 16
- Audit: inspect current form, routes, CRM/email integration, validation, spam controls, analytics.
- Plan: define smallest safe form path, validation, destination, rollback, success criteria, and 30-day outcome horizon.
- Implement: build approved form only.
- Audit implementation: compare planned fields, validation, events, and integrations; scan unrelated changes.
- Verify: submit test lead, verify email/CRM/analytics event, check mobile and accessibility basics.
- Verdict: CONDITIONAL PASS or PARTIAL if lead-quality outcome waits on 30-day horizon.

## Dry Run 3: Forensic Audit

Scenario: suspected authorization flaw exposing private customer records.

- Tier: Forensic
- Applicable goals: 1, 2, 3, 4, 7, 8, 10, 13, 14
- Audit: preserve evidence, inspect trusted boundaries, logs, routes, data access, roles, secrets, and affected records.
- Plan: define containment, owner, backup/restoration, affected users, rollback, and notification/legal review path if applicable.
- Implement: only authorized containment or fix.
- Audit implementation: verify no bypass remains and no unrelated access path opened.
- Verify: permission tests at server boundary, regression checks, log review, data reconciliation.
- Verdict: PASS only if core safety evidence is Verified; otherwise FAIL or BLOCKED.

