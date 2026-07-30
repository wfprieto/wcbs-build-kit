# WCBS V2 Remediation Execution Record

Base: `9cac90d5cfabb1b8d3d137058f4558c52149c7be` (`main` before this change).

Scope: execute the V2 remediation blueprint using the WCBS governance and
verification strengths while adopting the executable, native-adapter patterns
needed for a usable skill system. The implementation uses the pinned,
MIT-licensed Superpowers v6.2.0 source only as an attribution-recorded
reference for the Windows bridge and native adapter structure; WCBS procedures
and tests are independently written.

APIVR tier: **Comprehensive**. This changes runtime installation, activation
payloads, migration, release artifacts, and evidence claims. It does not claim
that any model runtime loaded a skill unless a raw fresh-session response exists.

## Remediations and Per-Remediation APIVR Results

| # | Remediation | APIVR result after the remediation | Direct evidence | Verdict |
|---:|---|---|---|---|
| 1 | Make the adapter registry and skill catalog canonical and generated. | Audit found duplicated, diverging adapter metadata; implementation added `runtime_adapters/adapter-registry.yaml` and `scripts/generate-v2-metadata.mjs`; implementation audit checked generated drift; verification regenerated 11 adapters and 14 core skills. | `npm run check:v2-metadata`; `scripts/tests/v2-registry.test.mjs` | PASS |
| 2 | Replace the generic session hook with runtime-shaped, marker-safe bootstrap rendering. | Audit found one output shape; implementation added `scripts/render-session-bootstrap.mjs` and a Windows cmd/bash bridge; verification checked Claude, Cursor, SDK/Copilot, and invalid-runtime fail-closed outputs. | `scripts/tests/v2-bootstrap-renderer.test.mjs`; `scripts/tests/activation-marker-reachability.test.mjs` | PASS |
| 3 | Turn the core workflow into command-bearing, routed skills. | Audit found descriptive core guidance; implementation added/reworked the 14-core-skill catalog, runnable examples, explicit triggers, and a deprecated diagnostic alias; verification enforced the skill contract and V2 evaluation cases. | `npm run audit:skill-contract`; `npm run eval:core-skills` | PASS |
| 4 | Add native package artifacts for Cursor, Kimi, OpenCode, Pi, and Codex. | Audit found missing or inert harness paths; implementation added the artifacts, generated marker paths, and explicit support labels; verification parses the packages and executes the OpenCode transform contract. | `scripts/tests/native-adapter-packages.test.mjs` | PASS |
| 5 | Replace V2 project vendoring with an explicit, owned plugin-bundle CLI. | Audit found ambiguous installation risk; implementation added `scripts/wcbs.mjs`, hash ownership, doctor, safe uninstall, and status; verification proved an ordinary README, package file, and source file remain unchanged. | `scripts/tests/wcbs-cli.test.mjs`; `npm run check-install` | PASS |
| 6 | Provide a fail-closed V1-to-V2 migration with rollback. | Audit found migration needed an ownership proof and recovery path; implementation requires byte-identical V1 files, dry-run first, and restores both trees after an injected removal failure. | `scripts/tests/wcbs-cli.test.mjs` | PASS |
| 7 | Remove generic duplicated skill tails and prevent catalog drift. | Audit found mechanically duplicated closing text; implementation moved classification to the generated specialist catalog and replaced repeated tails with local workflow guidance; verification checks governed duplicate counts and layer budgets. | `npm run audit:governance` | PASS |
| 8 | Make behavioral evaluation real but deliberately preregistered. | Audit found only self-referential activation checks; implementation added 42 blinded core-skill cases and a verifier. Paid evaluation remains intentionally blocked until model identity and authorization are recorded. | `npm run eval`; `npm run eval:core-skills` | PASS for preflight; paid outcome BLOCKED |
| 9 | Correct the Codex local marketplace contract and add a real CLI replay. | Audit found plugin and marketplace paths were confused. Implementation makes the V2 Codex bundle a self-contained marketplace root with `source.path: "./"`; implementation audit found and corrected Codex's three-prompt/128-character manifest limits. | `WCBS_CODEX_BIN=/opt/codex/bin/codex npm run codex:marketplace-check` | PASS |
| 10 | Publish an evidence-first V2 operating and migration path. | Implementation updated README, GET_STARTED, INSTALL, migration/runtime evidence docs, versions, provenance, generated matrices, and release notes. Re-audit confirms the generated metadata, version, docs, artifacts, and installer suites agree. | `npm run release-check`; `git diff --check` | PASS |

## Final APIVR Verification

### Audit

The initial gaps were: one-shape startup wiring; non-native or unproven adapter
paths; generic skill bodies; project-vendoring installation; no safe V2
migration; unobservable activation markers; and no behavioral-evaluation
design. A real Codex CLI replay also exposed a manifest-default-prompt limit
that structural JSON parsing did not catch.

### Plan

The plan preserved WCBS APIVR, specialist routing, evidence controls, and
installer safety. It rebuilt only the activation, core skill, native package,
and evaluation layers around one canonical registry and an explicit V2 CLI.
No support label would advance from a file test or marketplace installation.

### Implement

The implementation adds canonical registry generation, 14 core skills, native
adapter packages, shaped session bootstrap rendering, the V2 ownership CLI,
safe V1 migration, native Codex marketplace packaging, preregistered behavior
cases, and the user-facing runbooks. It also removes the verified duplicated
skill boilerplate and packages no root `package.json` into a native bundle,
preventing users from receiving package scripts whose sources are intentionally
not shipped.

### Audit the Implementation

The final diff is limited to the V2 remediation surface: registry-derived
runtime artifacts, native packages, V2 CLI/tests, core skills, evidence/docs,
and release metadata. `git diff --check` passed. `npm run doctor` and
`npm run check:v2-metadata` passed after the final Codex marketplace correction.

### Verify the Implementation

The complete local release gate passed:

- `npm run release-check`
- 265 Node tests and 15 Python tests
- Legacy V1 install → doctor → ownership → smoke → uninstall flows for eight
  runtime adapters
- V2 install → doctor → status → uninstall flows for all 11 registry adapters,
  with ordinary user-owned project files unchanged
- Release artifact `super-build-kit-2.0.0.zip`, 361 files
- A disposable Codex CLI 0.145.0 marketplace add → available-list → plugin add
  → installed-list → remove → marketplace-remove replay

### Re-Audit and Evidence Limits

The Codex replay passes only the package lifecycle. An isolated fresh Codex
process did start, load the WCBS plugin manifest without WCBS manifest warnings,
and display the blinded activation prompt, but it returned no model response
before the 20-second limit because the clean profile was unauthenticated. That
is **Blocked**, not a runtime pass or product failure.

Paid blinded model evaluation is likewise **Blocked** until an authorized
evaluator records an immutable model identity. Neither state is being used to
claim `Runtime Verified`.

## 20 Pass Protocol

| Pass | Material improvement made |
|---:|---|
| 1 | Defined the measurable V2 outcome: native install, discoverable core skills, safe migration, and evidence-backed runtime claims. |
| 2 | Added operator-facing `wcbs` and Codex marketplace commands instead of requiring agents to infer paths. |
| 3 | Separated V2 native installation from retained V1 compatibility and named both stop conditions. |
| 4 | Made `runtime_adapters/adapter-registry.yaml` the canonical source for runtime and catalog metadata. |
| 5 | Required explicit target and plugin directory inputs; ambiguous installs write nothing. |
| 6 | Classified the work as Comprehensive and retained APIVR/evidence restrictions in the bootstrap and docs. |
| 7 | Defined a core-versus-specialist architecture and generated the adapter/package contract from it. |
| 8 | Added hash ownership, symlink refusal, modified-file refusal, and rollback-safe migration. |
| 9 | Added a real Codex marketplace lifecycle replay and isolated profile rather than trusting a README path. |
| 10 | Named exact artifacts, manifests, generated files, scripts, tests, and owned-file receipts. |
| 11 | Added focused registry, renderer, native-package, CLI, and evaluation-design tests. |
| 12 | Added invalid-shape, missing marker, unowned directory, changed file, changed V1 file, and interrupted migration paths. |
| 13 | Added dry-run migration, transactional restoration, V2 uninstall refusal, and explicit Blocked evidence behavior. |
| 14 | Added review/receiving-review/verification skills and centralized release authority. |
| 15 | Recorded APIVR results after every remediation and this final re-audit. |
| 16 | Added concrete commands and a generated router so a competent operator need not invent installation or activation steps. |
| 17 | Removed repeated skill tails and made generated metadata drift fail the build. |
| 18 | Rewrote activation/install documentation around short, direct commands and explicit evidence limits. |
| 19 | Challenged the real Codex CLI; corrected the marketplace source model and Codex prompt-limit defect it exposed. |
| 20 | Kept the default bootstrap compact, routed specialist material on demand, and documented the remaining evidence gaps. |

20 Pass Protocol:

- Passes completed: 20 / 20
- Improvement proof: each pass above changed a shipped V2 artifact or its
  executable verification.
- Initial score: 5 / 10 for native operational readiness.
- Final score: 8 / 10 for native operational readiness; runtime outcome proof
  remains blocked rather than assumed.
- Final verdict: CONDITIONAL PASS

## Release Gate and Next Action

The V2 remediation implementation is ready for protected CI. It is not allowed
to claim all-harness runtime activation or paid behavioral lift. The single next
action for each evidence gap is an independently replayed, authenticated
fresh-session response (three profiles per runtime before upgrading that
runtime's support label); paid evaluation separately requires an authorized
evaluator and immutable model identity.
