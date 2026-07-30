---
name: receiving-code-review
description: Use when review comments, pull-request findings, audit observations, or change requests arrive. Verifies each finding before accepting, rejecting, fixing, or closing it.
activation: code review response, reviewer feedback, audit finding triage, or requested changes.
required_inputs: Review finding, cited range, approved requirements, and a safe verification surface.
required_outputs: Evidence-backed finding disposition, repair receipt when needed, and re-review request.
authority_dependencies: 00_start_here/SOURCE_OF_TRUTH.md; skills/test-driven-development/SKILL.md; skills/verification-before-completion/SKILL.md.
evidence_requirements: Executed probe or cited contract evidence for every accepted, rejected, or deferred finding.
---

# Receiving Code Review

Respect a reviewer without treating every comment as automatically correct.
Verify the finding against the current change and the approved requirement.

## Finding Decision Table

| Outcome | Required response |
|---|---|
| Valid defect | Add a focused regression or evidence probe, fix it, and request re-review. |
| Valid but scope change | Return to plan/owner for an explicit decision; do not smuggle it into the patch. |
| Misunderstanding | Provide the exact source, test, or contract that resolves it and keep the review open for confirmation. |
| Disagreement | State the trade-off, evidence, owner, and release impact. Do not dismiss by authority. |
| Blocked | State the unavailable evidence and the one action needed to resolve it. |

## Process

1. Restate the finding as a falsifiable claim.
2. Inspect the cited range and run the smallest probe that could prove it wrong.
3. Classify using the table. Record evidence, not confidence alone.
4. For a valid defect, invoke `test-driven-development`: Red, Green, Refactor.
5. Re-run the original reviewer evidence and request re-review of the fixed
   range. Do not mark it closed from the implementer’s own result.

## Worked Example

Finding: “The installer can overwrite a user README.”

Probe: create a temporary project with an unowned `README.md`, run install, and
assert the command exits before writes. If it overwrites, the finding is valid:
add the regression first, fix collision detection, and give the reviewer the
exact command and result. If the probe already fails safely, cite that result
and ask the reviewer whether a different path was intended.
