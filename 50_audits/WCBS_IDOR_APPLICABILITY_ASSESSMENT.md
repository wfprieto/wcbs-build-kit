# WCBS Build Kit: IDOR Applicability Assessment

Assessment type: current-kit applicability and evidence-boundary record.

Baseline revision: `0be7a837b63b2a4edb8530066cc01c9208c65cc6` on `main`.

## Result

**No current IDOR vulnerability found.**

The WCBS Build Kit at this revision does not contain:

- a web application or deployed URL;
- HTTP/API route handlers;
- user sessions or authentication;
- users, tenants, or ownership models; or
- a database-backed resource layer.

Therefore, there is currently no URL or API request in the kit where changing
an identifier could expose another user’s data. This applicability assessment
identified no reachable IDOR surface in the repository. No live security scan,
credential test, or external target probe was run, and no scan-result claim is
made.

This is an applicability result, not proof that a future CodeSapper
application is authorization-safe.

## Important fixture caveat

The evaluation fixture contains:

- `TaskStore.complete(id)`; and
- `TaskService.completeTask(id)`.

These select an in-memory task by numeric identifier without owner checks.
They are not exposed through an API, have no users or tenants, and therefore
are not a current IDOR vulnerability. If CodeSapper later exposes this
pattern through an application API, the server must enforce trusted-boundary
ownership or tenant authorization against the final resolved resource.

## Coverage status

| Control | State | Boundary |
|---|---|---|
| IDOR/authorization guidance | `Covered` | The kit routes the control through the web-security audit and specialist skills. |
| Required cross-user negative-test procedure | `Covered` | The generic audit requires modified identifiers, direct API tests, and cross-user/cross-tenant checks when applicable. |
| Actual two-user URL/API test against WCBS | `Not Run / Blocked` | No application target, deployed URL, sessions, or API exists in this repository. |
| Current reportable IDOR finding in WCBS | `None identified` | No reachable authorization boundary exists in the kit itself. |

## CodeSapper gate when an application exists

Before any authorization or release claim, use two accounts with separate
resources and attempt, for both the UI and direct API:

1. modified path, query, body, and GraphQL identifiers where applicable;
2. read, update, and delete operations across users and tenants;
3. vertical privilege escalation and hidden administrative routes;
4. stale authorization after ownership, role, or membership changes; and
5. response, error, timing, and export paths for unintended data leakage.

The server-side policy must use the trusted authenticated principal and final
resolved resource identity. Unknown cross-user or cross-tenant isolation
blocks a production release. Record the accounts/fixtures, exact revision,
environment, commands or requests, expected denial, observed result, redacted
evidence, and final verdict in the canonical security evidence ledger.

## Limitations and next action

No live probing, credential testing, security scan, or external target testing
was performed. This record is an applicability and evidence-boundary
assessment, not a retained penetration-test report.
The current result cannot establish behavior for CodeSapper because that
application target does not yet exist in this repository.

Single next action: when CodeSapper exposes its first authenticated resource
API, run the two-account negative-test matrix before treating authorization as
verified.
