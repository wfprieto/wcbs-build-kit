# Cybersecurity Risk Routing Index

This index adapts the high-value routing structure from `mukul975/Anthropic-Cybersecurity-Skills` into the Super Build Kit. It is a routing aid, not a bulk import.

## Primary Security Domains

| Domain | Super Build Kit Route |
|---|---|
| AI security, LLM apps, RAG, vector stores, prompt leakage | `skills/ai-application-security/SKILL.md` |
| MCP, plugin, connector, tool-call security | `skills/mcp-tool-governance/SKILL.md` |
| REST, GraphQL, gRPC, OAuth, webhooks | `skills/external-api-integration/SKILL.md` |
| Incident response, alerts, compromise, ransomware, leakage | `skills/security-incident-response/SKILL.md` |
| Dependencies, CI/CD, SBOM, artifact provenance, containers, IaC | `skills/supply-chain-and-build-provenance/SKILL.md` |
| Cloud, IAM, Kubernetes, container runtime, secret exposure | Cybersecurity router plus deployment, API, and supply-chain skills as applicable |
| Vulnerability management and triage | Cybersecurity router plus SSVC mapping in `40_knowledge/SECURITY_FRAMEWORK_MAPPING.md` |
| Threat modeling and security architecture | Cybersecurity router plus canonical audit protocols |

## Authorization-Sensitive Work

Treat these as dual-use and authorization-gated:

- exploitation, payload testing, credential attacks, password cracking;
- phishing, social engineering, impersonation, red-team infrastructure;
- scanning or probing live systems;
- malware execution or live sample detonation;
- cloud tenant, identity provider, endpoint, or network probing;
- prompt extraction, RAG poisoning, vector leakage tests against live systems;
- MCP SSRF or unauthenticated exposure testing against non-owned endpoints.

## Evidence Expectations

| Work Type | Minimum Evidence |
|---|---|
| Rapid review | inspected file/config, finding, evidence state, next action |
| Standard audit | scope, checklist, findings, evidence ledger, remediation plan |
| Comprehensive audit | system map, risk model, release gates, rollback/containment, challenge review |
| Forensic audit | chain of evidence, owner/signoff, timeline, containment, preservation, unknowns |

## Source Coverage Notes

The upstream cybersecurity library covers 800+ skills across cloud, appsec, AI security, DevSecOps, incident response, forensics, threat hunting, red team, compliance, identity, containers, and supply chain. The Super Build Kit should import only canonical routing and defensive governance patterns unless the user explicitly authorizes a scoped dual-use workflow.
