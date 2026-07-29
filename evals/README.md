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

Both commands validate locked case/control-project/candidate provenance and report `BLOCKED` truthfully when an immutable model identity, vendor-documented loader, or fixed Superpowers source is absent. They do not make vendor calls, create a run directory, spend funds, score cases, or claim success.

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

Do not alter the candidate identity, control manifest, prompts, run count, scoring rubric, failure policy, randomization method, or pass rule once measurement begins.

## Paid execution

After strict preflight passes, supply a fresh safe seed and a new run ID:

```bash
npm run eval -- --execute --run-id gate-0c-YYYYMMDD --seed <safe-seed>
npm run eval:superpowers -- --execute --run-id comparison-YYYYMMDD --seed <safe-seed> --superpowers-source /read-only/path/to/superpowers
```

The runner archives the fixed WCBS candidate with Git and stages it through V2 `scripts/wcbs.mjs`; it never uses the V1 adapter installer. The three-arm protocol verifies the supplied Superpowers checkout, then archives the exact preregistered commit rather than mutable `HEAD`. Every scheduled record creates one protected runtime profile shared by its loader setup and agent invocation, and retains a redacted transcript, workspace manifest, and workspace diff.

Timeouts, tool errors, invalid retained artifacts, and missing scores are failure-as-data: the scheduled attempt remains in the blinded packet set and normalizes to zero under the locked rubric. They do not erase a run or create an analysis-wide `BLOCKED` result. `BLOCKED` is reserved for protocol-integrity, provenance, or containment failures.

## Blinded scoring and analysis

Once every scheduled record completed, generate packets without arm labels:

```bash
npm run eval:create-judge-packets -- --run-id <run-id>
```

Keep `blind-map.json` unavailable to both judges and the adjudicator. Each of exactly two ledgers must identify one distinct judge; the adjudicator must be a third person. Missing/invalid packet scores are retained as locked zeroes rather than discarded, then analyzed with the reasoned adjudication ledger:

```bash
npm run eval:analyze -- \
  --run-id <run-id> \
  --protocol evals/superpowers-comparison-preregistration.json \
  --judge-ledger evals/runs/<run-id>/judge-a.json \
  --judge-ledger evals/runs/<run-id>/judge-b.json \
  --adjudications evals/runs/<run-id>/adjudications.json
```

The analysis uses exactly 10,000 stratified bootstrap resamples. For Phase 6 it reports only `superior`, `non-inferior`, `inferior`, or `inconclusive` under the committed rule. Wide or overlapping intervals are `inconclusive`, never parity or superiority.

## Optional marker evidence

```bash
npm run eval:publish-evidence -- --run-id <run-id>
```

This writes observed transport markers from a complete run. Behavioral evidence does not prove a native runtime activation. Marker evidence is deliberately weaker than a native session test and weaker than behavioral scoring; it cannot move a support label or determine either evaluation phase.
