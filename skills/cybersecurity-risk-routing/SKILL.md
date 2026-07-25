---
name: cybersecurity-risk-routing
description: Use when work includes cybersecurity review, app security, web application security, AI security, MCP/tool security, vulnerability triage, incident response, supply chain security, cloud/IAM/container security, phishing/red-team/scanning requests, or any security-sensitive audit, implementation, verification, or release decision. Routes light security reviews through forensic security audits and enforces authorization gates for dual-use work.
---

# Cybersecurity Risk Routing

Use this skill as the first cybersecurity decision point. It does not replace APIVR; it selects the right security depth and the right specialist skill.

<HARD-GATE>
Security work that tests, scans, exploits, phishes, collects credentials, executes malware, probes cloud tenants, performs cross-tenant testing, or targets systems outside the workspace requires explicit authorization, written scope, targets, rules of engagement, stop conditions, and a containment plan. If authorization is missing, stop and provide a safe planning checklist only.
</HARD-GATE>

## Required Files

Load when cybersecurity routing is in scope:

- `40_knowledge/CYBERSECURITY_RISK_ROUTING_INDEX.md`
- `40_knowledge/SECURITY_FRAMEWORK_MAPPING.md`
- `60_templates/SECURITY_AUTHORIZATION_AND_SCOPE_TEMPLATE.md` when dual-use or live-system testing may occur
- `60_templates/SECURITY_EVIDENCE_LEDGER_TEMPLATE.md` for Standard and above security work
- `50_audits/WEB_APPLICATION_SECURITY_AUDIT.md`, `skills/web-application-security/SKILL.md`, and `60_templates/WEB_APPLICATION_SECURITY_EVIDENCE_LEDGER_TEMPLATE.md` when a web application surface is in scope

## APIVR Security Routing

- Phase 1 Audit: identify asset, owner, data sensitivity, attack surface, authorization status, live-system impact, and applicable frameworks.
- Phase 2 Plan: choose tier, security modules, evidence, stop conditions, rollback/containment, and authorization boundaries.
- Phase 3 Implement: perform only approved defensive checks or scoped tests; do not exceed authorization.
- Phase 4 Audit Implementation: check scope drift, evidence quality, safety controls, and whether findings are reproducible.
- Phase 5 Verify Implementation: verify remediation, mitigations, detection, or release gates with documented evidence.
- Phase 6 Re-Audit: classify residual risk, owners, time-bound exceptions, and next security action.

## Tier Router

```mermaid
flowchart TD
  A["Security-relevant request"] --> B{"Live target, exploit, scan, phishing, credential, malware, cross-tenant probe, or third-party system?"}
  B -- "Yes" --> C{"Written authorization and scope present?"}
  C -- "No" --> D["STOP: safe planning checklist only"]
  C -- "Yes" --> E["Comprehensive or Forensic"]
  B -- "No" --> F{"Private data, auth, payments, production, web app, AI tools, CI/CD, cloud, or incident?"}
  F -- "Yes" --> G["Comprehensive unless confirmed narrow"]
  F -- "No" --> H{"Small reversible code/config review?"}
  H -- "Yes" --> I["Rapid or Standard"]
  H -- "No" --> J["Standard"]
```

## Specialist Routing

| Trigger | Load |
|---|---|
| Browser app, authenticated web system, SaaS, tenancy, sessions, uploads, object storage, browser security | `skills/web-application-security/SKILL.md` and `50_audits/WEB_APPLICATION_SECURITY_AUDIT.md` |
| RAG, LLM app, prompt injection, vector DB, model/tool leakage | `skills/ai-application-security/SKILL.md` |
| Security alert, suspected breach, compromise, exfiltration, ransomware | `skills/security-incident-response/SKILL.md` |
| CI/CD, SBOM, dependencies, signed artifacts, provenance, container/IaC scans | `skills/supply-chain-and-build-provenance/SKILL.md` |
| MCP servers, plugin tools, connectors, tool poisoning, tool auth | `skills/mcp-tool-governance/SKILL.md` |
| REST/GraphQL/gRPC APIs, OAuth, webhooks, BOLA, rate limits | `skills/external-api-integration/SKILL.md` |
| Provider callback path, deployment protection, sandbox/live split | `skills/external-integration-launch-gate/SKILL.md` |
| Vulnerability prioritization | `40_knowledge/SECURITY_FRAMEWORK_MAPPING.md` and SSVC routing in this skill |

## Web Application Security Decision

Load the composite web application security audit whenever the application includes one or more of:

- authentication, sessions, account recovery, roles, permissions, organizations, tenants, or private APIs;
- user uploads, downloads, generated files, or object storage;
- payments, entitlements, quotas, inventory, credits, refunds, or material state transitions;
- OAuth, CORS, CSRF, webhooks, callbacks, provider integrations, or browser-delivered sensitive data;
- AI, RAG, vector stores, MCP, connectors, or privileged tools within a web application;
- production security headers, logging, monitoring, backup, restoration, or disaster-recovery decisions.

The composite audit selects and aggregates specialists. It does not weaken or duplicate their authoritative controls.

## Evidence Standard

Security claims must say one of:

- `Verified`: direct evidence supports the claim.
- `Likely`: strong evidence but not complete.
- `Suspected`: plausible and needs proof.
- `Unknown`: not enough evidence.
- `Not Run`: check was not performed.
- `Blocked`: check could not be performed and why.

Never convert `Unknown`, `Not Run`, or `Blocked` into `PASS` for core security release gates.

A numeric or percentage score is informational only and cannot compensate for a failed or unknown release-critical control.

## Worked Example

Scenario: A user asks whether a new multi-tenant OAuth-enabled SaaS application is safe to release.

1. Select Comprehensive because auth, private user data, tenancy, and an external integration are in scope.
2. Load the web application security audit, external API integration, external integration launch gate, and the web security evidence ledger.
3. Check scopes, token storage, callback validation, session behavior, object and tenant authorization, webhook signatures, replay protection, logs, rate limits, browser controls, and revocation.
4. Run safe test-user cross-tenant and direct-API negative tests plus the deployed OAuth/provider path.
5. Release verdict is `PASS` only if core authorization, tenant isolation, and applicable Gate C and Gate H evidence are `Verified`.

## Final Output

Report APIVR tier, authorization status, scope, security modules loaded, frameworks used, evidence state, release-gate status, residual risk, owners, expiration and reversal triggers for exceptions, and final verdict.
