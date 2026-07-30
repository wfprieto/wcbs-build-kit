---
name: using-wcbs
description: Use when starting a WCBS-enabled session or before any project action, including questions, exploration, planning, edits, tests, reviews, or release work. Routes work to the smallest applicable WCBS skill before acting.
activation: session bootstrap and any task where a WCBS skill may apply.
required_inputs: User request, active runtime identity, skill catalog, and relevant project context.
required_outputs: Selected skill route or evidence-first fallback, evidence state, and next action.
authority_dependencies: 00_start_here/SOURCE_OF_TRUTH.md; 10_governance/APIVR_EXECUTION_LIFECYCLE.md; runtime_adapters/adapter-registry.yaml.
evidence_requirements: A loaded skill, an executed verification, or an honest Verified, Likely, Suspected, Unknown, Not Run, or Blocked state for every material claim.
---

# Using WCBS

WCBS is an on-demand operating system, not a document dump. Select the smallest
skill that changes the decision or the evidence standard before you act.

## Hard Gate

Before a project action, do one of these explicitly:

1. Load the relevant skill; or
2. State why no skill applies and use the evidence-first fallback below.

User instructions win. Never invent a tool that is absent from the active
runtime map. If the catalog or map is unreadable, stop with `Blocked`.

## Process Router

| Request signal | First skill | Next mandatory skill when code changes |
|---|---|---|
| New behavior, feature, workflow, or product idea | `brainstorming` | `writing-plans`, then `test-driven-development` |
| Plan, audit remediation, or multi-step change | `writing-plans` | `test-driven-development` |
| Bug, regression, flaky test, crash, or unknown failure | `systematic-debugging` | `test-driven-development` |
| Implementation request with approved plan | `executing-plans` | `test-driven-development` |
| Independent implementation and review | `subagent-driven-development` | `requesting-code-review` |
| Review request or received feedback | `requesting-code-review` / `receiving-code-review` | `verification-before-completion` |
| Branch, PR, merge, or cleanup | `finishing-a-development-branch` | `verification-before-completion` |
| New or revised skill, prompt, runbook, or agent | `writing-skills` | `20-pass-protocol` |

Add APIVR and the 16 Elite Goals at the tier that matches risk. Installation,
runtime adapters, external tools, security, or release artifacts are
Comprehensive unless evidence supports a narrower tier.

## Evidence-First Fallback

Use only when no listed skill applies:

```text
1. Inspect the smallest relevant source or system state.
2. State the evidence state: Verified, Likely, Suspected, Unknown, Not Run, or Blocked.
3. Make the smallest reversible action, if authorized.
4. Run the direct verification before making a completion claim.
```

## Example

User: “The installer corrupted a project. Fix it quickly.”

1. Load `systematic-debugging`; do not patch from the symptom.
2. Reproduce in a temporary project and record the failing command.
3. Load `test-driven-development`, write the regression first, observe Red,
   implement the smallest transaction fix, and verify Green.
4. Load `verification-before-completion` before reporting it fixed.

## Safe Failure

If a requested route needs credentials, a clean runtime session, a paid model
run, or a provider account that is unavailable, do not replace it with a
fixture and call it proven. Record `Blocked`, preserve the deterministic proof
that exists, and name the exact next runtime action.
