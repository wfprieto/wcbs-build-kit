# LLM-Agnostic Super Build Kit

Portable operating system for AI-assisted software work.

Operating law: **Audit wide. Fix narrow. Prove everything.**

This kit merges the permanent APIVR execution loop, the 16 Elite Build Goals, the reusable specialist/audit structure from `wfprieto/wcbs-build-kit`, and the portable skill/workflow mechanics from `obra/Superpowers`.

## Start Here

Every agent must begin with:

1. `00_start_here/START_HERE.md`
2. `00_start_here/SOURCE_OF_TRUTH.md`
3. `00_start_here/LOAD_ORDER.md`
4. `50_audits/AUDIT_TIER_ROUTER.md`

Then load only the task-specific governance, agent, audit, and template files named by the load order.

Core operational skills:

- `skills/super-build-kit/SKILL.md` - always-first orientation and skill invocation logic.
- `skills/writing-plans/SKILL.md` - zero-placeholder APIVR implementation plans.
- `skills/test-driven-development/SKILL.md` - APIVR Phase 3 test-first implementation gate.
- `skills/dispatching-parallel-agents/SKILL.md` - safe parallelization decision protocol.
- `skills/subagent-driven-development/SKILL.md` - delegated implementation, status handling, and two-stage review.
- Domain skills for deployment, scheduling, reporting, external APIs, and media/assets.

## Permanent Authority Order

1. `20_skills/apivr.skill` and `20_skills/apivr/`
2. `10_governance/source_of_truth/Elite_Build_Goals_v3.md`
3. Canonical merged files in this repository
4. Archived upstream provenance notes

No adapter, agent persona, prompt template, convenience workflow, or older repository file may weaken APIVR or the 16 Elite Build Goals.

## Layout

- `00_start_here/` - source of truth, load order, activation rules
- `10_governance/` - APIVR, Elite Build Goals, evidence rules, release gates
- `20_skills/` - portable skill definitions and packaged APIVR skill
- `skills/` - runtime-loadable operational skills
- `30_agents/` - merged specialist agent roles
- `40_knowledge/` - reusable knowledge and workflow source material
- `50_audits/` - light through forensic audit protocols
- `60_templates/` - evidence ledgers, plans, completion reports, rollback records
- `90_archive/` - provenance and superseded-source mapping

## Completion Standard

Work is not done until the applicable APIVR phases have run, evidence is recorded, release gates are classified, and the final verdict honestly reflects reality: `PASS`, `CONDITIONAL PASS`, `PARTIAL`, `FAIL`, or `BLOCKED`.

## Optional Doctor

This kit includes a private, zero-dependency `package.json` only for verification commands. It is not an app runtime package and does not add build dependencies.

Run from the kit root:

```bash
npm run doctor
npm run verify
```

These commands check required files, activation wiring, skill frontmatter, JSON validity, evidence vocabulary, and package safety.
