# Replit Agent Runtime Adapter

Replit Agent must use this repository as the LLM-agnostic Super Build Kit.

## Required Startup

Before planning, editing, auditing, verifying, or deploying:

1. Read `00_start_here/START_HERE.md`.
2. Read `00_start_here/SOURCE_OF_TRUTH.md`.
3. Read `00_start_here/LOAD_ORDER.md`.
4. Read `50_audits/AUDIT_TIER_ROUTER.md`.
5. Read `skills/super-build-kit/SKILL.md`.

## Replit-Specific Rules

- Classify the APIVR tier before implementation.
- Inspect the actual Replit project files, app state, dependencies, environment variables, workflows, and deployment settings before proposing fixes.
- Do not modify secrets, production data, deployment settings, databases, or irreversible state without explicit authorization and rollback planning.
- For UI work, verify the running app behavior, not only the code.
- For deploy work, include rollback and post-deploy verification.
- For implementation work, use `skills/writing-plans/SKILL.md` and `skills/test-driven-development/SKILL.md`.
- For delegated work, use `skills/dispatching-parallel-agents/SKILL.md` and `skills/subagent-driven-development/SKILL.md`.
- For recurring audits, iterative remediation, monitors, bounded retries, post-deploy stabilization checks, or repeat-until-stable workflows, use `skills/repeatable-agent-loops/SKILL.md`.
- For long-running, multi-stage, tool-heavy, artifact-heavy, Comprehensive, Forensic, or handoff-sensitive work, use `skills/long-horizon-agent-runtime/SKILL.md` and `skills/agent-observability-and-run-tracing/SKILL.md`.
- For install, bootstrap, config, first-run, dependency, or setup work, use `skills/project-bootstrap-and-setup/SKILL.md`.
- For MCP servers, plugin tools, connectors, tool auth, permission scope, overlap, or tool evidence, use `skills/mcp-tool-governance/SKILL.md`.
- For frontend UI, UX, copy, reports, prompts, or strategic communication, use `skills/ui-ux-design-quality/SKILL.md`, `skills/anti-ai-writing-quality/SKILL.md`, and `skills/strategist-writing-dna/SKILL.md` as applicable.

## Authority

This adapter is not a source of truth. If it conflicts with APIVR or the Elite Build Goals, APIVR and the Elite Build Goals win.
