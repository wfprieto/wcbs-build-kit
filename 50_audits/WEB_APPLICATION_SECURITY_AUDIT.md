# Web Application Security Audit

Use this composite audit for browser-delivered applications, authenticated web systems, APIs used by web clients, multi-tenant SaaS, upload-enabled applications, and web applications with payments, AI, MCP/tools, private data, or external integrations.

This audit coordinates existing specialist audits. It does not replace them or create a second source of truth.

## Operating Law

**Audit wide. Fix narrow. Prove everything.**

Security claims use only: `Verified`, `Likely`, `Suspected`, `Unknown`, `Not Run`, or `Blocked`.

A percentage score may summarize coverage, but it can never override a failed, unknown, not-run, or blocked release-critical control.

## Tier

- Rapid / Light: narrow, reversible code or configuration review with no private data, auth, payments, production, or live probing.
- Standard: normal web application security review with safe local or test-environment checks.
- Comprehensive: authentication, authorization, private data, payments, uploads, multi-tenancy, production, cloud, OAuth, webhooks, AI, or supply-chain risk.
- Forensic: suspected compromise, active exploitation, data leakage, credential abuse, malware, destructive behavior, regulated exposure, or material live-system testing.

Live scanning, exploitation, credential testing, prompt extraction, or testing outside the owned workspace requires explicit authorization, written scope, targets, rules of engagement, stop conditions, and containment.

## Required Inputs

Record:

- application owner and decision owner;
- exact repository revision or source snapshot;
- environment and deployed URL when runtime verification is required;
- application architecture and trust boundaries;
- authentication, authorization, tenancy, storage, API, upload, AI, payment, and provider surfaces;
- data sensitivity and regulated-data status;
- test accounts, fixtures, and authorization scope;
- rollback, restoration, or containment plan;
- applicable Elite Build Goals and release gates.

## Applicability Classification

Every control is classified as:

- `Universal`;
- `Conditional`;
- `Risk-Triggered`;
- `Not Applicable` with a concise reason.

No control may be silently omitted.

## Specialist Routing

| Trigger | Required specialist |
|---|---|
| LLM, RAG, vector store, prompt, embeddings, model output, AI tools | `skills/ai-application-security/SKILL.md` |
| MCP, plugins, connectors, filesystem, shell, network, high-impact tools | `skills/mcp-tool-governance/SKILL.md` |
| REST, GraphQL, gRPC, OAuth, webhooks, provider callbacks, rate limits | `skills/external-api-integration/SKILL.md` |
| Provider launch path, callback URL, sandbox/live split, deployment protection | `skills/external-integration-launch-gate/SKILL.md` |
| Dependencies, lockfiles, CI/CD, containers, IaC, SBOM, provenance | `skills/supply-chain-and-build-provenance/SKILL.md` |
| Browser workflow, cookies, headers, rendered errors, direct-route behavior | `skills/qa-and-browser-verification/SKILL.md` |
| Production release or done claim | `skills/release-readiness-and-ship-gates/SKILL.md` |
| Suspected compromise or active abuse | `skills/security-incident-response/SKILL.md` |

## Control Modules

### 1. Authentication and Account Recovery

Verify when applicable:

- protected pages and APIs require server-side authentication;
- passwords use an approved adaptive password hash or an approved identity provider;
- login resists brute force and user enumeration according to risk;
- password reset tokens are scoped, expiring, single-use, and invalidated after use;
- sensitive credential or recovery changes invalidate applicable sessions;
- MFA is available or enforced for privileged or high-risk roles when required;
- service accounts and machine callers do not depend on human interactive login;
- account deletion, disablement, lockout, and recovery behavior are defined.

### 2. Sessions, Cookies, and Tokens

Verify:

- expiration, idle timeout, renewal, revocation, and logout behavior;
- secure cookie flags and appropriate SameSite behavior;
- refresh-token rotation and reuse handling where applicable;
- tokens are not exposed in URLs, logs, client storage, or frontend bundles without approved reason;
- environment and audience boundaries prevent token reuse across systems;
- CSRF protections match the authentication architecture.

### 3. Authorization and Tenant Isolation

Every protected action must enforce the applicable ownership, tenant, membership, delegation, capability, or role policy at a trusted server-side boundary against the final resolved resource identity.

Required negative tests include, when applicable:

- cross-user object access;
- cross-tenant access;
- vertical privilege escalation;
- direct API calls that bypass the UI;
- modified path, query, body, or GraphQL identifiers;
- hidden admin routes;
- role or ownership changes;
- mass assignment;
- service-role or backend-key misuse;
- stale authorization after membership or ownership transfer.

Unknown cross-user, cross-role, or cross-tenant isolation blocks release.

### 4. Input Validation and Dangerous Interpreters

Verify trusted-boundary validation for:

- schemas, types, ranges, lengths, counts, and canonical formats;
- SQL, command, template, LDAP, path, header, and expression injection;
- server-side request forgery;
- unsafe deserialization;
- path traversal;
- request body, header, query, pagination, and query-complexity limits;
- prompt injection when AI features exist.

### 5. Output Encoding and Content Rendering

Verify context-appropriate handling for:

- HTML text and attributes;
- URLs and dangerous schemes;
- JavaScript and CSS contexts when present;
- JSON serialization;
- Markdown and rich text;
- user-generated content;
- model-generated content;
- downloadable content disposition and content type.

Sanitization and encoding are not interchangeable. The audit must identify the output context and the enforcing library or boundary.

### 6. Browser and HTTP Security

Verify from the deployed response when applicable:

- HTTPS-only behavior;
- HSTS;
- Content Security Policy;
- framing protection, preferably CSP `frame-ancestors` where supported;
- MIME sniffing prevention;
- Referrer-Policy;
- Permissions-Policy;
- secure cache controls for sensitive responses;
- mixed-content prevention;
- safe redirect behavior;
- cross-origin resource behavior.

Configuration text alone is not runtime proof when deployed verification is available.

### 7. APIs, CORS, CSRF, and Abuse Controls

Verify:

- authentication and object/function-level authorization;
- CORS allowlists and credential behavior;
- CSRF applicability and protection;
- rate limits by action, identity, tenant, IP, or resource according to risk;
- bounded request sizes, pagination, concurrency, and execution time;
- replay protection and idempotency;
- duplicate request and event handling;
- expected success and failure contracts;
- safe error responses;
- provider signature, state, nonce, callback, and revocation behavior.

### 8. File Upload and Object Storage Security

Verify when uploads or generated files exist:

- upload and download authorization;
- file size, count, and archive expansion limits;
- server-side MIME and magic-byte validation;
- approved extension and content policy;
- path traversal prevention;
- randomized server-side object identifiers;
- private-by-default storage;
- no unintended execution capability;
- malware scanning or an explicitly justified alternative according to risk;
- decompression bomb and archive traversal protections;
- image re-encoding and metadata removal where appropriate;
- quarantine and scan-failure behavior;
- signed URL expiration and scope;
- retention, deletion, orphan cleanup, and legal-hold behavior;
- AI ingestion isolation from untrusted embedded instructions.

### 9. Database and Data Security

Verify:

- least-privilege database identities;
- tenant and ownership enforcement;
- Row Level Security when supported and appropriate, or a documented equivalent trusted-boundary control;
- default-deny access policy where the architecture permits it;
- table, view, procedure, and storage policy coverage;
- validation before writes;
- transactions, idempotency, concurrency, and duplicate prevention;
- migration safety and rollback or restoration;
- encryption in transit and at rest according to risk;
- encrypted backups and tested restoration for material data;
- retention, deletion, export, reconciliation, and legacy-data handling.

RLS is conditional, not universally required.

### 10. Secrets and Configuration

Verify:

- no secrets in frontend bundles or public artifacts;
- repository, image, CI, and IaC secret scans are run or marked accurately;
- secrets use an approved server-side storage and delivery boundary;
- credentials are least privilege, environment scoped, rotatable, and revocable;
- production, preview, test, and local credentials are separated;
- logs, errors, build output, traces, screenshots, and support bundles are redacted;
- leaked or suspected-leaked credentials are rotated and evidence recorded.

Environment variables alone are not proof of secure secret management.

### 11. Logging, Monitoring, and Error Handling

Do not log passwords, access or refresh tokens, reset tokens, session identifiers, API keys, authorization headers, sensitive payment data, unnecessary personal data, private prompts, or retrieved private content.

Verify:

- structured logs and correlation IDs;
- security-relevant audit trails;
- failed-login, privilege-escalation, secret-exposure, and abuse alerts according to risk;
- actionable error tracking and health signals;
- safe user-facing errors with internal diagnostic correlation;
- retention, access control, and deletion for logs;
- incident owner, rollback, recovery, and escalation instructions.

### 12. Business Logic, Payments, and State Integrity

Verify when applicable:

- server-side price, entitlement, inventory, quota, and workflow validation;
- duplicate transaction prevention;
- idempotency keys and replay resistance;
- race-condition and stale-state tests;
- coupon, credit, refund, cancellation, and ownership-transfer authorization;
- payment provider event verification;
- state transitions reject invalid orderings;
- failures reconcile to an authoritative source of truth.

### 13. AI, RAG, and Tool Security

The web audit identifies the surface and routes to the specialist audit. At minimum verify:

- prompts are not treated as secrets or authorization boundaries;
- retrieved content is untrusted input;
- tenant and role filters protect retrieval;
- model output is rendered safely;
- tools use schemas, allowlists, least privilege, and approval gates;
- filesystem, network, shell, and code execution are isolated and resource bounded;
- traces and outputs do not expose secrets or private data;
- regression probes exist for material prompt, retrieval, or tool-routing changes.

### 14. Dependencies and Build Trust

Route to supply-chain review and verify applicability of:

- lockfile integrity;
- unexpected dependency changes;
- known critical vulnerabilities;
- package provenance and integrity;
- CI/CD permissions and secret boundaries;
- actions pinning;
- containers and IaC scanning;
- SBOM;
- artifact identity, signing, and provenance.

### 15. Backup, Recovery, and Disaster Readiness

Verify according to risk:

- backup scope, encryption, retention, and owner;
- restoration test or documented blocked state;
- rollback or forward-recovery path;
- recovery time and recovery point expectations;
- incident containment;
- post-recovery reconciliation;
- dependency and provider outage behavior.

## Evidence Record

Use `60_templates/WEB_APPLICATION_SECURITY_EVIDENCE_LEDGER_TEMPLATE.md`.

Every material control must record:

- control ID;
- applicability;
- evidence state and confidence;
- target revision and environment;
- test or inspection performed;
- expected and observed result;
- evidence location;
- affected files, routes, or resources;
- residual risk and owner;
- expiration and reversal trigger for exceptions;
- release gate.

## Release Blockers

Release is blocked by any applicable condition below:

- known authentication or authorization bypass;
- unknown core object, role, or tenant isolation;
- exposed or suspected active production secret without containment;
- known exploitable injection or unsafe arbitrary execution path;
- unaccepted critical or high-risk vulnerability;
- unsafe sensitive-data handling;
- unknown payment integrity for a material payment flow;
- unknown artifact source or critical supply-chain trust where material;
- failed restoration evidence where restoration is a core safety requirement;
- unapproved live security testing;
- percentage completion used to override a failed core control.

## Final Output

Report:

- tier and authorization status;
- source revision and environment;
- system and trust boundaries;
- applicable and non-applicable control families;
- specialist audits loaded;
- tests and inspections run;
- evidence states;
- failed, unknown, not-run, and blocked controls;
- residual risk, owners, expiration, and reversal triggers;
- affected Elite Build Goals and release gates;
- final verdict: `PASS`, `CONDITIONAL PASS`, `PARTIAL`, `FAIL`, or `BLOCKED`.
