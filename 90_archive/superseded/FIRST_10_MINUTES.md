# First 10 Minutes

1. Verify the kit:

```bash
npm run release-check
```

2. List adapter targets:

```bash
node scripts/install-adapter.mjs --list-targets
```

3. Install into a project-local destination:

```bash
node scripts/install-adapter.mjs --target codex --dest ../my-project --install
node scripts/install-adapter.mjs --target codex --dest ../my-project --doctor
node scripts/adapter-smoke-test.mjs --target codex --dest ../my-project
```

4. Start work with:

- `00_start_here/START_HERE.md`
- `00_start_here/SOURCE_OF_TRUTH.md`
- `00_start_here/LOAD_ORDER.md`
- `50_audits/AUDIT_TIER_ROUTER.md`

Done claims require APIVR tier, evidence state, release-gate status, final verdict, and next action.

