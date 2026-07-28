# Capability Matrix

<!-- GENERATED FILE - DO NOT EDIT BY HAND. Source of truth: runtime_adapters/manifests/*.json. Regenerate with: npm run generate:matrix -->

This file is generated from the runtime manifests. Editing it by hand creates a second source of truth and will fail `npm run verify`.

## Support And Activation

| Runtime | Support | Activation tier | Integration shape | Bootstrap | Install scope | Modifies user files |
|---|---|---|---|---|---|---|
| Claude and Claude Code (`claude`) | **Full** | **T1** | hybrid | automatic | project | no |
| OpenAI Codex (`codex`) | **Full** | **T2** | in_process_plugin | automatic | project | no |
| Cursor (`cursor`) | **Full** | **T1** | hybrid | automatic | project | no |
| Gemini CLI (`gemini`) | **Partial** | **T2** | always_on_instruction_file | automatic | project | no |
| Generic LLM Agent (`generic-agent`) | **Manual** | **T4** | always_on_instruction_file | manual | project | no |
| GitHub Copilot (`github-copilot`) | **Partial** | **T2** | always_on_instruction_file | automatic | project | no |
| Manus Agent (`manus`) | **Manual** | **T4** | always_on_instruction_file | manual | project | no |
| Replit Agent (`replit`) | **Partial** | **T2** | always_on_instruction_file | automatic | project | no |

A file's existence does not imply Full support or verified activation. See `runtime_adapters/PORTABILITY_CONTRACT.md` and `runtime_adapters/VERIFIED_SUPPORT_LEVELS.md`.

## Essential Capabilities

An adapter with any essential capability unavailable is `Unsupported`.

| Runtime | file_read | file_write | file_edit | execute_command |
|---|---|---|---|---|
| `claude` | native | native | native | native |
| `codex` | native | native | native | native |
| `cursor` | native | native | native | native |
| `gemini` | native | native | native | native |
| `generic-agent` | native | native | native | native |
| `github-copilot` | native | native | native | native |
| `manus` | native | native | native | native |
| `replit` | native | native | native | native |

## Optional Capabilities And Exact Fallbacks

Every `degradable` or `unavailable` cell states its exact fallback. Agents may not invent a tool.

| Runtime | subagents | task_tracking | web_access | browser_verification | durable_artifact_storage | human_approval_gates |
|---|---|---|---|---|---|---|
| `claude` | native | native | native | native | native | native |
| `codex` | native | native | native | native | native | native |
| `cursor` | native | native | native | native | native | native |
| `gemini` | unavailable — Sequential fresh-context review using the exact base..head package; report degraded independence. | degradable — Track task state in .wcbs/runs/<run-id>/progress-ledger.jsonl. | native | unavailable — Use command-line verification and record rendered-UI evidence as Not Run. | native | native |
| `generic-agent` | unavailable — Sequential fresh-context review using the exact base..head package; report degraded independence. | unavailable — Track task state in .wcbs/runs/<run-id>/progress-ledger.jsonl. | degradable — Require supplied source material and record Unknown rather than guessing. | unavailable — Use command-line evidence and record rendered-UI verification as Not Run. | degradable — Write project-local .wcbs artifacts. | degradable — Halt and require an explicit human reply. |
| `github-copilot` | unavailable — Sequential self-review in a fresh context window using the exact base..head review package; report degraded independence. | degradable — Track task state in .wcbs/runs/<run-id>/progress-ledger.jsonl. | native | unavailable — Use command-line verification and record rendered-UI evidence as Not Run. | native | native |
| `manus` | unavailable — Sequential fresh-context review using the exact base..head package; report degraded independence. | degradable — Track task state in .wcbs/runs/<run-id>/progress-ledger.jsonl. | native | degradable — Capture screenshot or page text evidence and record automated assertions as Not Run. | native | degradable — Halt, print the exact pending action, and require an explicit human reply. |
| `replit` | unavailable — Sequential fresh-context review using the exact base..head package; report degraded independence. | native | native | degradable — Use Replit preview evidence and record automated browser assertions as Not Run. | native | native |

## Known Limitations

- **Claude and Claude Code**: Surfaces without plugin hooks degrade to CLAUDE.md T2 or manual activation and must record that lower tier.
- **OpenAI Codex**: Plugin skill discovery requires the Codex plugin runtime to be enabled for the workspace. The root hook is deliberately disabled for Codex.
- **Cursor**: If native hook registration is unavailable, activation degrades to the always-on rule and is recorded as T2.
- **Gemini CLI**: No independent subagents and no native browser verification; activation is instructed rather than enforced.
- **Generic LLM Agent**: No native activation mechanism exists, so this is Manual by definition. If command execution is unavailable, the runtime is Unsupported.
- **GitHub Copilot**: No independent subagents and no native browser verification; activation is instructed rather than enforced.
- **Manus Agent**: Automatic session-start ingestion is not established. Activation is Manual and must never be reported as enforced.
- **Replit Agent**: Linux-only container. No independent subagents. Activation is instructed and must be measured in a clean session.
