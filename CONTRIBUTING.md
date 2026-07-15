# Contributing

Super Build Kit contributions must preserve the operating law: **Audit wide. Fix narrow. Prove everything.**

## Contribution Standard

1. Read `00_start_here/START_HERE.md`, `00_start_here/SOURCE_OF_TRUTH.md`, `00_start_here/LOAD_ORDER.md`, and `50_audits/AUDIT_TIER_ROUTER.md`.
2. Use APIVR for every change.
3. Keep edits scoped to the smallest complete file set.
4. Preserve source-of-truth order: APIVR, Elite Build Goals, canonical kit files, then provenance.
5. Never weaken evidence states, release gates, safety gates, or authorization gates for convenience.

## Before Opening A Pull Request

Run:

```bash
npm run release-check
```

If a check cannot run, say exactly which command was not run and why.

## Required PR Evidence

- APIVR tier.
- Applicable Elite Build Goals.
- Files changed.
- Verification commands and outcomes.
- Release gates affected.
- Known limitations or follow-up work.

## Skill And Guidance Changes

Skill changes should be self-contained, operational, and linked through `00_start_here/LOAD_ORDER.md` when they affect activation. Prefer upgrading an existing canonical skill over adding a duplicate skill with overlapping authority.

