# GitHub Copilot Instructions

Use this repository as the LLM-agnostic Super Build Kit.

## Required Startup

Read:

1. `00_start_here/START_HERE.md`
2. `00_start_here/SOURCE_OF_TRUTH.md`
3. `00_start_here/LOAD_ORDER.md`
4. `50_audits/AUDIT_TIER_ROUTER.md`
5. `skills/super-build-kit/SKILL.md`

## Required Behavior

- Classify the APIVR tier before implementation.
- Apply applicable Elite Build Goals.
- Preserve source-of-truth hierarchy.
- Use `skills/writing-plans/SKILL.md` for plans and `skills/test-driven-development/SKILL.md` for code implementation.
- Use `skills/dispatching-parallel-agents/SKILL.md` and `skills/subagent-driven-development/SKILL.md` for parallel/delegated work.
- Use `skills/repeatable-agent-loops/SKILL.md` for recurring audits, iterative remediation, monitors, quality sweeps, bounded retries, and repeat-until-stable workflows.
- Use `skills/long-horizon-agent-runtime/SKILL.md` and `skills/agent-observability-and-run-tracing/SKILL.md` for long-running, multi-stage, tool-heavy, artifact-heavy, Comprehensive, Forensic, or handoff-sensitive work.
- Use `skills/project-bootstrap-and-setup/SKILL.md` for install, bootstrap, config, first-run, dependency, or setup work.
- Use `skills/mcp-tool-governance/SKILL.md` for MCP servers, plugin tools, connectors, tool auth, permission scope, overlap, and tool evidence.
- Use `skills/cybersecurity-risk-routing/SKILL.md` for cybersecurity, app security, AI security, incidents, supply chain, vulnerability, scanning, red-team, phishing, credential, malware, prompt injection, MCP probing, or other dual-use work.
- Use `skills/ai-application-security/SKILL.md` for LLM apps, RAG, vector stores, prompts, model routing, AI tools, and AI data leakage.
- Use `skills/security-incident-response/SKILL.md` for alerts, suspected compromise, malware, ransomware, data leakage, unauthorized access, containment, recovery, and forensic security work.
- Use `skills/supply-chain-and-build-provenance/SKILL.md` for dependencies, CI/CD, SBOMs, containers, IaC, artifact signing, and provenance.
- Use `skills/ui-ux-design-quality/SKILL.md`, `skills/anti-ai-writing-quality/SKILL.md`, and `skills/strategist-writing-dna/SKILL.md` for frontend UI, copy, reports, prompts, and strategic communication.
- Do not invent tests, results, files, APIs, screenshots, or behavior.
- Report evidence state and final APIVR verdict.
