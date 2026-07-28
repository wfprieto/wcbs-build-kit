---
name: diagnosing-bugs-and-feedback-loops
description: Use when the task involves bug diagnosis, incidents, regressions, flaky behavior, unknown failures, root-cause analysis, reproduction, hypothesis testing, debug loops, and APIVR debug paths where a tight red-capable feedback loop must exist before fixing.
activation: Activate when the description trigger applies to the current task.
required_inputs: Task request, relevant repository context, constraints, and authority dependencies.
required_outputs: Skill-specific artifact, verification evidence, canonical verdict, and next action.
authority_dependencies: 00_start_here/SOURCE_OF_TRUTH.md; 10_governance/APIVR_EXECUTION_LIFECYCLE.md; 10_governance/source_of_truth/Elite_Build_Goals_v3.md.
evidence_requirements: Executed checks or an honest Unknown, Not Run, or Blocked state for every material claim.
---

# Diagnosing Bugs And Feedback Loops

Use this skill before changing code for a bug.

<EXTREMELY-IMPORTANT>
No fix before a red-capable feedback loop. Reproduce, observe, or create a failing characterization path before theorizing too far.
</EXTREMELY-IMPORTANT>

## Protocol

1. State the symptom, expected behavior, and observed behavior.
2. Create the tightest feedback loop that can go red and green.
3. Lock scope: do not fix adjacent issues unless APIVR escalates scope.
4. Form one hypothesis at a time.
5. Test the hypothesis with logs, tests, traces, or controlled reproduction.
6. Implement the smallest fix after the cause is supported.
7. Verify targeted behavior and scan nearby regression risk.

## Debug Flow

```mermaid
flowchart TD
  A["Bug reported"] --> B["Reproduce or observe"]
  B --> C{"Red-capable loop exists?"}
  C -- "No" --> D["Build characterization test or trace"]
  D --> C
  C -- "Yes" --> E["Test one hypothesis"]
  E --> F{"Cause supported?"}
  F -- "No" --> E
  F -- "Yes" --> G["Smallest fix"]
  G --> H["Verify green and re-audit"]
```

## Worked Example

Scenario: Exports sometimes contain duplicate rows.

- Feedback loop: fixture with two overlapping sync windows reproduces duplicate export rows.
- Hypothesis: sync cursor is inclusive on both windows.
- Fix: make the second window start exclusive of last exported id.
- Evidence: targeted export test and adjacent backfill test pass.

## Process

1. Load only the authority and task context required by this skill.
2. Execute the narrow workflow without bypassing APIVR, Elite Build Goals, or evidence requirements.
3. Verify the result and report a canonical verdict with remaining risk and next action.
