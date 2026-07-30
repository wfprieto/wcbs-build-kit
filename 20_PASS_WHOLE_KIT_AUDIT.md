# WCBS Whole-Kit 20-Pass Audit

Date: July 11, 2026  
Repository: `wfprieto/wcbs-build-kit`  
Branch: `main`  
Original upgrade head inspected: `017edf58da093c9564f6c187100e48ffbc3840d6`  
Last known-good pre-upgrade base: `6771ebb6b876b658a69eb9e8416fc1a5712808b2`  
Operating law: **Audit wide. Fix narrow. Prove everything.**

This audit was performed independently against the actual `main` tree. The earlier PASS report was treated as a claim to verify, not as evidence. Every counted pass below produced either a concrete correction or newly executed evidence. A passive reading was not counted.

## Pass 1: Authority and source-of-truth hierarchy

**Verified evidence:** Inspected `README.md`, `00_start_here/START_HERE.md`, `00_start_here/SOURCE_OF_TRUTH.md`, `00_start_here/LOAD_ORDER.md`, the packaged APIVR skill, and the Elite Build Goals source. The authority chain remains APIVR, Elite Build Goals, canonical merged files, then archived provenance. No adapter or convenience document outranks that chain.

**Improvement:** The root README verification section was updated to reflect the actual complete gate instead of describing only a partial doctor check.

## Pass 2: Startup and load-order routing

**Verified evidence:** The startup sequence deterministically loads START_HERE, SOURCE_OF_TRUTH, LOAD_ORDER, audit-tier routing, and then only task-specific material. Runtime work routes through the active manifest and tool mapping. Ordinary startup does not load the entire portability design corpus.

**New proof:** `npm run verify` completed in strict mode with no missing-reference warnings.

## Pass 3: Controller state-machine completeness

**Verified evidence:** `node --test scripts/tests/controller-contract.test.mjs` passed **13/13**. The suite proves pre-flight scanning, durable schemas/templates, exact ranges, bounded repair, independent re-review, evidence vocabulary, context-cost controls, and final whole-branch review requirements.

## Pass 4: Role separation

**Verified evidence:** Independently inspected the implementer, task-reviewer, fix-agent, and final-reviewer prompts. Implementers cannot self-clear findings; fix agents may return only `FIXED_PENDING_REVIEW` or `BLOCKED`; task reviewers require file-and-line evidence; final reviewers inspect the cumulative `plan_base_sha..branch_head_sha` range.

**New proof:** Controller tests verify every role prompt exists and remains wired to the canonical controller contract.

## Pass 5: Finding lifecycle and repair-budget enforcement

**Defect F-013 found and fixed:** The published finding schema allowed any string as `cleared_by`, did not enforce RFC 3339 on `cleared_utc` or history timestamps, and permitted arbitrary transition values. The schema now constrains clearing authority, lifecycle states, actors, and all lifecycle timestamps. Regression tests prove a fix agent cannot clear its own finding and invalid lifecycle timestamps fail.

**Verified evidence:** Repair budgets still enforce a minimum of one, repair rounds cannot be negative, and material findings require fix, named tests, recorded evidence, and same-scope re-review.

## Pass 6: Exact review-range generation

**Verified evidence:** `python3 -m unittest discover -s skills/subagent-driven-development/tests -v` passed **15/15**. Coverage includes multi-commit ranges, ancestor checks, identical-range rejection, shortcut-ref rejection, dirty-tree failure, Unicode and awkward untracked paths, isolated temporary-index behavior, verbatim constraints, and artifact hashes.

## Pass 7: Artifact durability and secret boundaries

**Defect F-014 found and fixed:** `task-artifact.schema.json` was published but no machine-readable task artifact existed in the run layout, committed fixture, doctor, or artifact suite. `task-artifact.json` is now a required companion to the human-readable task brief, the schema requires the immutable-brief contract fields, and the fixture contains matching artifacts for both ledger tasks.

**Verified evidence:** The artifact contract still forbids secrets, tokens, credentials, API keys, and private data in durable artifacts.

## Pass 8: Schema completeness and enforcement

**Defect F-015 found and fixed:** Supported JSON Schema keywords with malformed values could be silently weakened, such as `properties: []`, `required: "x"`, `enum: "x"`, or a string numeric bound. Recursive preflight now validates the shape and consistency of every supported keyword before instance traversal.

**Verified evidence:** `node --test scripts/tests/schema-enforcement.test.mjs` passed **40/40**, including numeric limits, impossible dates, timezone boundaries, unsupported keywords in absent branches and unused `$defs`, `$ref` sibling assertions, malformed keyword rejection, lifecycle timestamps, task artifacts, and complete test evidence.

## Pass 9: Hermetic testing

**Verified evidence:** With no live `.wcbs/` directory, `node --test scripts/tests/artifact-bundle.test.mjs` and the complete `npm run check` gate both passed. The committed fixture is the baseline; live run bundles are optional and validated only when present.

**New proof:** The fixture now verifies task artifacts, findings, progress ledgers, and task-ID agreement without developer-local state.

## Pass 10: Doctor coverage and strict behavior

**Defect F-016 found and fixed:** `--strict` previously changed only the displayed mode; markdown-reference warnings still exited successfully. Strict mode now converts every warning into a failure.

**Defect F-017 found and fixed:** The doctor required only `doctor` and `verify` script names, so the main gate could be silently replaced with a no-op. It now enforces the exact zero-dependency script chain for doctor, strict verify, matrix, Node, Python, aggregate test, and full check.

**Verified evidence:** `node --test scripts/tests/wcbs-doctor.test.mjs` passed **29/29**, including strict-warning failure, exact package wiring, task artifacts, adapter fraud, stale matrices, schema violations, dependencies, controller-rule removal, and durable-evidence defects.

## Pass 11: Manifest and tool-mapping agreement

**Verified evidence:** `node --test scripts/tests/adapter-contract.test.mjs` passed **26/26**. All eight runtimes have one manifest and one required nine-action tool mapping. Equivalent manifest capabilities and mapped actions agree, fallbacks are mandatory for non-native actions, and unknown actions fail closed.

## Pass 12: Support-level honesty

**Verified evidence:** Full, Partial, Manual, and Unsupported retain binding definitions. Manual activation remains Manual. Missing essential capabilities require Unsupported. Partial runtimes disclose degraded optional capabilities and exact fallbacks.

**Limitation retained:** These support classifications are documentation-reasoned. No vendor clean-session activation run was performed during this audit, and the kit does not represent one as completed.

## Pass 13: Activation-marker identity

**Verified evidence:** Every shipped marker equals `WCBS_KIT_ACTIVE:<runtime_id>` exactly. Duplicate markers and near matches such as wrong prefixes, suffixes, or embedded runtime names are rejected by contract tests, schema tests, artifact tests, and doctor integration tests.

## Pass 14: Generated capability-matrix reproducibility

**Verified evidence:** `npm run check:matrix` reported `CAPABILITY_MATRIX.md is current (8 runtimes)`. The matrix is generated from manifests, carries a generated-file warning, and hand edits fail the doctor.

## Pass 15: Runtime fallback accuracy

**Verified evidence:** Inspected all fallback categories in the generated matrix. Runtimes without independent subagents explicitly degrade to a fresh-context sequential review and must disclose reduced independence. Missing browser verification records rendered-UI evidence as Not Run rather than claiming proof. Manual approval and artifact fallbacks name executable behavior rather than generic workarounds.

## Pass 16: Package and dependency safety

**Verified evidence:** `package.json` remains private and has no runtime, development, peer, or optional dependencies. Doctor mutation tests prove any added dependency or weakened gate script fails.

## Pass 17: Cross-platform assumptions

**Defect F-018 found and fixed:** The mandatory npm gate hard-coded the `python3` executable despite Windows-capable adapter claims. `scripts/run-python-tests.mjs` now selects `python3`, `python`, or `py -3` without shell invocation. The direct `python3 -m unittest ...` command was still executed independently on the verification runner.

## Pass 18: Documentation reference integrity

**Defect F-019 found and fixed:** The committed fixture README documented only findings and ledgers after task artifacts became part of the enforced contract. It now documents all three schema-backed artifact classes, task-ID agreement, and the fixture's intentionally minimal scope.

**Verified evidence:** Strict verification passed, proving no detected canonical markdown reference is missing.

## Pass 19: Release-gate and evidence-state consistency

**Defect F-020 found and fixed:** Progress-ledger test records required command and exit status but allowed the documented result to be omitted, contradicting the artifact evidence rule. `result` is now required and non-empty.

**Verified evidence:** `Unknown`, `Not Run`, and `Blocked` remain distinct. `CANNOT_VERIFY_FROM_DIFF` maps to Unknown and cannot silently become PASS. Release gates require explicit risk ownership and do not allow missing evidence to disappear.

## Pass 20: Whole-system synergy, duplication, drift, and final gate

**Verified evidence:** The complete post-remediation gate passed from a clean GitHub checkout:

- `npm run check`: PASS
- Complete Node suite: **123/123**, zero failed, skipped, cancelled, or todo
- Python suite through the portable npm launcher: **15/15**
- Direct Python suite: **15/15**
- Controller: **13/13**
- Adapter: **26/26**
- Schema: **40/40**
- Artifact bundle: **15/15**
- Doctor integration: **29/29**
- Strict `npm run verify`: PASS
- Capability matrix: current for **8 runtimes**
- F-011 no-live-`.wcbs` verification: PASS
- F-012 adversarial verification: PASS, **10 direct cases**

The controller, artifacts, schemas, doctor, package scripts, runtime contracts, generated matrix, and documentation now reinforce the same authority chain. No duplicate controller authority or conflicting release vocabulary was found after the corrections above.

## Defects Found and Fixed

| ID | Correction |
|---|---|
| F-013 | Enforced finding lifecycle roles, states, and RFC 3339 timestamps. |
| F-014 | Wired machine-readable task artifacts through layout, schema, fixture, doctor, and tests. |
| F-015 | Added structural preflight for malformed supported JSON Schema keywords. |
| F-016 | Made strict doctor mode fail warnings. |
| F-017 | Made doctor enforce the exact complete package gate. |
| F-018 | Replaced the hard-coded npm `python3` launcher with a portable Node selector. |
| F-019 | Corrected stale hermetic-fixture documentation and task inventory. |
| F-020 | Required a non-empty test result in durable ledger evidence. |

## Remaining Limitations

1. Runtime support levels remain documentation-reasoned, not vendor clean-session verified.
2. The JSON Schema validator intentionally supports a documented draft-2020-12 subset and rejects unsupported keywords or formats rather than silently accepting them.
3. Python 3, Node.js, npm, and Git remain external prerequisites; the kit adds no dependency manager or bundled runtime.
4. A fresh-context sequential review remains a degraded substitute where a runtime lacks an independent reviewer.

## Final Audit Verdict

**PASS**, subject only to the accurately stated limitations above. No open material finding remains from this 20-pass review.
