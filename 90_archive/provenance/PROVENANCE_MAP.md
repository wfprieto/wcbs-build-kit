# Provenance Map

This kit was created from four source streams.

## Permanent Sources

| Source | Local Status | Notes |
|---|---|---|
| `apivr.skill` | Preserved at `20_skills/apivr.skill`; extracted at `20_skills/apivr/` | Highest authority for lifecycle and proportionality. |
| `Elite_Build_Goals_v3.md` | Preserved at `10_governance/source_of_truth/Elite_Build_Goals_v3.md` | Highest authority for goals, release gates, evidence states, and guardrails. |

## Upstream Repositories

| Source | Local Status | Merged Into |
|---|---|---|
| `wfprieto/wcbs-build-kit` | Inspected by GitHub API; canonical concepts merged; original files not copied wholesale | `00_start_here/`, `10_governance/`, `30_agents/`, `50_audits/`, `60_templates/` |
| `obra/Superpowers` | Inspected by GitHub API; portable workflow concepts merged; original files not copied wholesale | `20_skills/`, `40_knowledge/`, `00_start_here/PORTABLE_ADAPTERS.md` |

## Deduplication Decisions

- APIVR lifecycle content is canonical in `10_governance/APIVR_EXECUTION_LIFECYCLE.md`; full skill source remains preserved.
- Elite Build Goals are summarized for fast loading and preserved in full as source of truth.
- WCBS agent files are merged into role-based agent docs instead of 15 separate persona files.
- WCBS audit files are merged into one canonical audit protocol file plus tier router.
- Superpowers planning, review, TDD, subagent, and portability mechanics are merged into systematic workflow and skill-contract docs.
- Runtime-specific files are treated as adapter references, not source-of-truth files.

