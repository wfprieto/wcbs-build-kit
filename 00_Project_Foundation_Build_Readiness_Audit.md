Read and follow all of the following instructions: Create an expert-level, full Claude implementation prompt for the **Project Baseline Setup: Lint, TypeScript, Route Architecture, and Anti-Monolith Guardrails**\*\* \*\*that is clearer, sharper, more complete, and more effective than a standard draft. Draft the prompt with deliberate care. As you write each section, immediately refine it for precision, clarity, quality of instruction, and likelihood of producing excellent results before continuing.

The final Claude prompt must preserve the exact task substance, goals, constraints, source-of-truth rules, business logic, completed statuses, anti-drift requirements, and implementation target provided in the prompt. Do not invent unverified project facts, routes, files, schemas, APIs, libraries, tests, or statuses. If a fact is uncertain, instruct Claude to discover and verify it in the actual codebase before making changes.

The final Claude prompt must be paste-ready and must include these sections unless the task clearly requires a different structure:

TITLE: Create a concise title that matches the requested task.

READ-FIRST INSTRUCTION: Tell Claude to read the entire prompt from top to bottom before taking any action. Claude may not skip sections, summarize prematurely, rely on stale session context, or begin implementation before completing discovery.

OBJECTIVE: State the exact outcome Claude must achieve.

CURRENT CONTEXT: Summarize only the relevant known facts, locked rules, user intent, existing statuses, business logic, constraints, and source-of-truth requirements from the prompt. Do not add unsupported assumptions.

NON-NEGOTIABLE GUARDRAILS: Include all task-specific scope limits, data-safety rules, UX rules, naming rules, “do not touch” areas, and source-of-truth constraints.

Include this anti-drift block in the guardrails:

Work only on the requested task.

Do not reopen completed work.

Do not modify unrelated features, routes, UI, schemas, tests, copy, or documentation.

Do not chase stale TODOs, old session-plan items, or previously closed issues.

Do not “improve” unrelated areas while touching nearby files.

If unrelated issues are found, report them separately without fixing them unless they block the current task.

QUALITY BAR: Merge this quality-control requirement into the final Claude prompt.

Do not mark any UI control as complete unless it has been manually tested in the browser. For every button, dropdown, checkbox, form field, filter, modal, save/cancel action, and navigation link touched by this task, verify:

It renders correctly.

It can be interacted with.

It performs the intended action.

It persists or updates data correctly when applicable.

It survives reload/navigation.

It does not create console errors, runtime overlays, duplicate requests, or broken state.

It works across all relevant variants, not just the first happy-path example.

A passing typecheck/build is not sufficient. Manual workflow verification is required.

ACCOUNT/REPORT AGENT QUALITY RULE: When building Account setup, Reports, Reps, KPI Standards, or Generated Reports features, Claude must verify the full user workflow in the browser before completion.

Specific workflow proof requirements:

If a Save button is added or changed, Claude must prove save → reload → persisted value.

If a generated report workflow is added or changed, Claude must prove create → status update → download/open.

If a filter/dropdown is added or changed, Claude must prove selection changes the displayed result correctly.

If a checkbox is added or changed, Claude must prove checked/unchecked state updates correctly, persists when applicable, and does not cause duplicate updates or render loops.

If a form field is added or changed, Claude must prove input → validation → save/update → reload behavior.

If navigation is added or changed, Claude must prove the route/link works from all relevant entry points.

PRE-IMPLEMENTATION DISCOVERY: Require Claude to inspect the actual repository before editing. Discovery must include relevant files, routes, components, APIs, schemas, migrations, seed/demo/test data, tests, docs, and source-of-truth files. For risky, production-facing, data-facing, auth-facing, payment-facing, reporting-facing, or architectural tasks, require Claude to write a concise discovery summary before applying changes.

The discovery summary must include:

Files/routes/components inspected

Existing behavior found

Data/schema/API implications, if any

Tests available

Source-of-truth docs inspected

Root cause or implementation path, where applicable

Risks, blockers, or unknowns

Smallest safe implementation plan

IMPLEMENTATION REQUIREMENTS: Give Claude ordered, specific implementation instructions based on the prompt. Use direct language. If a path, schema, route, API, component, or test name is unknown, instruct Claude to discover the correct one rather than assuming.

Require:

Smallest safe patch that satisfies the task

Preservation of existing working behavior

No duplicate systems unless discovery proves one is necessary

No fake data, fake tests, fake screenshots, or fake verification

No secret exposure

No weakening of validation, auth, safety, or data integrity

Clear handling for missing/empty/error states

Backward compatibility when existing data or workflows depend on it

Safe migrations/backups/dry-runs for data changes where appropriate

TESTING AND VALIDATION: Require focused tests, regression checks, and manual workflow validation.

Include:

Typecheck

Build

Lint, if available

Relevant unit tests

Relevant API/server tests

Relevant frontend/component tests, if available

Manual browser smoke testing for every touched user workflow

Edge-case validation

Reload/navigation persistence checks where applicable

Console/network check for errors, duplicate requests, runtime overlays, and broken state

For UI tasks, require desktop and relevant narrow/mobile viewport checks if the project supports browser preview.

For data or production cleanup tasks, require:

Dry-run before destructive changes

Backup/export/snapshot before deletion or migration

Before/after counts

Orphan checks

Rollback notes

Clear list of preserved, changed, and ambiguous records

If a test command or UI test framework does not exist, instruct Claude not to invent one. Claude must report what exists and what manual validation was performed instead.

DOCUMENTATION / SOURCE OF TRUTH: Require Claude to update CLAUDE.md or the correct project source-of-truth file only when the task creates durable completed status, durable rules, migration notes, data model changes, future TODOs, or operational instructions. Do not require documentation edits for trivial changes. Do not allow speculative future work to be documented as completed.

COMPLETION REPORT: Require Claude to report:

Final status: Complete or Not Complete

What changed

Files changed

Schema/API/data changes, if any

Root cause, if this is a bug fix

Data cleanup details, if applicable

Tests/checks run and results

Manual browser verification steps completed

Screens/pages/workflows verified

Remaining risks or unresolved items

Future items intentionally not completed

Confirmation that unrelated areas were not modified

Confirmation that UI controls touched by the task were manually tested and passed the quality bar

After completing the draft, perform a rigorous internal refinement process:

Re-read the full prompt in context. Evaluate its structure, clarity, completeness, specificity, flow, and execution quality. Identify all meaningful weaknesses, gaps, vague phrasing, missing constraints, missing context, missing guardrails, missing quality checks, or areas needing polish. Score the prompt externally from 1–10 and post the score. Improve it substantially based on that review. Run this internal refinement cycle at least 20 times, each time using the newest improved version as the baseline and making it stronger, more complete, more precise, and better executed.

Do all evaluation and iteration internally. Return only the final polished prompt. Confirm you did 20 passes.
