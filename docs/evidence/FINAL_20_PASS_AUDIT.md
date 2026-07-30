# WCBS Surpass Remediation: Final 20-Pass Audit

> **Revision notice:** this historical audit’s Pass 14 result was invalidated
> by a later independent security review of `f90bccc`. The corrected installer
> ticket and its current evidence are recorded in
> `docs/evidence/V2_INSTALLER_SAFETY_REMEDIATION.md`. This document must not
> be used as the current release decision until that ticket has a full release
> rerun and independent re-review.

Candidate baseline: `9cac90d5cfabb1b8d3d137058f4558c52149c7be`.

Implementation candidate for the locked behavioral protocols:
`5eb0f297702e49a41f63946136b089a2eecfac97`
(`999234aec89d4ab63aa649c5dca56df7236c6b19`). The current branch additionally
contains evaluation-integrity corrections; they do not manufacture a behavioral
outcome.

APIVR tier: **Comprehensive**. This is a review record, not a claim that
external runtime behavior or comparative superiority has been proven.

| Pass | Review focus | Result | Evidence / limit |
|---:|---|---|---|
| 1 | Objective and scope fidelity | PASS | `docs/V2_REMEDIATION_EXECUTION.md`; bounded to native activation, workflow, evidence, and release controls. |
| 2 | Baseline preservation | PASS | `docs/evidence/BASELINE_9cac90d.md`; clean detached baseline retained. |
| 3 | Canonical-source architecture | PASS | `runtime_adapters/adapter-registry.yaml`, generated metadata checks. |
| 4 | Engineering lifecycle | PASS | `skills/using-wcbs/` and governed core workflow skills. |
| 5 | Design and acceptance discipline | PASS | APIVR lifecycle and execution record require scoped plans and evidence. |
| 6 | Worktree/task discipline | PASS | isolated baseline and remediation worktrees; no unrelated user work changed. |
| 7 | Test-first / testability | PASS | regression tests added before each correction in this remediation. |
| 8 | Systematic debugging | PASS | `docs/evidence/LEARNING_LOG.md` records the hardened-Git root cause and prevention. |
| 9 | Specification review | PASS | registry, adapter, installer, and evaluation contracts are executable. |
| 10 | Quality/security review | PASS | Fresh private hook directories, hostile legacy-hook regression coverage, and independent re-review. |
| 11 | Native activation proof | BLOCKED | package/fixture activation passes; authenticated clean-session runtime proof is unavailable. |
| 12 | Context reactivation proof | BLOCKED | requires a clean, authenticated runtime capable of compaction/resumption. |
| 13 | Adapter contract compliance | PASS | generated registry plus install/doctor/smoke/uninstall contract suites. |
| 14 | Installer and file preservation | PASS | ownership, uninstall, and unrelated-file preservation suites. |
| 15 | Behavioral A/B validity and result | BLOCKED | protocols are preregistered and candidate-bound, but vendor loader, immutable model/version, and independent evaluator keys are intentionally absent. |
| 16 | Security and supply chain | PASS | evaluator-harness bytes are pinned into the complete protocol and sealed run manifest; hardened Git and release provenance checks pass. |
| 17 | CI/release reproducibility | CONDITIONAL PASS | `npm run release-check` passed at `5eb0f29` (327/329 Node pass with one expected platform skip, Python, system, lifecycle, and ZIP artifact gates); hosted protected-CI remains external. |
| 18 | Documentation and claim accuracy | PASS | support evidence remains explicitly `Not Run` until a live runtime result exists. |
| 19 | Superpowers provenance and compatibility | PASS | drift creates one durable GitHub review issue and requires an adoption-ledger decision before closure; no import path exists. |
| 20 | Independent challenge review | PASS | VP Engineering re-review of the remediations found no remaining actionable defect in scope. |

## Gate decision

Internally controllable remediation has passed its local release-candidate
check. The following conditions are
non-waivable before claiming that WCBS surpasses Superpowers:

1. authenticated fresh-session activation evidence for every runtime labeled
   runtime-verified;
2. a complete preregistered Gate 0C run with immutable CLI/model identity,
   vendor-documented loaders, and independent blinded evaluator keys;
3. hosted protected-CI, release, and merge evidence from the resulting SHA.

Until then, the allowed verdict is **CONDITIONAL PASS for internal package
readiness; BLOCKED for runtime superiority proof**.
