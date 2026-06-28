# Agent Workspace And Artifact Boundaries

Use this module when an agent handles uploads, generated files, scratch work, evidence, reports, exports, media, traces, or final deliverables.

## Boundary Model

| Area | Purpose | Rules |
|---|---|---|
| User input | Original files, prompts, uploads, source material | Preserve; do not overwrite. |
| Workspace | Repo or project files being audited or changed | Modify only within scope. |
| Scratch | Temporary notes, logs, generated intermediates | Keep out of final deliverables unless cited. |
| Evidence | Test output, screenshots, traces, receipts, logs | Preserve enough to support claims. |
| Final output | Deliverables, reports, patches, docs | Clean, intentional, and referenced in final report. |

## Rules

- Never overwrite original user-provided files without explicit request.
- Do not mix scratch files with final deliverables.
- Name evidence files clearly enough that a future agent can inspect them.
- Record generated artifacts in the completion report.
- Delete or ignore temporary sensitive scratch only when evidence no longer depends on it.
- Treat binary/media artifacts through `skills/media-and-asset-pipeline/SKILL.md`.
- Treat reports/exports through `skills/data-output-and-reporting/SKILL.md`.

## Audit Checks

- Are original inputs preserved?
- Are generated outputs distinguishable from source files?
- Is evidence findable and linked from the final report?
- Are secrets or private data absent from artifacts?
- Is there a cleanup or retention decision?
