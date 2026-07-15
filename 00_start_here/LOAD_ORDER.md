# Load Order

Load the smallest complete set. Do not load the entire kit by default.

## Always Load

1. `00_start_here/START_HERE.md`
2. `00_start_here/SOURCE_OF_TRUTH.md`
3. `50_audits/AUDIT_TIER_ROUTER.md`
4. `10_governance/APIVR_EXECUTION_LIFECYCLE.md`
5. `skills/super-build-kit/SKILL.md` when skills, platform activation, or method selection may affect the work

## Runtime Bootstrap

At session start, load only the **active** runtime's manifest and tool mapping from `runtime_adapters/`. Do not load every adapter document, and do not load the portability contract by default. It loads only for adapter design, installation, troubleshooting, or porting.

## Build Or Fix

Load:

- `10_governance/ELITE_BUILD_GOALS_SUMMARY.md`
- `10_governance/RELEASE_GATES.md`
- `skills/requirements-grilling-and-alignment/SKILL.md` when requirements are ambiguous, broad, conflicting, assumption-heavy, or need one-question-at-a-time clarification
- `skills/product-strategy-office-hours/SKILL.md` when product, founder, buyer, user, premise, or strategic decision clarity affects the work
- `skills/domain-modeling-and-shared-language/SKILL.md` when durable business vocabulary, states, events, roles, domain boundaries, or ADRs affect design or naming
- `skills/product-requirements-and-issue-slicing/SKILL.md` when plans, PRDs, or audits must become vertical, independently verifiable implementation slices
- `skills/writing-plans/SKILL.md` for APIVR Phase 2 implementation plans
- `skills/20-pass-protocol/SKILL.md` when the plan, prompt, source-file edit, agent handoff, release instruction, or other artifact is high-stakes and precision failure is expensive
- `skills/engineering-plan-review/SKILL.md` before implementing high-risk, multi-file, architecture, migration, or integration plans
- `skills/test-driven-development/SKILL.md` for APIVR Phase 3 implementation work
- `skills/codebase-design-and-deep-modules/SKILL.md` when module boundaries, adapters, dependency direction, refactors, or architectural leverage are in scope
- `skills/code-review-and-review-army/SKILL.md` for APIVR Phase 4 implementation audit and specialist review passes
- `skills/qa-and-browser-verification/SKILL.md` when user-visible workflows, browser behavior, manual QA, screenshots, or adverse UI states are in scope
- `skills/release-readiness-and-ship-gates/SKILL.md` before merge, deploy, publish, handoff, or done claims
- `skills/devex-and-documentation-review/SKILL.md` when docs, setup, examples, onboarding, API docs, release notes, or handoffs are affected
- `skills/compound-learning-capture/SKILL.md` after Standard and above work produces reusable verified learning
- `skills/knowledge-refresh-and-drift-control/SKILL.md` when active guidance, lessons, templates, or references may be stale, duplicated, or drifting
- `skills/diagnosing-bugs-and-feedback-loops/SKILL.md` before changing code for bugs, regressions, flaky behavior, incidents, or unknown failures
- `skills/throwaway-prototyping/SKILL.md` when work is a prototype, spike, experiment, provider trial, or proof of concept
- `skills/using-git-worktrees/SKILL.md` when work should be isolated
- `skills/dispatching-parallel-agents/SKILL.md` when the work may benefit from parallel investigation, audit, implementation, or verification
- `skills/subagent-driven-development/SKILL.md` when subagents will implement, review, or verify task slices
- `skills/executing-plans/SKILL.md` when executing an approved plan sequentially without subagents
- `skills/finishing-a-development-branch/SKILL.md` when implementation is complete and merge, PR, keep, discard, or worktree cleanup decisions are needed
- `runtime_adapters/PORTABILITY_CONTRACT.md` when designing, installing, updating, troubleshooting, or porting a runtime adapter, or when a support level or capability fallback is claimed
- `runtime_adapters/PORTING_GUIDE.md` when adding support for a new runtime
- `skills/repeatable-agent-loops/SKILL.md` when work is recurring, iterative, monitor-like, or should repeat until a measurable condition is met or safely stopped
- `skills/long-horizon-agent-runtime/SKILL.md` when work spans many stages, tools, subagents, checkpoints, artifacts, or context windows
- `skills/project-bootstrap-and-setup/SKILL.md` when setup, install, bootstrap, config, dependency, service, or first-run work is involved
- `skills/mcp-tool-governance/SKILL.md` when MCP servers, plugin tools, connectors, tool auth, or permission boundaries are involved
- `skills/agent-observability-and-run-tracing/SKILL.md` when run trace, durable audit trail, tool record, or checkpoint evidence is needed
- `skills/cybersecurity-risk-routing/SKILL.md` when cybersecurity, app security, AI security, supply chain, incident, vulnerability, scanning, red-team, or dual-use risk is involved
- `skills/ai-application-security/SKILL.md` when LLM apps, RAG, vector stores, prompts, model routing, AI tools, or AI data leakage are involved
- `skills/security-incident-response/SKILL.md` when suspicious activity, alerts, compromise, exfiltration, malware, ransomware, or forensic security work is involved
- `skills/supply-chain-and-build-provenance/SKILL.md` when dependencies, CI/CD, containers, IaC, SBOM, signatures, provenance, or release artifact trust is involved
- `skills/deployment-and-hosting-guidance/SKILL.md` when hosting, deploy, runtime, cost, or environment choices are involved
- `skills/scheduling-and-automation-routing/SKILL.md` when jobs, webhooks, queues, reminders, monitors, or workers are involved
- `skills/external-api-integration/SKILL.md` when third-party services, SDKs, webhooks, OAuth, API keys, or provider limits are involved
- `skills/external-integration-launch-gate/SKILL.md` when outside systems call the app or the work touches webhooks, callbacks, OAuth redirects, payments, email providers, cron routes, SMS/provider queues, deployment protection, provider sandbox/live mode, or Preview/Production environment splits
- `skills/media-and-asset-pipeline/SKILL.md` when images, video, audio, files, fonts, generated media, CDN, or asset rights are involved
- `skills/data-output-and-reporting/SKILL.md` when dashboards, exports, reports, analytics outputs, or evidence artifacts are involved
- `skills/ui-ux-design-quality/SKILL.md` when frontend UI, UX, visual direction, accessibility, dashboards, forms, navigation, charts, landing pages, or interface copy are involved
- `skills/anti-ai-writing-quality/SKILL.md` when copy, reports, emails, client-facing text, website copy, UI microcopy, prompts, or completion reports must avoid generic AI tone
- `skills/strategist-writing-dna/SKILL.md` when writing must be decisive, tactical, executive-ready, anti-drift, scoped, or proof-driven
- `30_agents/AGENT_ACTIVATION_MATRIX.md`
- `60_templates/IMPLEMENTATION_BLUEPRINT_TEMPLATE.md`
- `60_templates/DOMAIN_GLOSSARY_TEMPLATE.md` when domain language affects implementation, UI, reports, tests, or decisions
- `60_templates/ADR_TEMPLATE.md` when a durable architecture, provider, data, security, cost, or operational decision is made
- `60_templates/QA_HEALTH_REPORT_TEMPLATE.md` when manual QA or browser verification is required
- `60_templates/RELEASE_READINESS_DASHBOARD_TEMPLATE.md` before production-impacting release, deployment, or handoff
- `60_templates/SOLVED_PROBLEM_LEARNING_TEMPLATE.md` when reusable learning is captured
- `60_templates/KNOWLEDGE_REFRESH_REPORT_TEMPLATE.md` when knowledge refresh is performed
- `60_templates/COMPLETION_REPORT_TEMPLATE.md`
- `60_templates/SECURITY_EVIDENCE_LEDGER_TEMPLATE.md` when security evidence is in scope

Use APIVR phases 1-6 at the selected tier.

## Audit

Load:

- `50_audits/AUDIT_TIER_ROUTER.md`
- `50_audits/CANONICAL_AUDIT_PROTOCOLS.md`
- `60_templates/EVIDENCE_LEDGER_TEMPLATE.md`
- `60_templates/QA_HEALTH_REPORT_TEMPLATE.md` when rendered workflow, browser, or manual QA evidence is part of the audit
- `60_templates/SECURITY_EVIDENCE_LEDGER_TEMPLATE.md` when security is in scope
- `60_templates/COMPLETION_REPORT_TEMPLATE.md`
- `skills/repeatable-agent-loops/SKILL.md` when the audit is a repeated sweep or iterative remediation loop
- `skills/knowledge-refresh-and-drift-control/SKILL.md` when the audit reviews skills, templates, knowledge files, lessons, load order, or stale/duplicated guidance
- `skills/20-pass-protocol/SKILL.md` when the audit produces or reviews high-stakes prompts, agents, skills, source files, plans, runbooks, release instructions, or final reports
- `skills/cybersecurity-risk-routing/SKILL.md` when cybersecurity, security release gates, dual-use, AI security, incident, supply-chain, MCP/tool security, or vulnerability work is in scope
- `skills/external-integration-launch-gate/SKILL.md` when the audit includes provider callbacks, webhooks, OAuth redirects, payment/email/SMS providers, cron routes, deployment protection, provider dashboard URLs, or environment separation

For Comprehensive or Forensic audits, also load:

- `10_governance/RELEASE_GATES.md`
- `30_agents/SPECIALIST_AGENT_ROLES.md`

## Debug Or Incident

Load:

- `40_knowledge/SYSTEMATIC_WORKFLOWS.md`
- `50_audits/CANONICAL_AUDIT_PROTOCOLS.md`
- `60_templates/ROLLBACK_RECORD_TEMPLATE.md`
- `skills/diagnosing-bugs-and-feedback-loops/SKILL.md` before code changes for bugs, regressions, flaky behavior, incidents, or unknown failures
- `skills/deployment-and-hosting-guidance/SKILL.md` for deployment/runtime/hosting incidents
- `skills/scheduling-and-automation-routing/SKILL.md` for job, queue, webhook, worker, or monitor failures
- `skills/external-api-integration/SKILL.md` for provider, webhook, API, auth, quota, or rate-limit failures
- `skills/external-integration-launch-gate/SKILL.md` for provider callback failures, webhook redirects, deployment-protection blocks, wrong callback URLs, preview-to-production redirects, or sandbox/live environment mixups
- `skills/cybersecurity-risk-routing/SKILL.md` for any suspected security cause or security-sensitive incident
- `skills/security-incident-response/SKILL.md` for suspected compromise, unauthorized access, malware, ransomware, data leakage, or security alert triage
- `skills/ai-application-security/SKILL.md` for AI app, prompt, RAG, vector, model, or agent security incidents
- `skills/repeatable-agent-loops/SKILL.md` when diagnosis requires repeated observation, bounded retries, or stepwise remediation
- `skills/agent-observability-and-run-tracing/SKILL.md` when the incident requires durable trace, command history, tool history, or postmortem evidence

If the human declares an emergency, use APIVR break-glass rules and run a retroactive audit after stabilization.

## Verification Or Release

Load:

- `10_governance/RELEASE_GATES.md`
- `60_templates/EVIDENCE_LEDGER_TEMPLATE.md`
- `60_templates/COMPLETION_REPORT_TEMPLATE.md`
- `skills/release-readiness-and-ship-gates/SKILL.md`
- `skills/20-pass-protocol/SKILL.md` when release evidence, launch instructions, rollback instructions, source-file changes, or final signoff claims require high precision
- `60_templates/RELEASE_READINESS_DASHBOARD_TEMPLATE.md`
- `skills/compound-learning-capture/SKILL.md` when the release or verification produced a reusable lesson, repeated fix pattern, provider behavior, or new review rule
- `60_templates/SOLVED_PROBLEM_LEARNING_TEMPLATE.md` when a reusable lesson is captured
- `skills/code-review-and-review-army/SKILL.md` when implementation review or specialist review is required
- `skills/qa-and-browser-verification/SKILL.md` when release depends on user-visible workflow or browser QA evidence
- `skills/deployment-and-hosting-guidance/SKILL.md` when release includes deploy or hosting changes
- `skills/data-output-and-reporting/SKILL.md` when release success depends on reporting, analytics, or exported evidence
- `skills/external-integration-launch-gate/SKILL.md` when release depends on Stripe, Resend, Supabase Auth, OAuth, Vercel Cron, SMS/provider callbacks, webhooks, provider dashboard setup, or Preview/Production environment separation
- `skills/cybersecurity-risk-routing/SKILL.md` when release includes security-sensitive code, auth, privacy, payments, regulated data, APIs, AI systems, tools, CI/CD, or supply-chain risk
- `skills/supply-chain-and-build-provenance/SKILL.md` when release depends on dependencies, CI/CD, containers, IaC, SBOMs, artifact signing, provenance, or package publishing
- `skills/repeatable-agent-loops/SKILL.md` when release depends on repeated post-deploy checks, monitors, stabilization windows, or iterative evidence collection
- `skills/agent-observability-and-run-tracing/SKILL.md` for Comprehensive, Forensic, production-impacting, multi-agent, or tool-heavy releases

Do not claim `PASS` while any applicable release gate is failed, unknown, not run, or blocked without accepted non-critical risk.

## Prompt, Skill, Or Agent Design

Load:

- `20_skills/PORTABLE_SKILL_CONTRACT.md`
- `skills/super-build-kit/SKILL.md`
- `skills/20-pass-protocol/SKILL.md`
- `skills/writing-plans/SKILL.md` when producing reusable implementation plans or agent handoff plans
- `skills/requirements-grilling-and-alignment/SKILL.md` when prompt, skill, or agent design has ambiguous objectives, audiences, or scope
- `skills/domain-modeling-and-shared-language/SKILL.md` when prompt, skill, or agent behavior depends on domain language or decisions
- `skills/devex-and-documentation-review/SKILL.md` when instructions, docs, examples, adapters, or handoffs are created or changed
- `skills/repeatable-agent-loops/SKILL.md` when designing reusable recurring workflows, monitors, or iterative agent procedures
- `skills/long-horizon-agent-runtime/SKILL.md` when designing long-running staged agent procedures
- `skills/mcp-tool-governance/SKILL.md` when prompts, skills, or agents depend on MCP servers, plugin tools, or connectors
- `skills/cybersecurity-risk-routing/SKILL.md` when prompt, skill, or agent design affects security behavior, dual-use capability, tool authority, or data boundaries
- `skills/ai-application-security/SKILL.md` when prompt, skill, or agent design includes LLM app security, RAG, model routing, prompt leakage, or AI tool risk
- `skills/agent-observability-and-run-tracing/SKILL.md` when handoffs, traces, receipts, or durable audit trails are part of the design
- `skills/knowledge-refresh-and-drift-control/SKILL.md` when prompt, skill, or agent work updates active reusable guidance or replaces older instructions
- `skills/anti-ai-writing-quality/SKILL.md` when prompt, skill, agent, or report wording quality matters
- `skills/strategist-writing-dna/SKILL.md` when prompts or handoffs must resist drift and require proof
- `30_agents/SPECIALIST_AGENT_ROLES.md`
- `40_knowledge/SYSTEMATIC_WORKFLOWS.md`
- `00_start_here/PORTABLE_ADAPTERS.md`

Prompt, skill, and agent work must still define objective, audience, non-goals, evidence, verification, and a 20 Pass Protocol summary for high-stakes artifacts.

## Isolated Feature Work Or Plan Execution

Load:

- `skills/using-git-worktrees/SKILL.md`
- `skills/writing-plans/SKILL.md`
- `skills/test-driven-development/SKILL.md`
- `skills/dispatching-parallel-agents/SKILL.md` when work can be split safely
- `skills/subagent-driven-development/SKILL.md` when subagents are dispatched
- `skills/executing-plans/SKILL.md` when subagents are unavailable or the plan should run sequentially
- `skills/finishing-a-development-branch/SKILL.md` before merge, PR, keep, discard, or worktree cleanup decisions
- `skills/repeatable-agent-loops/SKILL.md` when the plan executes repeated bounded steps
- `skills/long-horizon-agent-runtime/SKILL.md` when the plan spans multiple stages, context windows, tool classes, artifacts, or handoffs
- `skills/agent-observability-and-run-tracing/SKILL.md` when execution evidence must survive handoff or context compression
- `runtime_adapters/NATIVE_GIT_WORKTREES.md`
- `60_templates/IMPLEMENTATION_BLUEPRINT_TEMPLATE.md`

Detect existing isolation first. Prefer native worktree tools. Use manual `git worktree add` only as fallback.

## Plan Writing Or Agent Handoff

Load:

- `skills/writing-plans/SKILL.md`
- `skills/20-pass-protocol/SKILL.md` when the plan or handoff is high-stakes, reusable, production-impacting, or source-file precise
- `skills/requirements-grilling-and-alignment/SKILL.md` when the plan inputs are ambiguous
- `skills/product-strategy-office-hours/SKILL.md` when the plan depends on product, buyer, user, or premise decisions
- `skills/product-requirements-and-issue-slicing/SKILL.md` when the plan must be split into vertical implementation slices
- `skills/domain-modeling-and-shared-language/SKILL.md` when the plan introduces durable terms, states, or ADRs
- `skills/test-driven-development/SKILL.md` for any code implementation
- `skills/external-integration-launch-gate/SKILL.md` when the plan includes provider callbacks, webhooks, auth redirects, cron, payments, email delivery, deployment protection, or Production/Preview env splits
- `skills/engineering-plan-review/SKILL.md` before handing off high-risk or multi-file plans
- `skills/dispatching-parallel-agents/SKILL.md` when the plan contains parallel task slices
- `skills/subagent-driven-development/SKILL.md` when the plan delegates implementation or review
- `skills/repeatable-agent-loops/SKILL.md` when the plan contains recurring checks, iterative sweeps, monitors, or repeat-until-stable work
- `skills/long-horizon-agent-runtime/SKILL.md` when the plan is long-running, staged, or checkpointed
- `skills/agent-observability-and-run-tracing/SKILL.md` when the plan requires run ids, trace entries, artifact tracking, or checkpoint summaries
- `60_templates/IMPLEMENTATION_BLUEPRINT_TEMPLATE.md`

Plans must contain exact file paths, concrete test steps, evidence states, rollback conditions, and no placeholders.

For Standard and above plans, include a compound-learning decision: `capture`, `update canonical guidance`, or `do not preserve`. Use `skills/compound-learning-capture/SKILL.md` only after evidence exists.

## Compound Learning Or Knowledge Refresh

Load:

- `skills/compound-learning-capture/SKILL.md` when completed APIVR work produced verified reusable learning
- `skills/knowledge-refresh-and-drift-control/SKILL.md` when reviewing stale, duplicate, conflicting, or unreferenced guidance
- `40_knowledge/COMPOUND_LEARNING_GUIDANCE.md`
- `60_templates/SOLVED_PROBLEM_LEARNING_TEMPLATE.md` when capturing a lesson
- `60_templates/KNOWLEDGE_REFRESH_REPORT_TEMPLATE.md` when refreshing active knowledge
- `90_archive/provenance/PROVENANCE_MAP.md` when concepts came from external sources or prior kit files

Use solved-problem learning only after evidence exists. If the lesson changes how all agents should behave, update the canonical skill, audit, template, governance, or load-order file instead of creating a parallel rule.

## Deployment, Hosting, Or Runtime Placement

Load:

- `skills/deployment-and-hosting-guidance/SKILL.md`
- `40_knowledge/DEPLOYMENT_AND_HOSTING_GUIDANCE.md`
- `skills/external-integration-launch-gate/SKILL.md` when deployment work includes provider-facing routes, callbacks, webhooks, OAuth/Auth redirects, cron routes, deployment protection, provider dashboard URLs, or Preview/Production environment splits
- `60_templates/ROLLBACK_RECORD_TEMPLATE.md`

Route persistent versus ephemeral work, cost risk, environments, rollback, and post-deploy verification through APIVR.

## Scheduling, Automation, Or Reporting

Load:

- `skills/scheduling-and-automation-routing/SKILL.md`
- `skills/external-integration-launch-gate/SKILL.md` when scheduled, webhook, provider, or event-driven work must be reachable from outside the app
- `skills/repeatable-agent-loops/SKILL.md` when the workflow repeats, monitors state, retries, sweeps, or runs until a condition is met
- `skills/data-output-and-reporting/SKILL.md` when outputs or reports are part of the workflow
- `skills/compound-learning-capture/SKILL.md` when repeated automation/reporting failures or successful patterns should become reusable learning
- `40_knowledge/AUTOMATION_AND_REPORTING_PATTERNS.md`
- `40_knowledge/REPEATABLE_AGENT_LOOP_PATTERNS.md` when loop design or stop conditions are in scope

Define trigger, freshness, idempotency, retry, duplicate prevention, observability, data accuracy, and verification horizon.

## Repeatable Agent Loops

Load:

- `skills/repeatable-agent-loops/SKILL.md`
- `40_knowledge/REPEATABLE_AGENT_LOOP_PATTERNS.md`
- `60_templates/LOOP_DESIGN_TEMPLATE.md` before running Standard and above loops
- `60_templates/LOOP_RUN_RECEIPT_TEMPLATE.md` for every loop iteration

Use for recurring audits, iterative remediation, quality sweeps, monitors, post-deploy stabilization checks, documentation checks, repeated test reliability checks, or bounded repeat-until-stable workflows. Define objective, scope, one-step action rule, evidence check, continue condition, stop conditions, iteration budget, receipt, and APIVR verdict.

## Long-Horizon Agent Runtime Or Run Tracing

Load:

- `skills/long-horizon-agent-runtime/SKILL.md`
- `40_knowledge/LONG_HORIZON_AGENT_RUNTIME_PATTERNS.md`
- `40_knowledge/AGENT_WORKSPACE_AND_ARTIFACT_BOUNDARIES.md`
- `60_templates/LONG_HORIZON_RUN_CONTROL_TEMPLATE.md`
- `skills/agent-observability-and-run-tracing/SKILL.md`
- `60_templates/AGENT_RUN_TRACE_TEMPLATE.md`

Use for Comprehensive or Forensic work, multi-stage work, context handoffs, long-running audits, multi-agent execution, artifact-heavy work, tool-heavy work, production-impacting work, or any task where evidence must survive summarization. Define stages, checkpoints, tool boundaries, workspace/scratch/evidence/final output boundaries, trace fields, redaction rules, stop conditions, and final APIVR verdict.

## Project Bootstrap, Setup, Or Tool Governance

Load:

- `skills/project-bootstrap-and-setup/SKILL.md` for install, bootstrap, first-run, local service, dependency, config, or setup work
- `skills/mcp-tool-governance/SKILL.md` for MCP servers, plugin tools, connectors, tool auth, permissions, overlapping tools, or tool logging
- `40_knowledge/AGENT_WORKSPACE_AND_ARTIFACT_BOUNDARIES.md` when setup or tools produce files, logs, artifacts, or evidence

Define setup boundary, files that must not be overwritten, secret-bearing files that must not be read, tool permissions, auth handling, harmless verification, and exact next command.

## Cybersecurity, AI Security, Incident Response, Or Supply Chain

Load:

- `skills/cybersecurity-risk-routing/SKILL.md`
- `40_knowledge/CYBERSECURITY_RISK_ROUTING_INDEX.md`
- `40_knowledge/SECURITY_FRAMEWORK_MAPPING.md`
- `60_templates/SECURITY_EVIDENCE_LEDGER_TEMPLATE.md` for Standard and above
- `60_templates/SECURITY_AUTHORIZATION_AND_SCOPE_TEMPLATE.md` when live-system, dual-use, scanning, exploit, phishing, credential, malware, MCP probing, prompt extraction, RAG poisoning, vector leakage, or third-party testing may occur
- `skills/ai-application-security/SKILL.md` for LLM apps, RAG, vector stores, model routing, prompt leakage, prompt injection, AI data leakage, or AI tool abuse
- `skills/security-incident-response/SKILL.md` for alerts, compromise, exfiltration, malware, ransomware, unauthorized access, containment, recovery, or forensic security work
- `skills/supply-chain-and-build-provenance/SKILL.md` for dependencies, lockfiles, CI/CD, SBOMs, secret scanning, containers, IaC, signatures, provenance, or artifact release trust
- `skills/mcp-tool-governance/SKILL.md` for MCP/tool poisoning, tool shadowing, rug pulls, toxic flows, SSRF risk, unauthenticated MCP exposure, tool allowlists, or human approval gates
- `skills/external-api-integration/SKILL.md` for API auth, OAuth, webhooks, BOLA/IDOR, mass assignment, rate limits, abuse controls, or unsafe third-party consumption
- `skills/external-integration-launch-gate/SKILL.md` for provider inbound routes, OAuth callbacks, webhook reachability, deployment protection, sandbox/live separation, or external-world smoke tests

Use Rapid only for narrow, non-live, reversible security review. Use Comprehensive or Forensic for private data, auth, payments, production, cloud/IAM, CI/CD, AI systems, incidents, or unknown core security evidence.

## External APIs Or Media Assets

Load:

- `skills/external-api-integration/SKILL.md`
- `skills/external-integration-launch-gate/SKILL.md` when the API integration has provider callbacks, webhooks, OAuth redirects, machine-to-machine inbound calls, provider dashboard URLs, sandbox/live mode, or Preview/Production environment differences
- `40_knowledge/EXTERNAL_API_INTEGRATION_GUIDANCE.md`
- `skills/media-and-asset-pipeline/SKILL.md` when assets are generated, retrieved, transformed, stored, cached, licensed, or delivered
- `40_knowledge/MEDIA_AND_ASSET_PIPELINE_GUIDANCE.md` when media/assets are in scope

Define secrets, auth, rate limits, retries, idempotency, rights, provenance, optimization, fallback, and rendered or provider-level verification.

## Frontend UI, UX, Design, Or Interface Copy

Load:

- `skills/ui-ux-design-quality/SKILL.md`
- `40_knowledge/UI_UX_DESIGN_SYSTEM_GUIDANCE.md`
- `60_templates/DESIGN_DIRECTION_BRIEF_TEMPLATE.md` for Standard and above UI work
- `60_templates/UI_UX_REVIEW_CHECKLIST.md` before final delivery
- `skills/anti-ai-writing-quality/SKILL.md` when interface, marketing, client-facing, or report copy is involved
- `skills/strategist-writing-dna/SKILL.md` when the UI work includes strategy, executive narrative, prompts, or decision support
- `skills/media-and-asset-pipeline/SKILL.md` when images, icons, video, audio, fonts, generated media, or external assets are involved
- `skills/data-output-and-reporting/SKILL.md` when dashboards, charts, reports, exports, or analytics outputs are involved

Define user, screen job, design direction, accessibility gates, responsive viewports, UI copy standard, anti-generic review, rendered verification, and APIVR verdict.

## Writing, Copy, Voice, Or Strategic Communication

Load:

- `skills/anti-ai-writing-quality/SKILL.md`
- `skills/20-pass-protocol/SKILL.md` when the writing is a high-stakes prompt, agent instruction, runbook, release note, executive decision artifact, or accuracy-critical report
- `skills/strategist-writing-dna/SKILL.md` when the work must be tactical, executive, scoped, proof-driven, or anti-drift
- `skills/ui-ux-design-quality/SKILL.md` when the writing appears inside an interface or landing page

Define audience, purpose, voice, proof standard, banned patterns, facts versus assumptions, final action, and evidence state.

## Product Strategy, Requirements, Domain Modeling, Or Issue Slicing

Load:

- `skills/requirements-grilling-and-alignment/SKILL.md`
- `skills/product-strategy-office-hours/SKILL.md` when product, founder, buyer, user, premise, or market clarity is needed
- `skills/product-requirements-and-issue-slicing/SKILL.md` when converting ideas, PRDs, specs, or audits into vertical issues
- `skills/domain-modeling-and-shared-language/SKILL.md` when vocabulary, entities, events, states, roles, or ADRs are in scope
- `40_knowledge/DOMAIN_MODELING_AND_ADR_GUIDANCE.md`
- `60_templates/DOMAIN_GLOSSARY_TEMPLATE.md` when domain terms affect code, UI, reports, data, tests, or decisions
- `60_templates/ADR_TEMPLATE.md` when durable decisions affect architecture, providers, data, security, operations, cost, or reversibility

Define one decision at a time, non-goals, acceptance criteria, highest-risk assumption, success metric, vertical slices, evidence states, and APIVR verdict.

## Architecture, Engineering Review, Debugging, QA, Or Release Readiness

Load:

- `skills/codebase-design-and-deep-modules/SKILL.md` for architecture, module boundaries, adapters, refactors, dependency direction, locality, or deletion tests
- `40_knowledge/CODEBASE_DESIGN_DEEP_MODULES.md`
- `skills/engineering-plan-review/SKILL.md` before high-risk or multi-file implementation
- `skills/20-pass-protocol/SKILL.md` when source-file changes, plans, reviews, or release claims are high-stakes and require extra precision
- `skills/code-review-and-review-army/SKILL.md` for APIVR Phase 4 specialist implementation review
- `skills/diagnosing-bugs-and-feedback-loops/SKILL.md` before fixing bugs, regressions, incidents, flaky behavior, or unknown failures
- `skills/throwaway-prototyping/SKILL.md` for spikes, experiments, provider trials, or disposable proofs of concept
- `skills/qa-and-browser-verification/SKILL.md` for manual QA, browser checks, user workflows, and rendered verification
- `60_templates/QA_HEALTH_REPORT_TEMPLATE.md` for Standard and above QA work
- `skills/release-readiness-and-ship-gates/SKILL.md` before merge, deploy, publish, handoff, or done claims
- `60_templates/RELEASE_READINESS_DASHBOARD_TEMPLATE.md` for production-impacting release or handoff
- `skills/devex-and-documentation-review/SKILL.md` when developer experience, docs, setup, examples, API docs, release notes, or handoffs are affected
- `skills/compound-learning-capture/SKILL.md` after verified fixes, incidents, release findings, QA patterns, or review findings produce reusable learning
- `skills/knowledge-refresh-and-drift-control/SKILL.md` when architecture, QA, release, docs, or handoff guidance becomes stale or duplicated

Define feedback loop, specialist review passes, QA matrix, release gate statuses, rollback, changelog, post-release horizon, and final APIVR verdict.
