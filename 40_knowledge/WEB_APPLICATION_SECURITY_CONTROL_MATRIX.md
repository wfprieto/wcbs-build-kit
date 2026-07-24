# Web Application Security Control Matrix

This is the canonical control-ownership map for `50_audits/WEB_APPLICATION_SECURITY_AUDIT.md`.

Use applicability states: `Universal`, `Conditional`, `Risk-Triggered`, or `Not Applicable` with reason.

Use evidence states: `Verified`, `Likely`, `Suspected`, `Unknown`, `Not Run`, or `Blocked`.

A percentage score is never a release decision.

| ID | Control family | Primary owner | Supporting owner | Minimum evidence | Release-blocking condition | Elite Build Goals |
|---|---|---|---|---|---|---|
| WAS-AUTH-01 | Protected pages and APIs require trusted-boundary authentication | Web Application Security | QA and Browser Verification | Direct route and API negative tests | Known or unknown material auth bypass | 2, 11, 16 |
| WAS-AUTH-02 | Password reset and account recovery are scoped, expiring, single-use, and revocable | Web Application Security | External API Integration | Flow test and token lifecycle evidence | Recovery permits account takeover | 1, 2, 7, 16 |
| WAS-SESSION-01 | Sessions and tokens expire, revoke, rotate, and log out correctly | Web Application Security | QA and Browser Verification | Runtime cookie/token and revocation evidence | Active session remains valid beyond approved boundary | 1, 2, 11, 16 |
| WAS-AUTHZ-01 | Object, action, role, and tenant authorization is server-side | Web Application Security | External API Integration | Cross-user, cross-role, and cross-tenant negative tests | Failing or unknown core isolation | 2, 3, 7, 14, 16 |
| WAS-AUTHZ-02 | Frontend role or ownership claims are never trusted as authority | Web Application Security | MCP Tool Governance when tools act | Direct API and mass-assignment tests | Client-controlled privilege escalation | 2, 4, 9, 13 |
| WAS-INPUT-01 | Inputs are schema, type, range, size, and canonical-format validated | Web Application Security | External API Integration | Executed boundary tests | Untrusted input reaches privileged operation unchecked | 1, 2, 7, 9 |
| WAS-INJECT-01 | SQL, command, template, path, SSRF, deserialization, and prompt injection are controlled | Web Application Security | AI Application Security where applicable | Safe negative probes and source evidence | Known exploitable interpreter path | 2, 4, 7, 13, 16 |
| WAS-OUTPUT-01 | Output is context encoded and rich content is sanitized | Web Application Security | QA and Browser Verification | Rendered tests for relevant contexts | Known XSS or unsafe executable content | 2, 11, 16 |
| WAS-HTTP-01 | HTTPS, HSTS, CSP, framing, MIME, referrer, permission, and cache controls are appropriate | Web Application Security | QA and Browser Verification | Deployed response evidence | Material sensitive workflow lacks required transport/browser control | 1, 2, 11, 16 |
| WAS-API-01 | API auth, authorization, CORS, CSRF, size, complexity, timeout, and rate controls match risk | External API Integration | Web Application Security | Integration and abuse-boundary tests | Bypass or unbounded material abuse path | 1, 2, 4, 12 |
| WAS-API-02 | Replay, idempotency, duplication, and provider callback contracts are verified | External Integration Launch Gate | Web Application Security | Provider-path and duplicate-event evidence | Material duplicate or replay corruption | 1, 2, 7, 8, 16 |
| WAS-UPLOAD-01 | Uploads validate content, type, size, count, paths, archives, and malware risk | Web Application Security | Media and Asset Pipeline | Rejection tests and storage inspection | Upload enables execution, traversal, or unauthorized content access | 1, 2, 7, 14 |
| WAS-STORAGE-01 | Object storage is private by default with scoped expiring access | Web Application Security | External API Integration | Cross-user download tests and URL expiry evidence | Unauthorized object access | 2, 7, 14, 16 |
| WAS-DATA-01 | Database identities, tenancy, RLS or equivalent controls, writes, migrations, and recovery are safe | Web Application Security | Release Readiness | Policy plus negative tests and recovery evidence | Cross-tenant data access or realistic corruption/loss path | 2, 4, 7, 14, 16 |
| WAS-SECRET-01 | Secrets are absent from clients and public artifacts and use approved server-side boundaries | Supply Chain and Build Provenance | Web Application Security | Secret scans and runtime/config inspection | Active secret exposure or unknown material exposure | 2, 3, 8, 14, 16 |
| WAS-LOG-01 | Logs and traces redact secrets, tokens, private data, prompts, and retrieved content | Agent Observability and Run Tracing | Web Application Security | Sample log and error evidence | Material secret or private-data logging | 2, 8, 14, 16 |
| WAS-MON-01 | Failed auth, privilege escalation, secret exposure, and abuse are observable according to risk | Web Application Security | Agent Observability and Run Tracing | Alert/metric configuration and test evidence | Material failure is undetectable with no recovery path | 1, 3, 8, 16 |
| WAS-ERROR-01 | User errors are non-sensitive and correlated with internal diagnostics | Web Application Security | QA and Browser Verification | Runtime error-path evidence | Sensitive stack, secret, or private-data exposure | 1, 2, 8, 11 |
| WAS-BIZ-01 | Prices, entitlements, quotas, inventory, state transitions, refunds, and ownership changes are server validated | Web Application Security | External API Integration | Adverse-state and concurrency tests | Unauthorized value, invalid state, or material financial loss | 1, 2, 6, 7, 12 |
| WAS-AI-01 | Prompts, retrieval, vector stores, model output, and tool boundaries are secured | AI Application Security | MCP Tool Governance | AI regression probes and tenant/tool evidence | Cross-role leakage, unsafe privileged tool path, or unknown core isolation | 2, 4, 7, 14, 16 |
| WAS-SC-01 | Dependencies, CI/CD, containers, IaC, SBOM, and provenance are reviewed | Supply Chain and Build Provenance | Release Readiness | Scan and provenance evidence | Critical unaccepted vulnerability, active secret, or unknown material artifact source | 2, 8, 9, 10, 16 |
| WAS-RECOVERY-01 | Backups, restoration, rollback, reconciliation, and disaster readiness match risk | Release Readiness | Web Application Security | Restoration or blocked-state evidence | Required recovery path is failing or unknown | 1, 3, 7, 8, 16 |
| WAS-GOV-01 | Exceptions have owner, reason, compensating control, expiration, and reversal trigger | Release Readiness | Cybersecurity Risk Routing | Exception record | Unowned or indefinite release-critical exception | 3, 5, 14, 15, 16 |

## Ownership Rule

A control may be summarized by several documents, but only one primary owner defines its authoritative evidence requirement. Supporting audits may add context or stronger checks. They may not weaken the primary control.

## Negative-Test Rule

Configuration text is not sufficient when runtime or integration verification is available. Authentication, authorization, tenant isolation, object access, browser policy, provider callbacks, uploads, and material state transitions require negative tests appropriate to the selected tier.
