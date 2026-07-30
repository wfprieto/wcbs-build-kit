# WCBS Runtime Startup Contract

<!-- GENERATED FILE - DO NOT EDIT BY HAND. Source of truth: runtime_adapters/adapter-registry.yaml. -->

This is the common non-Kernel policy for thin runtime entry files. Every entry file must also retain the direct Kernel fail-closed transport invariant before routing here, plus its native transport details and exact marker.

## Kernel Route

Read and execute `BOOTSTRAP.md` before project work. If the Kernel cannot transfer to its Controller, stop and emit only the transport failure envelope.

## Required Startup

1. `00_start_here/START_HERE.md`
2. `00_start_here/SOURCE_OF_TRUTH.md`
3. `00_start_here/LOAD_ORDER.md`
4. `50_audits/AUDIT_TIER_ROUTER.md`
5. `skills/super-build-kit/SKILL.md`

## Common Controls

- Classify the APIVR tier before implementation or release claims.
- Apply the applicable Elite Build Goals and preserve the source-of-truth hierarchy.
- Load only the task-specific files selected by LOAD_ORDER.md.
- Use a failing test or documented evidence-first substitute before production code changes.
- Do not claim a check passed unless it was actually run.
- Do not bypass evidence, release gates, or stop conditions for speed.
- End material work with APIVR tier, evidence state, verification performed and not performed, release-gate status, final verdict, and one next action.
