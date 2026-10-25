# Activation Tests

These are package checks and diagnostic prompts, not a substitute for the
clean-session procedure in `docs/V2_RUNTIME_EVIDENCE.md`. Use the canonical
command-to-evidence map in `runtime_adapters/PORTABILITY_CONTRACT.md` section 6.

## Codex Executable Package Smoke Test

Run `node scripts/adapter-smoke-test.mjs --target codex --dest <installed-project>`
from the kit source. It verifies ownership and local references, resolves the
installed SessionStart hook, and executes its installed renderer with bounded
time and output. It checks the JSON payload, exact marker, installed paths,
and complete canonical `using-wcbs` context.

A pass is **Executable package verification**. **Authenticated Codex
activation: Not Run** describes what this smoke invocation did not test;
separate clean-session evidence must establish native registration, trusted
hook loading, and invocation. The smoke test does not update runtime support
labels or replace any separately retained runtime record. Other targets'
smoke checks validate files and scenario text; they do not execute those hooks.

## Marker Test

This probe checks for one candidate marker, not complete runtime support.

```text
Start a new session in the installed project and send: hello
```

Pass criteria:

- the first text-bearing assistant response begins with `WCBS_KIT_ACTIVE:<runtime-id>` on its own first line, where the identifier exactly matches the `runtime_id` in `runtime_adapters/manifests/`;
- the marker appears exactly once;
- a marker naming a different runtime is a failure.

Record an authorized observation with its exact runtime version and package
identity in `docs/VERIFIED_RUNTIME_TRANSCRIPTS.md`, labelled as a candidate.
The marker alone cannot establish authenticated activation or invocation.
Its absence does not by itself prove that the instruction file was not loaded.

## Prompted Startup Diagnostic

```text
Read the Super Build Kit startup files. Report the source-of-truth order, APIVR tier options, evidence states, and final-output requirements. Do not edit files.
```

Pass criteria:

- names APIVR and Elite Build Goals;
- names `START_HERE`, `SOURCE_OF_TRUTH`, `LOAD_ORDER`, and `AUDIT_TIER_ROUTER`;
- uses evidence states: Verified, Likely, Suspected, Unknown, Not Run, Blocked.

## Prompted Standard Plan Diagnostic

```text
Plan a Standard feature implementation using the Super Build Kit. Include required skills, test-first evidence, release gates, and stop conditions. Do not implement.
```

Pass criteria:

- loads `skills/writing-plans/SKILL.md`;
- loads `skills/test-driven-development/SKILL.md` for code work;
- includes release gates and verification.

## Prompted Forensic Routing Diagnostic

```text
Route a Forensic audit for an auth and payment workflow. Name required security skills, authorization boundaries, evidence ledger, and release-blocking unknowns. Do not test live systems.
```

Pass criteria:

- loads cybersecurity routing;
- blocks live dual-use testing without authorization;
- treats Unknown, Not Run, and Blocked as non-pass evidence.

The prompted diagnostics show only the observed response to those explicit
requests. A claim that a skill loaded requires native Skill/file-read events;
naming the skill is insufficient. A claim that an agent followed the workflow
requires its execution trace and observable result. None of these prompts
alone proves automatic activation, general agent behavior, or better builds.
