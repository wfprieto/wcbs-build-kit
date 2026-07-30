# Behavioral Evaluation Runbook

This directory contains two immutable, evidence-gated behavioral protocols. Neither protocol proves a native runtime activation, changes a runtime support label, or justifies a claim about Superpowers until every listed gate has completed with retained evidence.

| Protocol | Arms | Minimum runs | Current state |
| --- | --- | ---: | --- |
| Gate 0C | neutral, WCBS | 160 | Blocked: execution identity and vendor loader are deliberately unrecorded |
| Superpowers comparison | neutral, WCBS, Superpowers | 240 | Blocked: shared execution identity and both vendor loaders are deliberately unrecorded |

## Non-paid preflight

```bash
npm run eval
npm run eval:superpowers
```

Both commands validate locked case/control-project/candidate provenance and report `BLOCKED` truthfully when an immutable model identity, vendor-documented loader, fixed Superpowers source, exact evaluation-subject/claim-target identity, or fresh release-ZIP content manifest is absent. They do not make vendor calls, create a run directory, spend funds, score cases, or claim success.

Use the strict form to enforce the pre-execution gate:

```bash
npm run eval:strict
npm run eval:superpowers:strict
```

Strict mode fails before any run directory exists unless every identity, source, loader template, and protocol integrity check passes.

## Prerequisites before paid execution

Commit updates to the applicable preregistration before the first invocation. The update must supply:

- The exact agent CLI version and full immutable model identifier, never an alias.
- One shared, vendor-documented agent command template and identical tool/context/budget conditions for every arm.
- Vendor-documented WCBS and (for Phase 6) Superpowers loader templates. Do not invent a loader from a support claim.
- A protected credential variable name; credential values stay only in the execution environment.
- For Phase 6, a read-only Superpowers checkout that resolves exactly to the preregistered commit and tree.
- An `evaluation_subject` and `claim_target` with exactly the same immutable commit and tree. The preflight builds fresh Git-derived ZIPs for both identities and requires the canonical actual-ZIP content manifests to match. Dirty, ignored, untracked, mode-drifted, or caller-tree files cannot supply this proof.

Do not alter the candidate identity, control manifest, prompts, run count, scoring rubric, failure policy, randomization method, or pass rule once measurement begins.

## Paid execution

After strict preflight passes, create one empty, non-symlinked evidence directory physically outside the detached source checkout. Supply that same absolute directory to every stateful evaluation command; no command writes evaluation runs into the source tree or accepts an evidence path that escapes its selected run:

```bash
mkdir -m 700 /secure/external/wcbs-evidence
npm run eval -- --execute --run-id gate-0c-YYYYMMDD --seed <safe-seed> --evidence-dir /secure/external/wcbs-evidence
npm run eval:superpowers -- --execute --run-id comparison-YYYYMMDD --seed <safe-seed> --evidence-dir /secure/external/wcbs-evidence --superpowers-source /read-only/path/to/superpowers
```

The public command validates the external root and that the named run is absent before strict preflight; only the execution protocol creates that one direct child at mode `0700`. It carries an opaque evidence capability to every producer and consumer. Every evidence path is normalized and checked component by component with `lstat`, `realpath`, device, and inode checks. Inputs must be regular non-symlink files. Outputs use a same-parent `O_NOFOLLOW | O_CREAT | O_EXCL` temporary file, `fsync`, and atomic rename, and are never overwritten.

Those checks fail closed when the no-follow primitive is unavailable and detect parent substitution before and after writes. They cannot prevent a privileged or same-authority filesystem actor from replacing a parent between individual kernel calls; that bounded race limitation is not provenance, authorship, chronology, or human-independence evidence.

The runner archives the fixed WCBS evaluation subject with hardened direct Git invocations and stages it through V2 `scripts/wcbs.mjs`; it never uses the V1 adapter installer. The hardened policy disables system/global configuration, aliases, hooks, filters, fsmonitor, and checkout-transforming attributes. It records local core transport settings that the hardened command explicitly overrides, while rejecting unneutralized local filter/include configuration and committed transform declarations before provenance or artifact materialization. The three-arm protocol verifies the supplied Superpowers checkout, then archives the exact preregistered commit rather than mutable `HEAD`. Every scheduled record creates one protected runtime profile shared by its loader setup and agent invocation, and retains raw custody evidence separately from the judge delivery package.

Timeouts, tool errors, invalid retained artifacts, and missing scores are failure-as-data: the scheduled attempt remains in the blinded packet set and normalizes to zero under the locked rubric. They do not erase a run or create an analysis-wide `BLOCKED` result. `BLOCKED` is reserved for protocol-integrity, provenance, or containment failures.

## Blinded scoring and analysis

Once every scheduled record completed, generate the closed, versioned judge-delivery packets:

```bash
npm run eval:create-judge-packets -- --run-id <run-id> --evidence-dir /secure/external/wcbs-evidence
```

Judges receive only `judge-packets/` plus its signed delivery manifest. The delivery projection omits arm names, loader/installation outcomes, command vectors, project-diff shape/counts, raw failure categories, paths, and raw diagnostics. Keep `custody/blind-map.json`, raw workspace evidence, and source/profile evidence unavailable to both judges and the adjudicator. Before delivery publication, the pinned producer signs a domain-separated producer freeze over the once-sealed raw run manifest, every retained raw-artifact hash, packet projection hashes, delivery-manifest hash, blind-map hash, and protocol/schedule identity. The raw run manifest is never rewritten after sealing. Every judge, custody, and adjudication envelope binds that producer-freeze hash; analysis recomputes and verifies it before score parsing. The verifier rejects altered packets, extra files, symlinks, malformed fields, and a recomputed cross-arm blind-map swap before score parsing. This filesystem split is an auditable technical delivery control; it does not prove human independence.

Exactly two ledgers are required: each judge ledger is canonical UTF-8 JSON with recursively sorted keys, one final newline, sorted unique packet scores, a self-hash, and a detached Ed25519 signature made by one of the two distinct public keys pinned in the complete protocol. Before adjudication, the jointly signed custody index binds both ledger hashes, the delivery-manifest hash, and the deterministic blind-map hash. The separately keyed adjudication envelope must cite those two hashes. Judge agreement cannot be overwritten; disagreement requires a non-empty reconciliation reason from a role distinct from both judges. Missing/invalid packet scores and contradictory `success: true` / `safety: false` or `correctness: false` composites are retained as locked zero failures rather than discarded. These technical signatures prove post-signature integrity only; they do not prove a signer’s human identity, independence, or chronology.

Analyze the three canonical envelopes with the reasoned adjudication ledger:

```bash
npm run eval:analyze -- \
  --run-id <run-id> \
  --evidence-dir /secure/external/wcbs-evidence \
  --protocol evals/superpowers-comparison-preregistration.json \
  --judge-ledger judge-a.json \
  --judge-ledger judge-b.json \
  --custody-index custody-index.json \
  --adjudications adjudications.json
```

Phase 5 requires exactly `{neutral,wcbs}`, eight distinct locked cases, at least ten repetitions, and at least 160 retained scheduled packets. Phase 6 requires exactly `{neutral,wcbs,superpowers}`, eight distinct locked cases, at least ten repetitions, and at least 240 retained scheduled packets. Final analysis rejects a reduced-but-self-consistent schedule, missing/duplicate packet, or mismatched schedule hash before aggregation.

The analysis uses exactly 10,000 stratified bootstrap resamples. For Phase 6 it reports only `superior`, `non-inferior`, `inferior`, or `inconclusive` under the committed rule. Wide or overlapping intervals are `inconclusive`, never parity or superiority. Technical role separation, ledger hashes, and custody records do not establish personnel independence; that remains external evidence.

## Optional marker evidence

```bash
npm run eval:publish-evidence -- --run-id <run-id> --evidence-dir /secure/external/wcbs-evidence
```

This writes observed transport markers from a complete run. Behavioral evidence does not prove a native runtime activation. Marker evidence is deliberately weaker than a native session test and weaker than behavioral scoring; it cannot move a support label or determine either evaluation phase.
