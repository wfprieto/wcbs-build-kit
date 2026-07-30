# Superpowers Compatibility Policy

WCBS uses [obra/Superpowers](https://github.com/obra/superpowers) as an
upstream benchmark and an attributed design input. It is not a silent fork.

## Pinned baseline

- Repository: `https://github.com/obra/superpowers.git`
- Commit: `3dcbd5c4b48e02263fbf4a3c01e3fe4f81d584d9`
- Tree: `da1e7bb99212a060f90ffd6def69ff606775a79c`
- License: MIT. Retain the upstream copyright and license notice with any
  distributed copied material. Conceptual adaptations are recorded as
  adaptations, not represented as original upstream code.

The Phase 6 comparison protocol uses this exact identity. It must not be
changed after measurement begins. A newer upstream release requires a new,
versioned protocol and an updated comparison baseline.

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
