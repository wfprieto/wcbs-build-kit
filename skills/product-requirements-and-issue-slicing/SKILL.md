---
name: product-requirements-and-issue-slicing
description: Use when use to convert ideas, audits, requests, strategy notes, PRDs, specs, or implementation plans into product requirements and vertical issue slices with independent acceptance criteria, exact evidence, non-goals, dependencies, and APIVR-ready execution order.
activation: Activate when the description trigger applies to the current task.
required_inputs: Task request, relevant repository context, constraints, and authority dependencies.
required_outputs: Skill-specific artifact, verification evidence, canonical verdict, and next action.
authority_dependencies: 00_start_here/SOURCE_OF_TRUTH.md; 10_governance/APIVR_EXECUTION_LIFECYCLE.md; 10_governance/source_of_truth/Elite_Build_Goals_v3.md.
evidence_requirements: Executed checks or an honest Unknown, Not Run, or Blocked state for every material claim.
---

# Product Requirements And Issue Slicing

Use this skill when a plan is too large or needs to become executable issues.

## Slicing Rules

- Slice vertically by user-visible or system-verifiable outcome.
- Each slice must have one owner, one evidence path, and one rollback story.
- Avoid horizontal slices such as "build models", "build API", then "build UI" unless each is independently verifiable.
- Put risky learning slices early.
- Keep non-goals explicit to prevent scope drift.

## Issue Template

```text
Title:
Objective:
User/system outcome:
In scope:
Out of scope:
Files likely affected:
Acceptance criteria:
Tests/evidence:
Rollback:
Dependencies:
APIVR tier:
```

## Worked Example

Scenario: Build subscription analytics.

- Slice 1: define canonical subscription states and glossary.
- Slice 2: produce one verified monthly churn query.
- Slice 3: render admin table with empty/error/export states.
- Slice 4: add scheduled email after report accuracy is verified.
- Each slice can be tested and released independently.

## Process

1. Load only the authority and task context required by this skill.
2. Execute the narrow workflow without bypassing APIVR, Elite Build Goals, or evidence requirements.
3. Verify the result and report a canonical verdict with remaining risk and next action.
