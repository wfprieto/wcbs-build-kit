# Load Order

Load the smallest complete set. Do not load the entire kit by default.

## Always Load

1. `00_start_here/START_HERE.md`
2. `00_start_here/SOURCE_OF_TRUTH.md`
3. `50_audits/AUDIT_TIER_ROUTER.md`
4. `10_governance/APIVR_EXECUTION_LIFECYCLE.md`
5. `skills/super-build-kit/SKILL.md` when skills, platform activation, or method selection may affect the work

## Build Or Fix

Load:

- `10_governance/ELITE_BUILD_GOALS_SUMMARY.md`
- `10_governance/RELEASE_GATES.md`
- `skills/writing-plans/SKILL.md` for APIVR Phase 2 implementation plans
- `skills/test-driven-development/SKILL.md` for APIVR Phase 3 implementation work
- `skills/using-git-worktrees/SKILL.md` when work should be isolated
- `skills/dispatching-parallel-agents/SKILL.md` when the work may benefit from parallel investigation, audit, implementation, or verification
- `skills/subagent-driven-development/SKILL.md` when subagents will implement, review, or verify task slices
- `skills/deployment-and-hosting-guidance/SKILL.md` when hosting, deploy, runtime, cost, or environment choices are involved
- `skills/scheduling-and-automation-routing/SKILL.md` when jobs, webhooks, queues, reminders, monitors, or workers are involved
- `skills/external-api-integration/SKILL.md` when third-party services, SDKs, webhooks, OAuth, API keys, or provider limits are involved
- `skills/media-and-asset-pipeline/SKILL.md` when images, video, audio, files, fonts, generated media, CDN, or asset rights are involved
- `skills/data-output-and-reporting/SKILL.md` when dashboards, exports, reports, analytics outputs, or evidence artifacts are involved
- `skills/ui-ux-design-quality/SKILL.md` when frontend UI, UX, visual direction, accessibility, dashboards, forms, navigation, charts, landing pages, or interface copy are involved
- `skills/anti-ai-writing-quality/SKILL.md` when copy, reports, emails, client-facing text, website copy, UI microcopy, prompts, or completion reports must avoid generic AI tone
- `skills/strategist-writing-dna/SKILL.md` when writing must be decisive, tactical, executive-ready, anti-drift, scoped, or proof-driven
- `30_agents/AGENT_ACTIVATION_MATRIX.md`
- `60_templates/IMPLEMENTATION_BLUEPRINT_TEMPLATE.md`
- `60_templates/COMPLETION_REPORT_TEMPLATE.md`

Use APIVR phases 1-6 at the selected tier.

## Audit

Load:

- `50_audits/AUDIT_TIER_ROUTER.md`
- `50_audits/CANONICAL_AUDIT_PROTOCOLS.md`
- `60_templates/EVIDENCE_LEDGER_TEMPLATE.md`
- `60_templates/COMPLETION_REPORT_TEMPLATE.md`

For Comprehensive or Forensic audits, also load:

- `10_governance/RELEASE_GATES.md`
- `30_agents/SPECIALIST_AGENT_ROLES.md`

## Debug Or Incident

Load:

- `40_knowledge/SYSTEMATIC_WORKFLOWS.md`
- `50_audits/CANONICAL_AUDIT_PROTOCOLS.md`
- `60_templates/ROLLBACK_RECORD_TEMPLATE.md`
- `skills/deployment-and-hosting-guidance/SKILL.md` for deployment/runtime/hosting incidents
- `skills/scheduling-and-automation-routing/SKILL.md` for job, queue, webhook, worker, or monitor failures
- `skills/external-api-integration/SKILL.md` for provider, webhook, API, auth, quota, or rate-limit failures

If the human declares an emergency, use APIVR break-glass rules and run a retroactive audit after stabilization.

## Verification Or Release

Load:

- `10_governance/RELEASE_GATES.md`
- `60_templates/EVIDENCE_LEDGER_TEMPLATE.md`
- `60_templates/COMPLETION_REPORT_TEMPLATE.md`
- `skills/deployment-and-hosting-guidance/SKILL.md` when release includes deploy or hosting changes
- `skills/data-output-and-reporting/SKILL.md` when release success depends on reporting, analytics, or exported evidence
- `skills/ui-ux-design-quality/SKILL.md` when release includes user-facing UI, UX, accessibility, visual quality, dashboards, forms, or interface copy
- `skills/anti-ai-writing-quality/SKILL.md` when release includes client-facing, user-facing, report, email, prompt, or marketing copy

Do not claim `PASS` while any applicable release gate is failed, unknown, not run, or blocked without accepted non-critical risk.

## Prompt, Skill, Or Agent Design

Load:

- `20_skills/PORTABLE_SKILL_CONTRACT.md`
- `skills/super-build-kit/SKILL.md`
- `skills/writing-plans/SKILL.md` when producing reusable implementation plans or agent handoff plans
- `skills/anti-ai-writing-quality/SKILL.md` when prompt, skill, agent, or report wording quality matters
- `skills/strategist-writing-dna/SKILL.md` when prompts or handoffs must resist drift and require proof
- `30_agents/SPECIALIST_AGENT_ROLES.md`
- `40_knowledge/SYSTEMATIC_WORKFLOWS.md`
- `00_start_here/PORTABLE_ADAPTERS.md`

Prompt and skill work must still define objective, audience, non-goals, evidence, and verification.

## Isolated Feature Work Or Plan Execution

Load:

- `skills/using-git-worktrees/SKILL.md`
- `skills/writing-plans/SKILL.md`
- `skills/test-driven-development/SKILL.md`
- `skills/dispatching-parallel-agents/SKILL.md` when work can be split safely
- `skills/subagent-driven-development/SKILL.md` when subagents are dispatched
- `runtime_adapters/NATIVE_GIT_WORKTREES.md`
- `60_templates/IMPLEMENTATION_BLUEPRINT_TEMPLATE.md`

Detect existing isolation first. Prefer native worktree tools. Use manual `git worktree add` only as fallback.

## Plan Writing Or Agent Handoff

Load:

- `skills/writing-plans/SKILL.md`
- `skills/test-driven-development/SKILL.md` for any code implementation
- `skills/dispatching-parallel-agents/SKILL.md` when the plan contains parallel task slices
- `skills/subagent-driven-development/SKILL.md` when the plan delegates implementation or review
- `60_templates/IMPLEMENTATION_BLUEPRINT_TEMPLATE.md`

Plans must contain exact file paths, concrete test steps, evidence states, rollback conditions, and no placeholders.

## Deployment, Hosting, Or Runtime Placement

Load:

- `skills/deployment-and-hosting-guidance/SKILL.md`
- `40_knowledge/DEPLOYMENT_AND_HOSTING_GUIDANCE.md`
- `60_templates/ROLLBACK_RECORD_TEMPLATE.md`

Route persistent versus ephemeral work, cost risk, environments, rollback, and post-deploy verification through APIVR.

## Scheduling, Automation, Or Reporting

Load:

- `skills/scheduling-and-automation-routing/SKILL.md`
- `skills/data-output-and-reporting/SKILL.md` when outputs or reports are part of the workflow
- `40_knowledge/AUTOMATION_AND_REPORTING_PATTERNS.md`

Define trigger, freshness, idempotency, retry, duplicate prevention, observability, data accuracy, and verification horizon.

## External APIs Or Media Assets

Load:

- `skills/external-api-integration/SKILL.md`
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
- `skills/strategist-writing-dna/SKILL.md` when the work must be tactical, executive, scoped, proof-driven, or anti-drift
- `skills/ui-ux-design-quality/SKILL.md` when the writing appears inside an interface or landing page

Define audience, purpose, voice, proof standard, banned patterns, facts versus assumptions, final action, and evidence state.
