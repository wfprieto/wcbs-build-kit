TITLE:

Generic Full Workflow, Click Path, UI Interaction, Legacy Record, and Efficiency Audit

READ-FIRST INSTRUCTION:

Read this entire prompt from top to bottom before taking any action.

Do not skip sections.

Do not summarize prematurely.

Do not rely on stale session context.

Do not rely on prior conversation history.

Do not assume anything has already been tested, fixed, verified, or completed.

Do not assume the workflow works because typecheck, build, lint, or automated tests pass.

Do not begin implementation.

Do not edit, delete, rename, refactor, migrate, archive, seed, or modify any file, route, schema, UI, test, document, or database record during this task.

This is a WORKFLOW AUDIT-FIRST and WORKFLOW AUDIT-ONLY task.

Your job is to inspect the actual Claude-accessible repository, run the app if safe, test the workflows like a real user, document every click path, validate every interaction, identify broken or inefficient workflows, identify stale/legacy/test/malformed record exposure, and return a prioritized workflow improvement report.

Do not implement fixes during this task.

OBJECTIVE:

Perform a thorough, evidence-based workflow and user interaction audit of the system.

The goal is to determine:

1. Whether real users can complete the intended workflows from start to finish.  
     
2. Whether every button, dropdown, checkbox, filter, form field, tab, modal, link, table row, save action, edit action, delete/release/archive action, upload/download action, generated-file action, and navigation path works correctly.  
     
3. Whether dropdowns, filters, searches, sort controls, and dependent selections show the correct options and update the UI correctly.  
     
4. Whether records are created, edited, deleted, released, archived, assigned, generated, uploaded, downloaded, or updated correctly where applicable.  
     
5. Whether related records, rollups, statuses, dashboard counts, detail pages, lists, and dropdowns stay in sync after workflow actions.  
     
6. Whether stale, legacy, duplicate, malformed, orphaned, hidden, test, demo, or outdated records are still visible where they should not be.  
     
7. Whether users are forced through too many clicks, too much mouse movement, too many screens, repeated searches, avoidable reloads, or unclear decision points.  
     
8. Where the workflow can be simplified, clarified, consolidated, automated, or made faster.  
     
9. What should be fixed first to make the workflow cleaner, safer, easier to understand, easier to use, and more efficient.

This audit is strictly focused on:

- Workflow process  
    
- Real user click paths  
    
- UI interactions  
    
- Dropdown behavior  
    
- Filter/search/sort behavior  
    
- Form and modal behavior  
    
- Save/edit/delete/release/archive flows  
    
- Navigation paths  
    
- Data persistence  
    
- Stale UI after mutations  
    
- Table/list/detail refresh behavior  
    
- Legacy/stale/test record exposure  
    
- Role/access visibility during workflows  
    
- User confusion  
    
- Workflow efficiency  
    
- Click reduction  
    
- Screen-hopping reduction  
    
- Better labels and user-facing clarity  
    
- Operational speed  
    
- User confidence

Do not perform broad code cleanup unless the code directly explains a verified workflow issue.

CURRENT CONTEXT:

This audit is for the current Claude-accessible repository.

You must discover the actual system, stack, routes, workflows, UI surfaces, database/data model, source-of-truth documents, tests, and validation commands directly from the repository.

Do not assume the app type, framework, routes, tables, users, roles, workflows, records, business rules, or source-of-truth files.

If the repository contains multiple modules, identify each major workflow area and prioritize the most important user-facing, admin-facing, reporting-facing, data-facing, and production-impacting workflows.

If the user has provided a specific workflow, bug, screen, module, or process separately, audit that workflow first, then audit connected workflows that may affect it.

If any expected route, file, schema, API, workflow, test, or document is not found, mark it as unknown and explain how it should be verified.

NON-NEGOTIABLE GUARDRAILS:

This is audit-only.

Do not implement fixes.

Do not change UI.

Do not change routes.

Do not change database records.

Do not delete records.

Do not soft-delete records.

Do not archive records.

Do not rename records.

Do not update schemas.

Do not update migrations.

Do not modify tests.

Do not update documentation unless explicitly asked.

Do not run destructive commands.

Do not run seed scripts that may overwrite data.

Do not run migrations that change data.

Do not perform bulk actions.

Do not clean up records during the audit.

Do not fabricate screenshots, test results, browser behavior, or verification.

Do not expose secrets.

Do not weaken validation, auth, access control, safety, security, or data integrity.

Work only on the requested task.

Do not reopen completed work.

Do not modify unrelated features, routes, UI, schemas, tests, copy, or documentation.

Do not chase stale TODOs, old session-plan items, or previously closed issues.

Do not “improve” unrelated areas while touching nearby files.

If unrelated issues are found, report them separately without fixing them unless they block the current task.

SECRET AND DATA SAFETY:

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
    
- Private customer data  
    
- Sensitive env vars

If secret leakage risk is found, report only the file/path/pattern and risk. Do not expose the secret value.

Do not modify production data.

Do not delete records.

Do not use real customer data in unsafe tests.

Do not create test records unless explicitly approved.

If test data is required, recommend a controlled future test-record plan.

If records appear stale, legacy, duplicate, malformed, orphaned, unsafe, or improperly visible, report them with evidence and recommend a dry-run cleanup plan only.

QUALITY BAR:

Do not mark any UI control as complete unless it has been manually tested in the browser.

For every button, dropdown, checkbox, form field, filter, modal, save/cancel action, delete/release/archive action, upload/download action, generated-file action, and navigation link inspected or touched by this audit, verify and report whether:

- It renders correctly.  
    
- It can be interacted with.  
    
- It performs the intended action.  
    
- It persists or updates data correctly when applicable.  
    
- It survives reload/navigation.  
    
- It does not create console errors, runtime overlays, duplicate requests, unexpected 4xx/5xx responses, stale UI, or broken state.  
    
- It works across all relevant variants, not just the first happy-path example.

A passing typecheck/build/lint/test result is not sufficient. Manual workflow verification is required wherever browser testing is available.

If browser testing is not available, clearly state that full workflow verification could not be completed and provide the exact browser verification checklist required.

ACCOUNT / REPORT AGENT QUALITY RULE:

If this repository contains Account setup, Reports, Reps, KPI Standards, Generated Reports, dashboards, generated files, downloads, report-agent workflows, or similar reporting workflows, verify the full user workflow in the browser before calling the workflow healthy.

Specific workflow proof requirements:

- If a Save button exists or is part of the audited workflow, prove save → reload → persisted value.  
    
- If a generated report workflow exists, prove create → status update → download/open where safely testable.  
    
- If a filter/dropdown exists, prove selection changes the displayed result correctly.  
    
- If a checkbox exists, prove checked/unchecked state updates correctly, persists when applicable, and does not cause duplicate updates or render loops.  
    
- If a form field exists, prove input → validation → save/update → reload behavior.  
    
- If navigation exists, prove the route/link works from all relevant entry points.  
    
- If a download link exists, prove the downloaded file route works and returns the expected file behavior where safely testable.  
    
- If a dashboard counter exists, prove whether the visible count matches the relevant workflow state or identify the gap.

PRE-IMPLEMENTATION DISCOVERY:

Before producing the audit report, inspect the actual repository.

Discovery must include, where applicable:

1. Project Structure Discovery

Identify:

- Main app directories  
    
- Frontend route/page locations  
    
- Backend/API route locations  
    
- Shared packages  
    
- Schema/data model files  
    
- Migration files  
    
- Source-of-truth docs  
    
- Test files  
    
- Seed/fixture/demo data  
    
- Navigation/sidebar/header/footer components  
    
- Forms/modals/tables/components used by workflows  
    
- Generated files/codegen folders  
    
- Deployment/Claude configuration  
    
- Integration-specific folders  
    
2. Stack Discovery

Identify:

- Frontend framework, if present  
    
- Backend framework, if present  
    
- Database/ORM, if present  
    
- Auth/access approach, if present  
    
- Routing approach  
    
- API client/query approach  
    
- Test framework  
    
- Package manager  
    
- Browser/e2e tooling if present  
    
- Build/lint/typecheck tools  
    
- External integrations, if present  
    
3. Workflow Surface Discovery

Identify all major workflows, including where applicable:

- Create workflows  
    
- Edit workflows  
    
- Delete/release/archive workflows  
    
- View/detail workflows  
    
- List/table workflows  
    
- Search/filter/sort workflows  
    
- Assignment workflows  
    
- Import/export workflows  
    
- Upload/download workflows  
    
- Generated file workflows  
    
- Email/send workflows  
    
- Admin workflows  
    
- Standard user workflows  
    
- Role/access restricted workflows  
    
- Setup/onboarding workflows  
    
- Payment/subscription workflows  
    
- Reporting/dashboard workflows  
    
- Inventory/account/record management workflows  
    
4. Connected Workflow Discovery

For each main workflow, identify connected data and UI surfaces.

Examples:

- If testing a “create sale” workflow, inspect the list page, detail page, create/sell button, sale modal/form, sold record detail page, related inventory/package status, related program/account rollup, sold list, legacy list, release/delete path, and reload behavior.  
    
- If testing a “generated report” workflow, inspect the source account, workflow status, generation action, generated files list, download link, dashboard counter, status transition, and reload behavior.  
    
- If testing an “account edit” workflow, inspect account list, account detail, edit form, save action, related dropdown options, reporting workflow usage, and reload persistence.

Apply this connected-surface logic to the actual workflows in this repository.

5. Source-of-Truth Discovery

Inspect source-of-truth documents if present:

- CLAUDE.md  
    
- README files  
    
- docs  
    
- implementation notes  
    
- schema files  
    
- migrations  
    
- route maps  
    
- business rule docs  
    
- workflow notes  
    
- known issue lists  
    
- task ledgers  
    
- test notes  
    
- deployment notes

Use source-of-truth documents to identify expected behavior, but verify against the actual app and code.

6. Validation Command Discovery

Identify and run safe available commands if present:

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

DISCOVERY SUMMARY REQUIRED:

Before writing the final audit report, produce a concise discovery summary containing:

- Files/routes/components inspected  
    
- Workflows inspected  
    
- Forms/modals/dropdowns/buttons inspected  
    
- Existing behavior found  
    
- Data/schema/API implications, if any  
    
- Tests available  
    
- Source-of-truth docs inspected  
    
- Root cause or likely workflow problem path, where applicable  
    
- Risks, blockers, or unknowns  
    
- Smallest safe future implementation plan

FULL WORKFLOW AUDIT SCOPE:

1. Navigation and Entry Point Audit

Inspect and test:

- Header links  
    
- Sidebar links  
    
- Footer links  
    
- Dashboard cards  
    
- Table row links  
    
- Detail-page links  
    
- Back buttons  
    
- Cancel buttons  
    
- Breadcrumbs  
    
- Tabs  
    
- Hash/anchor links  
    
- Redirects  
    
- Login/logout gated routes  
    
- Admin/user route visibility  
    
- Empty-state links  
    
- Direct URL behavior

Look for:

- Broken links  
    
- Wrong destinations  
    
- Routes that only work from one page  
    
- Links that require returning Home first  
    
- Buttons styled as links but not wired  
    
- Missing back paths  
    
- Bad cancel behavior  
    
- Role-restricted links visible to wrong users  
    
- Missing empty-state links  
    
- Navigation loops  
    
- Dead routes  
    
- Stale legacy pages  
    
- Direct URL access mismatch

For each issue, report:

- Finding ID  
    
- Location  
    
- Click path  
    
- Current behavior  
    
- Expected behavior  
    
- Evidence  
    
- User impact  
    
- Recommended fix  
    
- Browser verification required  
    
2. Button and Action Audit

Inspect and test:

- Primary buttons  
    
- Secondary buttons  
    
- Row action buttons  
    
- Icon buttons  
    
- Save buttons  
    
- Cancel buttons  
    
- Close buttons  
    
- Edit buttons  
    
- Delete buttons  
    
- Release/archive buttons  
    
- Upload/download buttons  
    
- Generate buttons  
    
- Refresh buttons  
    
- Email/send buttons  
    
- Export buttons  
    
- Import buttons  
    
- Bulk action buttons, if present

Look for:

- Buttons that do nothing  
    
- Buttons not disabled during loading  
    
- Buttons that double-submit  
    
- Buttons that submit without validation  
    
- Buttons that do not show success/failure feedback  
    
- Buttons that leave stale UI behind  
    
- Buttons that do not navigate after destructive actions  
    
- Buttons that trigger the wrong route/API  
    
- Buttons hidden when they should appear  
    
- Buttons visible when user lacks access  
    
- Button labels that do not match behavior  
    
- Buttons that rely on stale state  
    
- Buttons that create duplicate requests

For each issue, report:

- Finding ID  
    
- Button/action  
    
- Page/component  
    
- Click path tested  
    
- Result observed  
    
- Expected result  
    
- Evidence  
    
- Recommended fix  
    
- Priority  
    
3. Dropdown, Filter, Search, and Sort Audit

Inspect and test every:

- Dropdown  
    
- Select  
    
- Multi-select  
    
- Combobox  
    
- Search input  
    
- Filter pill  
    
- Status filter  
    
- Date filter  
    
- Sort control  
    
- Table filter  
    
- Dashboard filter  
    
- Dependent dropdown  
    
- Role-specific dropdown  
    
- Record-selection dropdown

Look for:

- Dropdowns not opening  
    
- Missing options  
    
- Wrong options  
    
- Legacy options still showing  
    
- Deleted/inactive records still showing  
    
- Options not connected to backend data  
    
- Selection not changing results  
    
- Selection not persisting when expected  
    
- Selection causing errors  
    
- Dependent dropdowns not updating  
    
- Filters stacking incorrectly  
    
- Filters not clearing  
    
- Search not matching expected fields  
    
- Sort order incorrect  
    
- Empty results without clear message  
    
- Filter counts inconsistent with visible records  
    
- Dropdown options inconsistent across create/edit/detail pages

For each issue, report:

- Finding ID  
    
- Control  
    
- Location  
    
- Options observed  
    
- Selection tested  
    
- Current behavior  
    
- Expected behavior  
    
- Evidence  
    
- Recommended fix  
    
- Manual verification required  
    
4. Form and Modal Audit

Inspect and test:

- Create forms  
    
- Edit forms  
    
- Detail forms  
    
- Modal forms  
    
- Drawer forms  
    
- Inline edit forms  
    
- Required fields  
    
- Optional fields  
    
- Field defaults  
    
- Validation messages  
    
- Save/cancel/close behavior  
    
- Reset behavior  
    
- Form reload behavior

Look for:

- Missing required validation  
    
- Fields that save but do not persist  
    
- Fields that appear editable but are ignored  
    
- Backend fields missing from UI  
    
- UI fields missing from backend  
    
- Forms that allow invalid records  
    
- Forms that fail silently  
    
- Forms that do not show loading  
    
- Forms that do not show success/failure feedback  
    
- Forms that remain open after successful save when they should close  
    
- Forms that close without saving accidentally  
    
- Cancel that does not reset  
    
- Modal stale state between records  
    
- Default values wrong  
    
- Date handling issues  
    
- Status values inconsistent  
    
- Legacy values still selectable  
    
- Error and stale data shown at the same time

For each issue, report:

- Finding ID  
    
- Form/modal  
    
- Fields tested  
    
- Click path  
    
- Current behavior  
    
- Expected behavior  
    
- Evidence  
    
- Recommended fix  
    
- Tests needed  
    
- Browser verification required  
    
5. Create Workflow Audit

For every major create workflow, test:

- Entry point  
    
- Form opens/loads  
    
- Required fields  
    
- Dropdowns  
    
- Defaults  
    
- Validation  
    
- Save  
    
- Success feedback  
    
- Created record appears in list  
    
- Created record opens in detail page  
    
- Related records update  
    
- Reload persistence  
    
- Cancel behavior  
    
- Error behavior

Look for:

- Records created in wrong status  
    
- Records created but not visible  
    
- Records visible only in legacy sections  
    
- Related tables not updated  
    
- Rollups not updated  
    
- Missing foreign keys  
    
- Duplicate records  
    
- Malformed records  
    
- Save succeeds but UI does not refresh  
    
- Save fails without clear message  
    
- Create flow requires avoidable navigation  
    
- New records fail to appear in dropdowns where expected

For each issue, report:

- Finding ID  
    
- Workflow  
    
- Steps tested  
    
- Current behavior  
    
- Expected behavior  
    
- Evidence  
    
- Recommended fix  
    
- Priority  
    
6. Edit Workflow Audit

For every major edit workflow, test:

- Entry point  
    
- Existing values load  
    
- Fields are editable  
    
- Dropdowns reflect current values  
    
- Save works  
    
- Updated values persist after reload  
    
- Related records update  
    
- List/table reflects changes  
    
- Cancel preserves original values  
    
- Error handling works

Look for:

- Edit page opens wrong record  
    
- Fields not populated  
    
- Changes save but do not persist  
    
- Changes persist but UI does not refresh  
    
- Edit allowed when it should be blocked  
    
- Legacy values preserved incorrectly  
    
- Related records not synced  
    
- Inconsistent status behavior  
    
- Save returns success while data is unchanged  
    
- Form state stays stale when switching records

For each issue, report:

- Finding ID  
    
- Workflow  
    
- Steps tested  
    
- Current behavior  
    
- Expected behavior  
    
- Evidence  
    
- Recommended fix  
    
- Priority  
    
7. Delete / Release / Archive Workflow Audit

For every destructive or semi-destructive workflow, audit safely.

Do not delete real production data unless explicitly approved.

If safe test records exist and explicit approval exists, test:

- Delete/release/archive button  
    
- Confirmation modal  
    
- Cancel behavior  
    
- Confirm behavior  
    
- Related records update  
    
- List/table refresh  
    
- Detail page redirect  
    
- Reload behavior  
    
- Backend state  
    
- Error handling

If not safe to test directly, inspect code and recommend a controlled future test plan.

Look for:

- Delete button missing  
    
- Delete button fails  
    
- Record deleted but UI stays on broken detail page  
    
- Stale data appears with error message  
    
- Related record not released  
    
- Rollup not recalculated  
    
- Orphaned records  
    
- Hard delete where soft delete is required  
    
- No confirmation  
    
- No success/failure feedback  
    
- No dependency check  
    
- Delete allowed when dependencies exist  
    
- Delete hidden but backend route still available  
    
- Archive/release actions that do not update connected surfaces

For each issue, report:

- Finding ID  
    
- Workflow  
    
- Current behavior/evidence  
    
- Expected behavior  
    
- Data risk  
    
- Recommended fix  
    
- Human approval required  
    
- Future test plan  
    
8. List, Table, and Detail Page Audit

Inspect and test:

- List pages  
    
- Tables  
    
- Cards  
    
- Detail pages  
    
- Row click behavior  
    
- Pagination  
    
- Search/filter/sort  
    
- Status badges  
    
- Empty states  
    
- Error states  
    
- Loading states  
    
- Data refresh after mutations

Look for:

- Records missing  
    
- Records duplicated  
    
- Legacy records visible  
    
- Test/demo records visible  
    
- Incorrect statuses  
    
- Bad counts  
    
- Rows linking to wrong detail page  
    
- Detail page not found  
    
- Detail page shows stale data  
    
- Error and stale data shown together  
    
- Empty state unclear  
    
- Table does not refresh  
    
- Pagination broken  
    
- Bad loading spinners  
    
- Bad responsive behavior  
    
- Detail page does not reflect list state  
    
- List state lost unnecessarily after returning from detail page

For each issue, report:

- Finding ID  
    
- Page/table/detail  
    
- Evidence  
    
- Current behavior  
    
- Expected behavior  
    
- Recommended fix  
    
- Priority  
    
9. Legacy Record and Stale Data Audit

Inspect UI, schema, seeds, fixtures, test data, database records if safely accessible, and source-of-truth docs.

Look for:

- Legacy records still showing in active lists  
    
- Old statuses still selectable  
    
- Stale records visible in dropdowns  
    
- Deleted/inactive records visible where they should not be  
    
- Test records visible in production UI  
    
- Demo records mixed with real records  
    
- Orphaned records  
    
- Records with outdated naming  
    
- Records with missing relationships  
    
- Duplicate records  
    
- Old source-sheet/import records still active  
    
- Legacy sections still receiving new records  
    
- New records incorrectly showing only in legacy sections  
    
- Records connected to deleted/inactive parents  
    
- Active records with impossible or deprecated status values

For each issue, report:

- Finding ID  
    
- Record/table/source  
    
- Pattern observed  
    
- Count if safely known  
    
- Where it appears in UI  
    
- Why it appears legacy/stale  
    
- Evidence  
    
- Recommended cleanup approach  
    
- Backup/export required?  
    
- Dependency checks required?  
    
- Human approval required?

Do not remove records during this audit.

10. Connected Data Sync Audit

For every workflow where one action should update related records, verify the sync chain.

Examples:

- Create sale should update sale record, package/inventory status, program/account rollup, sold list, and detail views.  
    
- Delete sale should release package/inventory, update program/account rollup, remove from sold list, and navigate away from deleted detail page.  
    
- Edit account should update account detail, list row, dropdown options, reporting workflows, and connected records.  
    
- Generate report should update workflow status, generated files list, download link, and dashboard counters.  
    
- Upload/import should update validation state, parsed records, import status, error results, and final visible data.  
    
- Archive/release should update active lists, detail state, related parent records, and dropdown eligibility.

Apply this pattern to the actual repository workflows.

Look for:

- Partial updates  
    
- Backend state correct but frontend stale  
    
- Frontend optimistic state wrong  
    
- Related record not updated  
    
- Rollup not recalculated  
    
- Active ID not cleared  
    
- Status not synced  
    
- Detail page out of date  
    
- Dashboard counter wrong  
    
- Dropdown not refreshed  
    
- Cache invalidation missing or too broad  
    
- Mutation succeeds but connected surfaces remain stale

For each issue, report:

- Finding ID  
    
- Workflow  
    
- Connected records/surfaces  
    
- Sync expectation  
    
- Actual behavior  
    
- Evidence  
    
- Recommended fix  
    
- Tests needed  
    
- Browser verification required  
    
11. Error, Loading, and Empty State Audit

Inspect:

- Loading spinners  
    
- Disabled states  
    
- Empty states  
    
- Error banners  
    
- Inline validation  
    
- Toasts  
    
- Retry actions  
    
- Not found pages  
    
- Permission denied pages

Look for:

- Blank screens  
    
- Runtime overlays  
    
- Stale data plus error at same time  
    
- Missing loading indicators  
    
- Buttons active during loading  
    
- No error message  
    
- Raw technical errors shown to users  
    
- No retry path  
    
- Empty state with no next action  
    
- Not found after delete without redirect  
    
- Permission error unclear  
    
- Error state that hides useful recovery action  
    
- Loading state that never resolves  
    
- Duplicate requests during loading

For each issue, report:

- Finding ID  
    
- Page/component  
    
- State tested  
    
- Current behavior  
    
- Expected behavior  
    
- Evidence  
    
- Recommended fix  
    
- Priority  
    
12. Role, Permission, and Visibility Workflow Audit

If auth/roles exist, test or inspect:

- Logged-out view  
    
- Standard user view  
    
- Admin/manager view  
    
- Restricted user view  
    
- Protected pages  
    
- Protected buttons  
    
- Protected API actions  
    
- Sidebar visibility  
    
- Dashboard visibility  
    
- Detail page access  
    
- Direct URL access

Look for:

- Admin controls visible to standard users  
    
- Buttons visible but API denies them  
    
- API allows actions UI hides  
    
- Restricted pages accessible by direct URL  
    
- Wrong redirect behavior  
    
- Sensitive records visible in dropdowns  
    
- User view exposes internal tools  
    
- Permission checks only on frontend  
    
- Role-specific workflow starts but cannot complete  
    
- Direct URL behavior inconsistent with navigation visibility

For each issue, report:

- Finding ID  
    
- Role/surface  
    
- Current behavior  
    
- Expected behavior  
    
- Evidence  
    
- Security/user impact  
    
- Recommended fix  
    
- Verification needed  
    
13. Workflow Efficiency and Click Reduction Audit

For each major workflow, count or estimate:

- Number of clicks  
    
- Number of screens/pages  
    
- Number of modal openings  
    
- Number of manual fields  
    
- Number of repeated inputs  
    
- Number of mouse movements across the page  
    
- Number of times user must navigate away and back  
    
- Number of times user must search for the same record  
    
- Number of avoidable reloads  
    
- Number of confirmation steps  
    
- Number of unclear decisions

Look for opportunities to:

- Reduce clicks  
    
- Reduce screen-hopping  
    
- Combine related actions  
    
- Add inline actions  
    
- Add smart defaults  
    
- Auto-fill known fields  
    
- Preserve filters  
    
- Add quick actions  
    
- Add direct links after save  
    
- Add contextual next steps  
    
- Add better grouping  
    
- Move common actions closer to the user’s current focus  
    
- Replace multi-screen workflows with modal/drawer flows where appropriate  
    
- Replace manual refresh with automatic query invalidation  
    
- Add safe bulk actions only where appropriate  
    
- Hide legacy/noisy records from active workflows  
    
- Improve labels  
    
- Improve button placement  
    
- Improve status clarity  
    
- Improve empty-state guidance  
    
- Reduce repeated manual data entry  
    
- Make the next best action obvious

For each improvement opportunity, report:

- Finding ID  
    
- Workflow  
    
- Current click/process burden  
    
- Recommended improvement  
    
- Expected user benefit  
    
- Risk of change  
    
- Priority  
    
- Manual verification required  
    
14. User Understanding and Language Audit

Inspect user-facing copy:

- Page titles  
    
- Button labels  
    
- Dropdown labels  
    
- Status labels  
    
- Empty states  
    
- Error messages  
    
- Confirmation modals  
    
- Helper text  
    
- Table headers  
    
- Tooltips  
    
- Navigation labels

Look for:

- Confusing labels  
    
- Internal jargon  
    
- Legacy terminology  
    
- Labels that do not match behavior  
    
- Statuses users cannot understand  
    
- Missing explanations  
    
- Too much text  
    
- Not enough guidance  
    
- Warning language too weak  
    
- Destructive actions not clear enough  
    
- Duplicate labels for different things  
    
- Labels that obscure the true workflow outcome

For each issue, report:

- Finding ID  
    
- Location  
    
- Current language  
    
- Why it confuses users  
    
- Recommended wording direction  
    
- Priority  
    
15. Workflow Test Coverage Audit

Inspect available tests and identify missing coverage for:

- Navigation  
    
- Dropdowns  
    
- Filters  
    
- Create/edit/delete flows  
    
- Save → reload → persisted value  
    
- Delete/release → related records update  
    
- Modal open/save/cancel/close  
    
- Stale UI prevention  
    
- Legacy record filtering  
    
- Role/access behavior  
    
- Table refresh after mutation  
    
- Generated/downloaded files  
    
- Upload/import flows  
    
- Empty/error/loading states  
    
- Browser e2e happy path  
    
- Browser e2e non-happy path  
    
- Recently fixed workflow bugs needing regression coverage

Do not create tests during this audit.

For each gap, report:

- Finding ID  
    
- Workflow  
    
- Missing test  
    
- Why it matters  
    
- Recommended test  
    
- Priority

TESTING AND VALIDATION:

Run only safe validation commands.

Include, where available:

- Typecheck  
    
- Build  
    
- Lint/format check  
    
- Relevant unit tests  
    
- Relevant API/server tests  
    
- Relevant frontend/component tests  
    
- Relevant E2E tests, if safe  
    
- Codegen check, if applicable  
    
- Existing verify command, if available

For manual workflow validation, include:

- Browser smoke testing for every audited user workflow where available  
    
- Edge-case validation  
    
- Reload/navigation persistence checks  
    
- Console/network check for errors, duplicate requests, runtime overlays, unexpected 4xx/5xx responses, stale UI, and broken state  
    
- Desktop viewport checks  
    
- Narrow/mobile viewport checks if the project supports responsive browser preview

For data or production cleanup findings, do not perform cleanup. Recommend:

- Dry-run before destructive changes  
    
- Backup/export/snapshot before deletion, archive, migration, or bulk update  
    
- Before/after counts  
    
- Orphan checks  
    
- Dependency checks  
    
- Rollback notes  
    
- Clear list of preserved, changed, and ambiguous records  
    
- Human approval before action

If a test command or UI test framework does not exist, do not invent one. Report what exists and what manual validation was performed instead.

DOCUMENTATION / SOURCE OF TRUTH:

Do not update documentation during this audit unless explicitly instructed.

In the final report, identify whether CLAUDE.md or another source-of-truth file should be updated after future cleanup or workflow improvements.

Only recommend documentation updates when future work creates:

- Durable completed status  
    
- Durable rules  
    
- Migration notes  
    
- Data model changes  
    
- Workflow behavior changes  
    
- Operational instructions  
    
- Future TODOs  
    
- Known issue tracking

Do not document speculative future work as completed.

REQUIRED FINDING ID FORMAT:

Assign every finding a stable ID.

Use this format:

- FLOW-P0-001 for critical security/data-integrity/workflow corruption issues  
    
- FLOW-P1-001 for broken user-facing workflow issues  
    
- FLOW-P2-001 for legacy/stale/test data visibility issues  
    
- FLOW-P3-001 for inefficient workflow/click reduction issues  
    
- FLOW-P4-001 for UI clarity/polish/understanding issues  
    
- FLOW-P5-001 for missing workflow test coverage or documentation issues  
    
- FLOW-FUTURE-001 for valid but intentionally deferred future workflow improvements

Each finding must include:

- Finding ID  
    
- Severity: Critical | High | Medium | Low | Info  
    
- Category  
    
- Workflow/page/component/route/table  
    
- Exact click path or inspection path  
    
- Evidence  
    
- User impact  
    
- Recommended action  
    
- Risk of fix  
    
- Tests needed  
    
- Manual browser verification required?  
    
- Human approval required?

REQUIRED OUTPUT FORMAT:

Return the final report in this exact structure.

# Full Workflow, Click Path, UI Interaction, Legacy Record, and Efficiency Audit Report

## 1\. Executive Summary

Briefly explain:

- Overall workflow health  
    
- Biggest broken workflow risks  
    
- Biggest user friction points  
    
- Biggest legacy/stale/test record risks  
    
- Highest-value first improvement  
    
- Any major uncertainty

## 2\. Baseline Workflow Map

List:

- Main user-facing workflows discovered  
    
- Main admin/internal workflows discovered  
    
- Main create workflows  
    
- Main edit workflows  
    
- Main delete/release/archive workflows  
    
- Main list/detail workflows  
    
- Main search/filter/dropdown workflows  
    
- Main generated/upload/download workflows, if present  
    
- Main role/access-restricted workflows, if present  
    
- Main connected data relationships  
    
- Source-of-truth docs found

## 3\. Commands Run and Results

Create a table:

- Command  
    
- Result  
    
- Pass/fail  
    
- Notes  
    
- Blocking?  
    
- If not run, why not

## 4\. Browser / Manual Workflow Verification Performed

Create a table:

- Workflow  
    
- Page/route  
    
- User role tested, if applicable  
    
- Click path tested  
    
- Result  
    
- Passed?  
    
- Console/network issues?  
    
- Notes

If browser testing was not available, state that clearly and provide the future verification checklist.

## 5\. Discovery Summary

Include:

- Files/routes/components inspected  
    
- Workflows inspected  
    
- Forms/modals/dropdowns/buttons inspected  
    
- Existing behavior found  
    
- Data/schema/API implications  
    
- Tests available  
    
- Source-of-truth docs inspected  
    
- Risks/blockers/unknowns  
    
- Smallest safe future implementation approach

## 6\. Findings Index

Create a table:

- Finding ID  
    
- Severity  
    
- Category  
    
- Workflow/Page  
    
- One-line summary  
    
- Recommended action  
    
- Human approval required?

## 7\. Critical Workflow Findings

List only the most important issues affecting core workflow completion, data integrity, user trust, security, or major usability.

For each:

- Finding ID  
    
- Priority  
    
- Workflow/page/table  
    
- Finding  
    
- Evidence  
    
- User impact  
    
- Recommended action  
    
- Risk of fix  
    
- Suggested test coverage  
    
- Manual browser verification needed  
    
- Human approval required?

## 8\. Broken Buttons, Dropdowns, Links, Forms, and Actions

Create a table:

- Finding ID  
    
- Location  
    
- UI control/action  
    
- Click path tested  
    
- Current behavior  
    
- Expected behavior  
    
- Evidence  
    
- Recommended fix  
    
- Priority  
    
- Browser verification required

## 9\. Workflow Completion Findings

Create a table:

- Finding ID  
    
- Workflow  
    
- Start point  
    
- End goal  
    
- Where the workflow breaks or creates friction  
    
- Evidence  
    
- Recommended fix  
    
- Priority  
    
- Tests needed  
    
- Browser verification required

## 10\. Legacy, Stale, Test, or Malformed Record Findings

Create a table:

- Finding ID  
    
- Table/source/UI location  
    
- Record pattern or issue  
    
- Count if known  
    
- Where it appears  
    
- Why it is legacy/stale/malformed  
    
- Dependency risk  
    
- Safe to remove?  
    
- Recommended action  
    
- Backup/export required?  
    
- Human review required?

## 11\. Connected Data Sync Findings

Create a table:

- Finding ID  
    
- Workflow  
    
- Related records/surfaces  
    
- Expected sync behavior  
    
- Actual behavior  
    
- Evidence  
    
- Impact  
    
- Recommended fix  
    
- Tests needed

## 12\. Navigation and Screen-Hopping Findings

Create a table:

- Finding ID  
    
- Workflow/page  
    
- Navigation issue  
    
- Current click path  
    
- Better path  
    
- User impact  
    
- Recommended improvement  
    
- Priority  
    
- Difficulty

## 13\. Click Reduction and Efficiency Opportunities

Create a table:

- Finding ID  
    
- Workflow  
    
- Current burden  
    
- Recommended improvement  
    
- Expected clicks/screens saved  
    
- User benefit  
    
- Risk  
    
- Priority  
    
- Manual verification required

## 14\. Dropdown, Filter, Search, and Sort Findings

Create a table:

- Finding ID  
    
- Control/location  
    
- Options/results tested  
    
- Current behavior  
    
- Expected behavior  
    
- Evidence  
    
- Recommended fix  
    
- Priority  
    
- Browser verification required

## 15\. Form, Modal, Save, Cancel, and Reload Findings

Create a table:

- Finding ID  
    
- Form/modal  
    
- Fields/actions tested  
    
- Current behavior  
    
- Expected behavior  
    
- Persistence/reload result  
    
- Evidence  
    
- Recommended fix  
    
- Priority

## 16\. Error, Loading, Empty State, and Stale UI Findings

Create a table:

- Finding ID  
    
- Page/component/state  
    
- Current behavior  
    
- Expected behavior  
    
- Evidence  
    
- User impact  
    
- Recommended fix  
    
- Priority

## 17\. Role, Permission, and Visibility Findings

Create a table:

- Finding ID  
    
- Role/surface  
    
- Current behavior  
    
- Expected behavior  
    
- Evidence  
    
- Risk  
    
- Recommended fix  
    
- Verification needed

## 18\. User Understanding and Labeling Findings

Create a table:

- Finding ID  
    
- Location  
    
- Current label/copy/status  
    
- Why it is confusing  
    
- Recommended wording direction  
    
- Priority

## 19\. Workflow Test Coverage Gaps

Create a table:

- Finding ID  
    
- Workflow  
    
- Missing test  
    
- Why it matters  
    
- Recommended test  
    
- Priority

## 20\. Prioritized Workflow Improvement Backlog

Group tasks by:

### Priority 0: Critical Workflow/Data Integrity/Security

### Priority 1: Broken User-Facing Workflow

### Priority 2: Legacy/Stale/Test Record Visibility

### Priority 3: Click Reduction / Workflow Efficiency

### Priority 4: UI Clarity / User Understanding / Polish

### Priority 5: Workflow Test Coverage / Documentation

### Future Backlog

Each task must include:

- Finding ID  
    
- Task title  
    
- Why it matters  
    
- Evidence  
    
- Files/pages/routes/tables likely involved  
    
- Recommended implementation approach  
    
- Suggested verification steps  
    
- Human approval needed?

## 21\. Recommended Workflow Improvement Order

Give the safest order to improve the workflow.

Use this sequence unless discovery proves a better order:

1. Protect data and confirm safe test conditions  
     
2. Add or confirm workflow tests/guardrails  
     
3. Fix broken save/edit/delete/release workflows  
     
4. Fix stale UI and connected data sync issues  
     
5. Remove or hide legacy/stale/test records from active workflows after approval  
     
6. Fix broken dropdowns, filters, links, and buttons  
     
7. Reduce clicks and screen-hopping  
     
8. Improve labels, layout, and user guidance  
     
9. Update source-of-truth documentation after fixes are complete

## 22\. Items That Require Human Approval Before Action

List anything that should not be deleted, hidden, archived, renamed, migrated, bulk-updated, workflow-changed, or documented without approval.

## 23\. Items Intentionally Not Touched

Confirm:

- No implementation was performed.  
    
- No data was changed.  
    
- No records were deleted, hidden, archived, or modified.  
    
- No files were changed.  
    
- No routes were changed.  
    
- No schemas were changed.  
    
- No tests were changed.  
    
- No docs were changed unless explicitly approved.  
    
- No unrelated areas were modified.  
    
- No destructive commands were run.

## 24\. Final Recommendation

Give a clear, decisive recommendation for the first workflow improvement to implement and why.

COMPLETION REPORT REQUIREMENTS:

At the end of the audit report, include:

## Completion Report

- Final status: Complete, Partially Complete, or Not Complete  
    
- What workflows were audited  
    
- What click paths were tested  
    
- What buttons/dropdowns/forms/modals were tested  
    
- What files/areas were inspected  
    
- Commands/checks run and results  
    
- Browser verification performed, if any  
    
- Browser verification still required  
    
- Legacy/stale/test records found, if any  
    
- Schema/API/data changes: must be “None” unless explicitly approved  
    
- Data cleanup performed: must be “None” unless explicitly approved  
    
- Destructive actions performed: must be “None”  
    
- Remaining risks or unresolved items  
    
- Future items intentionally not completed  
    
- Confirmation that unrelated areas were not modified  
    
- Confirmation that this was audit-only and no fixes were implemented  
    
- Confirmation that no secret values were logged or exposed

FINAL RULES:

Be brutally accurate.

Test like a real user.

Do not exaggerate.

Do not guess.

Do not invent.

Do not hide uncertainty.

Do not mark anything as working unless verified.

Do not mark anything as broken unless verified.

Do not mark any record as safe to remove unless dependencies were checked.

Do not perform destructive actions.

Do not implement fixes.

Do not weaken validation, auth, safety, security, or data integrity.

If something is unclear, mark it as “Needs human review.”

Prefer root-cause workflow fixes over surface-level patching.

Prioritize user efficiency, data integrity, workflow completion, clarity, production safety, and professional usability.

The goal is to make the system easier to use, faster to operate, cleaner to understand, safer to trust, and more efficient for real users.
