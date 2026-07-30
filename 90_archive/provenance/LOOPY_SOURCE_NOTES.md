# Loopy Source Notes

These notes record the selective integration decision for `Forward-Future/loopy`.

## Adapted Source

- External source: `Forward-Future/loopy`

## Integration Decision

The Super Build Kit adapts the loop discipline, not the full Loopy runtime or publishing system.

Integrated concepts:

- bounded repeatable agent workflows;
- observe, act, check, record, decide cycle;
- explicit loop objectives;
- one-step action rules;
- evidence receipts;
- continuation and stop conditions;
- exhausted, blocked, approval-required, unsafe, and no-progress outcomes.

Not integrated:

- Loopy catalog as a source of truth;
- website or worker infrastructure;
- database or publishing machinery;
- external runtime dependency.

APIVR and the 16 Elite Build Goals remain the authority. Repeatable loops are an execution pattern inside APIVR, not a replacement for APIVR.
