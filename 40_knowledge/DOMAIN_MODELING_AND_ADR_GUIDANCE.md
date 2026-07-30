# Domain Modeling And ADR Guidance

Use this knowledge source with `skills/domain-modeling-and-shared-language/SKILL.md`.

## Domain Modeling

- Prefer project-native nouns over generic technical labels.
- Define role, object, event, state, invariant, and policy terms separately.
- Record synonyms and choose one canonical term.
- Treat state names as release-sensitive. A wrong state name often creates wrong permissions, reports, and workflows.
- Put domain terms into tests and acceptance criteria so language becomes executable.

## ADR Discipline

Write an ADR when a decision affects architecture, data model, external providers, security boundaries, public API, cost, operational behavior, or future reversibility.

An ADR should be short and durable:

- Context: what made the decision necessary.
- Decision: what was chosen.
- Alternatives: what was rejected.
- Consequences: what improves, worsens, or must be monitored.
- Reversal: what would make the decision wrong later.

## APIVR Evidence

Glossaries and ADRs are planning evidence. They do not prove implementation works. Link them to tests, audits, docs, and release gates before claiming `PASS`.

