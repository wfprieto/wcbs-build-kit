# QA Browser Workflow Proof Gate

## Purpose
Ensure user-facing work is proven in the browser, not merely assumed from passing tests or typecheck.

## Applies To
Use this gate whenever touching:
- Pages
- Components
- Buttons
- Forms
- Modals
- Dropdowns
- Filters
- Tables
- Dashboards
- Navigation
- Save/edit/delete/archive/release flows
- Upload/download/generated file flows
- Auth/admin workflows
- Mobile/narrow viewport behavior

## Required Proof
For every touched UI control, verify:
1. It renders correctly.
2. It can be interacted with.
3. It performs the intended action.
4. It persists or updates data correctly when applicable.
5. It survives reload and navigation.
6. It produces no console errors, runtime overlays, duplicate requests, stale UI, or unexpected 4xx/5xx responses.
7. It works across relevant states: happy path, empty, loading, error, disabled, and permission-restricted.

## Workflow Proof Patterns
- Save: input → validation → save → reload → persisted value.
- Edit: existing value loads → change → save → reload → updated value.
- Delete/archive/release: action → confirmation → related records update → list/detail refresh → reload → correct state.
- Generated file/report: create → status update → download/open.
- Upload/import: upload → validation → processing → result → reload.
- Dropdown/filter/search: selection changes displayed results correctly.
- Checkbox: checked/unchecked updates correctly and does not duplicate requests or render loops.
- Navigation: route/link works from all relevant entry points.
- Access: logged-out, allowed, denied, restricted, admin, and direct-URL cases verified where applicable.

## If Browser Testing Is Unavailable
Do not call the task complete. Report:
- Why browser testing was unavailable.
- What automated checks were run instead.
- Exact manual verification still required.
- Whether the task can be safely considered implemented but not verified.
