# Superpowers Compatibility Policy

WCBS uses [obra/Superpowers](https://github.com/obra/superpowers) as an
upstream benchmark and an attributed design input. It is not a silent fork.

## Pinned baseline

- Repository: `https://github.com/obra/superpowers.git`
- Commit: `44c9b2d6e889982ac18c27d05a19fefe335194e1`
- Tree: `dcb98a8f3aa03c8aef4144efda4e2bf9a77c40de`
- License: MIT. Retain the upstream copyright and license notice with any
  distributed copied material. Conceptual adaptations are recorded as
  adaptations, not represented as original upstream code.

The Phase 6 comparison protocol retains its separately preregistered identity.
This integration baseline must not be substituted into a measurement already in
progress. A new comparison requires a new, versioned protocol.

The complete current-cycle decision record is
`docs/upstream/SUPERPOWERS_INTEGRATION_MATRIX.json`. It covers every evaluated
capability, records the required WCBS test and provenance treatment, and never
changes runtime support claims.

## Change-management rule

The scheduled upstream report records the current remote `HEAD` beside this
pinned baseline. It never imports, merges, commits, or publishes upstream
changes. A maintainer must record one decision in `ADOPTION_LEDGER.md` for each
material candidate: **adopt, adapt, defer, or reject**. Every adopt/adapt
decision needs an owner, provenance, compatibility test, and evidence result.

## Compatibility scenarios

WCBS keeps APIVR as the governing lifecycle while testing comparable outcomes
for brainstorming/design, isolated worktrees, executable planning, test-first
implementation, systematic debugging, two-stage review, and completion
verification. Fixture and structural success do not establish live-runtime
behavioral equivalence. That claim remains blocked until the preregistered
comparison is executed and independently scored.
