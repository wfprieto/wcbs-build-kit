# Loop Design Template

Use during APIVR Phase 2 before running a repeatable agent loop.

## Objective

## APIVR Tier

Rapid / Standard / Comprehensive / Forensic

## Why A Loop Is Needed

## Source Of Truth

## Scope

- Allowed files/systems/data:
- Allowed actions:
- Forbidden files/systems/data:
- Forbidden actions:

## One-Step Action Rule

## Evidence Check

- Evidence source:
- Command, observation, test, screenshot, log, report, or approval:
- Required evidence state:

## Continue Condition

## Stop Conditions

- Success:
- Clean no-op:
- Approval required:
- Blocked:
- Exhausted:
- No progress:
- Unsafe to continue:

## Iteration Budget

- Maximum iterations:
- Timebox:
- Batch size, if applicable:

## Rollback Or Recovery

## Related Skills

| Skill | Why Needed |
|---|---|
|  |  |

## Receipt Location

Use `60_templates/LOOP_RUN_RECEIPT_TEMPLATE.md` or a task-specific receipt file.

## Final Verdict Rule

Define exactly what allows `PASS`, `CONDITIONAL PASS`, `PARTIAL`, `FAIL`, or `BLOCKED`.
