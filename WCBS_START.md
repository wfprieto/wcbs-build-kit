# WCBS Start

Use this page to choose the shortest valid route. It is a router, not a new source of truth. Authority remains `00_start_here/SOURCE_OF_TRUTH.md`; risk classification remains `50_audits/AUDIT_TIER_ROUTER.md`.

**Prove it before you say it.** A described package, a fixture, and a real clean-session runtime result are different evidence tiers.

## Choose your intent

| Operator intent | Start here | Required outcome |
| --- | --- | --- |
| Install or use | `GET_STARTED.md` | Identify the runtime and destination, use the supported project-scoped path, verify doctor and smoke, and retain the uninstall route. |
| Contribute or change | `CONTRIBUTING.md` | Confirm branch and risk tier, complete the design checkpoint when non-trivial, then select the required proof gate. |
| Release or verify | `RELEASE_PROCESS.md` | Run the authoritative release command, classify the evidence and rollback material, and issue the release verdict. |
| Evaluate runtime support | `runtime_adapters/RUNTIME_PROOF_PACKS.json` | Select the evidence tier and proof pack, run only authentic vendor steps, and report unavailable sessions or credentials as `Blocked`. |

## Eight primary workflows

1. **Start a task:** `00_start_here/START_HERE.md`
2. **Classify risk:** `50_audits/AUDIT_TIER_ROUTER.md`
3. **Install for use:** `GET_STARTED.md`
4. **Plan a non-trivial change:** `skills/writing-plans/SKILL.md`
5. **Implement test-first:** `skills/test-driven-development/SKILL.md`
6. **Review a material change:** `skills/code-review-and-review-army/SKILL.md`
7. **Release or verify:** `RELEASE_PROCESS.md`
8. **Evaluate a runtime:** `docs/V2_RUNTIME_EVIDENCE.md`

Everything else remains available through `00_start_here/LOAD_ORDER.md` as an advanced or internal route. This catalog does not remove a safeguard or change skill activation rules.

## Design checkpoint for non-trivial changes

Before implementation, record only: intent; constraints; acceptance tests; risk and rollback; and what must not change. Use the existing APIVR plan as the record. Do not create another planning system. For a narrow, reversible change, use the tier router to determine whether this checkpoint is required.

## Evidence and blocked states

Use the evidence states in the APIVR lifecycle exactly. A missing vendor session, credential, independent reviewer, or immutable evaluator identity is `Blocked`; it is not a failed runtime and it is not a pass. Runtime support cannot advance from package files, structural fixtures, hooks, or marker text alone.

## Challenger pass

Installer, security, runtime-adapter, evaluator, and release changes require the concise challenger pass in `skills/code-review-and-review-army/SKILL.md` before a release claim. The challenger reviews the exact diff, records material findings, and requires a re-review after repair.
