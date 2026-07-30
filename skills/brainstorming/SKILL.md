---
name: brainstorming
description: Use when a user asks to create a feature, change behavior, design a workflow, or build a product and the desired design has not been explicitly approved. Clarifies intent one question at a time before implementation.
activation: new behavior without an approved design.
required_inputs: User outcome, relevant project context, constraints, non-goals, and success signal.
required_outputs: Approved design record or Blocked decision, followed by a writing-plans handoff.
authority_dependencies: 00_start_here/SOURCE_OF_TRUTH.md; 10_governance/APIVR_EXECUTION_LIFECYCLE.md; 10_governance/source_of_truth/Elite_Build_Goals_v3.md.
evidence_requirements: Directly inspected context and user-approved design, or an honest Blocked state.
---

# Brainstorming Into an Approved Design

Use this before implementation work when the user has an outcome but not a
decision-complete design. The design can be short. It cannot be assumed.

## Hard Gate

Do not scaffold, edit production code, select a provider, or write an
implementation plan until a design has been presented and approved, unless the
user already supplied a decision-complete design or explicitly directs a narrow
reversible experiment.

## Workflow

1. Inspect only the project context needed to avoid asking questions already
   answered by source, tests, or recent decisions.
2. Ask one focused question at a time. Prefer an answerable choice when it
   reduces ambiguity. Cover user, outcome, constraint, non-goal, and success
   signal.
3. If the request contains independent systems, split it into the first
   vertical outcome. Do not design a whole platform as one task.
4. Present two or three viable approaches with trade-offs and a recommendation.
5. Present the proposed design: boundary, data or control flow, failure state,
   evidence plan, and rollback point. Request approval.
6. Save the approved design in the project’s canonical docs location, scan for
   contradictions and placeholders, then load `writing-plans`.

## Design Record

```markdown
## Decision
- User outcome:
- In scope / non-goals:
- Chosen approach and rejected alternative:
- Interfaces and data flow:
- Failure and recovery behavior:
- Success measure and verification horizon:
```

## Worked Example

Request: “Add a way for users to export campaign results.”

Ask first: “Should the export be a live CSV of the current filters, or a saved
scheduled report? I recommend a live CSV first because it solves the immediate
download need without introducing a job queue or email delivery.”

After approval, record that the first slice is a filtered CSV response, with
authorization and empty-state behavior. Then hand off to `writing-plans`; do
not begin route code during brainstorming.

## Failure Paths

- If the user declines the design, revise the decision record, not the code.
- If a required owner, data definition, or success condition is unknown, mark
  the design `Blocked` and ask the one question that resolves it.
- If the user asks for a prototype, isolate it and label what it cannot prove.
