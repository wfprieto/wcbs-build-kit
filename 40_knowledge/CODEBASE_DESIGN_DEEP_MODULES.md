# Codebase Design And Deep Modules

Use this knowledge source with `skills/codebase-design-and-deep-modules/SKILL.md`.

## Deep Module Heuristics

- A deep module offers a small, stable interface over meaningful complexity.
- A shallow module adds indirection without hiding complexity.
- A good adapter keeps provider-specific language out of core domain code.
- A good interface makes illegal states or invalid calls harder to express.
- A good boundary reduces how much a future change must know.

## Design Smells

- A feature requires touching many unrelated files for one business rule.
- Tests must mock internal details instead of public behavior.
- Provider-specific terms leak into UI, reports, or domain objects.
- A module cannot be deleted without hunting hidden references.
- Naming reflects implementation mechanics rather than domain meaning.

## APIVR Use

Use these heuristics in architecture audit, engineering plan review, code review, and re-audit. Record findings as release gate B or maintainability findings when they materially affect risk.

