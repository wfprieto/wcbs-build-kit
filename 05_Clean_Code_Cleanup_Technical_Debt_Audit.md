TITLE:

Full and Complete project-phoenix-ai-coach-full-root-cause-audit-and-workflow-quality-test

READ-FIRST INSTRUCTION:

Read this entire prompt from top to bottom before taking any action.

Do not skip sections.

Do not summarize prematurely.

Do not rely on stale session context.

Do not rely on prior conversation history.

Do not assume anything has already been completed.

Do not begin implementation.

Do not edit, delete, rename, refactor, migrate, archive, seed, or modify any file, route, schema, UI, test, document, or database record during this task.

This is an AUDIT-FIRST and AUDIT-ONLY task.

Your job is to inspect the actual Claude-accessible repository and produce a complete, evidence-based cleanup audit report. You must discover the real project structure, files, routes, database/schema behavior, tests, UI workflows, source-of-truth documents, integrations, and cleanup risks directly from the codebase.

If a file, route, schema, API, test, script, framework, workflow, integration, business rule, or source-of-truth document is not confirmed in the repository, do not invent it. Mark it as unknown and explain how it should be verified.

OBJECTIVE:

Perform a thorough, evidence-based cleanup audit of the entire Claude-accessible repository.

Identify, prioritize, and document everything that should be cleaned up, repaired, removed, simplified, optimized, renamed, documented, tested, or improved so the system becomes:

- More stable  
    
- Cleaner  
    
- Faster  
    
- Easier to maintain  
    
- More production-ready  
    
- More efficient for users  
    
- More visually polished  
    
- Safer from bad data, broken workflows, stale test records, security gaps, and architectural drift

The final deliverable is a prioritized cleanup audit report and future remediation plan.

Do not implement fixes during this task.

This audit must look for:

- Bad code  
    
- Broken links  
    
- Broken buttons  
    
- Dead routes  
    
- Unused files  
    
- Duplicate logic  
    
- Unnecessary complexity  
    
- Stale test/demo data  
    
- Malformed records  
    
- Orphaned records  
    
- Styling inconsistencies  
    
- Poor naming  
    
- Outdated comments  
    
- Documentation drift  
    
- Missing tests  
    
- Broken tests  
    
- Weak validation  
    
- Security/access-control risks  
    
- Performance inefficiencies  
    
- UI/UX friction  
    
- Incomplete workflows  
    
- Broken save/edit/delete flows  
    
- Stale UI after mutations  
    
- Data sync failures  
    
- Unsafe cleanup scripts  
    
- Missing browser verification  
    
- Anything else that makes the app messy, fragile, incomplete, inefficient, unsafe, or harder to maintain

CURRENT CONTEXT:

This audit is for the current Claude-accessible repository.

You must verify the actual project type, stack, structure, source-of-truth documents, features, routes, database patterns, tests, deployment configuration, and business rules directly from the repository before relying on them.

Do not assume this is a React app, Express app, Node app, monorepo, database-backed app, or API-based app until verified.

Likely areas to verify if present:

- Frontend application  
    
- Backend/API server  
    
- Shared packages  
    
- Database schema  
    
- ORM/migrations  
    
- Generated clients  
    
- API specs  
    
- Auth/session system  
    
- Admin areas  
    
- User-facing workflows  
    
- Docs/source-of-truth files  
    
- Tests  
    
- Scripts  
    
- Seeds/fixtures/test data  
    
- External integrations  
    
- Claude configuration  
    
- Deployment configuration

If this repository contains system-specific architectural rules, feature flags, protected directories, append-only tables, integration rules, compliance requirements, or source-of-truth documents, identify them and preserve them.

Do not add unsupported assumptions. If expected items differ from the actual repository, report the verified reality.

NON-NEGOTIABLE GUARDRAILS:

Work only on the requested audit task.

Do not implement fixes.

Do not delete files.

Do not delete data.

Do not soft-delete records.

Do not archive records.

Do not rename files.

Do not refactor code.

Do not modify schemas.

Do not modify migrations.

Do not update production data.

Do not change routes.

Do not change UI.

Do not change tests.

Do not change documentation unless explicitly approved after the audit.

Do not run destructive commands.

ANTI-DRIFT RULES:

Work only on the requested task.

Do not reopen completed work.

Do not modify unrelated features, routes, UI, schemas, tests, copy, integrations, or documentation.

Do not chase stale TODOs, old session-plan items, or previously closed issues.

Do not “improve” unrelated areas while touching nearby files.

Do not edit files you are only reading for context.

If unrelated issues are found, report them separately without fixing them unless they block the current audit.

ABSOLUTE OFF-LIMITS:

- Do not modify protected core files, security files, auth files, payment/webhook handlers, compliance files, generated files, migrations, or source-of-truth documents unless explicitly approved after the audit.  
    
- Do not open sensitive or protected files in edit mode.  
    
- Do not change database schema without explicit approval and a migration plan.  
    
- Do not emit DELETE, TRUNCATE, DROP, ALTER, UPDATE, or destructive SQL.  
    
- Do not mutate append-only ledger, audit, event, billing, payment, access, admin, or compliance tables if present.  
    
- Do not alter auth, role, entitlement, permission, payment, webhook, or access-control logic.  
    
- Do not delete or modify files under local/system/generated/cache directories unless later approved and proven safe.  
    
- Do not remove feature-flag checks.  
    
- Do not rename public API routes, DB columns, external integration paths, or webhook endpoints as “cleanup.”

SECRET SAFETY:

- Do not log, print, read aloud, expose, or return the value of any secret.  
    
- Do not expose API keys, auth secrets, payment secrets, webhook secrets, session secrets, database credentials, service credentials, OAuth secrets, JWT secrets, or any other sensitive env var.  
    
- If secret leakage risk is found, report the file/path/pattern without exposing the secret value.

DATA SAFETY:

- Do not reset the database.  
    
- Do not truncate tables.  
    
- Do not delete records.  
    
- Do not modify production records.  
    
- Do not run migrations that change data.  
    
- Do not run seed scripts that may overwrite data.  
    
- Do not mark a record as safe to remove without dependency checks.  
    
- Any proposed data cleanup must include dry-run plan, backup/export plan, dependency checks, before/after counts, rollback notes, and human approval requirements.

CLEANUP CONSERVATISM RULES:

- Do not mark a file safe to delete unless you verify:  
    
  1. It has zero imports from any workspace package.  
       
  2. It is not referenced by any route, test, build script, documentation, API spec, generated client, fixture, seed flow, deployment config, integration config, or external workflow.  
       
  3. It is not a legitimate fixture, test helper, dev utility, migration artifact, generated artifact, or historical reference required by the system.


- Before recommending deletion of a route, verify it is not linked from the frontend, referenced in an API spec, used by tests, protected by feature flags, required by external integrations, used by webhooks, or required by admin/internal tooling.  
    
- Do not recommend broad syntax modernization if it risks regressions.  
    
- Do not collapse separate systems unless discovery proves they are duplicates and consolidation is safe.  
    
- Do not recommend deleting demo/test records until environment, dependencies, and ownership are verified.

EVIDENCE RULES:

- Every finding must include evidence.  
    
- Evidence may include file path, function, component, route, schema, table, command result, test result, browser behavior, source-of-truth contradiction, dependency search result, API response, or data pattern.  
    
- Do not exaggerate severity.  
    
- Do not mark anything as broken unless verified.  
    
- Do not mark anything as unused unless search and dependency checks support it.  
    
- If evidence is incomplete, label the item “Needs human review.”

QUALITY BAR:

A passing typecheck, test, lint, or build is not enough to call a user-facing workflow healthy.

For this audit, identify where manual browser verification will be required in future implementation work.

Do not mark any UI control as complete unless it has been manually tested in the browser. For every button, dropdown, checkbox, form field, filter, modal, save/cancel action, delete action, edit action, upload action, download action, generated file action, and navigation link touched by any future cleanup task, the implementation must verify:

- It renders correctly.  
    
- It can be interacted with.  
    
- It performs the intended action.  
    
- It persists or updates data correctly when applicable.  
    
- It survives reload/navigation.  
    
- It does not create console errors, runtime overlays, duplicate requests, broken state, stale data, or unexpected 4xx/5xx responses.  
    
- It works across all relevant variants, including empty state, error state, loading state, populated state, permission-restricted state, and non-happy-path cases.

During this audit, flag every area where the current code appears to require this level of browser verification before it can be considered fixed.

WORKFLOW QUALITY RULE:

If this repository contains accounts, reports, reps, dashboards, generated files, downloads, uploads, forms, admin records, inventory records, sales records, user profiles, payments, subscriptions, AI workflows, document workflows, or similar business-critical workflows, audit them with this standard.

For future implementation involving these areas, Claude must verify the full user workflow in the browser before completion.

Specific proof requirements:

- If a Save button is added or changed, prove save → reload → persisted value.  
    
- If an Edit flow is added or changed, prove edit → save → reload → updated value.  
    
- If a Delete or Release flow is added or changed, prove action → related records update → reload → correct state.  
    
- If a generated report/file workflow is added or changed, prove create → status update → download/open.  
    
- If an upload/import workflow is added or changed, prove upload → validation → processing → result state → reload.  
    
- If a filter/dropdown is added or changed, prove selection changes the displayed result correctly.  
    
- If a checkbox is added or changed, prove checked/unchecked state updates correctly, persists when applicable, and does not cause duplicate updates or render loops.  
    
- If a form field is added or changed, prove input → validation → save/update → reload behavior.  
    
- If navigation is added or changed, prove the route/link works from all relevant entry points.  
    
- If role/access behavior is added or changed, prove the correct experience for allowed, denied, logged-out, and restricted users.

During this audit, identify any workflow that lacks enough evidence, test coverage, or browser verification confidence.

PRE-IMPLEMENTATION DISCOVERY:

Before producing the audit report, inspect the actual repository.

Discovery must include, where applicable:

1. Project Structure Discovery

Identify:

- Root directories  
    
- Frontend app structure  
    
- Backend/server structure  
    
- Shared packages  
    
- Generated code folders  
    
- Config files  
    
- Scripts  
    
- Docs/source-of-truth files  
    
- Generated artifacts  
    
- Fixture/seed/test-data locations  
    
- Deployment/Claude configuration  
    
- Integration-specific folders  
    
2. Stack Discovery

Identify from the repo:

- Frontend framework, if any  
    
- Backend framework, if any  
    
- Database/ORM, if any  
    
- Auth system, if any  
    
- Routing approach  
    
- API client/codegen approach, if any  
    
- Test framework  
    
- Build system  
    
- Package manager  
    
- Lint/format tools  
    
- Deployment or Claude-specific configuration  
    
- External integrations  
    
3. Source-of-Truth Discovery

Inspect the correct source-of-truth files, if they exist:

- CLAUDE.md  
    
- README files  
    
- docs  
    
- implementation notes  
    
- schema files  
    
- migrations  
    
- API spec files  
    
- seed/demo/test data files  
    
- scripts  
    
- route maps  
    
- project ledgers  
    
- task logs  
    
- deployment notes  
    
- compliance/security notes  
    
4. Functional Surface Discovery

Identify:

- Main frontend routes/pages  
    
- Main API route areas  
    
- Main workflows  
    
- Main forms/modals  
    
- Main tables/lists  
    
- Main admin areas  
    
- Main data entities  
    
- Main user-facing navigation paths  
    
- Main role/access-controlled surfaces  
    
- Main external integrations  
    
- Main background jobs or scheduled tasks, if present  
    
5. Test and Script Discovery

Identify and attempt safe baseline commands:

- Typecheck  
    
- Build, if safe  
    
- Lint/format, if available  
    
- Unit tests, if available  
    
- API/server tests, if available  
    
- Frontend/component tests, if available  
    
- E2E tests, if available and safe  
    
- Existing verify command, if available  
    
- Codegen command, if applicable

If a command does not exist, do not invent it. Report that it does not exist.

6. Data Discovery

Inspect database/schema/data patterns safely.

Look for:

- Seed files  
    
- Fixtures  
    
- Demo/test data scripts  
    
- E2E data factories  
    
- Production cleanup scripts  
    
- Tables likely to contain test records  
    
- Soft-delete patterns  
    
- Status enums  
    
- Foreign-key/dependency behavior  
    
- Orphan risks  
    
- Legacy statuses  
    
- Malformed records  
    
- Append-only tables  
    
- Import/export flows  
    
- Generated records  
    
- Integration-created records

Do not change data.

7. Discovery Summary

Before the final audit report, create a concise discovery summary covering:

- Files/routes/components inspected  
    
- Existing behavior found  
    
- Data/schema/API implications  
    
- Tests available  
    
- Source-of-truth docs inspected  
    
- Root causes or likely cleanup paths where applicable  
    
- Risks, blockers, or unknowns  
    
- Smallest safe future implementation approach

FULL AUDIT SCOPE:

1. Dead / Unused File Audit

Scan project files for:

- Unused .ts/.tsx/.js/.jsx files  
    
- Duplicate files  
    
- Old backup files  
    
- Temporary files  
    
- Dead assets  
    
- Unused scripts  
    
- Stale generated files  
    
- Files not imported or referenced anywhere  
    
- Test helpers or fixtures accidentally imported by production code  
    
- Generated files that appear out of sync  
    
- Deprecated directories  
    
- Stray exports

For each issue, report:

- File path  
    
- Why it appears unused or problematic  
    
- Evidence  
    
- Dependency/reference checks performed  
    
- Recommended action  
    
- Human approval required?  
    
- Risk of cleanup  
    
2. Dead / Broken Backend Route Audit

List every backend route registered, if backend routes exist.

Cross-reference:

- Route registration  
    
- API spec paths/operationIds, if applicable  
    
- Frontend API calls  
    
- Generated client usage  
    
- Tests  
    
- Feature flags  
    
- Auth/access rules  
    
- Webhook/integration usage  
    
- Admin/internal usage

Look for:

- Routes defined but not in spec  
    
- Routes in spec but not implemented  
    
- Routes returning inconsistent response shapes  
    
- Routes missing validation  
    
- Routes missing auth/access checks  
    
- Routes with unsafe delete/update behavior  
    
- Routes with incomplete sync logic  
    
- Routes that can create malformed or stale data  
    
- Routes that should use shared error middleware  
    
- HTML errors where JSON errors are expected  
    
- Routes trusting client-supplied role, entitlement, account, or ownership data  
    
- Routes that expose too much data

For each issue, report:

- Route file  
    
- Endpoint  
    
- Evidence  
    
- Risk  
    
- Recommended fix  
    
- Tests needed  
    
- Browser/API verification required  
    
3. Dead / Broken Frontend Route and Navigation Audit

List every frontend route, Link, navigate call, sidebar link, header link, footer link, tab, card link, dashboard link, detail-page link, hash/anchor link, and redirect, if present.

Look for:

- Broken links  
    
- Links pointing to missing routes  
    
- Buttons that do nothing  
    
- Buttons that appear clickable but are not wired  
    
- Routes registered but never linked  
    
- Components linked but missing  
    
- Links requiring a return to Home first  
    
- Hash/anchor links failing from other pages  
    
- Incorrect route parameters  
    
- Stale legacy routes  
    
- Duplicate pages  
    
- Broken back/cancel behavior  
    
- Hard-coded URLs that should use relative paths  
    
- Role/access visibility mismatches  
    
- Links that expose private/admin pages to the wrong users

For each issue, report:

- Location  
    
- Link/button/route  
    
- Current behavior or evidence  
    
- Expected behavior  
    
- Recommended fix  
    
- Priority  
    
- Manual browser verification required  
    
4. Duplicate Logic Audit

Look for copy-pasted or near-identical logic across files, especially:

- Date formatting  
    
- Currency/number formatting  
    
- Error response helpers  
    
- Access-check wrappers  
    
- Form validation patterns  
    
- Toast/notification triggers  
    
- API mutation patterns  
    
- Cache invalidation  
    
- Status badge logic  
    
- Empty/loading/error state handling  
    
- Upload/download handling  
    
- Delete/release/archive handling  
    
- Permission gates  
    
- Integration helpers  
    
- Data mapping/transformation logic

For each issue, report:

- Files involved  
    
- Duplicated logic  
    
- Consolidation target  
    
- Risk of consolidation  
    
- Recommended tests before cleanup  
    
5. Stale / Commented-Out Code Audit

Identify:

- Commented-out code blocks  
    
- TODO/FIXME/HACK/XXX comments  
    
- Old session-plan references  
    
- Comments contradicting current behavior  
    
- Outdated implementation notes  
    
- Dead feature references  
    
- Stale temporary workarounds  
    
- Old migration notes that no longer apply  
    
- Code comments claiming behavior that tests or runtime do not support

For each issue, report:

- File path  
    
- Comment/code block  
    
- Evidence  
    
- Recommended action  
    
- Whether cleanup is safe now or should be logged only  
    
6. Dead Imports and Type Suppression Audit

Inspect:

- Unused imports  
    
- Unused variables  
    
- Unused exports  
    
- @ts-ignore  
    
- @ts-expect-error  
    
- eslint-disable  
    
- biome-ignore  
    
- any/unknown widening  
    
- Type assertions that may hide bugs  
    
- Dead generic types  
    
- Broken inferred types

Run typecheck if available.

For each issue, report:

- File path  
    
- Problem  
    
- Evidence  
    
- Whether it is harmless, risky, or bug-masking  
    
- Recommended fix  
    
- Tests needed  
    
7. Naming and Structure Audit

Identify:

- Misnamed functions  
    
- Misnamed components  
    
- Misnamed files  
    
- Files not matching default exports  
    
- Inconsistent casing  
    
- Ambiguous helper names  
    
- Names that conflict with actual behavior  
    
- Folder organization that makes maintenance harder  
    
- Legacy terminology  
    
- User-facing names that differ from internal names in confusing ways  
    
- Names that suggest unsafe behavior

For each issue, report:

- File/path  
    
- Current name  
    
- Why it is confusing  
    
- Recommended name or structure  
    
- Risk of renaming  
    
- Required full-search verification  
    
8. UI/UX Cleanliness Audit

Inspect user experience for:

- Too many clicks  
    
- Excessive mouse movement  
    
- Repetitive workflows  
    
- Confusing labels  
    
- Misleading labels  
    
- Inconsistent button placement  
    
- Inconsistent card/table layouts  
    
- Inconsistent empty states  
    
- Missing confirmation messages  
    
- Missing success/failure toasts  
    
- Missing loading indicators  
    
- Poorly grouped forms  
    
- Cluttered pages  
    
- Pages that feel unfinished  
    
- User-facing language that should be clearer  
    
- Controls missing disabled states  
    
- Modals/drawers missing clear save/cancel/close behavior  
    
- Stale UI after save/delete  
    
- Missing redirect after delete  
    
- Error and stale data shown at the same time  
    
- Workflows that require avoidable manual effort

For each finding, report:

- Page/workflow  
    
- Friction point  
    
- User impact  
    
- Recommended improvement  
    
- Priority  
    
- Difficulty  
    
- Manual verification required  
    
9. Test Data and Production Data Cleanup Audit

Inspect schema, seeds, fixtures, database records if safely accessible, E2E factories, demo data scripts, and cleanup scripts.

Look for:

- E2E test records  
    
- Demo records  
    
- Placeholder records  
    
- Duplicate records  
    
- Malformed records  
    
- Orphaned records  
    
- Records with missing foreign keys  
    
- Records with invalid status values  
    
- Records with legacy statuses  
    
- Records connected to deleted/inactive records  
    
- Records that should have been soft-deleted but remain active  
    
- Test data visible in production UI  
    
- Unsafe cleanup scripts  
    
- Data factories that may pollute real environments  
    
- Generated records without cleanup  
    
- Records created by tests without teardown

Before recommending deletion, verify:

- Table/source  
    
- Record pattern  
    
- Count if safely discoverable  
    
- Dependencies  
    
- Whether hard delete, soft delete, archive, or no action is appropriate  
    
- Whether cleanup requires backup/export first  
    
- Whether cleanup could affect real production data  
    
- Whether human review is required

Do not delete anything during this audit.

Output proposed cleanup groups:

- Safe cleanup candidates  
    
- Cleanup candidates requiring human review  
    
- Cleanup candidates requiring backup/export first  
    
- Cleanup candidates that should not be touched yet  
    
- Ambiguous records needing source-of-truth review  
    
10. Database and Data Integrity Audit

Inspect schemas, relationships, constraints, validation, route behavior, and UI forms.

Look for:

- Missing constraints  
    
- Weak validation  
    
- Inconsistent status enums  
    
- Inconsistent date handling  
    
- Nullable fields causing broken UI  
    
- Orphan risks  
    
- Rollups that do not update  
    
- Create/edit/delete flows that fail to sync related records  
    
- Backend logic that allows malformed records  
    
- Frontend forms that allow invalid submissions  
    
- Tables that may need indexes  
    
- Stale or legacy columns  
    
- Fields no longer used  
    
- Fields used by backend but not editable in UI  
    
- Fields editable in UI but ignored by backend  
    
- Soft-delete inconsistencies  
    
- Import/export flows that can create bad data  
    
- Missing audit logs for sensitive changes  
    
- Ownership or account scoping gaps

For each issue, report:

- Table/schema  
    
- Related route/API/form  
    
- Evidence  
    
- Current risk  
    
- Recommended fix  
    
- Whether migration, validation, UI cleanup, route cleanup, or data cleanup is needed  
    
- Whether dry-run and backup/export are required  
    
11. API and Backend Audit

Inspect:

- API routes  
    
- Middleware  
    
- Service functions  
    
- Validators  
    
- Auth/permissions  
    
- Error handling  
    
- Logging  
    
- Generated client alignment  
    
- API/spec alignment  
    
- External integration safety  
    
- Background jobs  
    
- Webhooks, read-only audit only unless explicitly approved

Look for:

- Missing validation  
    
- Inconsistent response shapes  
    
- HTML errors instead of JSON  
    
- Duplicate business logic  
    
- Errors thrown instead of delegated to middleware  
    
- Missing 400/401/403/404 handling  
    
- Missing permission checks  
    
- Missing ownership checks  
    
- Unsafe deletes  
    
- Incomplete sync logic  
    
- Missing audit logging where important  
    
- Missing defensive checks  
    
- API/client mismatch  
    
- API spec drift  
    
- Logging violations  
    
- Secret leakage risk  
    
- Webhook safety issues  
    
- Environment-specific behavior not guarded

For each issue, report:

- Endpoint/file  
    
- Evidence  
    
- Risk  
    
- Recommended fix  
    
- Tests needed  
    
12. Frontend Component Audit

Inspect:

- Components  
    
- Pages  
    
- Hooks  
    
- API calls  
    
- Forms  
    
- Tables  
    
- Modals  
    
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
    
- Inconsistent form validation  
    
- Missing disabled/loading/error/empty states  
    
- Bad query invalidation  
    
- Stale UI after save/delete  
    
- Tables not refreshing after mutations  
    
- Components needing splitting  
    
- Components that should be reused  
    
- State that should be derived instead of duplicated  
    
- Race conditions  
    
- Duplicate requests  
    
- Render loops  
    
- UI not reflecting backend state  
    
- Forms missing default values or reset behavior  
    
- Broken cancel/close/back behavior  
    
- Error and data rendering at the same time  
    
- Missing redirect after destructive actions

For each issue, report:

- File path  
    
- Component/hook/function  
    
- Problem  
    
- User impact  
    
- Recommended fix  
    
- Risk level  
    
- Future manual browser proof required  
    
13. API Spec / Codegen Drift Audit

If API specs or generated clients exist:

- Compare API spec to generated API client.  
    
- Run the safe codegen command if available.  
    
- Check whether generated output differs from committed/generated code.  
    
- Do not hand-edit generated files.  
    
- Report whether spec and generated client are in sync.

For each issue, report:

- Spec path  
    
- Generated path  
    
- Drift evidence  
    
- Recommended fix  
    
- Required tests  
    
14. Dependency Drift Audit

Inspect:

- package.json files  
    
- workspace config  
    
- lockfile if relevant  
    
- workspace references  
    
- build scripts  
    
- test scripts

Look for:

- Declared dependencies not installed  
    
- Missing runtime dependencies  
    
- Runtime dependencies incorrectly listed as devDependencies  
    
- Build/test tools incorrectly listed as dependencies  
    
- Workspace packages with inconsistent dependency versions  
    
- Unused dependencies  
    
- Dependencies imported but not declared  
    
- Duplicate libraries solving the same problem  
    
- Outdated scripts pointing to missing files

For each issue, report:

- Package/file  
    
- Dependency  
    
- Evidence  
    
- Risk  
    
- Recommended fix  
    
15. Test Suite Health and Coverage Audit

Run and inspect safe available validation commands.

At minimum, attempt to discover and run, if available:

- Typecheck  
    
- Build command  
    
- Lint/format command  
    
- Unit tests  
    
- API/server tests  
    
- Frontend/component tests  
    
- E2E tests, if safe  
    
- Verify command  
    
- Codegen check, if applicable

If a command does not exist, report it.

For each failure, identify:

- Command run  
    
- Result  
    
- Exact failure  
    
- Whether cleanup-related  
    
- Whether pre-existing  
    
- Whether blocking  
    
- Recommended fix

Identify missing test coverage for:

- Critical create/edit/delete flows  
    
- Navigation links  
    
- Data cleanup safety  
    
- API validation  
    
- Permission checks  
    
- UI refresh after mutations  
    
- Error handling  
    
- Database integrity  
    
- Generated/downloaded file workflows, if present  
    
- Upload/import workflows, if present  
    
- Recently fixed bugs that need regression coverage  
    
- Role-based access behavior  
    
- Empty/error/loading states  
    
- Payment/webhook handlers, read-only audit only  
    
- External integration safety

Do not create tests during this audit.

16. Performance and Efficiency Audit

Inspect for:

- Duplicate network requests  
    
- Over-fetching  
    
- Missing pagination  
    
- Expensive frontend rendering  
    
- Repeated calculations  
    
- Inefficient filtering  
    
- Missing indexes  
    
- Slow queries  
    
- Large components loading too much data  
    
- Repeated API calls after save/delete  
    
- Inefficient import/export logic  
    
- Unnecessary rerenders  
    
- Oversized payloads  
    
- Cache invalidation patterns too broad or too narrow  
    
- Polling/refresh behavior that causes unnecessary work  
    
- Unbounded list rendering  
    
- Expensive browser-side data transformations

For each issue, report:

- Area  
    
- Inefficiency  
    
- Evidence  
    
- Impact  
    
- Recommended improvement  
    
- Priority  
    
17. Styling and Design-System Consistency Audit

Inspect UI components for:

- Wrong palette tokens  
    
- Hard-coded hex colors  
    
- Ad-hoc Tailwind class combinations  
    
- Inconsistent spacing  
    
- Typography scale violations  
    
- z-index conflicts  
    
- Button style inconsistencies  
    
- Card/table inconsistencies  
    
- Modal/drawer inconsistencies  
    
- Accessibility issues obvious from code  
    
- Inconsistent responsive behavior  
    
- Inconsistent icon usage  
    
- Inconsistent destructive-action styling  
    
- Inconsistent success/error/warning language

For each issue, report:

- File/page/component  
    
- Evidence  
    
- Design-system concern  
    
- Recommended cleanup  
    
- Priority  
    
- Browser verification required  
    
18. Logging and Secret Safety Audit

Inspect server and client code for:

- console.log/console.warn/console.error in production code  
    
- process.env values logged  
    
- Secrets returned in API responses  
    
- Secrets embedded in client bundles  
    
- Debug logs exposing sensitive data  
    
- Error messages leaking internals  
    
- Test credentials  
    
- Unsafe setup/admin exposure  
    
- Raw exception responses  
    
- Sensitive headers/cookies exposed  
    
- Personal or customer data exposed in logs

For each issue, report:

- File/route/page  
    
- Evidence, without exposing secret values  
    
- Severity  
    
- Recommended fix  
    
- Verification needed  
    
19. Security and Access Cleanup Audit

Inspect:

- Admin-only pages  
    
- Protected routes  
    
- API auth checks  
    
- Role checks  
    
- Access gates  
    
- Session/cookie safety  
    
- CORS/proxy assumptions if applicable  
    
- Public/private data boundaries  
    
- Object ownership checks  
    
- Delete/update protections  
    
- Webhook protections, read-only audit only  
    
- Setup/onboarding routes

Look for:

- Admin-only pages exposed to non-admins  
    
- API routes missing auth checks  
    
- API routes missing role checks  
    
- Sensitive fields returned unnecessarily  
    
- Setup routes that should be locked  
    
- Unsafe direct object access  
    
- Delete endpoints without protection  
    
- Public pages leaking private data  
    
- Overly broad access logic  
    
- Client-supplied entitlement trust  
    
- Client-supplied role trust  
    
- Missing ownership checks  
    
- Weak session/cookie handling  
    
- Unsafe CORS assumptions

For each issue:

- File/route/page  
    
- Evidence  
    
- Severity  
    
- Recommended fix  
    
- Verification needed  
    
20. Documentation and Project Ledger Audit

Inspect:

- CLAUDE.md  
    
- README files  
    
- docs  
    
- task logs  
    
- implementation notes  
    
- comments  
    
- source-of-truth files  
    
- setup/deployment notes  
    
- test command notes  
    
- data cleanup notes

Look for:

- Outdated documentation  
    
- Completed tasks still listed as open  
    
- Open tasks missing context  
    
- Incorrect project status  
    
- Missing setup instructions  
    
- Missing test commands  
    
- Missing deployment notes  
    
- Missing data cleanup notes  
    
- Missing known issue list  
    
- Documentation drift from actual code  
    
- Future TODOs mixed with completed work  
    
- Speculative future work incorrectly presented as completed  
    
- Missing operational warnings  
    
- Missing source-of-truth references

Recommend:

- Docs that should be updated later  
    
- Completed items that should be marked closed later  
    
- New cleanup tasks that should be added later  
    
- Future backlog items that should be preserved but not implemented now

TESTING AND VALIDATION:

For this audit, run only safe validation commands.

Required validation discovery:

- Identify available scripts.  
    
- Run typecheck if available.  
    
- Run build if available and safe.  
    
- Run lint/format check if available.  
    
- Run relevant unit/API/frontend tests if available.  
    
- Run E2E tests if available and safe.  
    
- Run codegen/check if applicable and safe.  
    
- Report missing test commands instead of inventing them.

If a command is too risky, environment-dependent, destructive, or requires unavailable secrets, do not run it. Report why.

For UI/workflow findings:

- Do not claim full manual browser verification unless actually performed.  
    
- If browser testing is not performed during this audit, list workflows that need it during future cleanup.  
    
- If browser testing is performed, report exact screens/pages/workflows checked.

For data cleanup findings:

- Do not perform destructive changes.  
    
- Recommend dry-run queries.  
    
- Recommend backup/export/snapshot before deletion, archive, migration, or bulk update.  
    
- Include before/after count requirements.  
    
- Include orphan/dependency checks.  
    
- Include rollback notes.  
    
- Include clear lists of preserved, changed, and ambiguous records for future implementation.

DOCUMENTATION / SOURCE OF TRUTH:

Do not update documentation during this audit unless explicitly instructed.

In the audit report, identify whether CLAUDE.md or another source-of-truth file should be updated after future cleanup work.

Only recommend documentation updates when future work creates:

- Durable completed status  
    
- Durable rules  
    
- Migration notes  
    
- Data model changes  
    
- Operational instructions  
    
- Future TODOs  
    
- Known issue tracking

Do not document speculative future work as completed.

REQUIRED FINDING ID FORMAT:

Assign every finding a stable ID.

Use this format:

- CLEAN-P0-001 for critical safety/security/data-integrity issues  
    
- CLEAN-P1-001 for broken user-facing functionality  
    
- CLEAN-P2-001 for test data/stale data/cleanup issues  
    
- CLEAN-P3-001 for code quality/maintainability issues  
    
- CLEAN-P4-001 for UI/UX/performance/polish issues  
    
- CLEAN-P5-001 for documentation/source-of-truth issues  
    
- CLEAN-FUTURE-001 for valid but intentionally deferred future work

Each finding must include:

- Finding ID  
    
- Severity: Critical | High | Medium | Low | Info  
    
- Category  
    
- File(s)/route/table/component  
    
- Evidence  
    
- Impact  
    
- Recommended action  
    
- Risk of fix  
    
- Tests needed  
    
- Manual verification required?  
    
- Human approval required?

REQUIRED OUTPUT FORMAT:

Return the final audit report in this exact structure.

# Full Claude Cleanup Audit Report

## 1\. Executive Summary

Briefly explain:

- Overall project health  
    
- Biggest risks  
    
- Biggest cleanup opportunities  
    
- Highest-value first move  
    
- Any major uncertainty

## 2\. Baseline System Map

List:

- Frontend stack, if present  
    
- Backend stack, if present  
    
- Database/ORM, if present  
    
- Auth system, if present  
    
- Routing approach  
    
- API/client/codegen approach, if any  
    
- Test system  
    
- Package manager  
    
- Main directories  
    
- Main frontend routes, if present  
    
- Main API areas, if present  
    
- Available scripts  
    
- Source-of-truth docs found  
    
- Feature flags found  
    
- External integrations found

## 3\. Commands Run and Results

Create a table:

- Command  
    
- Result  
    
- Pass/fail  
    
- Notes  
    
- Blocking?  
    
- If not run, why not

## 4\. Discovery Summary

Include:

- Files/routes/components inspected  
    
- Existing behavior found  
    
- Data/schema/API implications  
    
- Tests available  
    
- Source-of-truth docs inspected  
    
- Risks/blockers/unknowns  
    
- Smallest safe future implementation approach

## 5\. Findings Index

Create a table:

- Finding ID  
    
- Severity  
    
- Category  
    
- Location  
    
- One-line summary  
    
- Recommended action  
    
- Human approval required?

## 6\. Critical Findings

List only the most important issues affecting production stability, data integrity, security, core workflows, or major user experience.

For each:

- Finding ID  
    
- Priority  
    
- File/route/table  
    
- Finding  
    
- Evidence  
    
- Impact  
    
- Recommended action  
    
- Risk of fix  
    
- Suggested test coverage  
    
- Manual browser verification needed, if applicable  
    
- Human approval required?

## 7\. Broken Links, Routes, and Buttons

Create a table:

- Finding ID  
    
- Location  
    
- Link/button/route  
    
- Current behavior or evidence  
    
- Expected behavior  
    
- Recommended fix  
    
- Priority  
    
- Browser verification required

## 8\. Test Data and Data Cleanup Findings

Create a table:

- Finding ID  
    
- Table/source  
    
- Record pattern or issue  
    
- Count if known  
    
- Dependency risk  
    
- Safe to remove?  
    
- Recommended action  
    
- Backup/export required?  
    
- Human review required?  
    
- Notes

## 9\. Code Quality Findings

Create a table:

- Finding ID  
    
- File  
    
- Issue  
    
- Evidence  
    
- Why it matters  
    
- Recommended cleanup  
    
- Priority  
    
- Risk  
    
- Tests needed first?

## 10\. UI/UX and Workflow Findings

Create a table:

- Finding ID  
    
- Page/workflow  
    
- Friction point  
    
- User impact  
    
- Recommended improvement  
    
- Priority  
    
- Difficulty  
    
- Manual verification required

## 11\. API and Backend Findings

Create a table:

- Finding ID  
    
- Endpoint/file  
    
- Issue  
    
- Evidence  
    
- Risk  
    
- Recommended fix  
    
- Tests needed

## 12\. Database and Data Integrity Findings

Create a table:

- Finding ID  
    
- Table/schema  
    
- Issue  
    
- Evidence  
    
- Impact  
    
- Recommended fix  
    
- Migration needed?  
    
- Backup/dry-run needed?  
    
- Risk

## 13\. API Spec / Codegen / Dependency Drift Findings

Create a table:

- Finding ID  
    
- Area  
    
- Issue  
    
- Evidence  
    
- Impact  
    
- Recommended fix  
    
- Tests/checks needed

## 14\. Test Coverage Gaps

Create a table:

- Finding ID  
    
- Area  
    
- Missing test  
    
- Why it matters  
    
- Recommended test  
    
- Priority

## 15\. Performance and Efficiency Findings

Create a table:

- Finding ID  
    
- Area  
    
- Inefficiency  
    
- Evidence  
    
- Impact  
    
- Recommended improvement  
    
- Priority

## 16\. Styling and Design-System Findings

Create a table:

- Finding ID  
    
- File/page/component  
    
- Issue  
    
- Evidence  
    
- Recommended cleanup  
    
- Priority  
    
- Browser verification required

## 17\. Security, Access, Logging, and Secret Safety Findings

Create a table:

- Finding ID  
    
- File/route/page  
    
- Issue  
    
- Evidence  
    
- Severity  
    
- Recommended fix  
    
- Verification needed

## 18\. File Structure and Documentation Findings

Create a table:

- Finding ID  
    
- File/doc/location  
    
- Issue  
    
- Evidence  
    
- Recommended cleanup  
    
- Safe to change?  
    
- Priority

## 19\. Prioritized Cleanup Backlog

Group tasks by:

### Priority 0: Critical Safety / Security / Data Integrity

### Priority 1: Broken User-Facing Functionality

### Priority 2: Test Data / Stale Data / Cleanup

### Priority 3: Code Quality / Maintainability

### Priority 4: UI/UX / Performance / Polish

### Priority 5: Documentation / Source-of-Truth

### Future Backlog

Each task must include:

- Finding ID  
    
- Task title  
    
- Why it matters  
    
- Evidence  
    
- Files likely involved  
    
- Recommended implementation approach  
    
- Suggested verification steps  
    
- Human approval needed?

## 20\. Recommended Implementation Order

Give the safest order to complete cleanup work.

Use this sequence unless discovery proves a better order:

1. Backups, snapshots, and safety checks  
     
2. Tests and guardrails  
     
3. Critical security/data integrity issues  
     
4. Broken user-facing functionality  
     
5. Data cleanup  
     
6. Code cleanup  
     
7. UI polish/performance improvements  
     
8. Documentation/source-of-truth updates

## 21\. Items That Require Human Approval Before Action

List anything that should not be deleted, modified, archived, refactored, renamed, migrated, documented, or bulk-updated without approval.

## 22\. Items Intentionally Not Touched

Confirm:

- No implementation was performed.  
    
- No data was changed.  
    
- No files were deleted.  
    
- No routes were changed.  
    
- No schemas were changed.  
    
- No tests were changed.  
    
- No docs were changed unless explicitly approved.  
    
- No unrelated areas were modified.  
    
- No destructive commands were run.

## 23\. Final Recommendation

Give a clear, decisive recommendation for what should be fixed first and why.

COMPLETION REPORT REQUIREMENTS:

At the end of the audit report, include:

## Completion Report

- Final status: Complete, Partially Complete, or Not Complete  
    
- What was audited  
    
- Files/areas inspected  
    
- Commands/checks run and results  
    
- Schema/API/data changes: must be “None” unless explicitly approved  
    
- Data cleanup performed: must be “None” unless explicitly approved  
    
- Destructive actions performed: must be “None”  
    
- Browser verification performed, if any  
    
- Browser verification still required  
    
- Remaining risks or unresolved items  
    
- Future items intentionally not completed  
    
- Confirmation that unrelated areas were not modified  
    
- Confirmation that this was audit-only and no fixes were implemented  
    
- Confirmation that protected/security/auth/payment/core files were not modified  
    
- Confirmation that append-only/audit/ledger/payment/access tables were not mutated, if present  
    
- Confirmation that auth/access/permission logic was not altered  
    
- Confirmation that no secret values were logged or exposed

FINAL RULES:

Be brutally accurate.

Do not exaggerate.

Do not guess.

Do not invent.

Do not hide uncertainty.

Do not mark anything as broken unless verified.

Do not mark anything as safe to delete unless dependencies were checked.

Do not perform destructive actions.

Do not implement fixes.

Do not weaken validation, auth, safety, security, or data integrity.

Do not update docs unless explicitly instructed.

If something is unclear, mark it as “Needs human review.”

Prefer root-cause cleanup over surface-level patching.

Prioritize production safety, data integrity, maintainability, and user experience.

The goal is not just to make the app prettier. The goal is to make the system cleaner, safer, faster, easier to maintain, easier to use, and more professional.
