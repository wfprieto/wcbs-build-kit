# Master Claude Project Security Audit: Auth, Access, Secrets, APIs, Data, Infrastructure, AI, Payments, and Production Hardening

## READ-FIRST INSTRUCTION

Read this entire prompt from top to bottom before taking any action.

Do not skip sections.

Do not summarize prematurely.

Do not rely on stale session context.

Do not rely on prior conversation history.

Do not assume any prior audit is complete or correct until re-verified in the actual repository.

Do not assume the app is secure because typecheck, build, lint, or automated tests pass.

Do not begin implementation.

This is a SECURITY AUDIT-ONLY task.

Do not modify code.

Do not install packages.

Do not change configuration.

Do not change routes.

Do not change schemas.

Do not change tests.

Do not change documentation unless explicitly instructed.

Do not run destructive commands.

Do not mutate production data.

Do not expose secrets.

Your job is to perform a complete, evidence-based security deep-dive on the current Claude project and produce a prioritized, phased remediation plan before any fixes are made.

## OBJECTIVE

Perform a reusable master security audit of the current Claude-accessible repository covering:

1. Authentication  
     
2. Sessions and cookies  
     
3. Authorization, roles, permissions, and access control  
     
4. Account registration, login, logout, password reset, invitations, and identity flows  
     
5. Email, username, phone, or identity normalization  
     
6. Rate limiting, throttling, abuse prevention, and cost-control protections  
     
7. CORS and origin trust  
     
8. Security headers, Helmet, CSP, frame protection, and browser hardening  
     
9. Secret exposure and credential leak risks  
     
10. API route security  
      
11. Backend middleware security and ordering  
      
12. Frontend/client-side security  
      
13. Database and data-access security  
      
14. Object ownership and IDOR protection  
      
15. Webhook and payment security  
      
16. File upload/download security  
      
17. Admin, setup, debug, and internal-tool exposure  
      
18. Logging, error handling, and sensitive-data leakage  
      
19. AI/LLM/agent security, if present  
      
20. External integrations and third-party API risks  
      
21. Environment variable and deployment security  
      
22. Claude-specific preview, deployment, secrets, and proxy risks  
      
23. Data privacy, retention, deletion, and export risks  
      
24. Testing coverage for security-sensitive behavior  
      
25. Safe implementation sequencing

The goal is to confirm the full security picture before implementation so the next fix prompt is safe, complete, and properly phased.

Do not implement fixes during this task.

## CURRENT CONTEXT

This audit is for the current Claude-accessible repository.

You must discover the actual project type, stack, routes, auth model, database model, security boundaries, integrations, deployment configuration, source-of-truth documents, tests, scripts, and business rules directly from the repository before relying on them.

Do not assume the project uses React, Express, Node, Vite, Next.js, Python, Flask, FastAPI, Postgres, Drizzle, Prisma, Supabase, Firebase, Clerk, Stripe, OpenAI, Anthropic, or any specific framework or service until verified.

If a file, route, schema, API, middleware, dependency, environment variable, test, role, source-of-truth document, credential, secret pattern, or security behavior is uncertain, discover it in the actual codebase or mark it as unknown.

Do not invent unverified project facts.

## NON-NEGOTIABLE GUARDRAILS

### Audit-Only Scope

This is audit-only.

Do not implement fixes.

Do not install dependencies.

Do not add middleware.

Do not change auth logic.

Do not change session logic.

Do not change CORS.

Do not add Helmet.

Do not add CSP.

Do not change headers.

Do not alter database schema.

Do not alter migrations.

Do not alter payment or webhook logic.

Do not alter AI/LLM/agent behavior.

Do not alter production data.

Do not edit generated files.

Do not change source-of-truth docs unless explicitly instructed.

If a severe issue is discovered, document it with evidence and recommend a separate implementation prompt.

### Anti-Drift Rules

Work only on the requested security audit.

Do not reopen completed work.

Do not modify unrelated features, routes, UI, schemas, tests, copy, or documentation.

Do not chase stale TODOs, old session-plan items, or previously closed issues.

Do not “improve” unrelated areas while touching nearby files.

If unrelated issues are found, report them separately without fixing them unless they block the current audit.

### Data and Secret Safety

Do not run destructive commands.

Do not reset, seed, truncate, migrate, or mutate the database.

Do not emit DELETE, TRUNCATE, DROP, ALTER, UPDATE, or destructive SQL.

Do not delete, hide, archive, rename, normalize, or modify records.

Do not use production credentials.

Do not expose private user/customer/member data.

Do not print, log, expose, summarize, quote, partially quote, decode, transform, or return secret values.

Do not expose:

- API keys  
    
- Auth secrets  
    
- Payment secrets  
    
- Webhook secrets  
    
- Session secrets  
    
- Database credentials  
    
- OAuth tokens  
    
- JWT secrets  
    
- Service credentials  
    
- Private user/customer/member data  
    
- Sensitive env vars  
    
- Private keys  
    
- Certificate material  
    
- SMTP/email credentials  
    
- AI/LLM provider keys  
    
- Claude secrets  
    
- Deployment credentials  
    
- Access tokens  
    
- Refresh tokens  
    
- Personal passwords  
    
- Admin passwords  
    
- Test credentials that appear real  
    
- Internal URLs containing embedded credentials  
    
- Signed URLs or private file links  
    
- Cookie values  
    
- Authorization headers

If secret leakage risk is found, report only the file/path/pattern and risk. Do not reveal the secret value.

### Security Boundaries

Do not attack the app.

Do not fuzz production.

Do not brute-force login.

Do not trigger provider-cost AI/LLM calls unless explicitly approved.

Do not send real emails.

Do not run live payment/webhook actions.

Do not run destructive security scans.

Do not change auth, access, role, session, payment, webhook, AI safety, or data-integrity behavior.

This is a defensive review only.

## QUALITY BAR

Every finding must be evidence-based.

Evidence may include:

- File path  
    
- Function/component/middleware name  
    
- Route  
    
- Schema/table  
    
- Command result  
    
- Test result  
    
- Browser behavior  
    
- API response  
    
- Source-of-truth contradiction  
    
- Dependency/reference search result  
    
- Header/cookie behavior  
    
- Session behavior  
    
- CORS behavior  
    
- Code path analysis  
    
- Secret pattern location without revealing the value  
    
- Client bundle exposure pattern  
    
- Log exposure pattern  
    
- Documentation or fixture exposure pattern  
    
- Middleware ordering evidence  
    
- Access-control evidence

Do not exaggerate severity.

Do not mark anything as broken unless verified.

Do not mark anything as safe unless verified.

Do not mark anything as unused unless dependency/reference checks support it.

If evidence is incomplete, label the item “Needs human review.”

A passing typecheck/build is not enough to call security behavior healthy.

## PRE-IMPLEMENTATION DISCOVERY

Before producing the audit report, inspect the actual repository.

Discovery must include, where applicable:

1. Project structure  
     
2. Framework and runtime  
     
3. Package manager  
     
4. Frontend app  
     
5. Backend/API server  
     
6. Auth routes  
     
7. Register/login/logout/password reset/invite flows  
     
8. Session middleware and cookie configuration  
     
9. Token/JWT handling  
     
10. OAuth/social-login handling  
      
11. Role/permission/access-control model  
      
12. Admin/internal/setup routes  
      
13. CORS middleware/configuration  
      
14. Security header behavior  
      
15. Webhook routes and body-parser ordering  
      
16. Payment/subscription routes  
      
17. AI/LLM/agent/provider routes  
      
18. File upload/download routes  
      
19. Existing middleware ordering  
      
20. Environment variable usage  
      
21. API route registration  
      
22. Database schema and data-access patterns  
      
23. Tests for security-sensitive behavior  
      
24. Source-of-truth files such as README files, docs, API specs, tests, deployment notes, and implementation notes  
      
25. Secret exposure surfaces, including code, config, docs, fixtures, tests, scripts, env examples, frontend public env usage, static assets, generated files, and logs

Write a concise discovery summary before the final findings.

The discovery summary must include:

- Files/routes/configs inspected  
    
- Existing auth/session/token behavior found  
    
- Existing role/access behavior found  
    
- Existing identity normalization behavior found  
    
- Existing rate-limit/throttle behavior found  
    
- Existing CORS behavior found  
    
- Existing security-header behavior found  
    
- Existing secret/env handling found  
    
- Existing webhook/payment behavior found, if present  
    
- Existing AI/LLM/agent behavior found, if present  
    
- Existing tests available  
    
- Source-of-truth docs inspected  
    
- Risks, blockers, or unknowns  
    
- Smallest safe future implementation path

## SECURITY AREAS TO AUDIT

## 1\. Authentication and Identity Flow Audit

Inspect:

- Registration  
    
- Login  
    
- Logout  
    
- Password reset  
    
- Email verification  
    
- Invitations  
    
- OAuth/social login  
    
- Magic links  
    
- MFA/2FA, if present  
    
- Account creation by admin, if present  
    
- Account deletion/deactivation  
    
- Identity fields such as email, username, phone, external provider ID, customer ID, or user ID  
    
- Duplicate-account prevention  
    
- Generic auth error behavior  
    
- Password hashing and validation  
    
- Login failure behavior  
    
- Account lockout or abuse prevention

Look for:

- User enumeration  
    
- Weak password handling  
    
- Weak password hashing  
    
- Missing email normalization  
    
- Missing phone/username normalization, if applicable  
    
- Duplicate-account risk  
    
- Missing verification checks  
    
- Unsafe password reset tokens  
    
- Long-lived or reusable reset tokens  
    
- Token leakage in URLs/logs  
    
- Inconsistent auth errors  
    
- Login success before session/token persistence  
    
- Test/dev login paths leaking into production  
    
- Admin-created accounts bypassing validation

Report:

- Current identity lifecycle  
    
- Auth flows found  
    
- Risks found  
    
- Recommended implementation approach  
    
- Tests required  
    
- Human approval needed

## 2\. Session, Cookie, JWT, and Token Security Audit

Inspect:

- Session middleware  
    
- Session store  
    
- Cookie settings  
    
- trust proxy configuration  
    
- Session regeneration  
    
- Session save behavior  
    
- Session destroy behavior  
    
- JWT signing/verification, if present  
    
- Token expiration  
    
- Refresh tokens  
    
- Access tokens  
    
- Remember-me behavior  
    
- CSRF exposure  
    
- SameSite/Secure/HttpOnly settings  
    
- Dev/prod differences  
    
- Preview bypass logic  
    
- Middleware that assumes user identity

Look for:

- Session fixation risk  
    
- Missing session.regenerate()  
    
- Weak cookie settings  
    
- Missing HttpOnly  
    
- Missing Secure in production  
    
- SameSite mismatch  
    
- trust proxy mismatch  
    
- Logout not destroying session/token  
    
- Stale session after failed login  
    
- User switching without regeneration  
    
- Tokens without expiration  
    
- Tokens stored unsafely  
    
- JWT secrets exposed or weak  
    
- Refresh tokens not rotated  
    
- CSRF risk with cookie-authenticated state-changing requests

Report:

- Current session/token flow  
    
- Risk level  
    
- Recommended implementation approach  
    
- Tests required  
    
- Regression risks

## 3\. Authorization, Roles, Permissions, and IDOR Audit

Inspect:

- Protected routes  
    
- Role checks  
    
- Permission checks  
    
- Admin-only routes  
    
- User/member/customer-only routes  
    
- Subscription/access gates  
    
- Object ownership checks  
    
- Tenant/account/org scoping  
    
- Direct URL behavior  
    
- Frontend-only gates  
    
- Backend enforcement  
    
- Client-supplied role, user ID, entitlement, subscription, account ID, or org ID trust  
    
- Query scoping  
    
- API mutation authorization

Look for:

- Missing auth  
    
- Missing role checks  
    
- Missing ownership checks  
    
- Direct object reference risks  
    
- Frontend-only security  
    
- Admin functions visible or callable by non-admins  
    
- Public routes returning private data  
    
- Inconsistent 401/403 behavior  
    
- Overbroad access logic  
    
- Client-supplied authorization state  
    
- Multi-tenant data leakage  
    
- Cross-account or cross-org access

Report:

- Access model found  
    
- Protected surfaces inspected  
    
- IDOR risks  
    
- Role/permission risks  
    
- Tests required  
    
- Manual verification required

## 4\. Rate Limiting, Abuse Prevention, and Cost-Control Audit

Inspect:

- Login/register/password reset/invite routes  
    
- API routes that mutate data  
    
- Public contact or form routes  
    
- File upload routes  
    
- Search endpoints  
    
- AI/LLM/provider endpoints  
    
- Email/SMS sending endpoints  
    
- Payment/customer endpoints  
    
- Report/file generation endpoints  
    
- Existing middleware  
    
- Existing dependency list  
    
- IP/proxy handling  
    
- User/session-based request context  
    
- Error response style  
    
- Abuse/cost-control patterns  
    
- Queue/throttle/limit logic

Look for:

- No auth rate limit  
    
- No registration/password-reset rate limit  
    
- No public-form abuse protection  
    
- No AI/provider cost-control rate limit  
    
- No per-user throttling  
    
- No per-IP throttling  
    
- Rate-limit bypass via proxy/IP issue  
    
- Generic global limiter risk  
    
- Limiter accidentally affecting webhooks or health routes  
    
- Limiter response leaking auth state  
    
- Missing Retry-After or clear generic error  
    
- Need for separate limits by route type  
    
- Need for test-safe limiter behavior  
    
- Risk of breaking automated tests

Report separate recommendations for:

- Auth limits  
    
- Public endpoint limits  
    
- Mutation limits  
    
- Upload limits  
    
- AI/LLM/provider limits, if present  
    
- Email/SMS limits, if present  
    
- Per-IP limits  
    
- Per-user/session limits  
    
- Cost-control limits  
    
- Dev/test/prod behavior  
    
- Tests required

## 5\. CORS, CSRF, Origin Trust, and Browser Boundary Audit

Inspect:

- CORS middleware  
    
- credentials setting  
    
- allowed origin logic  
    
- reflected origin behavior  
    
- environment variables for frontend/custom domains  
    
- Claude preview domains  
    
- Claude deployment domains  
    
- production/custom domain handling  
    
- local development handling  
    
- cookie/session usage  
    
- preflight behavior  
    
- route-specific CORS behavior  
    
- CSRF protection, if cookie-authenticated  
    
- SameSite assumptions

Look for:

- credentials: true with reflected origin  
    
- wildcard origin with credentials  
    
- overly broad origin allowlist  
    
- missing production allowlist  
    
- dev/prod mismatch  
    
- Claude preview/custom-domain complications  
    
- CORS applied too broadly  
    
- CORS applied to webhooks unnecessarily  
    
- missing Vary: Origin concerns  
    
- cookies allowed cross-origin incorrectly  
    
- CSRF exposure on state-changing routes  
    
- frontend blocked if tightened too aggressively

Report:

- Current CORS/CSRF behavior  
    
- Required allowed origins  
    
- Dev/preview/prod distinction  
    
- Regression risks  
    
- Tests/manual verification required  
    
- Whether this should be a separate implementation phase

## 6\. Security Headers, Helmet, CSP, and Browser Hardening Audit

Inspect:

- Server middleware  
    
- Static asset serving  
    
- Frontend deployment assumptions  
    
- External scripts  
    
- Fonts  
    
- Images  
    
- Analytics  
    
- Payments  
    
- iframes  
    
- CSP compatibility risks  
    
- Existing response headers  
    
- Dev versus production header behavior  
    
- Reverse proxy/header behavior if discoverable

Look for missing or weak:

- Content-Security-Policy  
    
- frame-ancestors  
    
- X-Frame-Options  
    
- X-Content-Type-Options  
    
- Referrer-Policy  
    
- Permissions-Policy  
    
- Strict-Transport-Security, if appropriate  
    
- Cross-Origin-Opener-Policy  
    
- Cross-Origin-Resource-Policy  
    
- Cross-Origin-Embedder-Policy  
    
- overly strict CSP that would break the app  
    
- overly loose CSP that adds little value

Report:

- Current header behavior  
    
- Recommended minimum header set  
    
- Helmet recommendation  
    
- CSP rollout strategy  
    
- Dev/prod behavior  
    
- Known external domains that must be allowed  
    
- Browser verification required

## 7\. Secret Exposure and Credential Leak Audit

Inspect the repository for accidental exposure of secrets or credentials.

Inspect:

- Source code  
    
- Config files  
    
- Scripts  
    
- Tests  
    
- Fixtures  
    
- Seed files  
    
- README files  
    
- Docs  
    
- Deployment notes  
    
- Source-of-truth files  
    
- Example env files  
    
- Local env file references  
    
- Public/frontend environment variable usage  
    
- Client bundle exposure patterns  
    
- Console/server logging  
    
- Error responses  
    
- Generated files  
    
- Static/public assets  
    
- Comments and commented-out code  
    
- Base64-like or encoded secret patterns  
    
- Private key/certificate-like blocks

Look for:

- Hardcoded API keys  
    
- Passwords in code  
    
- Database URLs or credentials in code  
    
- JWT secrets  
    
- Session secrets  
    
- OAuth client secrets  
    
- Stripe/payment secrets  
    
- Webhook signing secrets  
    
- AI/LLM provider keys  
    
- Email/SMTP credentials  
    
- SMS provider credentials  
    
- Service account keys  
    
- Private tokens  
    
- .env files committed to the repo  
    
- Example env files containing real values instead of placeholders  
    
- Secrets logged in server/client logs  
    
- Secrets returned in API responses  
    
- Secrets exposed to frontend/client bundles  
    
- Secrets used in VITE\_ / PUBLIC\_ / NEXT\_PUBLIC\_ style variables when they should remain server-only  
    
- Test files, fixtures, screenshots, docs, README files, seed files, or deployment notes containing real credentials  
    
- Old commented-out credentials  
    
- Base64-encoded or disguised secrets  
    
- Private keys or certificate material  
    
- Admin/test passwords that appear real rather than placeholders  
    
- Credentials embedded in URLs  
    
- Tokens embedded in curl examples  
    
- Secrets included in error messages  
    
- Sensitive headers or cookies logged  
    
- Source maps or public assets exposing private config

Do not print, quote, partially quote, decode, transform, or reveal the secret value.

If a possible secret is found, report only:

- File/path  
    
- Secret type suspected  
    
- Why it appears sensitive  
    
- Whether it is server-side only, client-exposed, logged, documented, committed, or publicly bundled  
    
- Recommended remediation  
    
- Whether immediate key rotation is recommended  
    
- Whether git history review is recommended  
    
- Whether deployment logs or Claude history should be reviewed  
    
- Whether the value should be moved to the approved secret manager/environment variable system

If a real secret appears to have been committed, recommend:

1. Remove the secret from code/config/docs.  
     
2. Rotate the credential immediately.  
     
3. Review git history and deployment logs.  
     
4. Move the value to the approved secret manager/environment variable system.  
     
5. Replace real values in examples with placeholders.  
     
6. Add or enable a secret-scanning check if available.  
     
7. Confirm no client-side/public env exposure remains.

## 8\. API and Backend Security Audit

Inspect:

- API route registration  
    
- Middleware ordering  
    
- Validation  
    
- Error handling  
    
- Auth middleware  
    
- Permission middleware  
    
- Service functions  
    
- Response shapes  
    
- Input parsing  
    
- Body size limits  
    
- Query parameters  
    
- Pagination  
    
- File generation routes  
    
- Export routes  
    
- Admin routes  
    
- Internal routes  
    
- Health/debug routes

Look for:

- Missing validation  
    
- Unsafe request body parsing  
    
- Overly large payloads allowed  
    
- SQL injection risk  
    
- NoSQL injection risk  
    
- Command injection risk  
    
- SSRF risk  
    
- Path traversal risk  
    
- Open redirect risk  
    
- Unsafe file paths  
    
- Mass assignment  
    
- Prototype pollution  
    
- Insecure direct object access  
    
- Raw error leakage  
    
- Stack traces in responses  
    
- Sensitive fields returned unnecessarily  
    
- Missing pagination causing DoS risk  
    
- Debug endpoints exposed  
    
- Internal routes exposed publicly

Report:

- Endpoint/file  
    
- Evidence  
    
- Risk  
    
- Recommended fix  
    
- Tests needed

## 9\. Database and Data-Access Security Audit

Inspect:

- Schema files  
    
- ORM queries  
    
- Raw SQL  
    
- Query builders  
    
- Migrations  
    
- Indexes where relevant to abuse risk  
    
- Tenant/account/org scoping  
    
- Soft-delete patterns  
    
- Audit logs  
    
- Sensitive fields  
    
- Encryption or hashing patterns  
    
- Backup/export flows  
    
- Import flows

Look for:

- Unsafe raw queries  
    
- Missing ownership filters  
    
- Missing tenant/account/org scoping  
    
- Sensitive data stored unnecessarily  
    
- Sensitive data returned unnecessarily  
    
- Passwords or tokens stored unhashed  
    
- Tokens stored without expiry  
    
- Audit logs missing for sensitive actions  
    
- Soft-deleted data still visible  
    
- Import/export leaking private data  
    
- Backup files or dumps committed  
    
- PII data exposure  
    
- Data retention/deletion/export gaps  
    
- Missing constraints that allow unsafe records

Do not mutate data.

Report:

- Table/schema/query  
    
- Evidence  
    
- Impact  
    
- Recommended fix  
    
- Migration needed?  
    
- Backup/dry-run needed?  
    
- Human approval required?

## 10\. Frontend and Client-Side Security Audit

Inspect:

- Frontend routes  
    
- Client-side auth checks  
    
- API calls  
    
- Public environment variables  
    
- LocalStorage/sessionStorage/cookie use  
    
- User-generated content rendering  
    
- HTML rendering  
    
- Markdown rendering  
    
- Rich text rendering  
    
- URL handling  
    
- Redirect handling  
    
- Download links  
    
- Source maps/static assets  
    
- Error display  
    
- Third-party scripts

Look for:

- XSS risk  
    
- Dangerous innerHTML usage  
    
- Unescaped user-generated content  
    
- Unsafe markdown/html rendering  
    
- Token storage in localStorage  
    
- Private data in client state or logs  
    
- Public env secret exposure  
    
- Open redirects  
    
- Route guards that only protect frontend while API is open  
    
- Source maps exposing sensitive config  
    
- Sensitive errors shown to users  
    
- Unsafe third-party scripts  
    
- Clickjacking exposure

Report:

- File/component/route  
    
- Evidence  
    
- Risk  
    
- Recommended fix  
    
- Browser verification needed

## 11\. File Upload, Download, Storage, and Media Security Audit

Inspect, if present:

- Upload endpoints  
    
- Download endpoints  
    
- File preview routes  
    
- Storage providers  
    
- File metadata  
    
- File validation  
    
- MIME checks  
    
- Extension checks  
    
- Size limits  
    
- Antivirus/malware scanning if present  
    
- Private/public file access  
    
- Signed URL handling  
    
- Path construction  
    
- Temporary files  
    
- Generated files  
    
- Export files

Look for:

- No file size limit  
    
- No MIME/type validation  
    
- Executable uploads allowed  
    
- Path traversal  
    
- Public access to private files  
    
- Guessable file URLs  
    
- Signed URLs too long-lived  
    
- Uploads bypassing auth  
    
- Downloads bypassing ownership checks  
    
- Generated reports exposing other users’ data  
    
- Temporary files not cleaned  
    
- Malicious file risk

Report:

- Route/storage/file flow  
    
- Evidence  
    
- Risk  
    
- Recommended fix  
    
- Tests/manual verification needed

## 12\. Webhook, Payment, Billing, and Subscription Security Audit

Inspect, if present:

- Webhook routes  
    
- Raw body parsing  
    
- Signature verification  
    
- Payment provider integration  
    
- Subscription status updates  
    
- Customer mapping  
    
- Billing portal routes  
    
- Checkout routes  
    
- Webhook reconciler  
    
- Idempotency handling  
    
- Event replay behavior  
    
- Access entitlement updates  
    
- Client-supplied subscription data

Look for:

- Signature verification after body parsing  
    
- Missing signature verification  
    
- Webhook route affected by JSON parser unexpectedly  
    
- Webhook route affected by auth/CORS/rate limits incorrectly  
    
- Client-supplied payment status trusted  
    
- Missing idempotency  
    
- Duplicate event handling bugs  
    
- Payment-to-user mapping risks  
    
- Subscription access granted incorrectly  
    
- Billing errors leaking internals  
    
- Payment secrets exposed

Do not run live payment actions.

Report:

- Current webhook/payment posture  
    
- Middleware ordering risks  
    
- Access entitlement risks  
    
- Future implementation exclusions required

## 13\. AI, LLM, Agent, and Automation Security Audit, If Present

Inspect:

- AI/LLM provider routes  
    
- Prompt construction  
    
- System prompts  
    
- User input handling  
    
- Retrieval/context injection  
    
- Tool/function calling  
    
- Agent actions  
    
- Memory/context storage  
    
- Provider API keys  
    
- Cost-control logic  
    
- Safety validators  
    
- Human review gates  
    
- Output validation  
    
- Logging of prompts/responses  
    
- Data sent to providers  
    
- User consent/privacy disclosures, if present

Look for:

- Prompt injection risk  
    
- Tool abuse risk  
    
- Unauthorized data exposure to AI  
    
- Private data sent to provider unnecessarily  
    
- AI bypassing safety/validation  
    
- AI mutating data without approval  
    
- No rate limit/cost control  
    
- Unsafe tool permissions  
    
- Unsafe retrieval scope  
    
- Sensitive prompts/responses logged  
    
- Provider key exposure  
    
- Missing kill switch  
    
- Missing fallback/error handling  
    
- Model responses trusted as facts or permissions

Do not run live provider-cost actions unless explicitly approved.

Report:

- AI/automation security posture  
    
- Data exposure risks  
    
- Tool/action risks  
    
- Cost risks  
    
- Recommended guardrails  
    
- Tests required

## 14\. Admin, Setup, Debug, and Internal Tool Audit

Inspect:

- Admin routes  
    
- Setup routes  
    
- Debug routes  
    
- Test utilities  
    
- Seed/import/export utilities  
    
- Internal dashboards  
    
- Feature flag controls  
    
- Maintenance scripts  
    
- Claude-specific helper routes  
    
- Dev-only logic

Look for:

- Setup routes open in production  
    
- Admin routes missing role checks  
    
- Debug data exposed  
    
- Import/export routes exposed  
    
- Seed/reset tools accessible  
    
- Feature flags changeable by unauthorized users  
    
- Dev bypass active in production  
    
- Test credentials still valid  
    
- Internal tools linked in public UI  
    
- Direct URL access to protected tools

Report:

- Route/tool  
    
- Evidence  
    
- Risk  
    
- Recommended fix  
    
- Verification needed

## 15\. Logging, Monitoring, Error Handling, and Audit Trail Security

Inspect:

- Server logs  
    
- Client logs  
    
- Error middleware  
    
- Audit logs  
    
- Security event logs  
    
- Auth event logging  
    
- Payment event logging  
    
- AI/tool event logging  
    
- Data mutation logs  
    
- Third-party monitoring configuration

Look for:

- Secrets logged  
    
- PII logged unnecessarily  
    
- Raw request bodies logged  
    
- Auth headers/cookies logged  
    
- Stack traces returned to users  
    
- Errors not sanitized  
    
- Missing audit logs for sensitive actions  
    
- Missing login failure logs  
    
- Missing admin action logs  
    
- Missing payment/webhook logs  
    
- Overly verbose production logs  
    
- Logs that make incident response impossible

Report:

- File/route/logger  
    
- Evidence  
    
- Risk  
    
- Recommended fix

## 16\. Dependency, Supply Chain, and Build Security Audit

Inspect:

- package files  
    
- lockfiles  
    
- workspace config  
    
- build scripts  
    
- postinstall scripts  
    
- GitHub/Git/Claude config if present  
    
- imported packages  
    
- unused dependencies  
    
- duplicated dependencies  
    
- dependency scripts  
    
- generated artifacts  
    
- CI/verify scripts

Look for:

- Known risky packages if discoverable  
    
- Unpinned or inconsistent dependencies  
    
- Suspicious scripts  
    
- Missing lockfile  
    
- Runtime dependency listed only as dev dependency  
    
- Dev dependency shipped to runtime unnecessarily  
    
- Unused dependencies increasing attack surface  
    
- Multiple libraries solving same security-sensitive task  
    
- Build scripts exposing env values  
    
- Generated files out of sync  
    
- Dependency vulnerability scan available but not run

Run only safe dependency audit commands if available and non-destructive. If package audit requires network or fails due environment, report that limitation.

## 17\. Claude Deployment, Environment, and Operational Security Audit

Inspect:

- Claude config  
    
- Deployment config  
    
- Environment variable usage  
    
- Claude Secrets assumptions  
    
- Preview/deployment behavior  
    
- Custom domain assumptions  
    
- PORT/host binding  
    
- trust proxy  
    
- health checks  
    
- production/development flags  
    
- database connection handling  
    
- logs and deployment notes  
    
- public/static folders  
    
- build outputs

Look for:

- Dev bypass in production  
    
- Missing fail-closed production checks  
    
- Secrets expected in files instead of Claude Secrets  
    
- Public env leakage  
    
- Incorrect trust proxy  
    
- Insecure cookie behavior due proxy mismatch  
    
- Wrong host binding  
    
- Overly broad preview access  
    
- Deployment logs leaking secrets  
    
- Static files exposing private artifacts  
    
- Production using test credentials  
    
- Missing startup validation for critical secrets

Report:

- Config/file  
    
- Evidence  
    
- Risk  
    
- Recommended fix

## TESTING AND VALIDATION DISCOVERY

This is an audit, not an implementation task.

Identify available safe validation commands:

- Typecheck  
    
- Build  
    
- Lint/format check  
    
- Relevant unit tests  
    
- Relevant API/server tests  
    
- Relevant frontend/component tests  
    
- Relevant E2E tests if safe  
    
- Existing verify command  
    
- Codegen check if applicable  
    
- Secret scanning command if available  
    
- Dependency audit command if available and safe  
    
- Security test command if available

Run only safe commands if helpful and non-destructive.

If a command is too risky, environment-dependent, destructive, requires unavailable secrets, requires network access, or may mutate production data, do not run it. Report why.

For each security area, identify the tests future implementation must add or update.

Do not invent missing test commands.

Do not fabricate test results.

Do not claim browser verification unless actually performed.

## DOCUMENTATION / SOURCE OF TRUTH

Do not update documentation during this audit unless explicitly instructed.

In the report, identify whether the project ledger, README, security notes, deployment notes, or another source-of-truth file should be updated after future implementation.

Only recommend documentation updates when future work creates:

- Durable completed security status  
    
- Durable security rules  
    
- Middleware ordering rules  
    
- Auth/session/cookie rules  
    
- CORS origin rules  
    
- CSP/header rules  
    
- Rate-limit thresholds  
    
- Secret handling rules  
    
- Credential rotation notes  
    
- Payment/webhook rules  
    
- AI/LLM safety rules  
    
- Migration notes  
    
- Operational instructions  
    
- Future TODOs  
    
- Known issue tracking

Do not document speculative future work as completed.

## FINDING ID FORMAT

Use these finding IDs:

- SEC-P0-001 for critical security issues  
    
- SEC-P1-001 for high-priority security issues  
    
- SEC-P2-001 for medium security issues  
    
- SEC-P3-001 for low/cleanup security issues  
    
- SEC-SECRET-001 for secret exposure or credential leak findings  
    
- SEC-AI-001 for AI/LLM/agent security findings  
    
- SEC-PAY-001 for payment/webhook security findings  
    
- SEC-DATA-001 for database/data privacy/security findings  
    
- SEC-FUTURE-001 for future hardening ideas

Each finding must include:

- Finding ID  
    
- Severity: Critical | High | Medium | Low | Info  
    
- Area  
    
- Location: file/route/config/middleware/schema/test/doc/log/bundle  
    
- Evidence without exposing secret values  
    
- Impact  
    
- Recommended action  
    
- Risk of fix  
    
- Tests needed  
    
- Manual verification required?  
    
- Human approval required?  
    
- Credential rotation required?  
    
- Git/deployment history review required?

## REQUIRED OUTPUT FORMAT

Return the report in this exact structure.

# Master Claude Project Security Audit Report

## 1\. Final Status

Use one:

- Security audit complete, no code changes made  
    
- Security audit partially complete, blocked by specific issue  
    
- Security audit not complete

## 2\. Executive Summary

Include:

- Overall security posture  
    
- Highest-risk issue  
    
- Lowest-risk/highest-value first fix  
    
- Whether implementation should proceed  
    
- Whether any issue requires urgent action  
    
- Whether any exposed-secret or credential-leak risk was found  
    
- Any major uncertainty

## 3\. Project and Security Surface Map

Include:

- Project stack found  
    
- Frontend/backend structure  
    
- Auth/session/token model  
    
- Database/data model  
    
- Admin/internal surfaces  
    
- Payment/webhook surfaces, if present  
    
- AI/LLM/automation surfaces, if present  
    
- File upload/download surfaces, if present  
    
- External integrations found  
    
- Deployment/Claude configuration found  
    
- Source-of-truth files found

## 4\. Files, Routes, Middleware, Configs, Docs, and Tests Inspected

Create a table:

| Area | Files/Routes/Configs/Docs/Tests Inspected | Notes |

|---|---|---|

## 5\. Commands Run and Results

Create a table:

| Command | Result | Pass/Fail | Notes |

|---|---|---|---|

If no commands were run, say why.

## 6\. Findings Index

Create a table:

| Finding ID | Severity | Area | Location | Summary | Recommended Action | Human Approval Required? |

|---|---|---|---|---|---|---|

## 7\. Critical and High-Priority Findings

List only Critical and High findings.

For each:

- Finding ID  
    
- Area  
    
- Location  
    
- Evidence  
    
- Impact  
    
- Recommended action  
    
- Risk of fix  
    
- Tests required  
    
- Manual verification required  
    
- Human approval required

## 8\. Secret Exposure and Credential Leak Findings

Create a table:

| Finding ID | Location | Suspected Secret Type | Exposure Surface | Evidence Without Revealing Value | Severity | Rotation Needed? | Recommended Action |

|---|---|---|---|---|---|---|---|

If no exposed secret patterns are found, say so clearly.

Include:

- Whether hardcoded credentials were found  
    
- Whether real-looking credentials appeared in docs/tests/fixtures  
    
- Whether client-side env exposure risk was found  
    
- Whether secrets are logged or returned in responses  
    
- Whether git/deployment history review is recommended  
    
- Whether key rotation is recommended

## 9\. Authentication and Identity Findings

Include:

- Current auth flows  
    
- Registration/login/logout/password reset/invite findings  
    
- Password hashing and validation findings  
    
- Identity normalization findings  
    
- User enumeration risks  
    
- Recommended fixes  
    
- Tests required

## 10\. Session, Cookie, JWT, and Token Findings

Include:

- Current session/token flow  
    
- Cookie settings  
    
- Session regeneration  
    
- Logout/session destruction  
    
- trust proxy findings  
    
- CSRF-related concerns  
    
- Token expiration/rotation concerns  
    
- Tests required

## 11\. Authorization, Roles, Permissions, and IDOR Findings

Include:

- Access model found  
    
- Protected routes inspected  
    
- Role/permission risks  
    
- Ownership/tenant scoping risks  
    
- Direct URL risks  
    
- Frontend-only gate risks  
    
- Tests/manual verification required

## 12\. Rate Limiting, Abuse Prevention, and Cost-Control Findings

Include:

- Auth limits  
    
- Public endpoint limits  
    
- Mutation limits  
    
- Upload limits  
    
- AI/LLM/provider limits, if present  
    
- Email/SMS limits, if present  
    
- Per-IP limits  
    
- Per-user/session limits  
    
- Cost-control limits  
    
- Dev/test/prod behavior  
    
- Tests required

## 13\. CORS, CSRF, Origin Trust, and Browser Boundary Findings

Include:

- Current CORS/CSRF behavior  
    
- Credentialed request concerns  
    
- Required allowed origins  
    
- Dev/preview/prod strategy  
    
- Regression risks  
    
- Tests/manual verification required

## 14\. Security Headers, Helmet, CSP, and Browser Hardening Findings

Include:

- Current header behavior  
    
- Missing headers  
    
- Helmet recommendation  
    
- CSP recommendation  
    
- External domain compatibility risks  
    
- Dev/prod strategy  
    
- Rollout strategy  
    
- Browser verification required

## 15\. API and Backend Security Findings

Create a table:

| Finding ID | Endpoint/File | Issue | Evidence | Risk | Recommended Fix | Tests Needed |

|---|---|---|---|---|---|---|

## 16\. Database and Data-Access Security Findings

Create a table:

| Finding ID | Table/Query/Schema | Issue | Evidence | Impact | Recommended Fix | Migration Needed? | Backup/Dry-Run Needed? |

|---|---|---|---|---|---|---|---|

## 17\. Frontend and Client-Side Security Findings

Create a table:

| Finding ID | File/Page/Component | Issue | Evidence | Risk | Recommended Fix | Browser Verification Required |

|---|---|---|---|---|---|---|

## 18\. File Upload, Download, Storage, and Media Security Findings

Include findings if relevant. If no upload/download/storage surface exists, say so.

## 19\. Webhook, Payment, Billing, and Subscription Security Findings

Include findings if relevant. If no payment/webhook surface exists, say so.

## 20\. AI, LLM, Agent, and Automation Security Findings

Include findings if relevant. If no AI/LLM/automation surface exists, say so.

## 21\. Admin, Setup, Debug, and Internal Tool Findings

Include:

- Admin routes  
    
- Setup routes  
    
- Debug routes  
    
- Internal tools  
    
- Dev/test bypasses  
    
- Exposed utilities  
    
- Recommended fixes

## 22\. Logging, Monitoring, Error Handling, and Audit Trail Findings

Include:

- Secret/PII logging risks  
    
- Raw error leakage  
    
- Missing audit logs  
    
- Production logging concerns  
    
- Incident-response gaps

## 23\. Dependency, Supply Chain, and Build Security Findings

Include:

- Dependency risks  
    
- Lockfile/build risks  
    
- Suspicious scripts  
    
- Vulnerability audit availability  
    
- Recommended fixes

## 24\. Claude Deployment, Environment, and Operational Security Findings

Include:

- Claude config risks  
    
- Secrets handling risks  
    
- Preview/deployment risks  
    
- trust proxy/cookie risks  
    
- Static/public exposure risks  
    
- Production fail-closed checks

## 25\. Testing and Security Coverage Gaps

Create a table:

| Finding ID | Area | Missing Test | Why It Matters | Recommended Test | Priority |

|---|---|---|---|---|---|

## 26\. Recommended Implementation Phases

Group into phases:

### Phase 1 — Urgent Security Fixes

Include Critical/High items and exposed-secret remediation if present.

### Phase 2 — Auth, Session, Cookie, and Identity Hardening

Include auth/session/identity improvements.

### Phase 3 — Access Control, IDOR, and Role Hardening

Include authorization and ownership fixes.

### Phase 4 — Rate Limits, Abuse Prevention, and Cost Controls

Include throttling and cost-control work.

### Phase 5 — Secret Handling, Logging, and Operational Security

Include secret manager, rotation, logs, env, and deployment rules.

### Phase 6 — CORS, CSRF, Security Headers, and CSP

Include browser/security-header hardening.

### Phase 7 — API, Database, File, Webhook, Payment, and AI Hardening

Include specialized hardening work.

### Phase 8 — Security Tests, Documentation, and Ongoing Guardrails

Include tests, source-of-truth updates, and future audit cadence.

For each phase include:

- Why it matters  
    
- Files likely involved  
    
- Risk level  
    
- Tests needed  
    
- Manual verification needed  
    
- Separate implementation prompt needed?

## 27\. Recommended First Implementation Prompt Label

Provide the exact next prompt label.

## 28\. Items Requiring Human Approval

List anything that should not be changed without explicit approval, especially:

- CORS origins  
    
- CSP policy  
    
- Data normalization migration  
    
- New dependencies  
    
- Rate-limit thresholds  
    
- Production env vars  
    
- Session/cookie policy changes  
    
- Credential rotation  
    
- Git history cleanup  
    
- Secret manager/environment changes  
    
- Payment/webhook middleware  
    
- AI/LLM provider behavior  
    
- Auth behavior that changes user experience  
    
- Database migrations  
    
- Data cleanup  
    
- File storage access rules

## 29\. Documentation / Source-of-Truth Recommendations

Include:

- Whether the project ledger/README/security docs should be updated after implementation  
    
- Durable security rules to document later  
    
- Secret-handling rules to document later  
    
- Credential-rotation notes needed  
    
- Middleware-ordering notes needed  
    
- Future TODOs to preserve  
    
- Items not to document as complete yet

## 30\. Completion Report

Include:

- Final status  
    
- What was audited  
    
- Files/routes/configs/docs/tests inspected  
    
- Commands run, if any  
    
- Code changes: None  
    
- Data changes: None  
    
- Schema changes: None  
    
- Config changes: None  
    
- Destructive actions: None  
    
- Secrets exposed in this report: None  
    
- Remaining risks  
    
- Recommended next step  
    
- Confirmation that unrelated areas were not modified  
    
- Confirmation that this was audit-only and no fixes were implemented

## FINAL RULES

Be precise.

Do not guess.

Do not invent.

Do not exaggerate.

Do not implement.

Do not expose secrets.

Do not mutate data.

Do not broaden the scope beyond the security audit except to document serious adjacent risks.

Do not weaken safety, auth, access, validation, security, privacy, webhook behavior, AI guardrails, payment integrity, or data integrity.

If something is unclear, mark it “Needs human review.”

Prioritize security, production safety, low-regression implementation, credential safety, privacy, and clear sequencing.

The goal is to create a reusable master security audit that reveals the real security posture of any Claude project and produces the safest possible implementation roadmap.
