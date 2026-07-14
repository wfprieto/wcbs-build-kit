# Installation Matrix

This matrix defines how the Super Build Kit is activated in each runtime.

| Runtime | Active File | Install Mode | Verification |
|---|---|---|---|
| Codex / OpenAI agents | `AGENTS.md` | Repository instructions | Agent names startup files and APIVR tier |
| Claude / Claude Code | `CLAUDE.md` | Project instruction file | Agent follows startup sequence |
| Cursor | `.cursor/rules/super-build-kit.mdc` | Always-apply rule | Cursor context includes startup files |
| GitHub Copilot | `.github/copilot-instructions.md` | Repository instruction file | Copilot follows APIVR final report format |
| Gemini | `GEMINI.md` | Context file | Gemini names load order and evidence states |
| Replit Agent | `REPLIT.md` and `runtime_adapters/REPLIT_AGENT.md` | Runtime adapter | Replit reports APIVR tier before edits |
| Manus | `Manus.md` | Runtime adapter | Manus reports source-of-truth order |
| Generic LLM | `00_start_here/START_HERE.md` | Manual load | Agent follows minimum output standard |

No runtime adapter may weaken APIVR, Elite Build Goals, evidence states, release gates, or stop conditions.
