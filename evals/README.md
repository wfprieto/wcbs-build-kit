# Gate 0C Evaluation Runbook

This directory contains the locked experiment design for measuring whether the installed WCBS instructions change agent behavior. It is not proof that a runtime activated, and it must never be used to invent a score.

## Safe Preflight

Run this before any paid evaluation:

```bash
npm run eval
```

It validates the case registry, control-project hashes, locked run count, treatment runtime, and preregistration structure. A clean preflight may still report execution as `Blocked` when the exact agent version and immutable model ID have not yet been recorded.

Use the stricter readiness gate only after those identifiers are committed:

```bash
npm run eval:strict
```

## Paid Execution

Paid execution is deliberately unavailable until `evals/gate-0c-preregistration.json` records the exact agent version and a full immutable model ID in a commit made before the first run. Do not alter the case prompts, treatment runtime, or `runs_per_case_per_arm` after measurement starts.

Once preregistration is complete, run the named agent executable with an isolated evaluation credential:

```bash
npm run eval -- --execute --agent-command <agent-executable> --credential-name WCBS_EVAL_CREDENTIAL
```

The command creates one ignored local directory under `evals/runs/`. Its timeout is bounded to one hour per invocation. It stops with `Blocked` if a run is incomplete, staging fails, a process exits nonzero, or a credential is unavailable. Do not commit transcripts or credentials.

## Evidence Publication And Scoring

After every planned invocation completes, publish only observed marker output:

```bash
npm run eval:publish-evidence -- --run-id <run-id>
```

This writes `activation-evidence.json` only when the run manifest exactly matches the locked design. Marker output is one observable signal, not a runtime-support verdict or a Gate 0C result. Human scoring of every case-level activation criterion is still required before any Gate 0C claim.
