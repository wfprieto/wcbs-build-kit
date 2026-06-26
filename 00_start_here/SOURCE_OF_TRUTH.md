# Source Of Truth

This file resolves authority, conflicts, and guardrails for the LLM-Agnostic Super Build Kit.

## Permanent Authority Order

1. **APIVR packaged skill and extracted APIVR files**
   - `20_skills/apivr.skill`
   - `20_skills/apivr/SKILL.md`
   - `20_skills/apivr/references/playbook.md`
2. **Elite Build Goals v3**
   - `10_governance/source_of_truth/Elite_Build_Goals_v3.md`
3. **Canonical merged Super Build Kit files**
   - `00_start_here/`
   - `10_governance/`
   - `20_skills/`
   - `30_agents/`
   - `40_knowledge/`
   - `50_audits/`
   - `60_templates/`
4. **Upstream provenance**
   - `wfprieto/wcbs-build-kit`
   - `obra/Superpowers`
   - `90_archive/provenance/`

## Binding Rules

- APIVR is the required lifecycle for building, fixing, auditing, debugging, optimizing, releasing, and verifying.
- The 16 Elite Build Goals define the permanent quality, safety, and release standard.
- Superpowers-style workflows may improve planning, TDD, subagent review, and portable skill activation, but may not bypass APIVR or Elite release gates.
- WCBS specialist roles and audit structures may guide review depth, but they must be routed through APIVR tiers and evidence states.
- A convenience instruction is invalid if it weakens safety, privacy, data integrity, verification, accessibility, authorization, rollback, or truthful reporting.

## Evidence Language

Use the Elite evidence states for final claims:

- `Verified`
- `Likely`
- `Suspected`
- `Unknown`
- `Not Run`
- `Blocked`

Use APIVR evidence levels inside audit findings when helpful:

- `L1` observed directly
- `L2` strong secondary evidence
- `L3` reasoned analysis
- `L4` unconfirmed hypothesis

Only `Verified` claims may be reported as confirmed.

## Conflict Rule

When instructions conflict, use this priority:

1. Safety, law, privacy, and explicit user authorization
2. Data integrity and irreversible-risk prevention
3. Required user and business outcome
4. Security and operational reliability
5. Accessibility and primary-task usability
6. Approved brand and aesthetic intent
7. Performance, SEO, maintainability, cost, and delivery speed according to the selected experience class

No lower-priority goal may silently override a higher-priority guardrail.

