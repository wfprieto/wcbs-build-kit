# Learning Log

## 2026-07-30 — Thin runtime entries require a direct Kernel fail-close route

**Observed:** Centralizing shared runtime policy behind a generated contract initially removed the direct Kernel transfer instruction from primary runtime entry files.

**Root cause:** The canonicalization design treated the generated document as sufficient routing, but the delivery-plane entry must still tell an agent to stop if the generated contract is unavailable.

**Verified prevention:** Every registry-named thin entry now retains the same short Kernel/failure-envelope route. The generated contract carries only higher-order common policy. `runtime-entry-contract.test.mjs`, strict doctor, and the V2 install lifecycle cover the route.

**Do not repeat:** Do not replace a delivery-plane fail-closed instruction with an indirect reference alone.

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
