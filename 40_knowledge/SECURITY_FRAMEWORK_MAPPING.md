# Security Framework Mapping

Use this file to attach security work to recognized frameworks without making any framework override APIVR or the Elite Build Goals.

## Framework Use

| Framework | Use In Super Build Kit |
|---|---|
| MITRE ATT&CK | Map adversary behavior, incident findings, threat modeling, and detection gaps. |
| MITRE ATLAS | Map AI/ML threats such as prompt injection, plugin compromise, data leakage, and model abuse. |
| MITRE D3FEND | Map defensive countermeasures and detection/mitigation controls. |
| NIST CSF 2.0 | Map governance, identify/protect/detect/respond/recover controls. |
| NIST AI RMF | Map AI risk management for model, data, measurement, and governance decisions. |
| MITRE F3 | Map cyber-enabled fraud, positioning, and monetization risks when money or account takeover is involved. |
| OWASP API Top 10 | Review API auth, BOLA/IDOR, BFLA, mass assignment, SSRF, inventory, unsafe consumption, and rate limits. |
| OWASP LLM Top 10 | Review prompt injection, sensitive information disclosure, supply chain, model denial, agency, and vector weaknesses. |
| SSVC | Prioritize vulnerability response by exploitation, impact, automatability, prevalence, and public impact. |
| SLSA / Sigstore | Verify build provenance, artifact identity, signing, and tamper-resistant release pipelines. |

## APIVR Mapping

- Audit: use frameworks to identify relevant risks and missing evidence.
- Plan: select controls, tests, owners, and acceptance thresholds.
- Implement: apply mitigations or verification checks.
- Audit Implementation: check whether controls match framework intent and local risk.
- Verify Implementation: prove with logs, tests, scans, attestations, or documented evidence.
- Re-Audit: record residual risk and future framework gaps.

## Security Release Gate Mapping

| Release Gate | Security Framework Examples |
|---|---|
| Gate C: Security, Privacy, Permissions | OWASP, MITRE ATLAS, ATT&CK, NIST CSF |
| Gate D: Data Integrity | NIST CSF, OWASP API, AI RMF |
| Gate E: Reliability and Operations | NIST CSF Respond/Recover, incident response evidence |
| Gate G: Performance, SEO, Cost | abuse limits, rate limits, quota/cost exposure |
| Gate H: Verification and Handoff | SLSA/Sigstore, SBOM, evidence ledger, incident timeline |

## SSVC Vulnerability Triage

Use SSVC-style questions when deciding remediation urgency:

- Is exploitation active, public PoC, or unknown?
- Is technical impact partial or total?
- Is exploitation automatable?
- Is the affected asset essential, supporting, or minimal?
- Is public well-being, regulated data, money, or safety affected?

Outcomes:

- Track: normal remediation cycle.
- Track*: prioritize next planned patch window.
- Attend: accelerated remediation and owner visibility.
- Act: immediate mitigation and executive awareness.

## AI Security Mapping

| Risk | Framework Mapping |
|---|---|
| Prompt injection | MITRE ATLAS, OWASP LLM |
| Indirect injection through retrieved content | MITRE ATLAS, OWASP LLM |
| System prompt leakage | MITRE ATLAS data leakage, OWASP LLM |
| Vector/embedding leakage | MITRE ATLAS exfiltration via inference, OWASP LLM |
| MCP/tool poisoning | MITRE ATLAS supply-chain/plugin compromise |
| Excessive agency | OWASP Agentic AI, NIST AI RMF |

## Provenance Note

Framework structure adapted from `mukul975/Anthropic-Cybersecurity-Skills`, especially its ATT&CK coverage, AI-security skill mappings, F3 mapping notes, vulnerability triage, and supply-chain provenance skills.
