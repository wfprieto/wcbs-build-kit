# Audit Tier Router

Every task starts here.

## Router Questions

1. **Reversible?**
   - Easy to undo: lower tier.
   - Hard or impossible to undo: higher tier.
2. **Blast radius if wrong?**
   - One file/page/local behavior: lower tier.
   - Many systems/users/workflows: higher tier.
3. **Touches money, security, privacy, authorization, production data, regulated data, destructive actions, or revenue-critical workflows?**
   - Any yes: Comprehensive or Forensic.
4. **Includes cybersecurity testing, AI security testing, live scanning, exploitation, phishing, credential testing, malware, MCP probing, prompt extraction, RAG poisoning, vector leakage, or third-party targets?**
   - Any yes: require authorization and scope; use Comprehensive or Forensic, or stop with safe planning only.
5. **Is it a browser-delivered application, authenticated web system, multi-tenant SaaS, upload-enabled application, web API, or web application with payments, private data, AI, MCP/tools, OAuth, webhooks, or production security controls?**
   - Any yes: load `50_audits/WEB_APPLICATION_SECURITY_AUDIT.md` and `skills/web-application-security/SKILL.md`, then route to the applicable specialists.

## Tiers

### Rapid / Light

Use when the work is small, low-risk, reversible, and narrow.

Required:

- one-line audit;
- narrow change or finding;
- implementation audit;
- one-line verification;
- final verdict.

### Standard

Default for normal feature work, fixes, and non-trivial audits.

Required:

- current-state assessment;
- implementation blueprint;
- targeted evidence ledger;
- implementation audit;
- verification report;
- completion report.

### Comprehensive

Use for material user, business, architecture, SEO, accessibility, operations, data, brand, or revenue impact.

Required:

- full APIVR record;
- affected systems and preserved behavior;
- rollback plan;
- challenge review;
- release gates;
- evidence ledger;
- explicit remaining risks.

### Forensic

Use for security, privacy, authorization, payments, regulated data, destructive migrations, production availability, legal/financial exposure, or suspected serious defects.

Required:

- chain of evidence;
- sign-offs and owners;
- no guessing under missing evidence;
- independent challenge;
- backup/restoration plan where feasible;
- release blocked on unknown core safety evidence.

## Cybersecurity Tier Routing

- Rapid / Light: narrow code/config review on owned material; no live probing; reversible; no private data exposure.
- Standard: normal appsec, API, MCP/tool, dependency, or configuration audit with safe local checks.
- Comprehensive: auth, private data, payments, production, cloud/IAM, CI/CD, AI apps, RAG, vector stores, supply chain, multi-tenant web applications, uploads/object storage, OAuth, or multi-system security risk.
- Forensic: suspected compromise, active exploitation, data leakage, malware, ransomware, credential abuse, unauthorized access, regulated exposure, or live dual-use testing with material impact.

If explicit authorization is missing for dual-use work, do not perform the test. Produce only an authorization/scope checklist and safe defensive guidance.

## Web Application Security Routing

Load `50_audits/WEB_APPLICATION_SECURITY_AUDIT.md` when any of these exist:

- login, sessions, account recovery, roles, permissions, organizations, tenants, or private APIs;
- browser-delivered sensitive workflows;
- user-generated content, uploads, downloads, or object storage;
- payments, entitlements, inventory, quotas, credits, refunds, or material transactions;
- OAuth, webhooks, provider callbacks, external APIs, or machine callers;
- AI, RAG, vector stores, MCP, plugins, or privileged tools inside a web application;
- production security headers, cookies, CORS, CSRF, rate limits, logging, monitoring, backup, or recovery decisions.

The web audit is composite. It coordinates the specialist audits and evidence ledger. It does not replace their authoritative controls.

## Scoring Rule

A numeric or percentage score is informational only. It cannot override a failed, unknown, not-run, or blocked release-critical control.

## Escalation Rules

- Agents may always tier up for safety.
- Tiering down below Standard requires human confirmation except Rapid, where the agent may proceed after stating the tier unless the human objects.
- A human may declare emergency/break-glass. The agent may not declare it independently.
