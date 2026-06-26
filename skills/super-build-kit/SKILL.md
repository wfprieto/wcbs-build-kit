---
name: super-build-kit
description: Use for any build, fix, audit, debug, optimization, release, verification, prompt, skill, or agent-design task. Activates the APIVR lifecycle and Elite Build Goals guardrails from this repository before task-specific work.
---

# Super Build Kit

This skill activates the portable Super Build Kit operating system.

## Required Activation

Read these files in order:

1. `00_start_here/START_HERE.md`
2. `00_start_here/SOURCE_OF_TRUTH.md`
3. `00_start_here/LOAD_ORDER.md`
4. `50_audits/AUDIT_TIER_ROUTER.md`

Then load only the task-specific files named by `LOAD_ORDER.md`.

## Mandatory Behavior

- State the APIVR tier before implementation or release claims.
- Apply the relevant Elite Build Goals.
- Use evidence states for material claims.
- Run implementation audit and verification before calling work complete.
- Stop instead of guessing when required evidence or authorization is missing.

## Final Output

End with APIVR verdict, evidence summary, release-gate status when applicable, and the single next required action.
