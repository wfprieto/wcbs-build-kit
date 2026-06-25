# Canonical Path and Anti-Duplication Gate

## Purpose
Prevent Claude from fixing the wrong file, expanding legacy code, creating duplicate systems, or reporting success on a path that does not drive the live app.

## When This Gate Applies
Use this gate before any implementation, debugging, UI, API, data, workflow, route, permission, cleanup, or refactor task.

## Mandatory Discovery Steps
1. Identify the exact visible user workflow or execution path.
2. Identify the page, component, module, route, handler, schema, table, helper, and test files involved.
3. Search the repository for duplicate, legacy, old, unused, redirected, renamed, or parallel implementations.
4. Trace import/route registration to prove which path is live.
5. Confirm the app/browser/API/CLI actually uses that path.
6. Document every similar path found.
7. Stop if two candidates exist and canonical cannot be proven.

## Hard Stop Conditions
Stop and report if:
- The live path cannot be identified.
- Multiple implementations appear active.
- A legacy path may still be used by users, tests, API clients, webhooks, jobs, or external integrations.
- The proposed change would create a second source of truth.
- The proposed fix only changes labels/copy while the calculation/data/workflow layer remains unchanged.

## Required Report Before Editing
`~/.claude/wcbs-kit/``text
Canonical Path Gate:
- Live entry point:
- Page/component/module:
- Route/API/handler:
- Data/schema/table:
- Navigation/workflow path:
- Similar/legacy paths found:
- Evidence canonical path is live:
- Paths intentionally not touched:
- Stop condition triggered? Yes/No
`~/.claude/wcbs-kit/``

## Completion Requirement
Final report must include how the running app proves the changed path is the live path.
