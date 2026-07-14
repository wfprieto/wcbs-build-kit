# Distribution Policy

The Super Build Kit is distributed as a repository package first.

## Rules

- Keep `package.json` private unless an explicit publishing plan is approved.
- Keep runtime dependencies at zero unless APIVR records a durable need.
- Do not publish local scratch folders, generated archives, `.env` files, or secret-bearing material.
- Keep active instructions separate from provenance.
- Verify before every release with `npm run verify` and `npm run system-test`.

## Download Safety

A downloaded copy is valid when:

- active files in `MANIFEST.md` are present;
- doctor passes;
- system tests pass;
- adapter files point back to APIVR startup;
- provenance remains informational.
