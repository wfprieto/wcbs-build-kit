# \[PROJECT NAME\] Super Overall System Audit: Bugs, UI Workflow, Architecture, Security, Code Quality, and Cleanup

## READ-FIRST INSTRUCTION

Read this entire prompt from top to bottom before taking any action.

Do not skip sections.

Do not summarize prematurely.

Do not rely on stale session context.

Do not rely on prior conversation history.

Do not assume anything has already been tested, fixed, verified, or completed.

Do not assume the app works because typecheck, build, lint, or automated tests pass.

Do not begin implementation until discovery is complete.

This is an AUDIT-FIRST task.

Your job is to inspect the actual repository, discover the real system, verify the real behavior, identify risks and defects with evidence, and produce a prioritized remediation plan.

Default mode is AUDIT-ONLY.

You may make only tiny, clearly safe, directly related fixes if all of the following are true:

1. The issue is confirmed with evidence.  
     
2. The fix is low-risk and reversible.  
     
3. The fix does not touch architecture, schema, auth, payments, safety policy, production data, generated files, or broad refactors.  
     
4. The fix can be verified immediately.  
     
5. The completion report clearly separates audit findings from fixes applied.

If there is any doubt, do not fix. Report it for separate approval.

## OBJECTIVE

Perform a complete, evidence-based system audit covering:

1. Bugs and regressions  
     
2. Core product behavior  
     
3. AI/automation behavior, if present  
     
4. Safety, moderation, compliance, or policy behavior, if present  
     
5. UI workflow and real-user click paths  
     
6. Architecture  
     
7. Security and privacy  
     
8. Auth, roles, permissions, and subscription/access gating, if present  
     
9. Backend/API routes  
     
10. Database/schema/data integrity  
      
11. Code quality and maintainability  
      
12. Dead code, unused files, duplicate logic, and stale comments  
      
13. Frontend routing, navigation, buttons, forms, modals, dropdowns, filters, and state handling  
      
14. Error, loading, empty, disabled, and stale UI states  
      
15. Test coverage and validation quality  
      
16. Performance and efficiency  
      
17. Styling/design-system consistency  
      
18. Documentation and source-of-truth drift  
      
19. Stale, malformed, duplicate, orphaned, demo, or test data exposure  
      
20. Deployment and production-readiness risks  
      
21. Webhook/payment/security-sensitive surfaces, if present  
      
22. Items that should be fixed now versus deferred for separate approval

The final deliverable must be a clear audit report with evidence, severity, recommended fixes, verification requirements, and a prioritized next-step backlog.

The operating principle is:

Audit wide. Fix narrow. Prove everything.

## CURRENT CONTEXT

This audit is for the current repository and project.

Known project intent:

- Discover the actual project purpose, stack, architecture, routes, data model, source-of-truth documents, tests, scripts, integrations, deployment setup, and business rules directly from the repository.  
    
- Do not assume the app type, framework, database, API style, auth system, user roles, product modules, or completed work until verified.  
    
- If the project includes AI, automation, safety, moderation, payments, subscriptions, user-generated content, admin tools, private data, reporting, file uploads/downloads, external integrations, or production-facing workflows, audit those areas carefully.  
    
- Any existing safety, security, privacy, validation, auth, access-control, billing, webhook, compliance, or data-integrity behavior must not be weakened.  
    
- Any project source-of-truth files such as README files, project ledgers, docs, schema files, tests, implementation notes, deployment notes, or operational notes must be discovered and verified in the repository before relying on them.

Do not invent unverified project facts, routes, files, schemas, APIs, libraries, tests, roles, statuses, workflows, integrations, or completed work. If a fact is uncertain, discover it in the codebase or mark it as unknown.

## NON-NEGOTIABLE GUARDRAILS

### Scope Guardrails

Work only on this audit task.

Do not reopen completed work.

Do not chase stale TODOs, old session-plan items, or previously closed issues.

Do not improve unrelated areas while touching nearby files.

Do not modify unrelated features, routes, UI, schemas, tests, copy, docs, or configuration.

If unrelated issues are found, report them separately without fixing them unless they block the audit.

### No-Destructive-Action Guardrails

Do not run destructive commands.

Do not delete files.

Do not delete records.

Do not soft-delete records.

Do not archive records.

Do not rename files or records.

Do not reset, truncate, or seed the database.

Do not run migrations that change data.

Do not emit DELETE, TRUNCATE, DROP, ALTER, UPDATE, or destructive SQL.

Do not run cleanup scripts that mutate data.

Do not mutate append-only, audit, ledger, billing, payment, access, admin, event, safety, or compliance tables if present.

Do not modify production data.

Do not use real customer/member/user data in unsafe tests.

### Architecture and Security Guardrails

Do not change database schema without separate approval.

Do not modify migrations without separate approval.

Do not alter auth, roles, entitlements, permissions, sessions, subscription gates, payment/webhook logic, safety policy, or access-control behavior without separate approval.

Do not remove feature flags or kill switches.

Do not introduce a new AI provider path unless explicitly approved.

Do not bypass any existing safety, validation, auth, or access-control pipeline.

Do not weaken validation, auth, safety, security, privacy, or data integrity.

Do not hand-edit generated files.

Do not rename public API routes, DB columns, webhook endpoints, external integration paths, or source-of-truth identifiers as “cleanup.”

### Secret and Privacy Guardrails

Do not print, log, expose, summarize, or return secret values.

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

If secret leakage risk is found, report only the file/path/pattern and risk. Do not reveal the secret value.

### Evidence Guardrails

Every finding must include evidence.

Evidence may include:

- File path  
    
- Function/component name  
    
- Route  
    
- Schema/table  
    
- Command result  
    
- Test result  
    
- Browser behavior  
    
- API response  
    
- Source-of-truth contradiction  
    
- Dependency/reference search result  
    
- Data pattern  
    
- Console/network behavior

Do not exaggerate severity.

Do not mark anything as broken unless verified.

Do not mark anything as working unless verified.

Do not mark anything as unused unless dependency/reference checks support it.

Do not mark anything safe to delete unless dependency checks support it.

If evidence is incomplete, label the item “Needs human review.”

## QUALITY BAR

A passing typecheck, test, lint, or build is not enough to call a user-facing workflow healthy.

Do not mark any UI control or workflow as complete unless it has been manually tested in the browser, where browser testing is available.

For every button, dropdown, checkbox, form field, filter, modal, save/cancel action, edit action, delete/release/archive action, upload/download action, generated-file action, and navigation link inspected or changed, verify or explicitly flag whether:

1. It renders correctly.  
     
2. It can be interacted with.  
     
3. It performs the intended action.  
     
4. It persists or updates data correctly when applicable.  
     
5. It survives reload/navigation.  
     
6. It does not create console errors, runtime overlays, duplicate requests, unexpected 4xx/5xx responses, stale UI, or broken state.  
     
7. It works across relevant variants, including happy path, empty state, loading state, error state, permission-restricted state, and non-happy-path cases.

If browser testing is unavailable, say so clearly and provide the exact future verification checklist.

## WORKFLOW PROOF REQUIREMENTS

For any workflow audited or touched:

- Save flow: prove or require proof of input → validation → save → reload → persisted value.  
    
- Edit flow: prove or require proof of edit → save → reload → updated value.  
    
- Delete/release/archive flow: prove or require proof of action → related records update → list/detail refresh → reload → correct state.  
    
- Generated file/report flow: prove or require proof of create → status update → download/open.  
    
- Upload/import flow: prove or require proof of upload → validation → processing → result state → reload.  
    
- Dropdown/filter/search flow: prove or require proof that selection/search changes displayed results correctly.  
    
- Checkbox flow: prove or require proof that checked/unchecked state updates correctly, persists where applicable, and does not create render loops or duplicate updates.  
    
- Navigation flow: prove or require proof that the route/link works from all relevant entry points.  
    
- Access flow: prove or require proof for logged-out, allowed, denied, restricted, standard user, admin/moderator/manager, and direct-URL cases where applicable.

## REQUIRED DISCOVERY PHASE

Before making any changes or writing final findings, inspect the actual repository.

Discovery must identify:

### 1\. Project Structure

- Root directories  
    
- Frontend app structure  
    
- Backend/server structure  
    
- Shared packages  
    
- Generated code folders  
    
- Config files  
    
- Scripts  
    
- Docs/source-of-truth files  
    
- Fixture/seed/test-data locations  
    
- Deployment configuration  
    
- Integration-specific folders

### 2\. Stack

- Frontend framework, if present  
    
- Backend framework, if present  
    
- Database/ORM, if present  
    
- Auth/session system, if present  
    
- Routing approach  
    
- API client/codegen approach, if present  
    
- Test framework  
    
- Build system  
    
- Package manager  
    
- Lint/format tools  
    
- Browser/e2e tooling  
    
- External integrations  
    
- Deployment configuration

### 3\. Source of Truth

Inspect source-of-truth files if present:

- README files  
    
- Project ledgers  
    
- Docs  
    
- Implementation notes  
    
- Schema files  
    
- Migrations  
    
- API spec files  
    
- Seed/demo/test data files  
    
- Scripts  
    
- Route maps  
    
- Task logs  
    
- Deployment notes  
    
- Compliance/security notes  
    
- Known issue lists

Use these documents to understand expected behavior, but verify against code and runtime behavior.

### 4\. Functional Surface

Identify:

- Main frontend routes/pages  
    
- Main API route areas  
    
- Main public pages  
    
- Main user/member/customer pages  
    
- Main admin/moderation/management pages, if present  
    
- Main workflows  
    
- Main forms/modals/tables/lists  
    
- Main data entities  
    
- Main navigation paths  
    
- Main role/access-controlled surfaces  
    
- Main AI/automation/safety surfaces, if present  
    
- Main external integrations  
    
- Main background jobs or scheduled tasks, if present

### 5\. Tests and Scripts

Identify and run safe commands where available:

- Typecheck  
    
- Build, if safe  
    
- Lint/format check  
    
- Unit tests  
    
- API/server tests  
    
- Frontend/component tests  
    
- E2E tests, if safe  
    
- Existing verify command  
    
- Codegen check, if applicable

If a command does not exist, report that it does not exist.

If a command is risky, destructive, environment-dependent, requires unavailable secrets, or may mutate production data, do not run it. Report why.

### 6\. Data and Schema

Safely inspect:

- Schema files  
    
- Migrations  
    
- Seed files  
    
- Fixtures  
    
- Demo/test data scripts  
    
- E2E data factories  
    
- Production cleanup scripts  
    
- Status enums  
    
- Soft-delete patterns  
    
- Foreign-key/dependency behavior  
    
- Append-only tables  
    
- Import/export flows  
    
- Generated records  
    
- Integration-created records  
    
- Orphan risks  
    
- Legacy statuses  
    
- Malformed records

Do not change data.

### 7\. Discovery Summary

Before the final audit report, produce a concise discovery summary covering:

- Files/routes/components inspected  
    
- Workflows inspected  
    
- Existing behavior found  
    
- Data/schema/API implications  
    
- Tests available  
    
- Source-of-truth docs inspected  
    
- Risks, blockers, and unknowns  
    
- Likely root causes where applicable  
    
- Smallest safe future implementation approach

## FULL AUDIT SCOPE

### 1\. Core Product and Business Logic Audit

Inspect:

- Core product workflows  
    
- Business-rule enforcement  
    
- User-facing promises versus actual behavior  
    
- Source-of-truth rules versus implementation  
    
- Role-specific behavior  
    
- Data lifecycle behavior  
    
- Feature flags and environment-specific behavior  
    
- Recently changed or high-risk areas  
    
- Any logic that could create incorrect outcomes, bad records, misleading UI, or operational confusion

Do not assume business logic. Verify it from code, docs, tests, and observed behavior.

### 2\. AI, Automation, Safety, and Policy Audit, If Present

Inspect:

- AI provider adapter boundaries  
    
- Prompt/orchestration logic  
    
- Automation triggers  
    
- Deterministic rules/classifiers  
    
- Human review or escalation paths  
    
- Safety, moderation, compliance, or refusal behavior  
    
- Prompt-injection risks  
    
- Model/provider kill switches  
    
- Logging/audit trails for AI or automation decisions  
    
- Any place AI/automation can mutate data, send messages, expose private data, or bypass validation  
    
- Any canned, generic, unsafe, biased, manipulative, or policy-violating behavior

Do not run live model selection, live automation, mass messaging, or production-impacting AI workflows unless explicitly approved.

### 3\. UI Workflow and Click-Path Audit

Inspect and test where possible:

- Homepage/public navigation, if present  
    
- Main dashboard(s)  
    
- Header/sidebar/footer links  
    
- Hash/anchor links  
    
- Login/logout and auth routing  
    
- User/member/customer area access  
    
- Admin/moderation/management access, if present  
    
- Main create/edit/delete/release/archive workflows  
    
- Chat/message/workflow action flows, if present  
    
- Profile/account/settings flows, if present  
    
- Subscription/payment/access flows, if present  
    
- Mobile/narrow viewport basics  
    
- Empty/loading/error/disabled states  
    
- Back/forward behavior  
    
- Refresh/reload persistence  
    
- Console/network errors  
    
- Duplicate request loops  
    
- Broken buttons  
    
- Dead links  
    
- Confusing labels  
    
- Stale UI after mutations

### 4\. Architecture Audit

Review:

- Frontend/backend separation  
    
- API route organization  
    
- Shared types and generated client usage  
    
- AI/automation/provider adapter design, if present  
    
- Orchestration boundaries  
    
- Safety/validation chokepoints  
    
- Feature flag and kill-switch design  
    
- Database schema organization  
    
- Auth and role-based access architecture  
    
- Subscription/access-gating architecture, if present  
    
- Error-handling architecture  
    
- Logging and audit trail architecture  
    
- Test architecture  
    
- Migration safety  
    
- Deployment readiness  
    
- Coupling between modules  
    
- Duplicate or competing sources of truth  
    
- Separation between public, authenticated user, admin, payment, reporting, AI, and integration systems  
    
- Sensitive data boundaries  
    
- Future scaling fragility

Do not perform a major refactor during this audit.

### 5\. Security and Privacy Audit

Inspect:

- Authentication enforcement  
    
- Authorization and role checks  
    
- Protected routes  
    
- Public/private API exposure  
    
- Admin/moderator/manager-only functions  
    
- User/member/customer-only functions  
    
- Subscription/access gates, if present  
    
- Object ownership checks  
    
- Direct object reference risks  
    
- Client-supplied role/entitlement trust  
    
- Sensitive data exposure  
    
- Prompt injection risks, if AI exists  
    
- Automation bypass risks, if automation exists  
    
- Unsafe logging of private messages/data  
    
- Secrets and env handling  
    
- Error messages leaking internals  
    
- Rate limiting or abuse protection gaps  
    
- CSRF/CORS/session/cookie risks, if applicable  
    
- File upload risks, if applicable  
    
- Database query safety  
    
- Input validation  
    
- Output validation  
    
- Audit logs for security-sensitive events  
    
- Payment/webhook security planning or implementation, if present  
    
- Data retention/deletion/export considerations  
    
- Privacy risks around user-generated content, private records, emotional disclosures, financial data, health data, legal data, or other sensitive data if present  
    
- Compliance planning risks where applicable

Do not attack the app. This is a defensive review only.

### 6\. Backend/API Audit

Inspect:

- API routes  
    
- Middleware  
    
- Service functions  
    
- Validators  
    
- Auth/permissions  
    
- Subscription checks, if present  
    
- Error handling  
    
- Logging  
    
- API/spec alignment  
    
- Generated client alignment  
    
- External integrations  
    
- Background jobs  
    
- Webhooks, read-only unless explicitly approved

Look for:

- Missing validation  
    
- Inconsistent response shapes  
    
- HTML errors instead of JSON  
    
- Duplicate business logic  
    
- Missing 400/401/403/404 handling  
    
- Missing permission checks  
    
- Missing ownership checks  
    
- Unsafe deletes/updates  
    
- Incomplete sync logic  
    
- Missing audit logs where important  
    
- API/client mismatch  
    
- API spec drift  
    
- Secret leakage risk  
    
- Environment-specific behavior not guarded

### 7\. Database and Data Integrity Audit

Inspect:

- Schemas  
    
- Relationships  
    
- Constraints  
    
- Nullable fields  
    
- Status enums  
    
- Date/string handling  
    
- Soft-delete patterns  
    
- Ownership/account scoping  
    
- Audit log tables  
    
- User/member/customer status fields  
    
- Billing/payment fields, if present  
    
- Thread/reply/comment relationships, if present  
    
- Visibility/boundary/privacy settings, if present  
    
- Import/export flows  
    
- Rollups and related-record sync  
    
- Fields used by backend but missing from UI  
    
- Fields editable in UI but ignored by backend  
    
- Legacy columns or statuses  
    
- Orphan risks  
    
- Missing indexes where obvious

Do not migrate anything. Recommend migration only as a separate approval item.

### 8\. Code Quality and Cleanup Audit

Look for:

- Dead imports  
    
- Unused variables  
    
- Unused exports  
    
- Duplicate helper logic  
    
- Duplicate validation/safety/access logic  
    
- Overly large files  
    
- Components doing too much  
    
- API route duplication  
    
- Hardcoded strings that should be constants  
    
- Hardcoded categories/statuses that risk drift  
    
- Stale TODO/FIXME/HACK comments  
    
- Commented-out code  
    
- Outdated comments  
    
- Temporary logic that became permanent  
    
- Deprecated files  
    
- Confusing naming  
    
- Inconsistent casing  
    
- Type suppressions such as @ts-ignore, @ts-expect-error, eslint-disable, biome-ignore  
    
- any/unknown widening that hides bugs  
    
- Missing shared types  
    
- Generated files out of sync  
    
- Test helpers accidentally imported by production code

### 9\. Frontend Component and State Audit

Inspect:

- Components  
    
- Pages  
    
- Hooks  
    
- API calls  
    
- Forms  
    
- Tables  
    
- Modals/drawers  
    
- State management  
    
- Query/cache invalidation  
    
- Routing  
    
- Error boundaries  
    
- Loading states  
    
- Empty states

Look for:

- Duplicate components  
    
- Overloaded components  
    
- Inconsistent modal behavior  
    
- Missing validation  
    
- Bad query invalidation  
    
- Stale UI after save/delete  
    
- Tables not refreshing  
    
- Race conditions  
    
- Render loops  
    
- Duplicate requests  
    
- Forms missing defaults or reset behavior  
    
- Broken cancel/close/back behavior  
    
- Error and data rendering at the same time

### 10\. Workflow Efficiency Audit

For major workflows, assess:

- Number of clicks  
    
- Number of screens/pages  
    
- Repeated inputs  
    
- Screen hopping  
    
- Repeated searches  
    
- Avoidable reloads  
    
- Unclear decision points  
    
- Manual steps that could be safely automated  
    
- Opportunities for smart defaults  
    
- Opportunities for direct links after save  
    
- Opportunities for inline actions  
    
- Opportunities to preserve filters  
    
- Opportunities to reduce mouse movement and operational friction

Do not implement efficiency changes during the audit unless tiny and explicitly safe.

### 11\. Legacy, Stale, Test, and Malformed Record Audit

Look for:

- E2E test records  
    
- Demo records  
    
- Placeholder records  
    
- Duplicate records  
    
- Malformed records  
    
- Orphaned records  
    
- Invalid status values  
    
- Legacy statuses  
    
- Records tied to deleted/inactive parents  
    
- Test data visible in production UI  
    
- Unsafe cleanup scripts  
    
- Data factories without teardown  
    
- Generated records without cleanup

Do not clean anything up.

For any cleanup recommendation, include:

- Dry-run plan  
    
- Backup/export/snapshot requirement  
    
- Dependency checks  
    
- Before/after count requirements  
    
- Rollback notes  
    
- Human approval requirement  
    
- Whether hard delete, soft delete, archive, hide, or no action is appropriate

### 12\. API Spec, Codegen, and Dependency Drift Audit

If API specs or generated clients exist:

- Compare API spec to implemented routes.  
    
- Compare generated clients to API spec.  
    
- Run safe codegen check if available.  
    
- Do not hand-edit generated files.  
    
- Report drift clearly.

Inspect dependency files for:

- Missing runtime dependencies  
    
- Runtime dependencies incorrectly listed as devDependencies  
    
- Build/test tools incorrectly listed as dependencies  
    
- Workspace version inconsistencies  
    
- Unused dependencies  
    
- Imported but undeclared packages  
    
- Duplicate libraries solving the same problem  
    
- Scripts pointing to missing files

### 13\. Test Coverage Audit

Identify available and missing coverage for:

- Core business logic  
    
- Safety/moderation/compliance behavior, if present  
    
- AI/automation behavior, if present  
    
- Validator behavior  
    
- Provider/adapter boundaries, if present  
    
- Kill switch behavior, if present  
    
- Navigation  
    
- Dropdowns  
    
- Filters  
    
- Create/edit/delete/release/archive flows  
    
- Save → reload → persisted value  
    
- Connected data sync  
    
- Role/access behavior  
    
- API validation  
    
- Security-sensitive routes  
    
- Error/loading/empty states  
    
- Generated/downloaded files  
    
- Upload/import flows  
    
- Payment/webhook handlers, read-only unless explicitly approved  
    
- Recent bug fixes needing regression tests

Do not create broad test suites during the audit unless a tiny safe regression test is clearly justified.

### 14\. Performance and Efficiency Audit

Look for:

- Duplicate network requests  
    
- Over-fetching  
    
- Missing pagination  
    
- Expensive rendering  
    
- Repeated calculations  
    
- Inefficient filtering  
    
- Slow queries  
    
- Missing indexes where obvious  
    
- Large components loading too much data  
    
- Unnecessary polling  
    
- Cache invalidation too broad or too narrow  
    
- Unbounded list rendering  
    
- Oversized payloads  
    
- Expensive browser-side transformations

### 15\. Styling and Design-System Audit

Inspect:

- Palette/token consistency  
    
- Hardcoded colors  
    
- Tailwind/class sprawl or ad hoc styling  
    
- Spacing consistency  
    
- Typography consistency  
    
- Button consistency  
    
- Card/table consistency  
    
- Modal/drawer consistency  
    
- Z-index conflicts  
    
- Destructive-action styling  
    
- Success/error/warning language  
    
- Accessibility issues obvious from code  
    
- Responsive behavior

### 16\. Documentation and Project Ledger Audit

Inspect:

- README files  
    
- Docs  
    
- Task logs  
    
- Implementation notes  
    
- Source-of-truth files  
    
- Setup/deployment notes  
    
- Test command notes  
    
- Data cleanup notes  
    
- Known issue lists

Look for:

- Completed work still listed as open  
    
- Open work missing context  
    
- Incorrect project status  
    
- Missing setup instructions  
    
- Missing test commands  
    
- Missing deployment notes  
    
- Documentation drift from code  
    
- Future TODOs mixed with completed work  
    
- Speculative future work presented as completed  
    
- Missing operational warnings

Do not update documentation during audit unless explicitly instructed or unless a tiny ledger update is required and safe. Recommend documentation updates separately.

## FINDING ID FORMAT

Assign every finding a stable ID.

Use:

- SYS-P0-001 for critical safety/security/data-integrity/blocking production issues  
    
- SYS-P1-001 for major broken workflow, safety regression, or security gap  
    
- SYS-P2-001 for important backend/API/database/test issues  
    
- SYS-P3-001 for code quality, maintainability, architecture, or cleanup issues  
    
- SYS-P4-001 for UI/UX, workflow efficiency, performance, or polish issues  
    
- SYS-P5-001 for documentation/source-of-truth issues  
    
- SYS-FUTURE-001 for valid but intentionally deferred future work

Each finding must include:

- Finding ID  
    
- Severity: Critical | High | Medium | Low | Info  
    
- Category  
    
- Location: file/route/table/component/workflow  
    
- Evidence  
    
- Impact  
    
- Recommended action  
    
- Risk of fix  
    
- Tests needed  
    
- Manual browser verification required?  
    
- Human approval required?

## REQUIRED FINAL REPORT FORMAT

Return the final report in this structure.

# \[PROJECT NAME\] Super Overall System Audit Report

## 1\. Final Status

Use one:

- Audit complete, no code changes made  
    
- Audit complete, safe cleanup changes made  
    
- Audit complete, bugs found and safe fixes applied  
    
- Audit partially complete, blocked by specific issue  
    
- Audit not complete

## 2\. Executive Summary

Include:

- Overall project health  
    
- Biggest risks  
    
- Biggest strengths  
    
- Highest-value first move  
    
- Whether feature work should continue or pause  
    
- Any major uncertainty

## 3\. Baseline System Map

List:

- Frontend stack, if present  
    
- Backend stack, if present  
    
- Database/ORM, if present  
    
- Auth system, if present  
    
- Routing approach  
    
- API/client/codegen approach, if present  
    
- Test system  
    
- Package manager  
    
- Main directories  
    
- Main frontend routes  
    
- Main API areas  
    
- Main workflows  
    
- Feature flags/kill switches found  
    
- External integrations found  
    
- Source-of-truth docs found

## 4\. Commands Run and Results

Create a table:

| Command | Result | Pass/Fail | Notes | Blocking? |

|---|---|---|---|---|

If not run, explain why.

## 5\. Discovery Summary

Include:

- Files/routes/components inspected  
    
- Workflows inspected  
    
- Existing behavior found  
    
- Data/schema/API implications  
    
- Tests available  
    
- Source-of-truth docs inspected  
    
- Risks/blockers/unknowns  
    
- Smallest safe future implementation approach

## 6\. Findings Index

Create a table:

| Finding ID | Severity | Category | Location | Summary | Recommended Action | Human Approval Required? |

|---|---|---|---|---|---|---|

## 7\. Critical Findings

Include only P0/P1 findings affecting safety, security, data integrity, core workflows, or production stability.

For each:

- Finding ID  
    
- Priority  
    
- Location  
    
- Finding  
    
- Evidence  
    
- Impact  
    
- Recommended action  
    
- Risk of fix  
    
- Suggested test coverage  
    
- Manual browser verification needed  
    
- Human approval required

## 8\. Core Product and Business Logic Findings

Include:

- Confirmed core behavior  
    
- Any gaps found  
    
- Source-of-truth mismatches  
    
- Business-rule drift  
    
- User-facing promise versus implementation mismatches  
    
- Recommended next action

## 9\. AI, Automation, Safety, and Policy Findings, If Present

Include:

- Confirmed AI/automation/safety behavior  
    
- Any gaps found  
    
- Duplicate safety or automation logic  
    
- Provider/adapter risks  
    
- Validator risks  
    
- Kill-switch risks  
    
- Prompt-injection or bypass risks  
    
- Recommended next action

If the project has no AI, automation, safety, or policy system, state that none was found.

## 10\. UI Workflow and Click-Path Findings

Create a table:

| Finding ID | Workflow/Page | Control/Action | Current Behavior | Expected Behavior | Evidence | Recommended Fix | Browser Verification Required |

|---|---|---|---|---|---|---|---|

## 11\. Architecture Findings

Create a table:

| Finding ID | Area | Finding | Evidence | Impact | Recommendation | Separate Prompt Needed? |

|---|---|---|---|---|---|---|

## 12\. Security, Access, Privacy, Logging, and Secret Safety Findings

Create a table:

| Finding ID | Area | Issue | Evidence | Severity | Recommended Fix | Verification Needed |

|---|---|---|---|---|---|---|

## 13\. Backend/API Findings

Create a table:

| Finding ID | Endpoint/File | Issue | Evidence | Risk | Recommended Fix | Tests Needed |

|---|---|---|---|---|---|---|

## 14\. Database and Data Integrity Findings

Create a table:

| Finding ID | Table/Schema | Issue | Evidence | Impact | Recommended Fix | Migration Needed? | Backup/Dry-Run Needed? |

|---|---|---|---|---|---|---|---|

## 15\. Code Quality and Cleanup Findings

Create a table:

| Finding ID | File | Issue | Evidence | Why It Matters | Recommended Cleanup | Risk | Tests Needed |

|---|---|---|---|---|---|---|---|

## 16\. Legacy, Stale, Test, or Malformed Record Findings

Create a table:

| Finding ID | Table/Source/UI Location | Pattern/Issue | Count If Known | Dependency Risk | Safe To Remove? | Recommended Action | Backup/Approval Required |

|---|---|---|---|---|---|---|---|

## 17\. API Spec, Codegen, and Dependency Drift Findings

Create a table:

| Finding ID | Area | Issue | Evidence | Impact | Recommended Fix | Checks Needed |

|---|---|---|---|---|---|---|

## 18\. Test Coverage Gaps

Create a table:

| Finding ID | Area | Missing Test | Why It Matters | Recommended Test | Priority |

|---|---|---|---|---|---|

## 19\. Performance and Efficiency Findings

Create a table:

| Finding ID | Area | Inefficiency | Evidence | Impact | Recommended Improvement | Priority |

|---|---|---|---|---|---|---|

## 20\. Styling and Design-System Findings

Create a table:

| Finding ID | File/Page/Component | Issue | Evidence | Recommended Cleanup | Priority | Browser Verification Required |

|---|---|---|---|---|---|---|

## 21\. Documentation and Source-of-Truth Findings

Create a table:

| Finding ID | File/Doc/Location | Issue | Evidence | Recommended Cleanup | Safe To Change? | Priority |

|---|---|---|---|---|---|---|

## 22\. Safe Fixes Applied, If Any

If fixes were applied, include:

- Bug fixed  
    
- Root cause  
    
- Files changed  
    
- Why the fix was safe  
    
- Tests/checks run  
    
- Browser verification performed  
    
- Confirmation that safety/security/data integrity were not weakened

If no fixes were applied, say:

No code, data, schema, route, test, or documentation changes were made.

## 23\. Files Changed

List every changed file and why.

If no files changed, say so.

## 24\. Verification Results

Include:

- Exact commands run  
    
- Results  
    
- Browser workflows tested, if any  
    
- Console/network checks, if any  
    
- What could not be verified  
    
- What still requires manual verification

## 25\. Prioritized Remediation Backlog

Group by:

### P0 — Must Fix Before More Feature Work

### P1 — Should Fix Next

### P2 — Important Backend/API/Database/Test Work

### P3 — Architecture / Code Quality / Maintainability

### P4 — UI/UX / Workflow Efficiency / Performance / Polish

### P5 — Documentation / Source of Truth

### Future Backlog

Each item must include:

- Finding ID  
    
- Task title  
    
- Why it matters  
    
- Evidence  
    
- Likely files/routes/tables involved  
    
- Recommended implementation approach  
    
- Suggested verification steps  
    
- Human approval needed?  
    
- Separate implementation prompt needed?

## 26\. Recommended Implementation Order

Use this order unless discovery proves a better one:

1. Safety, security, data-integrity, and access-control issues  
     
2. Tests and guardrails for critical behavior  
     
3. Broken user-facing workflows  
     
4. Backend/API consistency issues  
     
5. Database/data cleanup planning with dry-runs and backups  
     
6. AI/automation quality improvements after safety and access stability, if applicable  
     
7. Architecture cleanup and centralization  
     
8. UI workflow efficiency and click reduction  
     
9. Styling/design-system polish  
     
10. Documentation/source-of-truth updates

## 27\. Items Requiring Human Approval Before Action

List anything that should not be deleted, hidden, archived, renamed, migrated, refactored, bulk-updated, or documented without explicit approval.

## 28\. Items Intentionally Not Touched

Confirm:

- No destructive commands were run.  
    
- No production data was changed.  
    
- No records were deleted, hidden, archived, or modified.  
    
- No schema or migration changes were made.  
    
- No auth/access/payment/safety behavior was weakened.  
    
- No secrets were logged or exposed.  
    
- No unrelated areas were modified.  
    
- No generated files were hand-edited.  
    
- No broad refactors were performed.  
    
- No live AI/model/automation run was performed unless explicitly approved.

## 29\. Safe Stopping Point Recommendation

State clearly:

- Whether this is a good stopping point  
    
- What is stable  
    
- What remains risky  
    
- Whether feature work should resume or pause  
    
- The recommended next prompt label

## 30\. Completion Report

Include:

- Final status: Complete, Partially Complete, or Not Complete  
    
- What was audited  
    
- Files/areas inspected  
    
- Commands/checks run and results  
    
- Browser verification performed, if any  
    
- Browser verification still required  
    
- Schema/API/data changes: None unless explicitly approved  
    
- Data cleanup performed: None unless explicitly approved  
    
- Destructive actions performed: None  
    
- Remaining risks or unresolved items  
    
- Future items intentionally not completed  
    
- Confirmation that unrelated areas were not modified  
    
- Confirmation that no secret values were logged or exposed  
    
- Confirmation that safety, auth, access, validation, security, privacy, and data integrity were not weakened

## FINAL RULES

Be brutally accurate.

Do not guess.

Do not invent.

Do not exaggerate.

Do not hide uncertainty.

Do not mark anything broken unless verified.

Do not mark anything healthy unless verified.

Do not mark anything unused unless dependency/reference checks support it.

Do not mark anything safe to delete without dependency checks.

Do not perform destructive actions.

Do not weaken safety, security, validation, auth, access control, privacy, or data integrity.

If something is unclear, mark it as “Needs human review.”

Prefer root-cause findings over surface-level observations.

Prioritize safety, security, data integrity, production stability, maintainability, user workflow completion, and professional usability.

The goal is to make the project cleaner, safer, more stable, easier to maintain, easier to use, more trustworthy, and ready for the next focused implementation phase.
