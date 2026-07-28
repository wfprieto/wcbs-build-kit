# WCBS V1 to V2 Migration

V2 keeps the V1 installer only to allow a safe exit from project vendoring.
Migration requires the V1 ownership manifest, the original V1 source root,
and byte-identical V1-owned files. It never changes user-owned README,
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

Migration blocks before writing if a V1-owned file changed, the original source
is unavailable, the target is ambiguous, or the V2 plugin directory contains
unowned content. It installs the V2 plugin first and removes only V1 files
whose ownership was verified. Keep the V1 source checkout until the V2 doctor
and a real clean-session check have completed.
