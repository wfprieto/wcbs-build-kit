# Data Integrity, Legacy Records, and Cleanup Safety Audit

## READ-FIRST INSTRUCTION

Read this entire prompt from top to bottom before taking any action.

Do not skip sections.

Do not summarize prematurely.

Do not rely on stale session context.

Do not rely on prior conversation history.

Do not assume data is clean because the app builds, typechecks, or passes tests.

Do not assume records are safe to delete, hide, archive, merge, migrate, normalize, or modify until dependency checks prove it.

Do not begin implementation before completing discovery.

This is a DATA INTEGRITY AND CLEANUP AUDIT-ONLY task.

Do not modify code.

Do not modify records.

Do not delete records.

Do not soft-delete records.

Do not archive records.

Do not merge records.

Do not rename records.

Do not normalize records.

Do not run cleanup scripts.

Do not run import scripts.

Do not run seed scripts.

Do not run migrations.

Do not truncate, reset, backfill, sync, or mutate the database.

Do not change schemas, routes, tests, UI, generated files, docs, or source-of-truth files unless explicitly instructed.

Do not expose secrets or private user/customer/member data.

Your job is to inspect the actual repository and safely audit the data model, records, relationships, cleanup risks, stale data, test data, legacy statuses, import quality, rollups, destructive-action safety, and future cleanup requirements.

The final deliverable is a prioritized data-integrity and cleanup safety report with evidence, dry-run plans, backup/export requirements, dependency checks, rollback requirements, and human approval gates.

## OBJECTIVE

Perform a complete, evidence-based audit covering:

1. Test records  
     
2. Demo records  
     
3. Placeholder records  
     
4. Stale or abandoned records  
     
5. Duplicate records  
     
6. Orphaned records  
     
7. Malformed records  
     
8. Missing relationships  
     
9. Legacy statuses  
     
10. Invalid enum/status values  
      
11. Bad imports  
      
12. Source-data mapping issues  
      
13. Rollup/count mismatches  
      
14. Related-record sync failures  
      
15. Delete/release/archive/restore safety  
      
16. Soft-delete and hard-delete risks  
      
17. Import/export data quality  
      
18. Seed/demo/test data pollution  
      
19. Migration/backfill risks  
      
20. Unsafe cleanup scripts  
      
21. UI exposure of bad data  
      
22. Test data isolation and teardown gaps  
      
23. Dry-run cleanup plans  
      
24. Backup/export/snapshot requirements  
      
25. Before/after count requirements  
      
26. Human approval requirements before future cleanup

The goal is to determine what data appears clean, what is suspicious, what is unsafe, what needs human review, and what can only be cleaned later with a controlled implementation prompt.

Do not perform cleanup during this task.

## CURRENT CONTEXT

This audit is for the current repository.

Discover the actual app type, database/ORM, schema, tables, relationships, workflows, import sources, status values, soft-delete patterns, rollups, source-of-truth documents, tests, scripts, fixtures, seeds, data factories, cleanup utilities, and relevant UI surfaces directly from the repository.

Do not assume the project uses any specific framework, database, ORM, schema style, import process, status model, cleanup system, or source-of-truth file until verified.

If a table, record type, relationship, import flow, cleanup script, migration, status value, workflow, UI surface, or test fixture is not confirmed in the repository, mark it as unknown and explain how it should be verified.

## NON-NEGOTIABLE GUARDRAILS

### Audit-Only Scope

This is audit-only.

Do not implement fixes.

Do not clean records.

Do not delete records.

Do not soft-delete records.

Do not archive records.

Do not merge records.

Do not rename records.

Do not edit records.

Do not run destructive SQL.

Do not run migrations.

Do not run seed scripts.

Do not run cleanup scripts.

Do not run import/sync/backfill scripts.

Do not update source-of-truth docs unless explicitly instructed.

If a severe data-integrity risk is found, document it with evidence and recommend a separate implementation prompt.

### Anti-Drift Rules

Work only on the requested task.

Do not reopen completed work.

Do not modify unrelated features, routes, UI, schemas, tests, copy, or documentation.

Do not chase stale TODOs, old session-plan items, or previously closed issues.

Do not “improve” unrelated areas while touching nearby files.

If unrelated issues are found, report them separately without fixing them unless they block the current task.

### Data Safety Rules

Do not mutate production data.

Do not run DELETE, TRUNCATE, DROP, ALTER, UPDATE, INSERT, UPSERT, MERGE, or destructive SQL.

Do not run scripts that write to the database.

Do not run scripts that seed, reset, backfill, import, sync, normalize, or clean data.

Do not mark any record safe to remove without dependency checks.

Do not inspect or expose private data beyond what is necessary to identify patterns.

Do not include private user/customer/member data in the report.

Any future cleanup recommendation must include:

- dry-run plan  
    
- backup/export/snapshot requirement  
    
- before/after count requirement  
    
- dependency checks  
    
- orphan checks  
    
- rollback plan  
    
- exact record criteria or record-pattern criteria  
    
- preserved/changed/ambiguous record classification  
    
- safe/unsafe/needs-human-review classification  
    
- tests needed  
    
- manual browser/API verification needed  
    
- human approval requirement

### Secret and Privacy Safety

Do not expose API keys, auth secrets, payment secrets, webhook secrets, session secrets, database credentials, OAuth tokens, JWT secrets, provider keys, service credentials, private logs, personal data, sensitive environment values, or sensitive record contents.

If secret or private-data exposure risk is discovered, report only the file/path/table/pattern and risk. Do not reveal the secret or private value.

## QUALITY BAR

Every finding must be evidence-based.

Evidence may include:

- schema/table path  
    
- migration path  
    
- seed/fixture path  
    
- import script path  
    
- export script path  
    
- cleanup/backfill script path  
    
- route/API path  
    
- UI workflow path  
    
- status enum definition  
    
- soft-delete pattern  
    
- relationship or foreign-key definition  
    
- query pattern  
    
- count query result, if safely obtained  
    
- dependency search result  
    
- source-of-truth contradiction  
    
- test data factory evidence  
    
- safe read-only database inspection  
    
- browser/UI evidence, if safely verified

Do not guess.

Do not exaggerate.

Do not mark a record safe to remove unless dependencies were checked.

Do not mark a table clean unless inspected.

Do not mark a cleanup script safe unless its behavior is verified.

Do not call a record duplicate unless the duplicate criteria are defined.

If evidence is incomplete, label it “Needs human review.”

A passing typecheck/build/test run is not enough to call data healthy.

Do not mark any UI control as complete unless it has been manually tested in the browser. For every button, dropdown, checkbox, form field, filter, modal, save/cancel action, and navigation link touched by any future implementation, verification must prove:

- It renders correctly.  
    
- It can be interacted with.  
    
- It performs the intended action.  
    
- It persists or updates data correctly when applicable.  
    
- It survives reload/navigation.  
    
- It does not create console errors, runtime overlays, duplicate requests, or broken state.  
    
- It works across all relevant variants, not just the first happy-path example.

## ACCOUNT / REPORT AGENT QUALITY RULE

When building or verifying Account setup, Reports, Reps, KPI Standards, Generated Reports, dashboards, generated files, downloads, or reporting workflows, Claude must verify the full user workflow in the browser before completion.

Specific future proof requirements:

- If a Save button is added or changed, prove save → reload → persisted value.  
    
- If a generated report workflow is added or changed, prove create → status update → download/open.  
    
- If a filter/dropdown is added or changed, prove selection changes the displayed result correctly.  
    
- If a checkbox is added or changed, prove checked/unchecked state updates correctly, persists when applicable, and does not cause duplicate updates or render loops.  
    
- If a form field is added or changed, prove input → validation → save/update → reload behavior.  
    
- If navigation is added or changed, prove the route/link works from all relevant entry points.

During this audit, identify where this proof is missing for data-facing workflows.

## PRE-AUDIT DISCOVERY

Before writing findings, inspect the actual repository.

Discovery must include, where applicable:

1. Database schema files  
     
2. ORM models  
     
3. Migrations  
     
4. Status enums/constants  
     
5. Seed files  
     
6. Fixture files  
     
7. Demo/test data scripts  
     
8. Import scripts  
     
9. Export scripts  
     
10. Cleanup scripts  
      
11. Backfill scripts  
      
12. E2E data factories  
      
13. Test setup/teardown files  
      
14. Generated schema/types, if present  
      
15. API routes that create/edit/delete/release/archive/restore/close/import/export/generate records  
      
16. UI workflows exposing active/inactive/archived/legacy/test/stale records  
      
17. Rollup/count/dashboard/status logic  
      
18. Related-record sync logic  
      
19. Soft-delete and hard-delete patterns  
      
20. Relationship and foreign-key patterns  
      
21. Source-of-truth docs such as README, CLAUDE.md, docs, audit reports, known issue lists, data notes, import notes, migration notes, or cleanup notes  
      
22. Available safe validation commands

Run only safe read-only commands. If using database inspection, use SELECT/count-style checks only and avoid private data exposure.

If a command is risky, destructive, requires secrets, requires unavailable network access, or may mutate data, do not run it. Report why.

Produce a concise discovery summary before final findings.

The discovery summary must include:

- schemas/tables/models inspected  
    
- workflows inspected  
    
- routes inspected  
    
- import/export/seed/fixture scripts inspected  
    
- cleanup/backfill scripts inspected  
    
- status values discovered  
    
- relationship patterns discovered  
    
- safe counts collected, if any  
    
- tests/scripts available  
    
- source-of-truth docs inspected  
    
- risks, blockers, or unknowns  
    
- smallest safe future cleanup approach

## FULL AUDIT SCOPE

### 1\. Test, Demo, Placeholder, and Stale Records

Look for:

- E2E test records  
    
- demo records  
    
- placeholder records  
    
- smoke-test records  
    
- QA records  
    
- abandoned drafts  
    
- old import-test rows  
    
- generated test records without teardown  
    
- test prefixes/suffixes  
    
- old users or accounts  
    
- inactive records still appearing active  
    
- records visible in production-facing UI  
    
- stale records tied to completed or inactive workflows

For each issue, report table/source, pattern, count if safely known, where it appears, why it is suspicious, dependency risk, cleanup recommendation, backup/export need, and approval need.

### 2\. Orphaned Records and Missing Relationships

Look for:

- child records with missing parents  
    
- active records tied to inactive/deleted parents  
    
- null relationship fields that should be required  
    
- orphaned files/attachments/reports/messages/notifications/comments/replies  
    
- records unreachable from UI but still active  
    
- dropdowns showing broken relationships  
    
- cross-table references without ownership or tenant/account scoping

Include dependency checks and safe handling recommendations.

### 3\. Legacy Statuses and Invalid Enums

Inspect all status values and status sources of truth.

Look for:

- deprecated statuses  
    
- impossible states  
    
- statuses in data but not in code  
    
- UI statuses not accepted by backend  
    
- backend statuses missing from UI  
    
- old labels still selectable  
    
- active lists showing legacy states  
    
- records stuck in transitional states  
    
- mismatched wording between UI/API/DB/docs/tests

### 4\. Bad Imports and Source Data

Inspect import logic and imported records.

Look for:

- duplicate imports  
    
- partial imports  
    
- missing fields  
    
- wrong status mapping  
    
- imported test rows  
    
- old source-sheet rows still active  
    
- imports that overwrite real records  
    
- imports without validation  
    
- imports without dry-run  
    
- imports without backup/export  
    
- imports without row-level error reporting  
    
- imports that bypass business rules  
    
- imports that create orphaned records

Do not rerun imports unless explicitly approved.

### 5\. Duplicate and Conflicting Records

Look for:

- duplicate accounts/users/items/programs/packages/posts/reports/files  
    
- duplicate external IDs  
    
- case/whitespace email duplicates  
    
- duplicate names that should be unique  
    
- multiple active records where only one should exist  
    
- conflicting ownership  
    
- duplicate generated files  
    
- duplicate sold/active/archive records  
    
- duplicate subscription/entitlement records

Classify duplicates as confirmed, likely, or needs human review.

### 6\. Rollup, Count, and Connected Sync

Check whether these match actual data:

- parent status and child status  
    
- dashboard counts and records  
    
- list counts and query results  
    
- active/sold/available/archived counts  
    
- generated report status and file records  
    
- subscription/member status and entitlement access  
    
- notification counts and notification records  
    
- comment/reply counts and actual replies  
    
- package/program/account rollups  
    
- import summary counts and database state

Report expected behavior, observed evidence, risk, and tests needed.

### 7\. Delete / Release / Archive / Restore Safety

Inspect destructive and semi-destructive workflows.

Look for:

- hard delete where soft delete is safer  
    
- soft-deleted records still active  
    
- archive not removing from active lists  
    
- release not clearing active links  
    
- restore not reconnecting related records correctly  
    
- delete leaving orphaned children  
    
- account close leaving active sessions/records  
    
- missing dependency checks  
    
- missing confirmation  
    
- backend delete route exposed despite UI hiding it  
    
- missing auth/role/ownership checks  
    
- missing audit logs  
    
- no rollback plan

Do not test destructive actions on real records. Recommend controlled future test plans.

### 8\. Validation and Constraints

Inspect schemas, validators, forms, routes, and database rules.

Look for:

- missing NOT NULL  
    
- missing uniqueness  
    
- missing foreign keys  
    
- missing ownership scoping  
    
- missing enum constraints  
    
- weak date/numeric validation  
    
- weak route validation  
    
- weak form validation  
    
- fields editable in UI but ignored by backend  
    
- backend-used fields missing from UI  
    
- nullable fields breaking workflows  
    
- records allowed in impossible states  
    
- duplicated validation that can drift

### 9\. Cleanup Script and Migration Safety

Inspect cleanup, seed, import, migration, and backfill scripts.

Look for:

- no dry-run  
    
- no backup/export  
    
- no before/after counts  
    
- no rollback  
    
- no dependency checks  
    
- no environment guard  
    
- hardcoded IDs  
    
- non-idempotent scripts  
    
- production/test confusion  
    
- destructive defaults  
    
- scripts mutating append-only, audit, ledger, billing, payment, access, admin, event, or compliance tables

### 10\. UI Exposure of Bad Data

Inspect UI paths where stale, test, legacy, inactive, duplicate, orphaned, or malformed records may appear.

Look for:

- active lists showing test data  
    
- dropdowns showing inactive/deleted records  
    
- filters showing legacy statuses  
    
- orphaned rows in tables  
    
- old imports visible to users  
    
- stale UI after delete/release/archive  
    
- empty/error states hiding bad data  
    
- role-restricted users seeing internal/test data

If browser testing is safe, verify key surfaces. If not, list exact future browser checks.

### 11\. Data Integrity Test Coverage

Inspect tests for:

- orphan prevention  
    
- duplicate prevention  
    
- enum/status validation  
    
- import validation  
    
- rollup sync  
    
- delete/release/archive/restore behavior  
    
- stale UI after mutations  
    
- cleanup dry-run behavior  
    
- backup/export expectations  
    
- seed/test teardown  
    
- migration/backfill safety

Do not add tests. Recommend priority tests.

## FINDING IDS

Use:

- DATA-P0-001 for critical data integrity, destructive cleanup, security, payment/access/audit, or production-risk issues  
    
- DATA-P1-001 for high-priority orphan, duplicate, bad import, rollup, or relationship issues  
    
- DATA-P2-001 for stale/test/demo/legacy record visibility issues  
    
- DATA-P3-001 for validation, cleanup-script, migration, or test-data isolation issues  
    
- DATA-P4-001 for lower-priority cleanup, documentation, or data hygiene improvements  
    
- DATA-FUTURE-001 for valid deferred improvements

Each finding must include:

- Finding ID  
    
- Severity: Critical | High | Medium | Low | Info  
    
- Category  
    
- Table/source/route/UI/workflow  
    
- Evidence  
    
- Impact  
    
- Recommended action  
    
- Cleanup risk  
    
- Dry-run required?  
    
- Backup/export required?  
    
- Dependency checks required?  
    
- Tests needed  
    
- Manual verification required?  
    
- Human approval required?

## REQUIRED OUTPUT FORMAT

Return the report in this exact structure:

# Data Integrity, Legacy Records, and Cleanup Safety Audit Report

## 1\. Final Status

Use one:

- Data integrity audit complete, no changes made  
    
- Data integrity audit partially complete, blocked by specific issue  
    
- Data integrity audit not complete

## 2\. Executive Summary

Include data health, biggest risks, strongest clean areas, highest-value first cleanup, whether feature work should continue or pause, and major uncertainty.

## 3\. Baseline Data Map

Include database/ORM, major tables/entities, relationships, status enums, import/export flows, seed/fixture/test data sources, cleanup scripts, soft-delete/hard-delete patterns, rollup/count logic, and source-of-truth docs.

## 4\. Commands Run and Results

Create a table:

| Command | Result | Pass/Fail | Notes | Blocking? |

|---|---|---|---|---|

## 5\. Discovery Summary

Include schemas/tables/workflows/routes/scripts/docs inspected, safe counts collected, risks/blockers/unknowns.

## 6\. Findings Index

Create a table:

| Finding ID | Severity | Category | Location | Summary | Recommended Action | Human Approval Required? |

|---|---|---|---|---|---|---|

## 7\. Critical Data Findings

List only P0/P1 findings with evidence, impact, cleanup risk, recommended action, tests, dry-run/backup needs, and approval needs.

## 8\. Test / Demo / Placeholder / Stale Record Findings

## 9\. Orphaned and Missing Relationship Findings

## 10\. Legacy Status and Invalid Enum Findings

## 11\. Bad Import and Source Data Findings

## 12\. Duplicate and Conflicting Record Findings

## 13\. Rollup, Count, and Connected Sync Findings

## 14\. Delete / Release / Archive / Restore Safety Findings

## 15\. Data Validation and Constraint Findings

## 16\. Cleanup Script and Migration Safety Findings

## 17\. UI Exposure of Bad Data Findings

## 18\. Data Integrity Test Coverage Gaps

## 19\. Proposed Cleanup Groups

Group into:

### Safe Candidates After Dry-Run

### Requires Backup/Export First

### Requires Human Review

### Do Not Touch Yet

### Needs More Discovery

Each group must include evidence, cleanup risk, dependency checks needed, and approval requirements.

## 20\. Prioritized Data Integrity Backlog

Group by:

### P0 — Critical Data / Security / Payment / Access / Audit Risk

### P1 — Orphan / Duplicate / Bad Import / Rollup / Relationship Risk

### P2 — Stale / Test / Demo / Legacy Record Visibility

### P3 — Validation / Cleanup Script / Migration / Test Data Isolation

### P4 — Lower-Priority Cleanup / Documentation / Data Hygiene

### Future Backlog

Each item must include why it matters, evidence, likely files/routes/tables, implementation approach, dry-run plan, backup/export plan, verification steps, and approval needs.

## 21\. Recommended Implementation Order

Use this order unless discovery proves otherwise:

1. Protect critical data/security/payment/access/audit boundaries  
     
2. Add tests and dry-run checks around risky cleanup  
     
3. Fix orphan, relationship, and rollup mismatch risks  
     
4. Fix bad imports and validation gaps  
     
5. Hide or separate stale/test/demo/legacy records from active workflows  
     
6. Perform approved cleanup with backup/export and before/after counts  
     
7. Improve delete/release/archive/restore safety  
     
8. Update documentation/source-of-truth after verified cleanup

## 22\. Items Requiring Human Approval

List anything that should not be deleted, hidden, archived, merged, migrated, backfilled, normalized, bulk-updated, or documented without approval.

## 23\. Items Intentionally Not Touched

Confirm no code, records, data, schema, migrations, routes, tests, docs, production records, destructive commands, or secrets were changed or exposed.

## 24\. Final Recommendation

Give the first data-integrity improvement to implement and why.

## Completion Report

Include final status, what was audited, commands run, data inspected, code/data/schema/route changes as “None,” cleanup performed as “None,” destructive actions as “None,” secrets exposed as “None,” remaining risks, future items, confirmation unrelated areas were not modified, and next prompt label.

## FINAL RULES

Be precise.

Do not guess.

Do not invent.

Do not implement.

Do not mutate data.

Do not expose secrets.

Do not mark records safe to remove without dependency checks.

Do not recommend destructive cleanup without dry-run, backup/export, before/after counts, rollback notes, and human approval.

If unclear, mark “Needs human review.”

The goal is to protect data integrity, prevent unsafe cleanup, identify stale or broken records, and create a safe cleanup roadmap without changing any data during the audit.
