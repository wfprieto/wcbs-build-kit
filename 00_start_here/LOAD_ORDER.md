# Load Order

Load the smallest complete set. Do not load the entire kit by default.

## Always Load

1. `00_start_here/START_HERE.md`
2. `00_start_here/SOURCE_OF_TRUTH.md`
3. `50_audits/AUDIT_TIER_ROUTER.md`
4. `10_governance/APIVR_EXECUTION_LIFECYCLE.md`

## Build Or Fix

Load:

- `10_governance/ELITE_BUILD_GOALS_SUMMARY.md`
- `10_governance/RELEASE_GATES.md`
- `skills/using-git-worktrees/SKILL.md` when work should be isolated
- `skills/deployment-and-hosting-guidance/SKILL.md` when hosting, deploy, runtime, cost, or environment choices are involved
- `skills/scheduling-and-automation-routing/SKILL.md` when jobs, webhooks, queues, reminders, monitors, or workers are involved
- `skills/external-api-integration/SKILL.md` when third-party services, SDKs, webhooks, OAuth, API keys, or provider limits are involved
- `skills/media-and-asset-pipeline/SKILL.md` when images, video, audio, files, fonts, generated media, CDN, or asset rights are involved
- `skills/data-output-and-reporting/SKILL.md` when dashboards, exports, reports, analytics outputs, or evidence artifacts are involved
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

Do not claim `PASS` while any applicable release gate is failed, unknown, not run, or blocked without accepted non-critical risk.

## Prompt, Skill, Or Agent Design

Load:

- `20_skills/PORTABLE_SKILL_CONTRACT.md`
- `30_agents/SPECIALIST_AGENT_ROLES.md`
- `40_knowledge/SYSTEMATIC_WORKFLOWS.md`
- `00_start_here/PORTABLE_ADAPTERS.md`

Prompt and skill work must still define objective, audience, non-goals, evidence, and verification.

## Isolated Feature Work Or Plan Execution

Load:

- `skills/using-git-worktrees/SKILL.md`
- `runtime_adapters/NATIVE_GIT_WORKTREES.md`
- `60_templates/IMPLEMENTATION_BLUEPRINT_TEMPLATE.md`

Detect existing isolation first. Prefer native worktree tools. Use manual `git worktree add` only as fallback.

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
