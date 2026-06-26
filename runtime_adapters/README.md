# Runtime Adapters

These files activate the same Super Build Kit spine in common agent runtimes.

## Files

- `AGENTS.md` - generic agent and Codex-style repository instructions.
- `CLAUDE.md` - Claude project/runtime adapter.
- `GEMINI.md` - Gemini runtime adapter.
- `REPLIT.md` - Replit Agent runtime adapter.
- `.codex-plugin/plugin.json` - Codex plugin metadata.
- `skills/super-build-kit/SKILL.md` - Codex-compatible skill entrypoint.
- `.cursor/rules/super-build-kit.mdc` - Cursor always-on project rule.
- `.github/copilot-instructions.md` - GitHub Copilot repository instructions.
- `runtime_adapters/REPLIT_AGENT.md` - detailed Replit Agent audit and implementation adapter.

## Rule

Adapters are not sources of truth. They only point agents back to:

1. `00_start_here/START_HERE.md`
2. `00_start_here/SOURCE_OF_TRUTH.md`
3. `00_start_here/LOAD_ORDER.md`
4. `50_audits/AUDIT_TIER_ROUTER.md`
