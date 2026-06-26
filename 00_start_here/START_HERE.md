# Start Here

This is the first file every LLM, coding agent, subagent, reviewer, or automation must read before using the Super Build Kit.

## Non-Negotiable Operating Law

**Audit wide. Fix narrow. Prove everything.**

Do not start from a fix. Start from the APIVR tier router, inspect the real system, identify the applicable Elite Build Goals, then proceed through the scaled APIVR lifecycle.

## Required Startup Sequence

1. Read `00_start_here/SOURCE_OF_TRUTH.md`.
2. Read `00_start_here/LOAD_ORDER.md`.
3. Read `50_audits/AUDIT_TIER_ROUTER.md`.
4. Classify the request as Rapid, Standard, Comprehensive, or Forensic.
5. Load the smallest complete file set required for the task.
6. State the tier, applicable goals, and evidence requirements before implementation or release claims.

## Stop Conditions

Stop and report instead of guessing when:

- required files, credentials, logs, data, or context are missing;
- a destructive or irreversible action is requested without explicit authorization and rollback planning;
- a material security, privacy, authorization, payment, data-integrity, or production-availability risk appears;
- evidence is unavailable for a required completion claim;
- two sources of truth conflict and the conflict is not resolved by `SOURCE_OF_TRUTH.md`.

## Minimum Output for Any Work Cycle

Even the smallest Rapid task must end with:

- APIVR tier;
- what was inspected;
- what changed or what was found;
- verification performed or marked `Not Run` / `Blocked`;
- final verdict;
- single next required action.

