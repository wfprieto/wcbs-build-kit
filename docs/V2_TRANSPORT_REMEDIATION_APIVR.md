# V2 Native Transport Remediation

## APIVR Tier

Comprehensive. This repair changes cross-platform startup transport, native
runtime registration, and the legacy project installer. It is reversible by
reverting the repair commit. No live model session or hosted runtime is
started by this change.

## Phase 1: Audit

At `956bfcc`, the generated renderer proved the desired JSON shapes but the
installed transport could not be invoked by bare path on POSIX because both
hook files were mode `100644`. `hooks/run-hook.cmd` was a CRLF batch file, the
V1 Cursor/Copilot installer targets did not copy a hook registration or the
hook scripts, and the Claude plugin manifest used parent traversal despite the
plugin-root component contract. A renderer launch failure wrote no valid hook
payload.

## Phase 2: Approved Scope

1. Add an executable LF cmd/bash wrapper and make `session-start` emit one
   harness-specific JSON envelope or one harness-specific blocked envelope.
2. Register Cursor at `.cursor/hooks.json` and Copilot at
   `.github/hooks/wcbs-session-start.json`, then have the V1 project installer
   copy each registration with its hook scripts.
3. Make the Claude manifest reference `./hooks/hooks.json` and `./skills/`
   from the plugin root.
4. Add a public-interface test that executes the wrapper, validates exactly
   one parsed payload, tests a failed renderer, and replays V1 install/uninstall.
5. Update the doctor, generated metadata, and installation documentation to
   match the canonical registrations.

## Preserved / Out Of Scope

- V2's bundle installer remains explicit and refuses to write ordinary project
  files. It cannot be labelled as a live Cursor or Copilot runtime proof.
- No vendor CLI, authenticated model session, paid evaluation, or hosted CI run
  is claimed or executed here.
- Runtime support labels remain `Not Run` until a clean-session transcript is
  independently replayed.

## Red-Green Contract

- Test: `scripts/tests/hook-transport.test.mjs`.
- Red command: `node --test scripts/tests/hook-transport.test.mjs`.
- Initial result: six failures, each naming a missing transport behavior.
- Green acceptance: all tests pass; `npm run release-check` passes; installed
  Cursor and Copilot V1 projects contain only their documented registration and
  owned transport files.

## Risk, Rollback, And Evidence

| Item | Decision |
|---|---|
| Owner / approver / verifier | Bill Prieto / Bill Prieto / Codex local verification |
| Restore point | `956bfcc4b8568465da6656dda19d4c307b1b0710` |
| Rollback trigger | Hook test, strict doctor, installer lifecycle, or release check fails |
| Rollback action | Revert the repair commit, regenerate metadata, rerun `npm run release-check` |
| Immediate success measure | Executable hook emits one parsed correct envelope and V1 installer replays cleanly |
| Deferred success measure | Clean authenticated Cursor, Copilot, and Claude sessions emit correct runtime markers |

## Pre-Flight Conflict Scan

| Area | Finding | Severity | Resolution |
|---|---|---|---|
| Objective / non-goals | Project hook discovery and V2 isolated bundles differ | Important | Keep project registrations in V1; do not promote V2 runtime evidence |
| Acceptance criteria | Windows cmd execution is unavailable locally | Important | Test POSIX parseability; record Windows runtime as Not Run |
| Tests / evidence | Prior suite tested renderer output but not executed transport | Blocking | Add and run the transport suite before code changes |
| File ownership | V1 installer owns project files; V2 owns only bundle files | None | Test V1 lifecycle separately; preserve V2 non-mutation invariant |
| Placeholder language | None | None | All source files and commands named |

## 20 Pass Protocol

| Pass | Concrete improvement made |
|---:|---|
| 1 | Defined the observable outcome as one parsed native payload per hook invocation. |
| 2 | Identified installers and maintainers as the operators of the path. |
| 3 | Separated V1 project registrations from V2 isolated bundle behavior. |
| 4 | Named the hook, manifest, installer, doctor, registry, and test files. |
| 5 | Added explicit `--runtime` arguments so no hook must infer an ambiguous host. |
| 6 | Classified the repair as Comprehensive with an exact restore commit. |
| 7 | Kept rendering in `render-session-bootstrap.mjs`; transport only selects an envelope. |
| 8 | Suppressed renderer stderr and emitted a safe blocked envelope instead. |
| 9 | Used documented project paths for Cursor and Copilot without adding global configuration. |
| 10 | Bound each new registration to its exact source and installer target. |
| 11 | Added executable tests that spawn the wrapper and parse its output. |
| 12 | Added renderer-unavailable and single-emission adverse-path coverage. |
| 13 | Replayed V1 install and uninstall to verify ownership and cleanup. |
| 14 | Recorded owner, approver, verifier, and the runtime-evidence handoff. |
| 15 | Recorded the six APIVR phases and no-runtime-proof boundary. |
| 16 | Replaced inferred platform selection with manifest commands that an operator can run. |
| 17 | Added strict-doctor checks for modes, line endings, manifests, and component paths. |
| 18 | Updated generated installation metadata and installer documentation from the registry. |
| 19 | Challenged the prior V2 bundle claim and documented the Cursor/Copilot project-root limitation. |
| 20 | Kept the final runbook short enough to execute while preserving rollback and evidence boundaries. |

## Plan Review

Approved for implementation: the source of truth remains the adapter registry
and vendor-native project hook paths. The repair adds no dependency, secret,
network callback, or user-global configuration.

## Phase 3: Implementation

The repair makes both transport entry points executable, pins their line
endings to LF, and replaces the old batch-only wrapper with a cmd/bash
polyglot. `session-start` now accepts an explicit runtime and writes exactly
one renderer-selected envelope. Its failure path writes exactly one
runtime-correct blocked envelope with `kernel_artifact_unreadable` rather than
shell diagnostics on stdout.

The native project registrations are `.cursor/hooks.json` and
`.github/hooks/wcbs-session-start.json`. The V1 Cursor and GitHub Copilot
installer targets now ship those registrations and `hooks/`; uninstall removes
the owned files. The obsolete unregistered Cursor plugin manifest and stale
standalone Cursor registration were removed. Claude component references are
now plugin-root-relative.

## Phase 4: Implementation Audit

- No user-global configuration, network operation, dependency, or secret was
  added.
- Each registration names the wrapper and an explicit runtime; runtime shape
  selection is no longer inferred from an ambiguous environment alone.
- The test executes source and installed wrappers, parses the emitted JSON,
  asserts a single line and empty stderr, and checks the renderer-unavailable
  path.
- The strict doctor rejects missing executable bits, CRLF wrapper content,
  malformed registration contracts, and parent-traversing Claude components.
- The adapter registry, generated matrices, manifests, installer, doctor,
  test, and installation guide were changed together.

## Phase 5: Local Verification

These are executed local results, not live harness evidence:

| Command | Observed result |
|---|---|
| `node --test scripts/tests/hook-transport.test.mjs` | 6 passed; source and installed-tree Cursor/Copilot transport each emitted exactly one parseable native envelope. |
| `npm run release-check` | Passed: 271 Node tests, 15 Python tests, strict doctor, system fixtures, eight V1 install/doctor/ownership/smoke/uninstall lifecycles, V2 isolated lifecycles, and release artifact build (363 files). |
| `git diff --check` | Passed with no whitespace errors. |

## Phase 6: Re-Audit And Verdict

The patch is based on `956bfcc4b8568465da6656dda19d4c307b1b0710`, whose
parent is `9cac90d5cfabb1b8d3d137058f4558c52149c7be`. Every change is within
the approved transport, registration, installer, metadata, documentation, and
verification scope. All 20 concrete protocol improvements above are present
and covered by the completed local verification.

**APIVR verdict: Conditional Pass.** The deterministic local repair is
verified. A release must not upgrade this to Runtime Verified until native
Cursor, GitHub Copilot, and Claude clean-session replays produce independently
captured transcripts; Windows `cmd.exe` execution and hosted CI are also Not
Run in this environment. Before publishing, attach the raw release-gate output
to the review alongside the resolvable commit.

## Compound Learning Decision

- Capture trigger: a shipping hook is structurally present but not executable.
- Canonical update: `scripts/wcbs-doctor.mjs` plus transport tests.
- Solved-problem entry: No separate entry. The regression test and doctor gate
  are the durable, executable learning.
- Knowledge refresh: Yes. Installation references must be regenerated and
  checked after the registry wording changes.
