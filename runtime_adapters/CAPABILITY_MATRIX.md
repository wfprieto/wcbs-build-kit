# Capability Matrix

<!-- GENERATED FILE - DO NOT EDIT BY HAND. Source of truth: runtime_adapters/manifests/*.json. Regenerate with: npm run generate:matrix -->

This file is generated from the runtime manifests. Editing it by hand creates a second source of truth and will fail `npm run verify`.

## Support Levels

| Runtime | Support | Integration shape | Bootstrap | Install scope | Modifies user files |
|---|---|---|---|---|---|
| Claude and Claude Code (`claude`) | **Full** | always_on_instruction_file | automatic | project | no |
| OpenAI Codex (`codex`) | **Full** | in_process_plugin | automatic | project | no |
| Cursor (`cursor`) | **Full** | always_on_instruction_file | automatic | project | no |
| Gemini CLI (`gemini`) | **Partial** | always_on_instruction_file | automatic | project | no |
| Generic LLM Agent (`generic-agent`) | **Manual** | always_on_instruction_file | manual | project | no |
| GitHub Copilot (`github-copilot`) | **Partial** | always_on_instruction_file | automatic | project | no |
| Manus Agent (`manus`) | **Manual** | always_on_instruction_file | manual | project | no |
| Replit Agent (`replit`) | **Partial** | always_on_instruction_file | automatic | project | no |

A file's existence does not imply Full or Partial support. See `runtime_adapters/PORTABILITY_CONTRACT.md`.

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
| `gemini` | unavailable — Sequential self-review in a fresh context window: re-read the task brief and the exact base..head diff package with no implementation context carried over. This is a degraded substitute and MUST NOT be reported as equivalent to an independent reviewer. | degradable — Track task state in .wcbs/runs/<run-id>/progress-ledger.jsonl instead of a native task list. | native | unavailable — Substitute command-line verification (curl, HTTP status, scripted DOM snapshot) and record rendered-UI evidence as Not Run. | native | native |
| `generic-agent` | unavailable — Sequential self-review in a fresh context window: re-read the task brief and the exact base..head diff package with no implementation context carried over. This is a degraded substitute and MUST NOT be reported as equivalent to an independent reviewer. | unavailable — Track task state in .wcbs/runs/<run-id>/progress-ledger.jsonl instead of a native task list. | degradable — Require the human to supply source material; record the evidence state as Unknown rather than guessing. | unavailable — Substitute command-line verification (curl, HTTP status, scripted DOM snapshot) and record rendered-UI evidence as Not Run. | degradable — Write durable artifacts to the project-local .wcbs/runs/<run-id>/ tree on the filesystem. | degradable — Halt, print the exact pending action, and require an explicit human reply before proceeding. |
| `github-copilot` | unavailable — Sequential self-review in a fresh context window: re-read the task brief and the exact base..head diff package with no implementation context carried over. This is a degraded substitute and MUST NOT be reported as equivalent to an independent reviewer. | degradable — Track task state in .wcbs/runs/<run-id>/progress-ledger.jsonl instead of a native task list. | native | unavailable — Substitute command-line verification (curl, HTTP status, scripted DOM snapshot) and record rendered-UI evidence as Not Run. | native | native |
| `manus` | unavailable — Sequential self-review in a fresh context window: re-read the task brief and the exact base..head diff package with no implementation context carried over. This is a degraded substitute and MUST NOT be reported as equivalent to an independent reviewer. | degradable — Track task state in .wcbs/runs/<run-id>/progress-ledger.jsonl instead of a native task list. | native | degradable — Capture a screenshot or page text through the agent's browsing capability and attach it as evidence; automated assertions are unavailable. | native | degradable — Halt, print the exact pending action, and require an explicit human reply before proceeding. |
| `replit` | unavailable — Sequential self-review in a fresh context window: re-read the task brief and the exact base..head diff package with no implementation context carried over. This is a degraded substitute and MUST NOT be reported as equivalent to an independent reviewer. | native | native | degradable — Use the Replit webview/preview and record a screenshot or HTTP status as evidence; automated browser assertions are unavailable. | native | native |

## Known Limitations

- **Claude and Claude Code**: Automatic load is established in Claude Code. Surfaces that do not read project memory fall back to Manual activation for that session.
- **OpenAI Codex**: Plugin skill discovery requires the Codex plugin runtime to be enabled for the workspace.
- **Cursor**: Rule content competes for context with other always-on rules in very large workspaces.
- **Gemini CLI**: No independent subagents; reviews degrade to fresh-context sequential passes. No native browser verification.
- **Generic LLM Agent**: No native mechanism places the kit in context automatically, so this is Manual by definition. If command execution is unavailable, the runtime is Unsupported.
- **GitHub Copilot**: No independent subagents: task and final review run as fresh-context sequential passes and MUST be reported as degraded independence. No native browser verification.
- **Manus Agent**: Automatic session-start ingestion of Manus.md is NOT established. The operator must attach or reference the file each session, so this adapter is Manual by definition, not Full. Upgrade only after a clean-session activation scenario passes.
- **Replit Agent**: Linux-only container. No independent subagents. Automatic load depends on the Agent reading repository instructions; verify the activation marker in a clean session before relying on it.
