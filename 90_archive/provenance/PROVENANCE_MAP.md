# Provenance Map

This kit was created from four source streams.

## Permanent Sources

| Source | Local Status | Notes |
|---|---|---|
| `apivr.skill` | Preserved at `20_skills/apivr.skill`; extracted at `20_skills/apivr/` | Highest authority for lifecycle and proportionality. |
| `Elite_Build_Goals_v3.md` | Preserved at `10_governance/source_of_truth/Elite_Build_Goals_v3.md` | Highest authority for goals, release gates, evidence states, and guardrails. |

## Upstream Repositories

| Source | Local Status | Merged Into |
|---|---|---|
| `wfprieto/wcbs-build-kit` | Inspected by GitHub API; canonical concepts merged; original files not copied wholesale | `00_start_here/`, `10_governance/`, `30_agents/`, `50_audits/`, `60_templates/` |
| `obra/Superpowers` | Inspected by GitHub API; portable workflow concepts merged; original files not copied wholesale | `20_skills/`, `40_knowledge/`, `00_start_here/PORTABLE_ADAPTERS.md` |
| `Forward-Future/loopy` | Inspected by GitHub; loop discipline adapted; original runtime/catalog/publishing system not copied | `skills/repeatable-agent-loops/SKILL.md`, `40_knowledge/REPEATABLE_AGENT_LOOP_PATTERNS.md`, `60_templates/LOOP_DESIGN_TEMPLATE.md`, `60_templates/LOOP_RUN_RECEIPT_TEMPLATE.md` |
| `bytedance/deer-flow` | Inspected by GitHub; long-horizon runtime, artifact boundary, setup, MCP governance, and tracing concepts adapted; runtime/platform not copied | `skills/long-horizon-agent-runtime/SKILL.md`, `skills/project-bootstrap-and-setup/SKILL.md`, `skills/mcp-tool-governance/SKILL.md`, `skills/agent-observability-and-run-tracing/SKILL.md`, `40_knowledge/`, `60_templates/` |
| `mukul975/Anthropic-Cybersecurity-Skills` | Inspected by GitHub; cybersecurity routing, AI security, MCP security, incident response, supply-chain, API security, framework mapping, and dual-use guardrails adapted; offensive content not imported wholesale | `skills/cybersecurity-risk-routing/SKILL.md`, `skills/ai-application-security/SKILL.md`, `skills/security-incident-response/SKILL.md`, `skills/supply-chain-and-build-provenance/SKILL.md`, `40_knowledge/SECURITY_FRAMEWORK_MAPPING.md`, `40_knowledge/CYBERSECURITY_RISK_ROUTING_INDEX.md` |
| `garrytan/gstack` | Inspected by GitHub; product office hours, autoplan review routing, engineering review, review army, QA, ship gates, investigation, and CSO-style finding calibration adapted; runtime/platform-specific mechanics not imported | `skills/product-strategy-office-hours/SKILL.md`, `skills/engineering-plan-review/SKILL.md`, `skills/code-review-and-review-army/SKILL.md`, `skills/qa-and-browser-verification/SKILL.md`, `skills/release-readiness-and-ship-gates/SKILL.md`, `skills/devex-and-documentation-review/SKILL.md`, `skills/diagnosing-bugs-and-feedback-loops/SKILL.md`, `60_templates/QA_HEALTH_REPORT_TEMPLATE.md`, `60_templates/RELEASE_READINESS_DASHBOARD_TEMPLATE.md` |
| `mattpocock/skills` | Inspected by GitHub; requirements grilling, doc-backed alignment, domain modeling, codebase design, bug diagnosis, TDD refinements, PRD/issue slicing, prototype discipline, and handoff discipline adapted; original files not copied wholesale | `skills/requirements-grilling-and-alignment/SKILL.md`, `skills/domain-modeling-and-shared-language/SKILL.md`, `skills/codebase-design-and-deep-modules/SKILL.md`, `skills/diagnosing-bugs-and-feedback-loops/SKILL.md`, `skills/product-requirements-and-issue-slicing/SKILL.md`, `skills/throwaway-prototyping/SKILL.md`, `40_knowledge/DOMAIN_MODELING_AND_ADR_GUIDANCE.md`, `40_knowledge/CODEBASE_DESIGN_DEEP_MODULES.md`, `60_templates/DOMAIN_GLOSSARY_TEMPLATE.md`, `60_templates/ADR_TEMPLATE.md` |

## Temporary Audit Tools

| Source | Local Status | Output |
|---|---|---|
| `nvidia/skillspector` | Used as a static safety-audit lens; not added as a dependency; temporary scanner artifacts removed | `90_archive/provenance/SKILLSPECTOR_STATIC_AUDIT_REPORT.md` |
| `DeusData/codebase-memory-mcp` | Used as a temporary local structural audit aid; not installed into agent configs; not added as a dependency; temporary binary/cache artifacts removed after audit | `90_archive/provenance/CODEBASE_MEMORY_MCP_TEMPORARY_AUDIT_PLAN.md`, `90_archive/provenance/CODEBASE_MEMORY_MCP_TEMPORARY_AUDIT_REPORT.md` |

## Deduplication Decisions

- APIVR lifecycle content is canonical in `10_governance/APIVR_EXECUTION_LIFECYCLE.md`; full skill source remains preserved.
- Elite Build Goals are summarized for fast loading and preserved in full as source of truth.
- WCBS agent files are merged into role-based agent docs instead of 15 separate persona files.
- WCBS audit files are merged into one canonical audit protocol file plus tier router.
- Superpowers planning, review, TDD, subagent, and portability mechanics are merged into systematic workflow and skill-contract docs.
- gstack product/review/QA/release mechanics are merged as APIVR-native workflows instead of runtime-specific commands.
- Matt Pocock skill concepts are merged into APIVR planning, domain modeling, codebase design, debugging, TDD, issue slicing, prototype, and handoff discipline.
- Runtime-specific files are treated as adapter references, not source-of-truth files.
