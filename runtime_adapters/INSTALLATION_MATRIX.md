# Installation Matrix

<!-- GENERATED FILE - DO NOT EDIT BY HAND. Source of truth: runtime_adapters/adapter-registry.yaml. -->

| Runtime | Native install route | Project fallback | Verified state |
|---|---|---|---|
| Claude and Claude Code | Install .claude-plugin/plugin.json; the SessionStart hook injects BOOTSTRAP.md. CLAUDE.md remains the T2 fallback. | native instruction file | Not Run |
| OpenAI Codex | Install the plugin from .codex-plugin/plugin.json; the skills/ directory is registered automatically. | native instruction file | Not Run |
| Cursor | Commit .cursor/rules/super-build-kit.mdc, .cursor/hooks.json, and hooks/. The project SessionStart hook invokes the WCBS transport. | native instruction file | Not Run |
| Gemini CLI | Commit GEMINI.md at the repository root. Gemini CLI loads it as hierarchical context. | native instruction file | Not Run |
| Generic LLM Agent | Provide BOOTSTRAP.md at the start of every session. | operator-supplied bootstrap | Not Run |
| GitHub Copilot | Commit .github/copilot-instructions.md, .github/hooks/wcbs-session-start.json, and hooks/. The repository SessionStart hook invokes the WCBS transport. | native instruction file | Not Run |
| Kimi Code | Install the package artifact at .kimi-plugin/plugin.json through the runtime's native plugin route. | none | Not Run |
| Manus Agent | Commit Manus.md and manually provide BOOTSTRAP.md or reference it at session start. | operator-supplied bootstrap | Not Run |
| OpenCode | Install the package artifact at .opencode/plugins/wcbs.js through the runtime's native plugin route. | none | Not Run |
| Pi | Install the package artifact at .pi/extensions/wcbs.ts through the runtime's native plugin route. | none | Not Run |
| Replit Agent | Commit REPLIT.md at the repository root of the Repl. | native instruction file | Not Run |
