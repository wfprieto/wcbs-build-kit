# APIVR Execution Lifecycle

Source authority: `20_skills/apivr.skill`, `20_skills/apivr/SKILL.md`, and `20_skills/apivr/references/playbook.md`.

APIVR is the required closed loop for all build, fix, audit, debug, optimization, release, and verification work.

## Lifecycle

1. **Audit** - establish reality before prescribing a fix.
2. **Plan** - define root cause, smallest safe change, rollback, evidence, and success criteria.
3. **Implement** - execute only the approved surface.
4. **Audit the Implementation** - compare planned vs actual and scan for collateral damage.
5. **Verify the Implementation** - prove technical behavior, experience quality, and outcome progress.
6. **Re-Audit** - update the baseline when it informs a decision or closes a verification horizon.

## Tier Scaling

- Rapid: one-line audit, direct change, one-line implementation audit and verification.
- Standard: compressed six-phase record.
- Comprehensive: full assessment, blueprint, evidence ledger, rollback, and release gates.
- Forensic: chain of evidence, sign-offs, formal audit trail, and no core safety release on unknown evidence.

## Required Claim Discipline

- Never prescribe before inspection.
- Never claim deployment equals success.
- Never skip implementation audit or verification.
- Never present L3/L4 analysis as fact.
- Never call work done when required evidence is `Unknown`, `Not Run`, or `Blocked`.

## Final Verdicts

- `PASS`
- `CONDITIONAL PASS`
- `PARTIAL`
- `FAIL`
- `BLOCKED`

Every verdict must include evidence and the single next required action.

