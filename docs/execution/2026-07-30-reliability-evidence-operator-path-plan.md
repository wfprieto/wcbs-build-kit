# Reliability, Evidence, and Operator-Path Upgrade Plan

## APIVR classification

- **Tier:** Comprehensive. The change governs evaluation provenance, runtime-support evidence, installation rollback guidance, and release claims.
- **Applicable goals:** Reliability, Security and Privacy, Clear Ownership, Fast Safe Delivery, Operational Excellence, Maintainability, and Evidence Integrity.
- **Base:** `82d9dd61dffb4e26ae1046887b95c43e89c3cbe8`.
- **Objective:** Repair stale behavioral-evaluation pins, add generated proof-pack definitions for every registry runtime, and provide one short operator route without changing the active skill count or a support label.

## Boundaries

- **In scope:** `evals/`, `runtime_adapters/`, `scripts/`, public entry documentation, focused contract tests, and execution evidence.
- **Out of scope:** Vendor-runtime authentication, paid behavioral runs, changing designed support levels, publishing a package, or altering user-owned destination files.
- **Preserved:** APIVR authority hierarchy, V1 project-scoped default, V2 package-integrity limitation, clean-session proof threshold, and full release gate.
- **Rollback:** Revert the coherent remediation commit. No migration or user data is changed.

## Design checkpoint

- **Intent:** Make readiness and proof requirements replayable before external access exists; reduce the first navigation decision to four intents.
- **Constraints:** No vendor CLI command, model identifier, credential, judge identity, or runtime result may be invented. No new active skill may be introduced.
- **Acceptance tests:** Stale protocol identities fail; current pinned identities are independently readable; all registry runtimes have complete proof packs; malformed proof packs fail; the operator entrypoint routes all four intents; existing support language remains below Runtime Verified.
- **Risk and rollback:** Incorrect pin refresh could make a protocol look executable. All readiness output therefore keeps configuration and external blockers separate; a bad result is reverted with the commit.
- **Must not change:** Support labels, evaluator execution authorization, default installer scope, or existing release command.

## Vertical slices

### 1. Evaluator readiness

1. Add a failing contract test for an immutable evaluation-subject record and a machine-readable readiness command.
2. Add `evals/EVALUATION_SUBJECT.json` with the exact WCBS and Superpowers source identities observed at baseline.
3. Refresh the two preregistrations' subject, candidate, target, rubric, and harness pins without adding an agent command, credential, or role key.
4. Add `scripts/evaluation-readiness.mjs`, which emits a redacted, version-pinned record and separately labels configuration versus external blockers.
5. Run the focused evaluator contracts and the normal/strict preflight commands.

### 2. Runtime proof packs

1. Add a failing contract test for one proof pack per runtime registry entry.
2. Add `runtime_adapters/RUNTIME_PROOF_PACKS.json`, generated from registry identities and containing package, lifecycle, registration, activation, invocation, uninstall, rollback, redaction, and evidence-manifest requirements.
3. Add `scripts/verify-runtime-proof-packs.mjs` and the `check:runtime-proof-packs` script; it fails closed on a missing runtime, invalid tier order, unsafe evidence location, or an unsupported claim.
4. Update the runtime-evidence guide and portability contract to route external proof through this one canonical generated catalog.
5. Run the focused validator and adapter tests.

### 3. Operator route and challenger gate

1. Add a failing contract test for `WCBS_START.md` and its four intent routes.
2. Add `WCBS_START.md` as the concise public router and link it from `README.md` and `GET_STARTED.md`; it lists eight primary workflows and routes detailed mechanics to canonical owners.
3. Add the five-field design checkpoint to the contribution route only for non-trivial changes.
4. Strengthen the canonical review skill with a mandatory concise challenger pass for installer, security, runtime-adapter, evaluator, and release changes.
5. Run public-entry, documentation, and behavior-fixture contracts.

## Pre-flight contradiction scan

No contradiction found. The task requires a readiness repair but forbids invented vendor details; the implementation therefore validates and records exact gaps rather than attempting execution. The required operator entrypoint is a router, not a second authority source.

## Verification and release

1. Inspect exact base-to-head diff and generated-file freshness.
2. Run focused Node contracts, `npm run doctor`, `npm run check`, and `npm run release-check`.
3. Run `npm run eval:readiness` and preserve its `Blocked` external evidence state.
4. Run the challenger review against the exact branch range, repair any material finding, and re-review.
5. Commit only coherent slices, publish a draft PR, and merge only after GitHub release, verification, and cross-platform checks pass.

## Compound-learning decision

- **Capture trigger:** A real vendor proof pack exposes an adapter-wide replay pattern not already covered by `runtime_adapters/PORTABILITY_CONTRACT.md`.
- **Canonical update if universal:** `runtime_adapters/PORTABILITY_CONTRACT.md`.
- **Solved-problem entry:** No, unless a real clean-session proof produces a reusable vendor integration lesson.
- **Knowledge refresh:** Yes, because public routing and runtime-evidence references change.
- **Privacy:** Runtime records retain only redacted evidence locations and hashes; credentials and raw private prompts are excluded.
