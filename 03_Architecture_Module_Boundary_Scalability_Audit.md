# Architecture, Module Boundary, and Scalability Audit

## READ-FIRST INSTRUCTION

Read this entire prompt from top to bottom before taking any action.

Do not skip sections.

Do not summarize prematurely.

Do not rely on stale session context.

Do not rely on prior conversation history.

Do not assume the architecture is healthy because the app builds, typechecks, or passes tests.

Do not assume routes, modules, boundaries, providers, schemas, workflows, or source-of-truth rules are already known.

Do not begin implementation.

This is an ARCHITECTURE AUDIT-ONLY task.

Do not modify code.

Do not refactor.

Do not move files.

Do not rename files.

Do not change imports.

Do not change routes.

Do not change schemas.

Do not change migrations.

Do not change generated files.

Do not change tests.

Do not change documentation unless explicitly instructed.

Do not run destructive commands.

Do not mutate production data.

Do not expose secrets.

Your job is to inspect the actual repository, discover the real architecture, identify architecture risks with evidence, and produce a prioritized architecture improvement roadmap.

## OBJECTIVE

Perform a complete, evidence-based architecture audit covering:

1. Frontend/backend separation  
     
2. API boundaries and route organization  
     
3. Shared types, schemas, generated clients, and contract drift  
     
4. Provider adapters and third-party service boundaries  
     
5. Monolith risk in files, routes, services, and components  
     
6. Feature flags, kill switches, and environment gates  
     
7. Data flow, state flow, cache invalidation, and side effects  
     
8. Module boundaries and dependency direction  
     
9. Scalability risks  
     
10. Migration safety  
      
11. Separation of public, member/user, admin, payment, webhook, AI/automation, safety/moderation, and internal/dev-only areas  
      
12. Error-handling and logging architecture  
      
13. Test architecture  
      
14. Documentation and architecture source-of-truth quality

The final deliverable is a clear audit report with evidence, severity, architectural impact, recommended fixes, refactor risk, testing needs, approval needs, and a prioritized remediation roadmap.

Do not implement fixes during this task.

## CURRENT CONTEXT

This audit is for the current repository.

You must discover the actual project structure, stack, modules, routes, APIs, database schema, provider adapters, generated code, source-of-truth files, tests, scripts, integrations, and deployment configuration directly from the repository.

Do not assume the project uses any specific framework, database, API structure, auth system, AI provider, payment provider, routing pattern, deployment setup, or source-of-truth file until verified.

If a route, module, provider, schema, type, feature flag, source-of-truth file, test, or architectural rule is not confirmed in the repository, mark it as unknown and explain how it should be verified.

## NON-NEGOTIABLE GUARDRAILS

### Audit-Only Scope

This is audit-only.

Do not implement fixes.

Do not refactor.

Do not move files.

Do not rename files.

Do not change imports.

Do not change route registration.

Do not change API contracts.

Do not change schemas.

Do not change migrations.

Do not change generated files.

Do not change auth, access, payment, webhook, AI, safety, provider, or validation behavior.

Do not change tests.

Do not update documentation unless explicitly instructed.

If a severe architectural issue is found, document it with evidence and recommend a separate implementation prompt.

### Anti-Drift Rules

Work only on the requested architecture audit.

Do not reopen completed work.

Do not modify unrelated features, routes, UI, schemas, tests, copy, prompts, or documentation.

Do not chase stale TODOs, old session-plan items, or previously closed issues.

Do not “improve” unrelated areas while touching nearby files.

If unrelated issues are found, report them separately without fixing them unless they block the architecture audit.

### Data and Secret Safety

Do not run destructive commands.

Do not reset, seed, truncate, migrate, or mutate the database.

Do not emit DELETE, TRUNCATE, DROP, ALTER, UPDATE, or destructive SQL.

Do not delete, hide, archive, rename, normalize, or modify records.

Do not expose private user/member/customer data.

Do not expose API keys, auth secrets, payment secrets, webhook secrets, session secrets, database credentials, OAuth tokens, JWT secrets, provider keys, service credentials, environment variables, private logs, or sensitive data.

If secret leakage risk is found while auditing architecture, report only the file/path/pattern and risk. Do not reveal the secret value.

## QUALITY BAR

Every finding must be evidence-based.

Evidence may include:

- File path  
    
- Folder/module structure  
    
- Route registration  
    
- Import graph or dependency direction  
    
- API contract  
    
- Schema/table reference  
    
- Provider adapter reference  
    
- Generated client/spec relationship  
    
- Shared type usage  
    
- Feature flag usage  
    
- Middleware order  
    
- Data-flow path  
    
- Source-of-truth contradiction  
    
- Test coverage gap  
    
- Monolithic file size or responsibility concentration  
    
- Duplicated business logic  
    
- Cross-module coupling  
    
- Safely verified runtime behavior

Do not exaggerate.

Do not guess.

Do not call architecture broken unless verified.

Do not call a refactor safe unless dependency, migration, testing, and runtime risks are identified.

If evidence is incomplete, label the item “Needs human review.”

A passing typecheck/build is not enough to call architecture healthy.

Manual browser verification is required only if UI behavior is changed in a future implementation. Since this task is audit-only, identify where future browser verification will be required but do not claim browser proof unless actually performed.

## PRE-AUDIT DISCOVERY

Before writing findings, inspect the actual repository.

Discovery must include, where applicable:

1. Root project structure  
     
2. Frontend app structure  
     
3. Backend/API structure  
     
4. Shared packages  
     
5. Generated-code folders  
     
6. API specs and generated clients  
     
7. Database schemas and migrations  
     
8. Route registration and route modules  
     
9. Auth/access middleware  
     
10. Public, user/member, admin, payment, webhook, AI/automation, safety/moderation, and internal/dev-only areas  
      
11. Provider adapter or third-party integration files  
      
12. Feature flags, kill switches, and env gates  
      
13. State/data-fetching/cache patterns  
      
14. Error handling and logging patterns  
      
15. Test structure, fixtures, mocks, factories, and verify scripts  
      
16. Source-of-truth files such as README, CLAUDE.md, docs, route maps, architecture notes, deployment notes, migration notes, security notes, or implementation notes  
      
17. Claude/deployment configuration  
      
18. External integrations

Run only safe validation commands where available, such as typecheck, build, lint, tests, codegen check, dependency/import graph checks, or verify scripts.

If a command is risky, destructive, unavailable, requires secrets, requires network access, or may mutate data, do not run it. Report why.

Produce a concise discovery summary before final findings.

The discovery summary must include:

- Files/folders inspected  
    
- Main modules discovered  
    
- Main route areas discovered  
    
- Main data flows discovered  
    
- Main provider/integration boundaries discovered  
    
- Source-of-truth files inspected  
    
- Tests/scripts available  
    
- Architecture risks, blockers, or unknowns  
    
- Smallest safe future improvement approach

## FULL ARCHITECTURE AUDIT SCOPE

### 1\. Frontend / Backend Separation

Inspect frontend app structure, backend/server structure, shared code, API client usage, direct imports across boundaries, environment variables, and public/private data boundaries.

Look for:

- Frontend importing server-only logic  
    
- Backend importing UI/client logic  
    
- Shared utilities containing server-only behavior or secrets  
    
- Business logic duplicated across frontend/backend  
    
- Validation only on frontend  
    
- Types or constants drifting between layers  
    
- Client bundle exposure risk  
    
- Environment variables used on the wrong side

### 2\. API Boundary and Route Organization

Inspect API route registration, route modules, request/response schemas, validation patterns, OpenAPI/generated clients if present, public/private/internal API separation, webhook routes, and error response consistency.

Look for:

- Inconsistent response shapes  
    
- Missing validation  
    
- Missing auth/access checks  
    
- Routes returning too much data  
    
- Routes that should be internal but are public  
    
- API spec drift  
    
- Generated client drift  
    
- Route naming inconsistency  
    
- Duplicate business logic inside handlers  
    
- Route handlers doing too much  
    
- Unsafe middleware order around webhooks

### 3\. Provider Adapter Boundaries

If third-party providers exist, audit AI, payment, email, SMS, analytics, file storage, auth, or other integrations.

Look for:

- Direct SDK imports scattered across routes/components  
    
- Provider logic leaking into UI or domain logic  
    
- Routes coupled directly to one vendor  
    
- Missing adapter boundary  
    
- Missing fallback or kill switch  
    
- Weak mock/test boundary  
    
- Provider keys outside server-only context  
    
- Provider-specific response shapes leaking into business logic  
    
- Provider side effects before validation or auth checks

### 4\. Shared Types and Contracts

Inspect shared packages, generated clients, Zod schemas, OpenAPI schemas, database-derived types, frontend form types, backend validators, enums, and status constants.

Look for:

- Duplicate type definitions  
    
- Frontend/backend type drift  
    
- API spec/generated client drift  
    
- Runtime validation missing while TypeScript types exist  
    
- Validation schema not matching DB schema  
    
- Hand-edited generated files  
    
- Types imported from the wrong layer  
    
- `any` hiding contract problems  
    
- Enums/statuses duplicated in many places

### 5\. Monolith Risk

Identify oversized files, overloaded route handlers, large components, service catch-alls, utility dumping grounds, and high-change-risk files.

Look for:

- Components mixing UI, validation, API calls, state, and business logic  
    
- Routes mixing auth, validation, persistence, provider calls, and response formatting  
    
- Hard-to-test functions  
    
- Files where one change risks breaking unrelated behavior  
    
- Repeated patching around the same file/module

Recommend staged decomposition only after required tests and boundaries are identified.

### 6\. Feature Flags and Environment Gates

Audit feature flags, kill switches, preview/dev/prod gates, payment/test flags, provider disable flags, admin/setup flags, and experimental toggles.

Look for:

- Fail-open behavior  
    
- Inconsistent checks  
    
- Undocumented flags  
    
- Frontend-only enforcement  
    
- Dead flags  
    
- Missing defaults  
    
- Dev bypasses that could leak into production  
    
- Critical provider/payment/safety behavior without a kill switch

### 7\. Data Flow and State Flow

Trace major request and mutation paths from UI to API to DB/provider and back.

Look for:

- Unclear data ownership  
    
- Business logic split unpredictably across UI/API/DB  
    
- Duplicated state  
    
- Stale UI risk  
    
- Missing cache invalidation  
    
- Related records updated in multiple places  
    
- Rollups recalculated inconsistently  
    
- Direct DB access scattered too widely  
    
- Missing transactional boundaries  
    
- Partial-update risk  
    
- Provider side effects before validation  
    
- Missing audit/event trail for sensitive changes

### 8\. Module Boundaries and Dependency Direction

Inspect feature folders, services, domain logic, shared utilities, data access, provider adapters, and tests.

Look for:

- Circular dependencies  
    
- Cross-module imports that bypass intended boundaries  
    
- Shared modules depending on feature modules  
    
- Unrelated features importing each other directly  
    
- Utility modules becoming dumping grounds  
    
- Domain/persistence/provider logic living in UI components  
    
- Tests relying on private implementation details

### 9\. Scalability

Assess risks from user growth, data volume, route growth, AI/provider cost growth, file/report generation, background jobs, sessions, rate limits, webhooks, pagination, indexes, caching, and multi-instance readiness.

Look for:

- In-memory state that will fail across instances  
    
- Missing pagination  
    
- Full-table scans  
    
- Large unbounded lists  
    
- No background queue for expensive work  
    
- No idempotency on repeated external events  
    
- Local-only file assumptions  
    
- Rate limits that reset per process  
    
- Session store not production-scalable  
    
- Tests becoming too slow or brittle  
    
- Provider-cost controls that do not scale

### 10\. Migration Safety

Inspect migrations, schema evolution, backfills, cleanup scripts, seed scripts, generated schema/types, rollback notes, enum/status changes, and production data assumptions.

Look for:

- Migrations without rollback consideration  
    
- Backfills without dry-run  
    
- Destructive schema changes  
    
- Schema changes not reflected in UI/API/types  
    
- Seeds that can overwrite real data  
    
- Missing before/after counts  
    
- No orphan/dependency checks  
    
- Migrations assuming an empty database  
    
- Hard-delete/soft-delete ambiguity

### 11\. Public / User / Admin / Payment / AI Separation

Verify separation between public pages, authenticated user/member areas, admin/internal tools, payment/billing/webhooks, AI/provider routes, safety/moderation routes, and setup/dev-only routes.

Look for:

- Public routes touching private data  
    
- Member routes exposing admin data  
    
- Admin controls visible to standard users  
    
- Payment/webhook routes mixed with normal API logic  
    
- AI routes bypassing safety/validator gates  
    
- Setup routes accessible in production  
    
- Dev-only tools linked in production UI  
    
- Shared layout/nav leaking private routes  
    
- Frontend-only route guards  
    
- Direct URL access mismatch

### 12\. Error Handling and Logging Architecture

Inspect global error middleware, route-level error handling, logger usage, redaction utilities, client error display, provider errors, webhook errors, auth/payment/admin errors.

Look for:

- Raw stack traces returned to clients  
    
- Inconsistent error response shapes  
    
- Sensitive data logged  
    
- Errors swallowed silently  
    
- Duplicate try/catch patterns  
    
- Route handlers not delegating unknown errors consistently  
    
- Provider errors leaking internals  
    
- Webhook errors misclassified  
    
- Client UI showing technical errors

### 13\. Test Architecture

Inspect unit, API, frontend, E2E, fixtures, mocks, helpers, factories, teardown, CI/verify scripts, and generated-file checks.

Look for:

- Missing boundary tests  
    
- Tests coupled to private implementation details  
    
- Shared mocks drifting from real packages  
    
- Test data pollution  
    
- No teardown  
    
- Slow/flaky tests  
    
- Missing route/auth/security tests  
    
- Missing migration/data-integrity tests  
    
- Missing browser workflow tests  
    
- No source-level guard tests for critical chokepoints  
    
- Generated files not checked

### 14\. Architecture Source of Truth

Inspect README, CLAUDE.md, docs, route maps, provider docs, deployment notes, security docs, AI/safety docs, and migration notes.

Look for:

- Missing architecture summary  
    
- Outdated project status  
    
- Unclear module boundaries  
    
- Missing route map  
    
- Missing provider rules  
    
- Missing migration rules  
    
- Undocumented env/feature flags  
    
- Completed work mixed with active work  
    
- Source-of-truth files too large to be useful  
    
- Undocumented deployment assumptions  
    
- Undocumented security/auth/payment/AI boundaries

## FINDING IDS

Use:

- ARCH-P0-001 for critical architecture risks affecting safety, security, data integrity, production stability, payment/webhook, or AI boundaries  
    
- ARCH-P1-001 for high-priority boundary, monolith, route, provider, or data-flow risks  
    
- ARCH-P2-001 for medium architecture, scalability, migration, or shared-type issues  
    
- ARCH-P3-001 for organization, test architecture, documentation, or maintainability issues  
    
- ARCH-FUTURE-001 for valid deferred architecture improvements

Each finding must include:

- Finding ID  
    
- Severity: Critical | High | Medium | Low | Info  
    
- Category  
    
- Location: file/module/route/schema/package/test/doc  
    
- Evidence  
    
- Architectural impact  
    
- Recommended action  
    
- Refactor risk  
    
- Tests needed  
    
- Manual verification required?  
    
- Human approval required?  
    
- Separate implementation prompt needed?

## REQUIRED OUTPUT FORMAT

Return the report in this exact structure:

# Architecture, Module Boundary, and Scalability Audit Report

## 1\. Final Status

Use one:

- Architecture audit complete, no code changes made  
    
- Architecture audit partially complete, blocked by specific issue  
    
- Architecture audit not complete

## 2\. Executive Summary

Include architecture health, biggest risks, strongest patterns, highest-value first improvement, whether feature work should continue or pause, and major uncertainty.

## 3\. Baseline Architecture Map

Include project stack, frontend areas, backend/API areas, shared packages, generated code, database/schema areas, public/user/admin/payment/AI areas, provider/integration areas, feature flags, source-of-truth docs, and test architecture.

## 4\. Commands Run and Results

Create a table:

| Command | Result | Pass/Fail | Notes | Blocking? |

|---|---|---|---|---|

## 5\. Discovery Summary

Include files/folders/modules/routes/data flows/providers/docs/tests inspected, plus risks, blockers, and unknowns.

## 6\. Findings Index

Create a table:

| Finding ID | Severity | Category | Location | Summary | Recommended Action | Separate Prompt Needed? |

|---|---|---|---|---|---|---|

## 7\. Critical Architecture Findings

List only P0/P1 findings with evidence, impact, recommended action, refactor risk, tests, and approval needs.

## 8\. Frontend / Backend Separation Findings

## 9\. API Boundary and Route Organization Findings

## 10\. Provider Adapter Findings

## 11\. Shared Types and Contract Findings

## 12\. Monolith and Module Boundary Findings

## 13\. Feature Flag and Environment Gate Findings

## 14\. Data Flow and State Flow Findings

## 15\. Scalability Findings

## 16\. Migration Safety Findings

## 17\. Public / User / Admin / Payment / AI Separation Findings

## 18\. Error Handling and Logging Architecture Findings

## 19\. Test Architecture Findings

## 20\. Documentation / Architecture Source-of-Truth Findings

## 21\. Prioritized Architecture Backlog

Group by:

### P0 — Critical Architecture / Safety / Security / Data Integrity

### P1 — Boundary / Monolith / Provider / Route Risks

### P2 — Shared Types / Data Flow / Migration / Scalability

### P3 — Test Architecture / Documentation / Maintainability

### Future Backlog

Each item must include why it matters, evidence, likely files/routes/modules, implementation approach, verification steps, approval need, and prompt need.

## 22\. Recommended Implementation Order

Use this order unless discovery proves otherwise:

1. Protect safety/security/payment/webhook/AI boundaries  
     
2. Add tests around critical boundaries  
     
3. Centralize contracts/shared types where drift risk is high  
     
4. Separate public/user/admin/payment/AI route areas where needed  
     
5. Extract provider adapters where direct coupling exists  
     
6. Split monolith files only after tests exist  
     
7. Improve data/cache/state boundaries  
     
8. Improve migration and scalability patterns  
     
9. Update architecture source-of-truth docs

## 23\. Items Requiring Human Approval

List anything that should not be moved, renamed, refactored, centralized, migrated, deleted, documented, or changed without approval.

## 24\. Items Intentionally Not Touched

Confirm no code, data, routes, schemas, migrations, tests, docs, production records, destructive commands, or secrets were changed or exposed.

## 25\. Final Recommendation

Give the first architecture improvement to implement and why.

## Completion Report

Include final status, what was audited, files/folders/routes/modules inspected, commands run, code/data/schema/route changes as “None,” destructive actions as “None,” secrets exposed as “None,” remaining risks, future items, confirmation unrelated areas were not modified, and next prompt label.

## FINAL RULES

Be precise.

Do not guess.

Do not invent.

Do not implement.

Do not mutate data.

Do not expose secrets.

Do not recommend broad refactors without tests and staged migration.

Do not weaken safety, security, auth, payment, webhook, AI, validation, privacy, or data integrity.

If unclear, mark “Needs human review.”

The goal is to determine whether the architecture can safely support continued growth without becoming fragile, monolithic, hard to test, risky to migrate, or dangerous to change.
