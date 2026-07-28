---
name: diagnosing-bugs-and-feedback-loops
description: Use when an older WCBS link names this skill for a bug, regression, flaky test, or unknown failure. This compatibility alias routes immediately to the executable systematic-debugging procedure.
activation: Compatibility route for legacy bug-diagnosis references only.
required_inputs: Bug report, observed failure, and the affected project context.
required_outputs: A route to systematic-debugging and no unsupported diagnosis claim.
authority_dependencies: skills/systematic-debugging/SKILL.md; 10_governance/APIVR_EXECUTION_LIFECYCLE.md.
evidence_requirements: Record the actual reproduction result or an honest Blocked state before changing code.
---

# Diagnosing Bugs And Feedback Loops (Deprecated Alias)

This name remains so existing links do not silently fail. Do not maintain a
second debugging protocol here.

<HARD-GATE>
Do not use this compatibility name to bypass `systematic-debugging`.
</HARD-GATE>

## Required Route

1. Load `skills/systematic-debugging/SKILL.md` before proposing a fix.
2. Preserve its reproduce → compare → hypothesis → root-cause → regression-test
   sequence and its `Blocked` rule.
3. Update callers to use `systematic-debugging` when the change is in scope.

## Safe Failure

If the new procedure cannot be read, stop as `Blocked`. Do not replace it with
a symptom patch or claim that a red-capable feedback loop exists without having
run it.
