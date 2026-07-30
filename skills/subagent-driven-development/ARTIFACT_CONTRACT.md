# Controller Artifact Contract

Canonical contract owner: `skills/subagent-driven-development/SKILL.md`.

This file defines the durable artifacts the controller protocol produces. It **extends** `40_knowledge/AGENT_WORKSPACE_AND_ARTIFACT_BOUNDARIES.md` and must not contradict it.

## Why Durable Artifacts

Two failures the controller protocol exists to prevent:

1. **Context loss.** A long run summarizes, compacts, or crashes, and the evidence goes with it.
2. **Unfalsifiable claims.** "The tests passed" with no recorded command is not evidence.

Artifacts on disk solve both. They also make the run recoverable by a different agent, in a different session, on a different day.

## Run Layout

```text
.wcbs/runs/<run-id>/
  run-manifest.json
  original-plan.md
  global-constraints.md
  preflight-conflict-report.md
  progress-ledger.jsonl
  tasks/
    <task-id>/
      task-brief.md
      task-artifact.json
      task-base-head.json
      implementer-report.md
      diff.patch
      changed-files.json
      review-package.md
      review-report.md
      fixes/
        <finding-id>-round-<n>/
          fix-report.md
          test-evidence.txt
          rereview-report.md
  final-review/
    cumulative-diff.patch
    final-review-package.md
    final-review-report.md
  completion-report.md
```

## Binding Rules

- The default directory is **project-local** and should be gitignored, unless the project explicitly retains evidence in version control.
- **Original user input is preserved and never overwritten.**
- **Each task brief is immutable after dispatch.** A correction creates a new revision with a reason and a timestamp. Silently editing a dispatched brief destroys the audit trail.
- `task-brief.md` is the human-readable brief. Its paired `task-artifact.json` is the machine-readable record validated against `skills/subagent-driven-development/schemas/task-artifact.schema.json`. Neither replaces the other.
- Every artifact records `run_id`, `task_id`, creation time, source commit or diff range, and producer role.
- **Large plans, diffs, logs, and reports remain on disk.** Controller messages carry paths and concise status only. This is the context-cost control: pasting a diff into the controller prompt is how long runs degrade.
- **Secrets, tokens, credentials, API keys, and private data must never be written into artifacts.** Redact before writing. An artifact is a durable record, so a leaked secret in one is a durable leak.
- The completion report indexes all retained evidence.

## Artifacts Must Satisfy Their Own Schemas

Every task artifact validates against `skills/subagent-driven-development/schemas/task-artifact.schema.json`, every packaged finding validates against `skills/subagent-driven-development/schemas/review-finding.schema.json`, and every progress-ledger entry validates against `skills/subagent-driven-development/schemas/progress-ledger.schema.json` **before** the bundle is written.

This rule exists because it was broken. A finding ledger once shipped hash-valid but schema-invalid: non-canonical `opened_by` roles and an undeclared `note` property. The kit published a schema and then produced evidence that violated it, which is the same failure as publishing a contract and not enforcing it.

`npm run doctor` validates the committed hermetic fixture and every applicable bundle under `.wcbs/runs/`. Durable evidence must satisfy the contract it is evidence for.

## Evidence Rule

An artifact that records a test run must contain the **exact command, the exit status, and the result**. A narrative summary of a test run is not evidence of a test run.

## Retention

Retain run artifacts until the final whole-branch review passes and the completion report is written. After that, retention is a project decision. Record the decision; do not let it be implicit.
