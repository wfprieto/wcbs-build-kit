---
name: simplest-safe-path
description: Use when a build, fix, plan, audit, skill, agent, or pipeline has more than one viable design and the agent must choose the simplest safe option or challenge unjustified complexity.
activation: Activate when the task presents design alternatives, proposes a new guardrail, stage, retry, fallback, dependency, abstraction, configuration surface, or review of complexity. Do not activate for a predetermined narrow edit unless a design choice appears.
required_inputs: Task objective, repository state, applicable APIVR tier, constraints, source-of-truth files, evidence available, rollback boundary, and any proposed alternatives.
required_outputs: Simplest-safe decision, rejected simpler alternatives with reasons, complexity budget, guardrail justifications, evidence states, APIVR verdict, and one next action.
authority_dependencies: 00_start_here/SOURCE_OF_TRUTH.md; 10_governance/APIVR_EXECUTION_LIFECYCLE.md; 10_governance/source_of_truth/Elite_Build_Goals_v3.md; 20_skills/PORTABLE_SKILL_CONTRACT.md.
evidence_requirements: Execute relevant checks or mark every material claim Verified, Likely, Suspected, Unknown, Not Run, or Blocked; never treat confidence or a design document as runtime proof.
---

# Simplest Safe Path

Use this skill as the kit-wide owner for design minimality. It makes the
simplest design that still satisfies safety, correctness, security, data
integrity, accessibility, and the required outcome the default. It does not
replace APIVR, the Elite Build Goals, TDD, security review, code review, or
release gates.

<HARD-GATE>
Do not add a component, layer, stage, retry loop, fallback, dependency,
abstraction, configuration surface, or guardrail without naming the specific
failure mode or required outcome it addresses and the evidence that makes it
real or reasonably likely. “Best practice,” “future-proofing,” “more robust,”
and “defense in depth” are not sufficient by themselves. If the justification
is speculative, choose the simpler safe option and record the decision.
</HARD-GATE>

## Activation and authority

Activate during APIVR Phase 1 when the design is not predetermined, during
Phase 2 before implementation, and during Phase 4 when reviewing a plan, diff,
skill, agent, pipeline, or audit for overengineering. For security,
authorization, privacy, data integrity, production, or destructive work, the
higher-risk APIVR and security controls remain authoritative. This skill may
escalate a tier but may not lower one.

Load only the relevant files named by `00_start_here/LOAD_ORDER.md`. For a
high-stakes skill, audit, plan, or source-file change, also load
`skills/20-pass-protocol/SKILL.md`. Do not copy APIVR, routing tables, or Elite
Build Goals into a second source of truth.

## Decision procedure

1. State the required outcome and the hard constraints in one sentence.
2. Establish the current baseline and the smallest design that could meet the
   outcome. Treat it as the default choice.
3. List at least one simpler alternative and one rejected alternative. Reject
   an alternative only with a named constraint, failure mode, or required
   outcome it cannot satisfy. If no simpler alternative fails, choose it.
4. For every element beyond the baseline, record the failure mode or required
   outcome, evidence, implementation/testing cost, and what happens if it
   misfires.
5. Record the complexity budget before implementation. Unjustified moving
   parts are removed or deferred.
6. Route the chosen design into the normal APIVR plan, test-first
   implementation, review, verification, release, and re-audit controls.

## Complexity budget

Use a small table in the plan, review, or evidence ledger:

| Added element | Failure mode or required outcome | Evidence | Cost / misfire risk | Decision |
|---|---|---|---|---|
| name the layer, guardrail, retry, dependency, or state | what it prevents or delivers | observed, likely, or blocked | moving parts, tests, operations, and failure if wrong | keep, defer, or remove |

Every kept row must be justified. Do not invent a numeric budget. The budget
is satisfied when every added element has a matching justification and the
chosen design is reversible or has a verified rollback.

## Review and pressure rules

As the simplicity challenger, ask: “What is the smallest safe option that
still meets the requirement?” Flag duplicated rules, speculative stages,
unbounded retries, premature abstractions, and guardrails without evidence.
Material findings return to APIVR implementation and require re-review of the
same scope. Do not remove an existing safeguard merely because it is complex;
first prove that its failure mode no longer exists and preserve a rollback.

Do not let sunk cost, schedule pressure, or a request to “just add it” bypass
the gate. If evidence is missing, record `Unknown`, `Not Run`, or `Blocked`
and stop the affected claim. A simpler design may proceed only if it still
holds the higher-priority safety and integrity constraints.

## APIVR output

End with:

- chosen simplest safe option;
- simpler alternatives and why they failed or were selected;
- complexity budget and guardrail justifications;
- files, tests, and evidence states;
- `PASS`, `CONDITIONAL PASS`, `PARTIAL`, `FAIL`, or `BLOCKED`;
- one next required action.

`PASS` means the selected design is the simplest safe design and every added
element is justified. `CONDITIONAL PASS` or `PARTIAL` requires the exception,
owner, and next action. `FAIL` means unjustified complexity remains. `BLOCKED`
means a required decision or evidence is unavailable.

## Worked example

Proposed change: “Add three retry layers to an external API workflow.” The
simplest safe baseline is one bounded, idempotent retry policy at the owning
integration boundary. Keep another layer only if a documented provider or
transport failure requires it and a test proves it does not duplicate side
effects. Otherwise remove it, record the rejected alternative, and route the
remaining work through `skills/external-api-integration/SKILL.md`.

## Relationship to other skills

- `skills/writing-plans/SKILL.md` owns the executable APIVR plan.
- `skills/test-driven-development/SKILL.md` owns Red-Green-Refactor evidence
  for code changes.
- `skills/codebase-design-and-deep-modules/SKILL.md` owns module boundaries
  and the deletion test.
- `skills/code-review-and-review-army/SKILL.md` owns specialist review.
- `skills/20-pass-protocol/SKILL.md` owns the 20 counted precision passes.
- `skills/knowledge-refresh-and-drift-control/SKILL.md` owns stale or duplicate
  guidance decisions.

This skill contributes the simplicity decision and challenge; it does not
create a competing lifecycle or a new agent hierarchy.
