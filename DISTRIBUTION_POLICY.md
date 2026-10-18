# Distribution Policy

The Super Build Kit is distributed as a repository package first.

## Rules

- Keep `package.json` private. Decision (2026-10-18): defer npm publication;
  the GitHub release ZIP and self-hosted plugin marketplaces are the distribution
  routes. npm currently runs repository checks, not a supported install path.
  Reconsider only with demonstrated user demand, a tested install/update/uninstall
  contract, package provenance, and an owner for published-version support.
- Keep runtime dependencies at zero unless APIVR records a durable need.
- Do not publish local scratch folders, generated archives, `.env` files, or secret-bearing material.
- Keep active instructions separate from provenance.
- Include the current `LICENSE` and matching `UNLICENSED` metadata in new
  distribution packages. Do not relabel or republish the MIT-licensed v2.0.0
  artifact under the new notice; its existing grant remains intact. Before
  publishing a new all-rights-reserved release, assign it a distinct version
  and verify that its packaged license and metadata agree.
- Verify before every release with `npm run verify` and `npm run system-test`.

## Download Safety

A downloaded copy is valid when:

- active files in `MANIFEST.md` are present;
- doctor passes;
- system tests pass;
- adapter files point back to APIVR startup;
- provenance remains informational.
