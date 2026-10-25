# Verified Runtime Support Levels

<!-- GENERATED FILE - DO NOT EDIT BY HAND. Source of truth: runtime_adapters/adapter-registry.yaml. -->

A designed capability or package test is not runtime proof. This table reports recorded authenticated runtime states; static and package passes do not advance them.

## Evidence Levels

- **Documented** — a route is described, but no structural check has run.
- **Structurally Verified** — manifests, generated artifacts, and package contracts pass deterministic validation. Executable component checks prove only the component outcomes they assert.
- **Installed In Isolated Fixture** — an installer completed in a throwaway destination with ownership evidence; this does not establish native runtime registration.
- **Behaviorally Verified** — legacy fixture-conformance label: documented fixture data or routing contracts passed. No agent behavior was observed by those checks.
- **Runtime Verified** — the required authenticated clean-session activation and invocation evidence passed for the named runtime version and exact package revision, with independent review under the runtime evidence procedure.

Do not report a runtime as `Runtime Verified` without the raw clean-session transcript, runtime version, package revision, and independent replay instructions.

The canonical command-to-evidence map is in `runtime_adapters/PORTABILITY_CONTRACT.md` section 6. `Verified` evidence states describe named observations; they are not runtime support labels. Observed workflow results require actual agent traces and do not establish general quality or superiority.

| Runtime | Designed support | Authenticated runtime state | Public label | Evidence |
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
