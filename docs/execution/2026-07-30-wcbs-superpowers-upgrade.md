# WCBS × Superpowers Upgrade: Execution Record

## Pinned sources

- WCBS base: `02c25dcb395c43883793f33590cecd20634dc2f1`
- Superpowers: `44c9b2d6e889982ac18c27d05a19fefe335194e1`
- Superpowers tree: `dcb98a8f3aa03c8aef4144efda4e2bf9a77c40de`
- Inspection: 2026-07-30, America/New_York
- APIVR tier: Comprehensive

This is a source-and-test integration cycle. It does not upgrade any runtime
support tier and does not substitute package tests for clean-session evidence.

## Scope and acceptance criteria

1. Replace the stale summary-only upstream decision record with a complete,
   pinned, machine-validated integration matrix.
2. Keep APIVR and Elite Build Goals authoritative over imported methods.
3. Make the verified project-scoped installer the URL-arrival default until
   each runtime has a separately verified V2 registration route.
4. Prove the two changes with red-green regression tests and the full release
   gate.

Non-goals: copying Superpowers files, asserting behavioral superiority,
changing runtime support labels, or executing a credentialed live evaluation.

## 20 Pass Protocol

| Pass | Concrete improvement to this execution artifact or branch |
|---:|---|
| 1 | Added measurable scope, acceptance criteria, and non-goals above. |
| 2 | Defined URL-arriving agent and V1-maintainer routes separately. |
| 3 | Recorded exact WCBS and upstream immutable identities. |
| 4 | Named APIVR and Elite Goals as non-overridable authority. |
| 5 | Added explicit runtime and destination-project discovery rather than inference. |
| 6 | Classified the work as Comprehensive and excluded unsupported live claims. |
| 7 | Assigned upstream decisions to the matrix and WCBS ownership to canonical paths. |
| 8 | Preserved transactional project-write boundaries and MIT attribution requirements. |
| 9 | Separated package integrity from runtime activation in onboarding. |
| 10 | Named exact changed paths and test contracts in the commit history. |
| 11 | Added integration-matrix and public-entry red-green regression tests. |
| 12 | Recorded unknown runtime and ambiguous-destination handling; V2 package use remains separately bounded. |
| 13 | Preserved V2 uninstall and V1 resolver no-write rollback boundaries. |
| 14 | Required independent diff and provenance review before release verdict. |
| 15 | Mapped the work through Assess, Plan, Implement, Verify, Release, Re-Audit. |
| 16 | Made the V2 command sequence executable from `GET_STARTED.md`. |
| 17 | Removed contradictory V2-default routing and retained one project-scoped default route. |
| 18 | Compressed public onboarding while retaining explicit compatibility boundaries. |
| 19 | Added challenger review as a required release input for this branch. |
| 20 | Defined evidence-bounded scores and a release verdict below. |

## Baseline and final scorecard

Scores are engineering-control assessments, not adoption, popularity, or live
agent-performance measurements. They are bounded by the listed evidence.

| Dimension | Baseline | Final target | Evidence |
|---|---:|---:|---|
| Upstream maintainability | 72 | 88 | Complete pinned matrix, validator, scheduled review-only drift check |
| Source-of-truth integrity | 86 | 90 | APIVR-preserving dispositions and canonical-owner fields |
| First-use clarity | 74 | 84 | Project-scoped default and explicit V2 registration boundary |
| Verification integrity | 88 | 91 | New red-green tests plus release gate |
| Runtime behavioral proof | 20 | 20 | Intentionally unchanged: external clean-session evidence is Blocked |
| Overall control-plane score | 78 | 83 | Moderate confidence; live behavior excluded |

## Verification and limits

Required targeted evidence:

```bash
node --test scripts/tests/upstream-compatibility.test.mjs
node --test scripts/tests/public-entry-contract.test.mjs
npm run release-check
```

The preflight for `npm run eval:superpowers:strict` remains `Blocked` until an
immutable execution identity, vendor-documented loader templates, external
evidence directory, and independent keys exist. That is a retained limitation,
not a test failure to be bypassed.

## Rollback

Revert the two upgrade commits. V2 and V1 installer behavior is unchanged;
the change affects provenance governance and public routing only.

## Final release template

Final verdict is conditional on the full release gate, exact-diff review, and
upstream recheck. Any clean-session activation claim remains `Blocked` unless
the separate runtime-evidence procedure completes.
