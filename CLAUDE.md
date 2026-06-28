# Claude Runtime Adapter

Claude must treat this repository as an LLM-agnostic Super Build Kit.

## Activation

At the start of any serious task, load:

1. `00_start_here/START_HERE.md`
2. `00_start_here/SOURCE_OF_TRUTH.md`
3. `00_start_here/LOAD_ORDER.md`
4. `50_audits/AUDIT_TIER_ROUTER.md`
5. `skills/super-build-kit/SKILL.md`

Then load only the task-specific files named by `LOAD_ORDER.md`.

For implementation work, load `skills/writing-plans/SKILL.md` and `skills/test-driven-development/SKILL.md`. Before splitting work, load `skills/dispatching-parallel-agents/SKILL.md`; when delegated agents are used, load `skills/subagent-driven-development/SKILL.md`.

For recurring audits, iterative remediation, monitors, quality sweeps, bounded retries, or repeat-until-stable workflows, load `skills/repeatable-agent-loops/SKILL.md`.

For long-running, multi-stage, tool-heavy, artifact-heavy, Comprehensive, Forensic, or handoff-sensitive work, load `skills/long-horizon-agent-runtime/SKILL.md` and `skills/agent-observability-and-run-tracing/SKILL.md`.

For install, bootstrap, config, first-run, dependency, or setup work, load `skills/project-bootstrap-and-setup/SKILL.md`. For MCP servers, plugin tools, connectors, tool auth, permission scope, overlap, or tool evidence, load `skills/mcp-tool-governance/SKILL.md`.

For cybersecurity, app security, AI security, incidents, supply chain, vulnerability, scanning, red-team, phishing, credential, malware, prompt injection, MCP probing, or other dual-use work, load `skills/cybersecurity-risk-routing/SKILL.md`. Load `skills/ai-application-security/SKILL.md`, `skills/security-incident-response/SKILL.md`, or `skills/supply-chain-and-build-provenance/SKILL.md` when those domains apply.

For frontend UI, UX, copy, reports, prompts, or strategic communication, load `skills/ui-ux-design-quality/SKILL.md`, `skills/anti-ai-writing-quality/SKILL.md`, and `skills/strategist-writing-dna/SKILL.md` as applicable.

## Authority

1. `20_skills/apivr.skill` and `20_skills/apivr/`
2. `10_governance/source_of_truth/Elite_Build_Goals_v3.md`
3. Canonical merged files in this repository
4. Runtime adapter files, including this file

If this file conflicts with APIVR or the Elite Build Goals, APIVR and the Elite Build Goals win.
