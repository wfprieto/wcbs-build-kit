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

If the human declares an emergency, use APIVR break-glass rules and run a retroactive audit after stabilization.

## Verification Or Release

Load:

- `10_governance/RELEASE_GATES.md`
- `60_templates/EVIDENCE_LEDGER_TEMPLATE.md`
- `60_templates/COMPLETION_REPORT_TEMPLATE.md`

Do not claim `PASS` while any applicable release gate is failed, unknown, not run, or blocked without accepted non-critical risk.

## Prompt, Skill, Or Agent Design

Load:

- `20_skills/PORTABLE_SKILL_CONTRACT.md`
- `30_agents/SPECIALIST_AGENT_ROLES.md`
- `40_knowledge/SYSTEMATIC_WORKFLOWS.md`
- `00_start_here/PORTABLE_ADAPTERS.md`

Prompt and skill work must still define objective, audience, non-goals, evidence, and verification.

