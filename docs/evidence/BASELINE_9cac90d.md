# WCBS Published Baseline Receipt

- Published source: `origin/main`
- Immutable commit: `9cac90d5cfabb1b8d3d137058f4558c52149c7be`
- Observed date: 2026-07-29
- APIVR tier: Comprehensive

## Preservation

The original local checkout at `09def82a` was three commits behind the
published source and contained a user-owned edit to
`90_archive/provenance/UPSTREAM_FILE_INVENTORY.md`. It was not reset, cleaned,
merged, or used as release evidence. Verification ran from a separate detached
worktree at the published commit.

## Verified baseline checks

`npm run release-check` completed successfully at `9cac90d`. The command
covered doctor/strict structural controls, generated metadata checks, legacy
adapter lifecycle fixtures, behavior fixtures, Node and Python suites, system
tests, installer checks, and release artifact generation.

Gate 0C preflight was structurally valid but correctly `Blocked`: its Claude
execution identity had no immutable CLI version or model identifier. No paid
runs, runtime-support upgrade, or behavioral-lift claim was produced.

## Baseline limits

- Runtime adapters had fixture/structural evidence only, not authenticated
  clean-session proof.
- Gate 0C and the Superpowers comparison required external runtime access,
  protected credentials, vendor-documented loaders, and independent scoring.
- A local verification pass was not GitHub merge, tag, hosted-CI, or pilot
  evidence.
