# Systematic Workflows

Merged from APIVR, WCBS, and Superpowers workflow mechanics.

## Planning Discipline

- Explore the project context before proposing a solution.
- Ask only questions that materially affect scope, success criteria, risk, or implementation.
- Present alternatives when the choice changes architecture, risk, cost, or user outcome.
- Write plans that an implementer can execute without inventing missing decisions.
- Use `skills/writing-plans/SKILL.md` for implementation, audit-remediation, or handoff plans.
- Plans for code work must embed failing test steps or an APIVR-approved evidence-first substitute.

## Implementation Discipline

- Prefer the smallest safe change.
- Preserve existing behavior unless a change is explicitly approved.
- Use test-first development for code changes as an APIVR Phase 3 requirement unless non-applicability is proved and alternate evidence is recorded.
- Verify after meaningful steps.
- Stop on new Critical risk.

## Review Discipline

Review in this order:

1. Spec compliance
2. Source-of-truth consistency
3. Security, privacy, and data integrity
4. Reliability and adverse states
5. User outcome and accessibility
6. Maintainability and local patterns
7. Performance, SEO, and cost
8. Evidence completeness

## Domain Routing Discipline

Load the relevant specialist skill when the task includes:

- deployment, hosting, runtime placement, cloud cost, or environment setup;
- scheduled jobs, webhooks, queues, event-driven work, monitors, reminders, or always-on workers;
- dashboards, exports, recurring reports, analytics outputs, or audit/compliance evidence;
- third-party APIs, SDKs, OAuth, API keys, webhooks, provider limits, or external syncs;
- generated, retrieved, transformed, cached, licensed, or delivered media/assets.

When multiple domains overlap, load all applicable skills and preserve one APIVR evidence ledger.

## Debugging Discipline

- Reproduce or directly observe the failure when possible.
- Trace root cause before changing code.
- Distinguish symptom, cause, contributing factor, and unrelated issue.
- Add defense-in-depth only when it addresses a real failure mode.
- Verify the fix and scan for collateral damage.

## Subagent Discipline

Use `skills/dispatching-parallel-agents/SKILL.md` before deciding to split work. Use subagents only when they reduce risk, time, or context load. Each subagent must receive:

- objective;
- exact scope;
- relevant source files;
- applicable goals;
- expected evidence;
- stop conditions;
- output format.

Subagent outputs must use `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`, then pass the two-stage review gate in `skills/subagent-driven-development/SKILL.md`.
