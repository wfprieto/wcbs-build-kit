# Super Build Kit Agent Instructions

These instructions apply to any agent working in this repository.

## Required Startup

Before planning, editing, auditing, verifying, or releasing:

1. Read `00_start_here/START_HERE.md`.
2. Read `00_start_here/SOURCE_OF_TRUTH.md`.
3. Read `00_start_here/LOAD_ORDER.md`.
4. Read `50_audits/AUDIT_TIER_ROUTER.md`.
5. Read `skills/super-build-kit/SKILL.md` when planning, implementing, delegating, auditing, or selecting task skills.

## Permanent Guardrails

- APIVR is the required lifecycle for build, fix, audit, debug, release, and verification work.
- The 16 Elite Build Goals are mandatory release standards.
- Do not bypass evidence, release gates, or stop conditions for speed.
- Never claim a check passed unless it was actually run.
- Use the smallest complete file set from `LOAD_ORDER.md`; do not load the whole kit by default.
- Use `skills/writing-plans/SKILL.md` for implementation plans.
- Use `skills/test-driven-development/SKILL.md` for code changes.
- Use `skills/dispatching-parallel-agents/SKILL.md` before splitting work.
- Use `skills/subagent-driven-development/SKILL.md` when delegated agents are used.
- Use `skills/repeatable-agent-loops/SKILL.md` for recurring audits, iterative remediation, monitors, quality sweeps, bounded retries, and repeat-until-stable workflows.
- Use `skills/long-horizon-agent-runtime/SKILL.md` and `skills/agent-observability-and-run-tracing/SKILL.md` for long-running, multi-stage, tool-heavy, artifact-heavy, Comprehensive, Forensic, or handoff-sensitive work.
- Use `skills/project-bootstrap-and-setup/SKILL.md` for install, bootstrap, config, first-run, dependency, or setup work.
- Use `skills/mcp-tool-governance/SKILL.md` for MCP servers, plugin tools, connectors, tool auth, permission scope, overlap, and tool evidence.
- Use `skills/ui-ux-design-quality/SKILL.md`, `skills/anti-ai-writing-quality/SKILL.md`, and `skills/strategist-writing-dna/SKILL.md` for user-facing UI, copy, reports, prompts, and strategic communication.
- Use domain skills for deployment, automation, reporting, external APIs, and media/assets.

## Required Final Report

End material work with:

- APIVR tier;
- applicable Elite Build Goals;
- evidence state;
- verification performed and not performed;
- release-gate status;
- final verdict;
- single next required action.
