# WCBS V1 to V2 Migration

V2 keeps the V1 installer only to allow a safe exit from project vendoring.
Migration requires the V1 ownership manifest and unchanged V1-owned files.
Versioned receipts verify recorded per-file hashes even if the original source
checkout moved. Older hashless receipts require the original V1 source root
for byte comparison. Migration never changes user-owned README,
package, source, or unrelated configuration files.

Run the dry-run first:

```bash
npm run wcbs -- migrate --project <v1-project> --plugin-dir <runtime-plugin-directory> --dry-run --json
```

Apply only after the dry-run says `DRY_RUN`:

```bash
npm run wcbs -- migrate --project <v1-project> --plugin-dir <runtime-plugin-directory> --apply --json
```

For a Codex migration, add the resulting V2 plugin directory as the local
marketplace root, then install the listed plugin before beginning the required
fresh-session check:

```bash
codex plugin marketplace add <runtime-plugin-directory>
codex plugin add wcbs-build-kit@wcbs-build-kit
```

Migration blocks before writing if a V1-owned file changed, an owned path is
redirected through a symlink, a hashless receipt's original source is
unavailable, the target is ambiguous, or the V2 plugin directory contains
unowned content. It installs the V2 plugin first and removes only V1 files
whose ownership was verified. Keep the original checkout for hashless receipts
until migration completes. V2 package integrity alone does not establish
native runtime activation; follow `docs/V2_RUNTIME_EVIDENCE.md` before relying
on the new installation.
