---
name: qa-and-browser-verification
description: Use for QA planning, manual workflow verification, browser testing, UI regression review, issue taxonomy, QA health scoring, screenshot/video evidence, adverse-state testing, fix loops, and APIVR Phase 5 verification for frontend, workflow, or user-visible changes.
---

# QA And Browser Verification

Use this skill when success depends on a user-visible workflow, rendered interface, browser behavior, or manual acceptance path.

## QA Flow

```mermaid
flowchart TD
  A["Define user workflow"] --> B["Create QA matrix"]
  B --> C["Run happy path"]
  C --> D["Run adverse states"]
  D --> E["Run responsive/accessibility checks"]
  E --> F{"Issue found?"}
  F -- "Yes" --> G["Classify, fix narrowly, retest affected path"]
  G --> C
  F -- "No" --> H["Record QA health report and APIVR verdict"]
```

## Required QA Matrix

- Happy path.
- Empty state.
- Loading state.
- Error state.
- Permission or auth boundary.
- Responsive viewport checks.
- Accessibility checks.
- Data accuracy checks when reporting or analytics are visible.

## Issue Taxonomy

- Blocker: prevents core workflow or creates safety/security/data risk.
- Major: harms important workflow, trust, accessibility, or release readiness.
- Minor: visible polish issue with low functional risk.
- Observation: not a bug, but useful product or quality note.

## Worked Example

Scenario: A new admin report page.

- QA runs desktop and mobile viewports, empty dataset, provider timeout, export action, and keyboard navigation.
- Finding: mobile table overflows and export button is hidden.
- APIVR state: UI release gate is `Blocked` until fixed and retested.
- Final verdict: `PASS` only when screenshot evidence, export evidence, and adverse-state checks are recorded.

