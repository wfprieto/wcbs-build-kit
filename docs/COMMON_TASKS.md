# Common Tasks

## Audit A Repo

1. Read startup files.
2. Select audit tier.
3. Load `50_audits/CANONICAL_AUDIT_PROTOCOLS.md`.
4. Produce findings with evidence states.

## Plan A Feature

1. Load `skills/writing-plans/SKILL.md`.
2. Use `60_templates/IMPLEMENTATION_BLUEPRINT_TEMPLATE.md`.
3. Include Red-Green-Refactor evidence and pre-flight contradiction scan.

## Install An Adapter

```bash
node scripts/install-adapter.mjs --target codex --dest <project> --install
node scripts/install-adapter.mjs --target codex --dest <project> --doctor
node scripts/adapter-smoke-test.mjs --target codex --dest <project>
```

## Prepare A Release

```bash
npm run release-check
```

Attach artifacts from `dist/release-artifacts/` to the GitHub release.

