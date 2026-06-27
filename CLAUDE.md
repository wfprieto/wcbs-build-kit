# Claude Runtime Adapter

Claude must treat this repository as an LLM-agnostic Super Build Kit.

## Activation

At the start of any serious task, load:

1. `00_start_here/START_HERE.md`
2. `00_start_here/SOURCE_OF_TRUTH.md`
3. `00_start_here/LOAD_ORDER.md`
4. `50_audits/AUDIT_TIER_ROUTER.md`
5. `skills/super-build-kit/SKILL.md`

Then load only the task-specific files named by `LOAD_ORDER.md`.

For implementation work, load `skills/writing-plans/SKILL.md` and `skills/test-driven-development/SKILL.md`. Before splitting work, load `skills/dispatching-parallel-agents/SKILL.md`; when delegated agents are used, load `skills/subagent-driven-development/SKILL.md`.

## Authority

1. `20_skills/apivr.skill` and `20_skills/apivr/`
2. `10_governance/source_of_truth/Elite_Build_Goals_v3.md`
3. Canonical merged files in this repository
4. Runtime adapter files, including this file

If this file conflicts with APIVR or the Elite Build Goals, APIVR and the Elite Build Goals win.
