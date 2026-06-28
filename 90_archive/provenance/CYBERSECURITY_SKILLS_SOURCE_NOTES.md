# Cybersecurity Skills Source Notes

Source reviewed: `mukul975/Anthropic-Cybersecurity-Skills`.

## Integration Decision

The Super Build Kit adapts selected defensive, governance, routing, framework, incident-response, AI-security, API-security, MCP-security, and supply-chain concepts. It does not import the full 817-skill library and does not make offensive workflows always active.

## Adapted Concepts

| Source Area | Super Build Kit Destination |
|---|---|
| `index.json` and README domain taxonomy | `40_knowledge/CYBERSECURITY_RISK_ROUTING_INDEX.md` |
| MITRE ATT&CK coverage and F3 mapping | `40_knowledge/SECURITY_FRAMEWORK_MAPPING.md` |
| Agentic tool invocation security | `skills/mcp-tool-governance/SKILL.md` |
| MCP tool poisoning audit | `skills/mcp-tool-governance/SKILL.md` |
| RAG prompt injection, system prompt leakage, vector weakness | `skills/ai-application-security/SKILL.md` |
| OWASP API Top 10 testing | `skills/external-api-integration/SKILL.md` |
| Security incident triage | `skills/security-incident-response/SKILL.md` |
| SLSA/Sigstore, Trivy, SBOM scanning | `skills/supply-chain-and-build-provenance/SKILL.md` |
| SSVC vulnerability triage | `40_knowledge/SECURITY_FRAMEWORK_MAPPING.md` |

## Excluded Or Authorization-Gated

Credential attacks, exploitation walkthroughs, phishing/social engineering, red-team C2, password cracking, wireless attacks, malware execution, live target scanning, and third-party probing remain authorization-gated. Without explicit scope and written authorization, agents must stop and provide safe planning guidance only.
