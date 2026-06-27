---
name: data-output-and-reporting
description: Use when designing, auditing, or implementing dashboards, exports, recurring reports, analytics outputs, CSV/PDF/spreadsheet artifacts, API reporting endpoints, notification reports, audit ledgers, compliance reports, or business outcome reporting.
---

# Data Output And Reporting

Use this skill to choose the safest and most useful reporting/output format.

## Required Inputs

- Audience, decision the report supports, and required freshness.
- Source data, transformations, filters, permissions, and retention.
- Output channel: dashboard, export, email, file artifact, API endpoint, or audit/compliance record.
- Accuracy threshold and verification horizon.

## Routing Workflow

1. Read `40_knowledge/AUTOMATION_AND_REPORTING_PATTERNS.md`.
2. Classify the output:
   - live dashboard;
   - scheduled report;
   - downloadable export;
   - API endpoint;
   - notification summary;
   - audit/compliance evidence;
   - ad hoc artifact.
3. Define data contract, freshness, permissions, privacy controls, and reconciliation checks.
4. Decide whether scheduling/automation or external API guidance also applies.
5. Verify data accuracy, completeness, permissions, and business usefulness.

## Guardrails

- Do not expose private or sensitive data without permission checks.
- Do not report derived metrics without source definition and reconciliation.
- Do not claim business outcome success from a generated report alone.
- Do not create a second source of truth without migration and ownership.

## Closeout

Report output format, source of truth, data checks, permission checks, evidence state, and APIVR verdict.
