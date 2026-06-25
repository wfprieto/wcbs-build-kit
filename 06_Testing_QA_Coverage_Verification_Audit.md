# Testing, QA Coverage, and Verification Audit

## READ-FIRST INSTRUCTION

Read this entire prompt from top to bottom before taking any action.

Do not skip sections.

Do not summarize prematurely.

Do not rely on stale session context.

Do not rely on prior conversation history.

Do not assume the test suite is healthy because typecheck, build, lint, or a few targeted tests pass.

Do not assume existing tests prove the workflows they claim to cover.

Do not begin implementation before completing discovery.

This is a TESTING, QA COVERAGE, AND VERIFICATION AUDIT-ONLY task.

Do not modify code.

Do not add tests.

Do not delete tests.

Do not rewrite tests.

Do not update snapshots.

Do not change mocks, fixtures, factories, schemas, routes, UI, generated files, docs, or source-of-truth files.

Do not run destructive commands.

Do not mutate production data.

Do not expose secrets.

Your job is to inspect the actual repository, discover the real testing and verification structure, run safe validation commands where appropriate, identify missing/brittle/flaky/insufficient coverage with evidence, and produce a prioritized QA improvement roadmap.

## OBJECTIVE

Perform a complete, evidence-based audit of the project’s testing, QA coverage, and verification process.

The audit must determine:

1. What tests exist.  
     
2. What each test category actually proves.  
     
3. What critical behavior is not tested.  
     
4. Which tests are brittle, flaky, outdated, fake, shallow, or misleading.  
     
5. Which mocks, fixtures, factories, or helpers have drifted from real behavior.  
     
6. Which workflows require browser/manual verification.  
     
7. Which regression tests are missing for recent fixes.  
     
8. Which safety, security, auth, API, UI, E2E, data-integrity, payment, webhook, AI, or generated-file areas lack coverage.  
     
9. Whether CI/verify commands are reliable.  
     
10. What should be tested first before more feature work, refactors, cleanup, or launch.

The final deliverable is a prioritized QA coverage audit report and future test-improvement roadmap.

Do not implement fixes or add tests during this task.

## CURRENT CONTEXT

This audit is for the current repository.

Discover the actual project type, stack, test framework, test scripts, route structure, UI workflows, API surfaces, database behavior, generated-code workflow, source-of-truth documents, and business-critical workflows directly from the repository.

Do not assume the project uses any specific framework, test runner, browser tool, database, auth system, API style, AI provider, payment provider, or deployment setup until verified.

If a test file, command, route, workflow, fixture, mock, schema, source-of-truth document, or expected behavior is not confirmed in the repository, mark it as unknown and explain how to verify it.

## NON-NEGOTIABLE GUARDRAILS

### Audit-Only Scope

This is audit-only.

Do not implement fixes.

Do not add tests.

Do not delete tests.

Do not rewrite tests.

Do not update snapshots.

Do not update generated files.

Do not change code to make tests pass.

Do not change mocks or fixtures.

Do not change schemas, migrations, seed data, or production data.

Do not edit source-of-truth docs unless explicitly instructed.

If a severe gap is found, document it with evidence and recommend a separate implementation prompt.

### Anti-Drift Rules

Work only on the requested testing and QA audit.

Do not reopen completed work.

Do not modify unrelated features, routes, UI, schemas, tests, copy, or documentation.

Do not chase stale TODOs, old session-plan items, or previously closed issues.

Do not “improve” unrelated areas while touching nearby files.

If unrelated issues are found, report them separately without fixing them unless they block the current task.

### Data and Secret Safety

Do not run destructive commands.

Do not mutate production data.

Do not reset, seed, truncate, migrate, clean, or bulk-update the database.

Do not run tests that are known to write to production data.

Do not call live providers.

Do not send real emails or SMS.

Do not run real payments.

Do not trigger live webhooks.

Do not expose API keys, tokens, database credentials, session secrets, webhook secrets, provider keys, private user data, cookies, auth headers, sensitive env values, or logs containing secrets.

If secret leakage risk appears in tests, fixtures, snapshots, docs, logs, or command output, report only the file/path/pattern and risk. Do not reveal the secret value.

## QUALITY BAR

Every finding must be evidence-based.

Evidence may include:

- Test file path  
    
- Test name  
    
- Test command result  
    
- Failure output summary  
    
- Fixture/mock/helper path  
    
- Route/API/component/workflow covered  
    
- Source-of-truth contradiction  
    
- Missing coverage proof  
    
- Browser verification gap  
    
- Test data cleanup gap  
    
- Codegen/typecheck/build/lint result  
    
- Timeout/flaky behavior  
    
- Mismatch between test and real implementation  
    
- Skipped/todo test evidence  
    
- Manual verification gap

Do not exaggerate.

Do not guess.

Do not mark coverage healthy unless it proves meaningful behavior.

Do not mark a test fake, brittle, or useless unless evidence supports it.

If evidence is incomplete, label it “Needs human review.”

A passing test suite is not enough. The audit must determine whether the tests prove the right behavior.

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

Specific proof requirements:

- If a Save button is added or changed, prove save → reload → persisted value.  
    
- If a generated report workflow is added or changed, prove create → status update → download/open.  
    
- If a filter/dropdown is added or changed, prove selection changes the displayed result correctly.  
    
- If a checkbox is added or changed, prove checked/unchecked state updates correctly, persists when applicable, and does not cause duplicate updates or render loops.  
    
- If a form field is added or changed, prove input → validation → save/update → reload behavior.  
    
- If navigation is added or changed, prove the route/link works from all relevant entry points.

During this audit, identify where this proof is missing.

## PRE-AUDIT DISCOVERY

Before writing findings, inspect the actual repository.

Discovery must include, where applicable:

1. Package scripts  
     
2. Test runner configuration  
     
3. Unit test folders  
     
4. API/server test folders  
     
5. Frontend/component test folders  
     
6. Browser/E2E/smoke test folders  
     
7. Fixtures, mocks, factories, helpers, setup files, teardown files, and snapshots  
     
8. Coverage configuration, if present  
     
9. Codegen/spec validation commands, if present  
     
10. CI/verify scripts  
      
11. Source-of-truth docs such as README, CLAUDE.md, docs, test notes, audit reports, implementation notes, and known issue lists  
      
12. High-risk areas: auth, sessions, roles, payments, webhooks, AI/LLM, safety, admin, file upload/download, database mutations, generated files/reports, and core workflows if present

Discover and safely run available validation commands where appropriate:

- typecheck  
    
- build  
    
- lint/format check  
    
- unit tests  
    
- API/server tests  
    
- frontend/component tests  
    
- E2E/browser tests  
    
- verify command  
    
- codegen check  
    
- coverage command

If a command is missing, say so.

If a command is risky, destructive, slow, environment-dependent, requires secrets, requires network access, or may mutate data, do not run it. Report why.

If a command times out, report what timed out, whether it appears related, and what targeted checks were run instead.

Produce a concise discovery summary before final findings.

The discovery summary must include:

- Test structure found  
    
- Commands found  
    
- Commands run  
    
- Test categories found  
    
- Critical workflows identified  
    
- Source-of-truth docs inspected  
    
- Risks, blockers, or unknowns  
    
- Smallest safe future test-improvement plan

## FULL AUDIT SCOPE

### 1\. Script, CI, and Verify Command Audit

Inspect package scripts and validation paths.

Look for:

- Missing unified verify command  
    
- Typecheck not included in verify  
    
- Build not included where needed  
    
- Lint/format not included where available  
    
- Codegen checks missing where generated files exist  
    
- Tests not grouped by risk area  
    
- Scripts pointing to missing files  
    
- Scripts requiring unavailable secrets  
    
- Scripts that mutate data  
    
- Overbroad, slow, or flaky suites  
    
- No clear pre-merge validation path

Report which commands should be run before feature work, before deployment, and before risky refactors.

### 2\. Unit Test Coverage Audit

Inspect unit tests for helpers, validators, service functions, formatters, state logic, rate limiters, classifiers, pure business rules, and utility behavior.

Look for:

- Missing tests for core helpers  
    
- Tests that only assert trivial behavior  
    
- Over-mocked tests that do not catch real bugs  
    
- Tests coupled to implementation details  
    
- Missing edge cases  
    
- Missing failure-path tests  
    
- Missing boundary tests  
    
- Duplicated low-value tests  
    
- Outdated expectations

### 3\. API / Server Test Coverage Audit

Inspect API and backend tests.

Look for missing coverage for:

- Auth/login/logout/register/password reset  
    
- Session/cookie behavior  
    
- Authorization/roles/permissions  
    
- Direct API access  
    
- Object ownership/IDOR  
    
- Validation errors  
    
- 400/401/403/404/429/500 behavior  
    
- Generic error responses  
    
- Rate limiting  
    
- CORS/preflight behavior  
    
- Webhook signature verification  
    
- Payment/subscription access  
    
- AI/provider endpoints  
    
- File upload/download  
    
- Database mutation routes  
    
- Pagination/filter/search/sort  
    
- Import/export/generation routes  
    
- Error middleware  
    
- Secret/redaction behavior

Report gaps with route/file evidence.

### 4\. Frontend / Component Test Coverage Audit

Inspect frontend/component tests.

Look for missing tests for:

- Form validation  
    
- Save/edit/delete/cancel behavior  
    
- Loading states  
    
- Empty states  
    
- Error states  
    
- Disabled states  
    
- Modal/drawer behavior  
    
- Dropdown/filter/search/sort controls  
    
- Protected-route rendering  
    
- Role-based visibility  
    
- API error rendering  
    
- Stale UI prevention  
    
- Cache/query invalidation  
    
- Responsive layout risks, if testable

### 5\. Browser / E2E / Workflow Coverage Audit

Inspect E2E and browser tests.

Look for proof of real workflows:

- login → protected area  
    
- create → list/detail visibility → reload persistence  
    
- edit → save → reload persistence  
    
- delete/release/archive → related record update → reload  
    
- generated report/file → status update → download/open  
    
- upload/import → validation → processing → result state  
    
- dropdown/filter/search changing visible results  
    
- checkbox checked/unchecked persistence  
    
- navigation from relevant entry points  
    
- mobile/narrow viewport smoke checks  
    
- console/network clean checks  
    
- role/access variants  
    
- happy path and non-happy path

Report workflows that still require manual browser verification.

### 6\. Safety, Security, and Abuse-Prevention Test Audit

If relevant, inspect tests for:

- Safety classifiers  
    
- Crisis/self-harm handling  
    
- Abuse/stalking/boundary-risk handling  
    
- Validator behavior  
    
- Prompt/manifest integrity  
    
- Provider kill switches  
    
- No provider call after rate limit  
    
- Auth/session fixation  
    
- Email normalization  
    
- Rate limiting  
    
- CORS allowlist  
    
- Security headers  
    
- Secret exposure protections  
    
- Webhook signatures  
    
- Payment/subscription integrity  
    
- Admin-only access  
    
- IDOR protection  
    
- Logging/redaction

Critical safety/security gaps should be P0/P1.

### 7\. Regression Coverage Audit

Use recent fixes, docs, audit reports, CLAUDE.md, test names, and known bug history to identify fixed issues without regression tests.

Look for:

- Security fixes without tests  
    
- Workflow fixes without browser/E2E proof  
    
- Data cleanup fixes without before/after guards  
    
- Route fixes without API tests  
    
- UI fixes without interaction tests  
    
- Generated-file fixes without download/open proof  
    
- AI/prompt/safety fixes without adversarial tests

### 8\. Mock, Fixture, Factory, and Helper Drift Audit

Inspect mocks, fixtures, helpers, factories, and snapshots.

Look for:

- Mocks missing real exports  
    
- Mocked sessions missing real methods  
    
- Fixtures mismatching schemas  
    
- Factories creating invalid or stale records  
    
- Outdated statuses/enums  
    
- Provider mocks not matching adapters  
    
- API response mocks differing from real routes  
    
- Unrealistic browser data  
    
- Shared mutable state  
    
- Tests coupled to private internals

### 9\. Test Data Isolation and Cleanup Audit

Inspect how tests create and clean data.

Look for:

- Records without teardown  
    
- E2E records persisting in dev/live data  
    
- Demo/test records visible in production UI  
    
- No unique test prefixes  
    
- Unsafe cleanup scripts  
    
- Fixed-ID dependencies  
    
- Cross-test contamination  
    
- Shared limiter/cache contamination  
    
- Tests requiring production-like records

Do not clean data. Recommend future dry-run, backup/export, before/after counts, orphan checks, rollback notes, and human approval where needed.

### 10\. Brittle, Flaky, Slow, or Misleading Test Audit

Look for:

- Arbitrary sleeps  
    
- Timeouts  
    
- Network dependency  
    
- Order dependency  
    
- Shared state  
    
- Race conditions  
    
- Tests passing without asserting the critical outcome  
    
- Skipped/todo tests without explanation  
    
- Snapshot-only coverage  
    
- Local-only assumptions  
    
- Broad suites too slow for routine verification

### 11\. Generated Files, API Specs, and Codegen Audit

If generated clients, OpenAPI, Zod schemas, generated reports, or generated artifacts exist, verify whether tests cover:

- spec-to-implementation alignment  
    
- codegen output sync  
    
- runtime validator alignment  
    
- no hand-edited generated files  
    
- generated report/download behavior  
    
- generated output opens/downloads correctly  
    
- drift checks

### 12\. Manual Browser Verification Gap Audit

Identify where manual browser verification is required but missing.

For each major workflow or UI control, report whether there is proof of:

- render  
    
- interaction  
    
- intended action  
    
- persistence after reload  
    
- navigation/back/cancel behavior  
    
- no console errors  
    
- no duplicate requests  
    
- no stale UI  
    
- happy path  
    
- empty/loading/error state  
    
- permission-restricted state

Do not claim browser verification unless actually performed.

## FINDING IDS

Use:

- QA-P0-001 for critical missing tests around safety, security, data integrity, payment/webhook, auth, or production-blocking workflows  
    
- QA-P1-001 for major workflow, API, E2E, or regression coverage gaps  
    
- QA-P2-001 for brittle/flaky/misleading tests or mock/fixture drift  
    
- QA-P3-001 for test organization, CI/verify, codegen, or maintainability gaps  
    
- QA-P4-001 for manual browser verification or UI coverage gaps  
    
- QA-FUTURE-001 for useful deferred QA improvements

Each finding must include:

- Finding ID  
    
- Severity: Critical | High | Medium | Low | Info  
    
- Category  
    
- Test area/file/command/workflow  
    
- Evidence  
    
- Impact  
    
- Recommended test or QA action  
    
- Risk if ignored  
    
- Implementation priority  
    
- Manual verification required?  
    
- Human approval required?

## REQUIRED OUTPUT FORMAT

Return the report in this exact structure:

# Testing, QA Coverage, and Verification Audit Report

## 1\. Final Status

Use one:

- QA audit complete, no changes made  
    
- QA audit partially complete, blocked by specific issue  
    
- QA audit not complete

## 2\. Executive Summary

Include test health, biggest risks, strongest coverage areas, highest-value first test improvement, whether feature work should continue or pause, and major uncertainty.

## 3\. Baseline QA Map

Include test frameworks, commands, test folders, test categories, fixtures/mocks/helpers, E2E/browser tools, source-of-truth docs, codegen checks, and CI/verify structure found.

## 4\. Commands Run and Results

Create a table:

| Command | Result | Pass/Fail | Notes | Blocking? |

|---|---|---|---|---|

## 5\. Discovery Summary

Include files/folders/tests/scripts/docs inspected, workflows identified, coverage found, blockers, and unknowns.

## 6\. Findings Index

Create a table:

| Finding ID | Severity | Category | Location | Summary | Recommended Action | Priority |

|---|---|---|---|---|---|---|

## 7\. Critical QA Findings

List only P0/P1 findings with evidence, impact, recommended action, risk if ignored, and approval needs.

## 8\. Script / CI / Verify Command Findings

## 9\. Unit Test Findings

## 10\. API / Server Test Findings

## 11\. Frontend / Component Test Findings

## 12\. Browser / E2E / Workflow Test Findings

## 13\. Safety, Security, and Abuse-Prevention Test Findings

## 14\. Regression Coverage Findings

## 15\. Mock, Fixture, and Test Helper Drift Findings

## 16\. Test Data Cleanup and Isolation Findings

## 17\. Brittle, Flaky, Slow, or Misleading Test Findings

## 18\. Generated Files, API Spec, and Codegen Test Findings

## 19\. Manual Browser Verification Gap Findings

## 20\. Prioritized QA Improvement Backlog

Group by:

### P0 — Critical Safety / Security / Data Integrity / Payment / Auth Coverage

### P1 — Core Workflow / API / Regression Coverage

### P2 — Brittle Tests / Mock Drift / Test Data Isolation

### P3 — CI / Verify / Codegen / Test Organization

### P4 — Manual Browser Verification / UI Coverage

### Future Backlog

Each item must include why it matters, evidence, likely files/tests, recommended approach, verification steps, and approval needs.

## 21\. Recommended Implementation Order

Use this order unless discovery proves otherwise:

1. Add/repair tests around safety, security, auth, payment, webhook, and data-integrity boundaries  
     
2. Add regression tests for recently fixed bugs  
     
3. Add API/server tests for high-risk routes  
     
4. Add E2E/browser tests for core workflows  
     
5. Fix brittle/flaky/misleading tests  
     
6. Repair mocks, fixtures, and test data cleanup  
     
7. Add codegen/spec drift checks  
     
8. Improve CI/verify command structure  
     
9. Document durable QA rules and manual verification requirements

## 22\. Items Requiring Human Approval

List anything that should not be tested with real providers, real payments, production data, bulk data, destructive actions, live external systems, or credentialed services without approval.

## 23\. Items Intentionally Not Touched

Confirm no code, tests, fixtures, mocks, schemas, data, docs, routes, generated files, production records, or secrets were changed or exposed.

## 24\. Final Recommendation

Give the first QA improvement to implement and why.

## Completion Report

Include final status, what was audited, commands run, tests inspected, code/test/data/schema changes as “None,” destructive actions as “None,” secrets exposed as “None,” remaining risks, future items, confirmation unrelated areas were not modified, and next prompt label.

## FINAL RULES

Be precise.

Do not guess.

Do not invent.

Do not implement.

Do not mutate data.

Do not expose secrets.

Do not call live providers, send real emails, run real payments, or use production data without explicit approval.

Do not mark coverage healthy unless it proves meaningful behavior.

If unclear, mark “Needs human review.”

The goal is to make the project’s test and verification system trustworthy, stable, complete, and useful enough to support safe future development.
