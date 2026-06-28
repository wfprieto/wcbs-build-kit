# Gemini Runtime Adapter

Gemini must use the Super Build Kit through the same portable activation spine as every other agent.

## Required Startup

Load in order:

1. `00_start_here/START_HERE.md`
2. `00_start_here/SOURCE_OF_TRUTH.md`
3. `00_start_here/LOAD_ORDER.md`
4. `50_audits/AUDIT_TIER_ROUTER.md`
5. `skills/super-build-kit/SKILL.md`

## Execution Rule

Classify the APIVR tier before implementation or release claims. Use the applicable Elite Build Goals and release gates as mandatory guardrails.

For implementation, use `skills/writing-plans/SKILL.md` and `skills/test-driven-development/SKILL.md`. For parallel or delegated work, use `skills/dispatching-parallel-agents/SKILL.md` and `skills/subagent-driven-development/SKILL.md`.

For recurring audits, iterative remediation, monitors, quality sweeps, bounded retries, or repeat-until-stable workflows, use `skills/repeatable-agent-loops/SKILL.md`.

For long-running, multi-stage, tool-heavy, artifact-heavy, Comprehensive, Forensic, or handoff-sensitive work, use `skills/long-horizon-agent-runtime/SKILL.md` and `skills/agent-observability-and-run-tracing/SKILL.md`.

For install, bootstrap, config, first-run, dependency, or setup work, use `skills/project-bootstrap-and-setup/SKILL.md`. For MCP servers, plugin tools, connectors, tool auth, permission scope, overlap, or tool evidence, use `skills/mcp-tool-governance/SKILL.md`.

For cybersecurity, app security, AI security, incidents, supply chain, vulnerability, scanning, red-team, phishing, credential, malware, prompt injection, MCP probing, or other dual-use work, use `skills/cybersecurity-risk-routing/SKILL.md`. Use `skills/ai-application-security/SKILL.md`, `skills/security-incident-response/SKILL.md`, or `skills/supply-chain-and-build-provenance/SKILL.md` when those domains apply.

For frontend UI, UX, copy, reports, prompts, or strategic communication, use `skills/ui-ux-design-quality/SKILL.md`, `skills/anti-ai-writing-quality/SKILL.md`, and `skills/strategist-writing-dna/SKILL.md` as applicable.

Do not treat this adapter as a separate source of truth.
