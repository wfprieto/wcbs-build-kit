# Systematic Workflows

Merged from APIVR, WCBS, and Superpowers workflow mechanics.

## Planning Discipline

- Explore the project context before proposing a solution.
- Ask only questions that materially affect scope, success criteria, risk, or implementation.
- Use `skills/requirements-grilling-and-alignment/SKILL.md` for ambiguous or assumption-heavy requests; ask one decision-making question at a time.
- Use `skills/product-strategy-office-hours/SKILL.md` when product, buyer, user, premise, or strategic tradeoffs determine what should be built.
- Use `skills/domain-modeling-and-shared-language/SKILL.md` and ADRs when durable vocabulary or decisions affect implementation.
- Use `skills/product-requirements-and-issue-slicing/SKILL.md` to split large plans into vertical, independently verifiable slices.
- Present alternatives when the choice changes architecture, risk, cost, or user outcome.
- Write plans that an implementer can execute without inventing missing decisions.
- Use `skills/writing-plans/SKILL.md` for implementation, audit-remediation, or handoff plans.
- Plans for code work must embed failing test steps or an APIVR-approved evidence-first substitute.
- UI plans must use `skills/ui-ux-design-quality/SKILL.md` and define user, screen job, design direction, accessibility gates, responsive verification and anti-generic review.
- Writing plans must use `skills/anti-ai-writing-quality/SKILL.md` when text quality matters and `skills/strategist-writing-dna/SKILL.md` when the output must move a decision or prevent drift.
- Recurring, iterative, monitor-like, or repeat-until-stable plans must use `skills/repeatable-agent-loops/SKILL.md` and define objective, one-step action, evidence check, stop conditions, iteration budget, and receipts.
- Long-running, tool-heavy, artifact-heavy, multi-stage, or handoff-sensitive plans must use `skills/long-horizon-agent-runtime/SKILL.md` and `skills/agent-observability-and-run-tracing/SKILL.md`.

## Implementation Discipline

- Prefer the smallest safe change.
- Preserve existing behavior unless a change is explicitly approved.
- Use `skills/codebase-design-and-deep-modules/SKILL.md` when structure, module boundaries, adapters, or refactor shape affects risk.
- Use test-first development for code changes as an APIVR Phase 3 requirement unless non-applicability is proved and alternate evidence is recorded.
- Prefer vertical tracer bullets: prove one thin behavior through the public interface before broad horizontal buildout.
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

Use `skills/engineering-plan-review/SKILL.md` before high-risk implementation and `skills/code-review-and-review-army/SKILL.md` during APIVR Phase 4 when specialist passes reduce risk.

## Domain Routing Discipline

Load the relevant specialist skill when the task includes:

- frontend UI, UX, visual direction, design systems, forms, charts, dashboards, landing pages, accessibility, responsive behavior, or interface copy;
- product strategy, requirements alignment, PRDs, issue slicing, domain modeling, ADRs, architecture/module boundaries, engineering plan review, specialist code review, debugging, prototype spikes, QA, release readiness, or DevEx documentation;
- writing, rewriting, client-facing copy, email, reports, prompts, executive summaries, strategic recommendations, or anti-AI tone control;
- deployment, hosting, runtime placement, cloud cost, or environment setup;
- scheduled jobs, webhooks, queues, event-driven work, monitors, reminders, or always-on workers;
- dashboards, exports, recurring reports, analytics outputs, or audit/compliance evidence;
- third-party APIs, SDKs, OAuth, API keys, webhooks, provider limits, or external syncs;
- generated, retrieved, transformed, cached, licensed, or delivered media/assets;
- recurring audits, repeated quality sweeps, monitors, post-deploy stabilization checks, or iterative remediation loops;
- setup, bootstrap, first-run commands, dependency installation, local services, MCP servers, plugin tools, connectors, tool auth, artifact boundaries, run traces, or long-horizon execution.
- cybersecurity, app security, AI security, incident response, supply chain security, vulnerability triage, live scanning, red-team, phishing, credential, malware, prompt injection, RAG, vector, MCP security, or dual-use work.

When multiple domains overlap, load all applicable skills and preserve one APIVR evidence ledger.

## Cybersecurity Discipline

Use `skills/cybersecurity-risk-routing/SKILL.md` before security-sensitive work. If a request includes live testing, scanning, exploitation, phishing, credential testing, malware execution, MCP probing, prompt extraction, RAG poisoning, vector leakage, or third-party targets, require authorization and rules of engagement before proceeding.

Security findings must separate facts, hypotheses, and unknowns. Do not claim security release readiness while core evidence is `Unknown`, `Not Run`, or `Blocked`.

## Debugging Discipline

- Reproduce or directly observe the failure when possible.
- Use `skills/diagnosing-bugs-and-feedback-loops/SKILL.md` before changing code for a bug.
- Trace root cause before changing code.
- Distinguish symptom, cause, contributing factor, and unrelated issue.
- Add defense-in-depth only when it addresses a real failure mode.
- Verify the fix and scan for collateral damage.

## Prototype Discipline

Use `skills/throwaway-prototyping/SKILL.md` when learning is the goal. Define one question, isolate the prototype, set a budget, record evidence, and delete, archive, or convert through APIVR before production use.

## QA And Release Discipline

Use `skills/qa-and-browser-verification/SKILL.md` when user-visible workflows or rendered behavior matter. Use `skills/release-readiness-and-ship-gates/SKILL.md` before merge, deploy, publish, handoff, or done claims. Use `skills/devex-and-documentation-review/SKILL.md` when docs, setup, examples, API docs, release notes, or handoffs are affected.

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

## Repeatable Loop Discipline

Use `skills/repeatable-agent-loops/SKILL.md` when work repeats across files, records, environments, viewports, checks, or time windows.

Each loop must have:

- measurable objective;
- explicit scope and non-scope;
- one-step action rule;
- evidence check after each action;
- continue condition;
- stop conditions;
- iteration or time budget;
- one receipt per iteration.

Stop instead of continuing when the loop hits its budget, repeats the same failure without new evidence, needs approval, leaves scope, or becomes unsafe.

## Long-Horizon Runtime Discipline

Use `skills/long-horizon-agent-runtime/SKILL.md` when work spans many stages, tools, subagents, loops, artifacts, or context windows.

Every long-horizon run must define:

- stage plan;
- checkpoint cadence;
- workspace, scratch, evidence, and final-output boundaries;
- context that must not be summarized away;
- tool and MCP boundaries;
- trace template;
- handoff format;
- stop conditions.

Do not rely on chat history as the evidence record. Use `skills/agent-observability-and-run-tracing/SKILL.md` when claims need to survive handoff, context compression, or audit.
