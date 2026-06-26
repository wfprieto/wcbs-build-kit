# Super Build Kit Agent Instructions

These instructions apply to any agent working in this repository.

## Required Startup

Before planning, editing, auditing, verifying, or releasing:

1. Read `00_start_here/START_HERE.md`.
2. Read `00_start_here/SOURCE_OF_TRUTH.md`.
3. Read `00_start_here/LOAD_ORDER.md`.
4. Read `50_audits/AUDIT_TIER_ROUTER.md`.

## Permanent Guardrails

- APIVR is the required lifecycle for build, fix, audit, debug, release, and verification work.
- The 16 Elite Build Goals are mandatory release standards.
- Do not bypass evidence, release gates, or stop conditions for speed.
- Never claim a check passed unless it was actually run.
- Use the smallest complete file set from `LOAD_ORDER.md`; do not load the whole kit by default.

## Required Final Report

End material work with:

- APIVR tier;
- applicable Elite Build Goals;
- evidence state;
- verification performed and not performed;
- release-gate status;
- final verdict;
- single next required action.
