# Committed Run-Bundle Fixture

A **schema-valid** controller run bundle, committed to the repository.

## Why this exists

The artifact tests previously validated whatever run bundle happened to sit in the
developer's working tree at `.wcbs/runs/`. But `.wcbs/` is gitignored, so in a clean
`git clone` plus `git am` checkout that directory does not exist, and the suite failed
7 tests. The advertised `npm run check` gate was not reproducible from a clean checkout,
and the reported pass count depended on ignored local state.

This fixture makes the gate **hermetic**: it is committed, so it is present in every
checkout, and the tests validate it rather than the developer's incidental artifacts.

The doctor integration tests copy this fixture into a temporary fixture repo's
`.wcbs/runs/<run-id>/`, mutate one field, and assert the doctor rejects it.

## Contract

Every machine-readable artifact here must validate against its published schema:

- `tasks/<task-id>/task-artifact.json` -> `skills/subagent-driven-development/schemas/task-artifact.schema.json`
- `findings.json` -> `skills/subagent-driven-development/schemas/review-finding.schema.json`
- `progress-ledger.jsonl` -> `skills/subagent-driven-development/schemas/progress-ledger.schema.json`

Every task ID in `progress-ledger.jsonl` must have a matching task artifact. The fixture is intentionally a minimal schema-and-wiring fixture, not a complete example of every human-readable file in the full run layout.

`npm run doctor` enforces this. If a schema changes, this fixture must change with it.
