# Repeatable Agent Loop Patterns

Use this knowledge module under APIVR when a task is safer or clearer as a bounded loop.

## Provenance

Adapted from the useful loop discipline in `Forward-Future/loopy`: repeatable workflows should define the goal, action, evidence, continuation rule, and stopping rule. The Super Build Kit does not import Loopy's catalog, website, Cloudflare, or publishing system.

## When A Loop Is Appropriate

Use a loop for:

- recurring audits;
- broken-link or documentation sweeps;
- repeated test reliability checks;
- post-deploy verification passes;
- dependency or configuration checks across many files;
- UI review passes across several viewports;
- report generation with freshness checks;
- monitor follow-up where the next action depends on measured state.

Do not use a loop when:

- the objective is vague;
- the next action could be destructive;
- credentials, permissions, or rollback are unclear;
- production, payment, personal data, security, or legal risk can be changed without approval;
- each iteration would need a new architectural decision;
- no reliable evidence check exists.

## Loop Shapes

| Shape | Use For | Required Evidence |
|---|---|---|
| Audit sweep | Inspect repeated files, routes, pages, or records | finding log, path list, evidence state |
| Fix-and-check | Repair one issue at a time | diff, command result, regression check |
| Monitor follow-up | Re-check a condition until stable or expired | timestamped observation, threshold, stop reason |
| Quality pass | Improve copy, UI, docs, tests, or reports in bounded slices | before/after, checklist, verification |
| Backfill or reconciliation | Process bounded records safely | batch size, idempotency proof, reconciliation result |

## Safety Requirements

- Keep one APIVR evidence ledger for the whole loop.
- Record one receipt per iteration.
- Prefer read-only observation unless a planned action is explicitly authorized.
- Never hide uncertainty behind repeated attempts.
- Stop on new Critical risk, repeated no-progress, unavailable evidence, or scope drift.
- For code changes, TDD still applies unless non-applicability is recorded.
- For subagents, each delegated loop must have its own scope, budget, receipts, and review gate.

## Stop Conditions

Stop immediately when:

- target condition is met;
- no work is needed and evidence proves clean state;
- the next step needs approval;
- the loop hits its iteration or time budget;
- the same failure repeats twice without new evidence;
- the next action would exceed scope;
- required evidence is `Unknown`, `Not Run`, or `Blocked` for a release-critical claim;
- an unsafe condition appears.

## Integration With Other Skills

- Scheduling or monitors: pair with `skills/scheduling-and-automation-routing/SKILL.md`.
- Reports and dashboards: pair with `skills/data-output-and-reporting/SKILL.md`.
- External APIs: pair with `skills/external-api-integration/SKILL.md`.
- UI sweeps: pair with `skills/ui-ux-design-quality/SKILL.md`.
- Writing passes: pair with `skills/anti-ai-writing-quality/SKILL.md` and `skills/strategist-writing-dna/SKILL.md` when relevant.
- Delegated work: pair with `skills/dispatching-parallel-agents/SKILL.md` and `skills/subagent-driven-development/SKILL.md`.
