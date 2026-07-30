# Learning Log

## 2026-07-29: Hardened release builds must be usable in secure local checkouts

- Observation: the consolidated V2 release-artifact test failed because the
  shared checkout set `core.autocrlf=false` and `core.attributesFile` locally.
- Root cause: the hardened Git policy rejected values that its own `-c`
  arguments already override, making a secure immutable archive builder depend
  on harmless local checkout preferences.
- Correction: retain fail-closed rejection for local `filter.*` and include
  settings, but record overridden core transport keys as neutralized evidence.
- Regression proof: `scripts/tests/hardened-git.test.mjs` includes an isolated
  neutralization case; `scripts/tests/artifact-bundle.test.mjs` now proves the
  release artifact can be built under those settings.
- Reuse trigger: any new hardening control that rejects local configuration
  must distinguish effective execution risk from settings explicitly overridden
  by the hardened invocation.

## 2026-07-29: Ownership verification must cover the whole destructive tree

- Observation: V2 uninstall verified only the manifest-listed files, then
  recursively removed the entire plugin directory.
- Root cause: manifest integrity was incorrectly treated as proof that no
  unowned file, directory, or symlink existed in the same tree.
- Correction: scan every tree entry with `lstat`; refuse an ownership action
  when an unowned entry or symlink exists; revalidate every existing ancestor
  before installing or renaming a plugin directory.
- Regression proof: `scripts/tests/wcbs-cli.test.mjs` covers unowned entries,
  live ancestor symlinks, and dangling ancestor symlinks.
- Reuse trigger: any installer, uninstaller, migration, or cleanup routine
  that performs recursive deletion must prove the entire target tree is owned,
  not merely a selected list of files.
