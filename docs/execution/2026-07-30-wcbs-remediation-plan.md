# WCBS Remediation Plan

## APIVR Tier And Scope

**Tier:** Comprehensive. WCBS governs agent behavior, installation, release evidence, CI, and support claims.

**Applicable Elite Build Goals:** Meta Goal 0; Goals 1, 2, 3, 5, 7, 8, 9, 10, 13, 14, and 15.

**Authoritative baseline:** `origin/main` at `3d9f22efced769dd4eec8699b531927ab05c98d3`, tree `644f545d`. All new work is isolated on `feat/wcbs-engineering-loop-20260730`.

## Preserved Behavior And Non-Goals

- Preserve V2 installer ownership, symlink, rollback, and unrelated-file protections.
- Preserve the support ledger: no adapter is upgraded above `Not Run` without raw clean-session evidence.
- Do not amend a preregistered behavioral protocol after its first measured run.
- Do not claim Superpowers superiority without an independently scored, pinned comparison.
- Do not delete or mutate the historical `feat/wcbs-surpass-remediation` worktree.

## Baseline Findings

1. The historical remediation branch has the same tree as `origin/main` but non-ancestral history from a squash merge. It is not the implementation baseline.
2. V2 metadata is generated from `runtime_adapters/adapter-registry.yaml`, but primary runtime entry files duplicate a large startup policy.
3. `LOAD_ORDER.md` is 37,551 bytes. A concise entry contract is needed so runtime adapters can route rather than restate governance.
4. The evaluation preflight correctly fails closed but its Gate 0C candidate and evaluator-harness pin are historical rather than the current published candidate.
5. Local deterministic checks exist; fresh full-suite completion in this execution environment is not yet verified because its Node runner is interrupted before a final summary. This must be treated as `Blocked`, not passed.

## Vertical Slices

### Slice 0: Baseline and evidence control

**Files:** `docs/execution/ENGINEERING_LOOP_*`, this plan, `docs/evidence/LEARNING_LOG.md`.

**Acceptance criteria:** detached baseline and implementation worktree resolve to the same remote SHA; divergent legacy branch is recorded; local and external evidence are separated.

**Verification:** `git -C ../wcbs-loop-baseline rev-parse HEAD`; `git -C . status --short --branch`.

### Slice 1: Canonical runtime startup contract

**Files:** `runtime_adapters/adapter-registry.yaml`, `scripts/generate-v2-metadata.mjs`, `runtime_adapters/generated/runtime-startup-contract.md`, seven primary runtime entry files, `scripts/tests/v2-registry.test.mjs`, and a focused entry-contract test.

**Failing test first:** add tests that require a generated common startup contract and require each primary entry file to identify that contract as its source. Run the focused test and observe failure because neither artifact nor route markers exist.

**Implementation:** generate one concise common non-Kernel policy contract from the registry. Each entry file retains the mandatory direct Kernel fail-closed transport invariant, its native details, and its exact runtime marker. Make `--check` reject drift.

**Acceptance criteria:** no primary entry file restates non-Kernel common startup policy; the direct Kernel fail-closed route is the documented delivery-transport exception; a deterministic check identifies every primary entry file; existing adapter package, doctor, install, smoke, and uninstall tests remain unchanged or stronger.

**Rollback:** revert this slice commit. Runtime support labels are untouched.

### Slice 2: Lifecycle evidence fixtures

**Files:** lifecycle skills, core-skill registry cases, behavior fixtures, tests, and user-facing quick-start documentation.

**Acceptance criteria:** representative feature, bug, documentation, and security-sensitive routes have positive and pressure/negative examples; no workflow requirement exists only as prose.

**Dependency:** Slice 1 must pass drift checks.

### Slice 3: Evaluation candidate integrity

**Files:** `evals/*`, evaluator-manifest generation/checking, preregistration documentation, and tests.

**Acceptance criteria:** existing historical protocols are explicitly labeled historical; a future protocol can only be created against a frozen candidate and refreshed hashes before measurement. The repository does not fabricate vendor commands, model IDs, keys, or runtime proof.

**Dependency:** the future candidate SHA and independent approval. Do not run paid evaluation in this slice.

### Slice 4: CI and supply-chain assurance

**Files:** `.github/workflows/*`, dependency/review configuration, release builder, release tests, evidence templates, and release documentation.

**Acceptance criteria:** a full release-gate path is PR-enforced; artifact manifest includes the planned provenance references; no credentials or unpinned action are introduced; GitHub execution remains separately verified.

### Slice 5: Documentation and support boundaries

**Files:** `GET_STARTED.md`, `docs/*`, runtime support tables, upstream adoption ledger, release documentation.

**Acceptance criteria:** a new engineer can find activation, lifecycle, recovery, evidence tier, and support limitation from one concise path; documentation makes no adoption or superiority claim.

### Slice 6: External runtime and behavior evidence

**Files:** only preregistered evidence outside the source checkout plus the support registry after independent review.

**Acceptance criteria:** three fresh authenticated profiles per claimed runtime, immutable runtime/model identity, installation record, raw transcript, verifier output, and independent replay record. Gate 0C runs before the three-arm comparison.

**Stop condition:** immediately `BLOCKED` if clean authenticated runtime access, immutable model IDs, vendor loaders, evaluator keys, isolated external evidence storage, or independent judges are unavailable.

### Slice 7: Final review, CI, and merge

**Acceptance criteria:** two distinct review records, full clean-worktree release evidence, hosted required checks on one candidate SHA, final 20-pass record, merged-SHA verification, and artifact checksum evidence.

**Stop condition:** do not merge on a numeric score or when a release-critical check is blocked.

## Fixed External Blockers

| Blocker | Why it cannot be synthesized | Required evidence |
|---|---|---|
| Clean-session runtime proof | A package test cannot prove injection or behavior in a real runtime. | Raw authenticated session records and independent review. |
| Immutable model/runtime identity | A model alias is not reproducible. | Vendor-supported exact version and model identifier. |
| Behavioral comparison | Scoring needs independent, blinded evidence. | Complete frozen protocol, two judges, adjudicator, signed ledgers. |
| Hosted protected CI | Local execution cannot prove repository protections. | Workflow run URLs/IDs against the candidate SHA. |

## Pre-Flight Challenge Questions

1. Does the slice change any installer ownership boundary? If yes, add adversarial red tests and security review.
2. Does it upgrade a support claim? If yes, stop until raw runtime evidence is available.
3. Does it alter a measured behavioral protocol? If yes, version a new preregistration before any run.
4. Does the change merely replace duplicated prose with another source of truth? If yes, reject it.
5. Does the test fail for the intended missing behavior before production code changes? If no, revise the test.

## Compound Learning Decision

- Capture trigger: an observed cross-platform, evaluation-integrity, or canonicalization defect with a verified regression test.
- Canonical destination: the directly applicable skill or governance file; otherwise `docs/evidence/LEARNING_LOG.md`.
- Solved-problem entry: after verified evidence only.
- Privacy: no runtime credentials or raw private transcripts enter source control.
