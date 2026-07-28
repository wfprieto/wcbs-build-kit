# Verified Runtime Support Levels

<!-- GENERATED FILE - DO NOT EDIT BY HAND. Source of truth: runtime_adapters/adapter-registry.yaml. -->

A designed capability or package test is not runtime proof. This table reports only recorded evidence.

## Evidence Levels

- **Documented** — a route is described, but no structural check has run.
- **Structurally Verified** — manifests, generated artifacts, and package contracts pass deterministic validation.
- **Installed In Isolated Fixture** — an installer completed in a throwaway destination with ownership evidence.
- **Behaviorally Verified** — documented behavior fixtures passed; this is not proof that a runtime injected the instructions.
- **Runtime Verified** — a clean, authenticated session in the named runtime loaded the package and produced the expected activation evidence.

Do not report a runtime as `Runtime Verified` without the raw clean-session transcript, runtime version, package revision, and independent replay instructions.

| Runtime | Designed support | Verified state | Public label | Evidence |
|---|---|---|---|---|
| `claude` (Claude and Claude Code) | Full | Not Run | Designed | Manifest and tool-mapping contract only. No V2 clean-session evidence is recorded. |
| `codex` (OpenAI Codex) | Full | Not Run | Designed | Manifest and tool-mapping contract only. No V2 clean-session evidence is recorded. |
| `cursor` (Cursor) | Full | Not Run | Designed | Manifest and tool-mapping contract only. No V2 clean-session evidence is recorded. |
| `gemini` (Gemini CLI) | Partial | Not Run | Designed | Manifest and tool-mapping contract only. No V2 clean-session evidence is recorded. |
| `generic-agent` (Generic LLM Agent) | Manual | Not Run | Designed | Manifest and tool-mapping contract only. No V2 clean-session evidence is recorded. |
| `github-copilot` (GitHub Copilot) | Partial | Not Run | Designed | Manifest and tool-mapping contract only. No V2 clean-session evidence is recorded. |
| `kimi` (Kimi Code) | Partial | Not Run | Experimental | No clean-session runtime evidence is recorded. |
| `manus` (Manus Agent) | Manual | Not Run | Designed | Manifest and tool-mapping contract only. No V2 clean-session evidence is recorded. |
| `opencode` (OpenCode) | Partial | Not Run | Experimental | No clean-session runtime evidence is recorded. |
| `pi` (Pi) | Partial | Not Run | Experimental | No clean-session runtime evidence is recorded. |
| `replit` (Replit Agent) | Partial | Not Run | Designed | Manifest and tool-mapping contract only. No V2 clean-session evidence is recorded. |
