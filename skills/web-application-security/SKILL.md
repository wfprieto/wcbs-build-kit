---
name: web-application-security
description: Use when auditing, planning, building, testing, or releasing browser-delivered applications, authenticated web systems, multi-tenant SaaS, upload-enabled applications, web APIs, or web applications involving payments, private data, AI, MCP/tools, OAuth, webhooks, or production security controls.
---

# Web Application Security

Use this skill as the composite entry point for conventional web application security. Route through `skills/cybersecurity-risk-routing/SKILL.md` first when authorization, scope, live testing, or dual-use risk is uncertain.

<HARD-GATE>
Do not perform live scanning, exploitation, credential testing, cross-tenant probing, destructive tests, or testing outside the owned workspace without explicit authorization, written scope, targets, rules of engagement, stop conditions, and containment. Unknown core authentication, authorization, tenant-isolation, secret-exposure, or payment-integrity evidence blocks a production PASS.
</HARD-GATE>

## Required Files

- `50_audits/WEB_APPLICATION_SECURITY_AUDIT.md`
- `40_knowledge/WEB_APPLICATION_SECURITY_CONTROL_MATRIX.md`
- `60_templates/WEB_APPLICATION_SECURITY_EVIDENCE_LEDGER_TEMPLATE.md`
- `10_governance/RELEASE_GATES.md`
- `40_knowledge/SECURITY_FRAMEWORK_MAPPING.md`

## APIVR Routing

- Phase 1 Audit: identify owner, source revision, environment, architecture, trust boundaries, data sensitivity, auth, tenancy, APIs, uploads, storage, providers, AI/tools, and authorization status.
- Phase 2 Plan: classify applicability, select audit tier and specialists, define safe negative tests, evidence, stop conditions, rollback/restoration, and release blockers.
- Phase 3 Implement: perform only approved defensive checks or narrowly implement controls with trusted-boundary enforcement, least privilege, safe fixtures, and redacted evidence.
- Phase 4 Audit Implementation: check scope drift, duplicate sources of truth, control ownership, negative-test coverage, runtime behavior, and evidence quality.
- Phase 5 Verify Implementation: run targeted static, integration, browser, provider-path, and recovery checks or record `Not Run` / `Blocked` honestly.
- Phase 6 Re-Audit: classify residual risk, owners, expiration, reversal triggers, and final release verdict.

## Control Ownership

This skill coordinates but does not duplicate specialist ownership:

| Surface | Route |
|---|---|
| AI, RAG, vector stores, prompts, model output | `skills/ai-application-security/SKILL.md` |
| MCP, connectors, filesystem, shell, network, tools | `skills/mcp-tool-governance/SKILL.md` |
| APIs, OAuth, webhooks, callbacks, rate limits | `skills/external-api-integration/SKILL.md` |
| Deployed provider path and environment split | `skills/external-integration-launch-gate/SKILL.md` |
| Dependencies, CI/CD, containers, IaC, SBOM, provenance | `skills/supply-chain-and-build-provenance/SKILL.md` |
| Browser workflow and rendered runtime evidence | `skills/qa-and-browser-verification/SKILL.md` |
| Release decision | `skills/release-readiness-and-ship-gates/SKILL.md` |
| Suspected compromise | `skills/security-incident-response/SKILL.md` |

## Required Decision Sequence

1. Freeze source identity and environment.
2. Map trust boundaries and privileged operations.
3. Classify each control as `Universal`, `Conditional`, `Risk-Triggered`, or `Not Applicable` with reason.
4. Select the minimum complete specialist set.
5. Define positive and negative tests before implementation claims.
6. Record evidence using canonical states.
7. Block release on unknown core safety evidence.
8. Report residual risk and ownership.

## Minimum Negative Tests

When applicable, attempt safe authorized tests for:

- unauthenticated protected-page and private-API access;
- cross-user and cross-tenant object access;
- vertical privilege escalation;
- direct API access without the UI;
- modified resource identifiers;
- stale permissions after role, membership, or ownership changes;
- injection and unsafe output rendering;
- duplicate, replayed, concurrent, and out-of-order material operations;
- upload type, size, archive, path, and download-authorization failures;
- deployed security headers and cookie attributes;
- secret leakage in bundles, logs, errors, traces, and build artifacts.

## Evidence Standard

Use only:

- `Verified`
- `Likely`
- `Suspected`
- `Unknown`
- `Not Run`
- `Blocked`

A control count or percentage is informational only. It cannot turn a failed, unknown, not-run, or blocked release-critical control into a pass.

## Elite Build Goals

This skill directly supports all 16 Elite Build Goals, with primary emphasis on:

- Goal 1 Reliability Above Cleverness;
- Goal 2 Security and Privacy by Design;
- Goal 3 Clear Ownership and Accountability;
- Goal 4 Architecture That Supports Required Scale;
- Goal 5 Fast, Safe Delivery;
- Goal 7 Data Integrity and Trust;
- Goal 8 Operational Excellence and Observability;
- Goal 9 Consistent Engineering Standards;
- Goal 10 Developer Productivity at Scale;
- Goal 13 Maintainability Over Heroics;
- Goal 14 Compliance and Governance Readiness;
- Goal 16 Verification and Continuous Improvement.

## Final Output

Report tier, authorization status, source revision, environment, trust boundaries, applicable modules, specialists loaded, tests and inspections run, evidence states, release blockers, residual risk, owners, Elite Build Goal mapping, release-gate status, and final verdict.
