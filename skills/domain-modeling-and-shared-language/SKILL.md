---
name: domain-modeling-and-shared-language
description: Use when software work needs durable business vocabulary, domain concepts, entity boundaries, state transitions, glossary terms, ubiquitous language, ADRs, bounded contexts, workflow nouns, or reduction of generic/ambiguous naming before implementation.
---

# Domain Modeling And Shared Language

Use this skill during APIVR Phase 1 and Phase 2 when unclear domain language could create wrong code, duplicate concepts, or brittle plans.

## Protocol

1. Extract domain nouns, verbs, states, roles, and invariants from source material.
2. Identify synonyms and conflicts.
3. Define canonical terms in a domain glossary.
4. Capture major technical/product decisions as ADRs.
5. Use domain terms in file names, tests, plans, UI copy, and completion reports.

## Required Artifacts

- Use `40_knowledge/DOMAIN_MODELING_AND_ADR_GUIDANCE.md` for guidance.
- Use `60_templates/DOMAIN_GLOSSARY_TEMPLATE.md` for glossary work.
- Use `60_templates/ADR_TEMPLATE.md` for durable decisions.

## Worked Example

Scenario: A CRM uses "lead", "prospect", and "opportunity" interchangeably.

- Glossary defines Lead as an unqualified contact, Prospect as qualified but not quoted, and Opportunity as a tracked revenue pursuit.
- ADR records why scoring belongs to Prospect, not Lead.
- Tests and UI copy use the canonical words.
- APIVR verdict cannot be `PASS` if implementation introduces a fourth synonym without an ADR.

