# Reliability, Evidence, and Operator-Path Upgrade: Execution Record

## Pinned baseline and scope

- **WCBS base:** `82d9dd61dffb4e26ae1046887b95c43e89c3cbe8`
- **Superpowers reference:** `44c9b2d6e889982ac18c27d05a19fefe335194e1`
- **APIVR tier:** Comprehensive
- **Scope:** evaluator preflight pins and readiness reporting, generated proof packs for all 11 registry runtimes, one public intent router, and challenger-review wording.
- **Not changed:** active skill count, designed or verified runtime-support labels, V1 project-scoped installation default, V2 package-integrity limitation, or any vendor account.

## Remediation outcomes

| Outcome | Result | Evidence state |
| --- | --- | --- |
| Stale WCBS, Superpowers, rubric, and harness pins | Repaired through `evals/EVALUATION_SUBJECT.json`, refreshed preregistrations, and refreshed harness manifest | Verified |
| Evaluation readiness | Gate 0C reports configuration `PASS`; the three-arm comparison also reports configuration `PASS` only when supplied its separately validated Superpowers source checkout | Verified |
| Clean-session proof procedure | Generated `runtime_adapters/RUNTIME_PROOF_PACKS.json` covers all 11 runtimes, five evidence tiers, and each adapter's canonical lifecycle, registration, and `read_skill` route | Verified |
| Actual clean-session activation and invocation | No vendor session or independent replay record was available | Blocked |
| Operator compression | `WCBS_START.md` routes installation, contribution, release verification, and runtime evaluation to canonical owners | Verified |
| Challenger pass | The canonical code-review skill now requires the exact-diff challenger pass for installer, security, adapter, evaluator, and release work | Verified |

## 20 Pass Protocol

| Pass | Concrete improvement made |
| ---: | --- |
| 1 | Bound the release to three measurable remediation outcomes. |
| 2 | Added one operator router for human and agent first-use choices. |
| 3 | Recorded exact WCBS and Superpowers immutable identities in one evaluation-subject record. |
| 4 | Routed every new page back to APIVR and tier-router canonical authorities. |
| 5 | Made missing evaluator inputs and the external Superpowers source input visible as classified readiness blockers rather than assumptions. |
| 6 | Kept the work Comprehensive because it controls support and release claims. |
| 7 | Separated evaluation source identity, protocol, runner, proof pack, and public router ownership. |
| 8 | Rejected escaping evaluator protocol paths and kept credential values out of readiness output. |
| 9 | Preserved vendor-session and credential limitations as external `Blocked` evidence. |
| 10 | Added exact scripts, generated catalog, test files, and canonical documentation paths. |
| 11 | Added Red-Green contracts for pin readiness, proof-pack completeness, route coverage, malformed packs, and escaped paths. |
| 12 | Added missing session, missing identity, stale pin, malformed pack, dirty checkout, and path-escape adverse handling. |
| 13 | Preserved WCBS-owned uninstall boundaries and named rollback as a revert of the coherent branch. |
| 14 | Added the concise independent challenger requirement for the affected change classes. |
| 15 | Recorded baseline, plan, implementation, implementation audit, verification, and release-readiness steps. |
| 16 | Added runnable `eval:readiness` and proof-pack check commands. |
| 17 | Used generated proof packs from the adapter registry, including each runtime's lifecycle, registration, and representative routing mechanism. |
| 18 | Compressed the first decision into eight primary workflows with advanced routes retained. |
| 19 | Reviewed the exact branch changes for stale pins, uncontained reads, false support claims, and generated-file drift. |
| 20 | Added the final scorecard and evidence-bounded verdict below. |

## Engineering-only scorecard

These are source-control assessments, not popularity, adoption, or live-runtime-performance measurements.

| Dimension | Baseline | Final | Basis |
| --- | ---: | ---: | --- |
| Evaluator configuration readiness | 30 | 85 | Stale pins now validate through a canonical source record and readiness command; three-arm readiness requires an independently supplied, identity-checked Superpowers checkout. |
| Runtime-proof reproducibility | 35 | 78 | Every runtime has the same ordered proof and evidence-manifest contract, with lifecycle, registration, and `read_skill` details derived from its canonical adapter entry. |
| Operator clarity | 74 | 88 | One first decision routes four intents and eight common workflows. |
| Release-control coverage | 88 | 91 | Proof-pack freshness is part of the authoritative check and doctor contract. |
| Clean-session runtime proof | 20 | 20 | No vendor clean-session or independent replay evidence was available. |
| Overall source-control score | 78 | 84 | Medium confidence; external runtime behavior is excluded. |

## Verification

- **Verified:** focused remediation contracts; evaluator protocol suite; doctor integration suite; Gate 0C readiness; three-arm readiness with an identity-checked external Superpowers checkout; `npm run check:runtime-proof-packs`; full `npm run release-check` after final documentation is rechecked.
- **Blocked:** paid behavioral execution, immutable vendor execution identity, vendor-documented loaders, independent producer/judge/adjudicator keys, authenticated runtime sessions, and independent runtime replay.
- **Rollback:** revert the final remediation commit. No user project, runtime account, credential, or support label was changed.

## Provenance and drift

The existing 29-entry `docs/upstream/SUPERPOWERS_INTEGRATION_MATRIX.json` remains the complete upstream decision record. This release adapts only its lightweight routing, design checkpoint, vertical-slice, verification, and challenger mechanics into WCBS canonical owners. No Superpowers text or runtime mechanism was bulk-copied.

## Verdict

`CONDITIONAL PASS` after the full release gate. The remaining blockers are external proof prerequisites, not package or source-control failures. The next required action is hosted PR verification; only an authorized clean authenticated runtime session may advance a runtime-support label.
