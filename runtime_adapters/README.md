# Runtime Adapters

These files activate the same Super Build Kit spine in common agent runtimes.

## Files

- `AGENTS.md` - generic agent and Codex-style repository instructions.
- `CLAUDE.md` - Claude project/runtime adapter.
- `GEMINI.md` - Gemini runtime adapter.
- `REPLIT.md` - Replit Agent runtime adapter.
- `Manus.md` - Manus Agent runtime adapter.
- `.codex-plugin/plugin.json` - Codex plugin metadata.
- `skills/super-build-kit/SKILL.md` - Codex-compatible skill entrypoint.
- `.cursor/rules/super-build-kit.mdc` - Cursor always-on project rule.
- `.github/copilot-instructions.md` - GitHub Copilot repository instructions.
- `runtime_adapters/REPLIT_AGENT.md` - detailed Replit Agent audit and implementation adapter.
- `runtime_adapters/NATIVE_GIT_WORKTREES.md` - native-first worktree integration and manual fallback rules.
- `skills/writing-plans/SKILL.md` - zero-placeholder APIVR planning and handoff workflow.
- `skills/test-driven-development/SKILL.md` - test-first APIVR Phase 3 implementation workflow.
- `skills/dispatching-parallel-agents/SKILL.md` - parallel dispatch decision protocol.
- `skills/subagent-driven-development/SKILL.md` - subagent implementation and two-stage review workflow.
- `skills/repeatable-agent-loops/SKILL.md` - recurring audits, iterative remediation, monitors, quality sweeps, receipts, and stop conditions.
- `skills/ui-ux-design-quality/SKILL.md` - frontend UI, UX, visual direction, accessibility, interface copy, and rendered verification.
- `skills/anti-ai-writing-quality/SKILL.md` - human, direct, non-generic writing quality.
- `skills/strategist-writing-dna/SKILL.md` - verdict-first strategic communication and anti-drift writing.
- `skills/deployment-and-hosting-guidance/SKILL.md` - deployment, hosting, runtime, cost, and environment routing.
- `skills/scheduling-and-automation-routing/SKILL.md` - cron, webhooks, events, queues, workers, monitors, and always-on routing.
- `skills/data-output-and-reporting/SKILL.md` - dashboards, exports, recurring reports, analytics outputs, and evidence artifacts.
- `skills/external-api-integration/SKILL.md` - third-party APIs, SDKs, OAuth, API keys, webhooks, and provider limits.
- `skills/media-and-asset-pipeline/SKILL.md` - generated/retrieved assets, media delivery, rights, optimization, and fallback behavior.

## Rule

Adapters are not sources of truth. They only point agents back to:

1. `00_start_here/START_HERE.md`
2. `00_start_here/SOURCE_OF_TRUTH.md`
3. `00_start_here/LOAD_ORDER.md`
4. `50_audits/AUDIT_TIER_ROUTER.md`
