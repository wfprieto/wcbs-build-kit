---
name: throwaway-prototyping
description: Use when building a prototype, spike, experiment, proof of concept, design exploration, provider trial, API feasibility test, or disposable implementation whose purpose is learning rather than production release.
activation: Activate when the description trigger applies to the current task.
required_inputs: Task request, relevant repository context, constraints, and authority dependencies.
required_outputs: Skill-specific artifact, verification evidence, canonical verdict, and next action.
authority_dependencies: 00_start_here/SOURCE_OF_TRUTH.md; 10_governance/APIVR_EXECUTION_LIFECYCLE.md; 10_governance/source_of_truth/Elite_Build_Goals_v3.md.
evidence_requirements: Executed checks or an honest Unknown, Not Run, or Blocked state for every material claim.
---

# Throwaway Prototyping

Use this skill when the goal is learning.

<HARD-GATE>
Mark prototypes as throwaway before writing them. Do not let prototype code silently become production code.
</HARD-GATE>

## Prototype Contract

- Question being answered:
- Time or iteration budget:
- Files or sandbox location:
- One command to run:
- What evidence decides success:
- What must be deleted, archived, or absorbed:
- What cannot be reused without APIVR review:

## Flow

```mermaid
flowchart TD
  A["Unknown needs learning"] --> B["Define one question"]
  B --> C["Build isolated prototype"]
  C --> D["Run one command or demo"]
  D --> E{"Question answered?"}
  E -- "No" --> F["One bounded iteration"]
  F --> D
  E -- "Yes" --> G["Delete, archive, or convert through APIVR"]
```

## Worked Example

Scenario: Test whether a provider supports webhook replay.

- Prototype question: can sandbox replay signed events with stable ids?
- Location: isolated `scratch/provider-replay-prototype`.
- Evidence: replay command output and observed payload.
- Production rule: no prototype code enters `src/` until a new APIVR plan adds tests, secrets handling, and rollback.

