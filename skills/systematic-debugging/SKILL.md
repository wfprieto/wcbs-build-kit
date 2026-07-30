---
name: systematic-debugging
description: Use when a test, command, install, runtime, integration, or user workflow fails, flakes, regresses, hangs, or behaves unexpectedly. Establishes a causal reproduction before any symptom patch.
activation: bug, regression, flaky behavior, crash, timeout, or unknown failure.
required_inputs: Reproduction evidence, expected and actual behavior, relevant code or system boundary, and safe test scope.
required_outputs: Causal finding, regression test or evidence substitute, verified fix, and remaining risk.
authority_dependencies: 00_start_here/SOURCE_OF_TRUTH.md; 10_governance/APIVR_EXECUTION_LIFECYCLE.md; skills/test-driven-development/SKILL.md.
evidence_requirements: Executed reproduction and causal probe, or an honest Blocked state where a probe cannot run safely.
---

# Systematic Debugging

Fix causes, not symptoms. A plausible patch is not a diagnosis.

## Hard Gate

Do not change production behavior until the failure is reproduced or an
evidence-first substitute is documented. “It probably needs a retry,” “works
locally,” and “the test is flaky” are hypotheses, not causes.

## Process

1. **Reproduce.** Capture the smallest command, fixture, environment, expected
   result, actual result, and timestamp. For a flaky failure, record enough
   runs to show the pattern rather than one lucky pass.
2. **Compare.** Find the nearest known-good path or boundary. Compare inputs,
   environment, state, permissions, filesystem layout, and timing one variable
   at a time.
3. **Hypothesize and test.** State one causal hypothesis and the observation
   that would falsify it. Change only the probe or test needed to learn.
4. **Fix and defend.** Write the regression test first, observe Red, implement
   the smallest root-cause fix, then add a second boundary guard only when the
   same failure can enter through another supported path.

## Debug Receipt

```text
Symptom:
Reproduction command:
Expected / actual:
Known-good comparison:
Hypothesis and falsifier:
Root cause evidence:
Regression test:
Fix and adverse-state check:
```

## Worked Example

```bash
node scripts/install-adapter.mjs --target codex --dest /tmp/ordinary-project --install
```

If it fails only when `README.md` exists, compare the copy plan with a clean
directory. The causal finding is a collision rule treating ordinary user files
as owned output, not “README support is missing.” Write a test that creates
`README.md`, expects zero writes on collision, then change only the ownership
plan. Re-run the targeted test and the full installer suite.

## Stop Conditions

- Required logs, clean environment, credentials, or source are absent:
  report `Blocked`; do not invent a root cause.
- A probe could touch production, credentials, or third-party systems without
  authorization: stop and request scoped approval.
- A hypothesis fails: discard it explicitly and return to comparison.
