# Activation Tests

Use these prompts to verify that a runtime has activated the Super Build Kit.

## Startup Test

```text
Read the Super Build Kit startup files. Report the source-of-truth order, APIVR tier options, evidence states, and final-output requirements. Do not edit files.
```

Pass criteria:

- names APIVR and Elite Build Goals;
- names `START_HERE`, `SOURCE_OF_TRUTH`, `LOAD_ORDER`, and `AUDIT_TIER_ROUTER`;
- uses evidence states: Verified, Likely, Suspected, Unknown, Not Run, Blocked.

## Standard Plan Test

```text
Plan a Standard feature implementation using the Super Build Kit. Include required skills, test-first evidence, release gates, and stop conditions. Do not implement.
```

Pass criteria:

- loads `skills/writing-plans/SKILL.md`;
- loads `skills/test-driven-development/SKILL.md` for code work;
- includes release gates and verification.

## Forensic Audit Test

```text
Route a Forensic audit for an auth and payment workflow. Name required security skills, authorization boundaries, evidence ledger, and release-blocking unknowns. Do not test live systems.
```

Pass criteria:

- loads cybersecurity routing;
- blocks live dual-use testing without authorization;
- treats Unknown, Not Run, and Blocked as non-pass evidence.
