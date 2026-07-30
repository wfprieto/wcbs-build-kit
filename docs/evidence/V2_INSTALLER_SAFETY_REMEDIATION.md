# V2 Installer Safety Remediation

Baseline under review: `f90bcccf454f818649f1f8abe49001405e8541e8`.

## Objective and boundaries

Correct the V2 plugin installer defects found in the post-audit security
review without changing runtime support labels, evaluation outcomes, external
services, or the V1 migration contract. The repaired V2 CLI must refuse an
unowned plugin tree and any existing symlink in a requested plugin-directory
path before it can write or delete there.

APIVR tier: **Comprehensive**. The changed surface can create and remove
files, so file ownership and symlink handling are release-critical.

## Frozen acceptance criteria

| Behavior | Evidence command | Expected result |
|---|---|---|
| Uninstall preserves unowned material | `node --test scripts/tests/wcbs-cli.test.mjs` | An unowned file, directory, or symlink causes `uninstall` to return `BLOCKED`; the plugin tree remains intact. |
| Install rejects ancestor symlinks | `node --test scripts/tests/wcbs-cli.test.mjs` | Both live and dangling ancestor symlinks are rejected before a bundle is created outside the requested path. |
| Ordinary owned-only uninstall remains available | `node --test scripts/tests/wcbs-cli.test.mjs` | Existing install, doctor, status, and owned-only uninstall lifecycle passes. |
| Whitespace evidence is enforceable | `node --test scripts/tests/product-readiness-contract.test.mjs && npm run check:whitespace` | Package and both CI workflows require the Git whitespace gate; the candidate has no whitespace errors since `9cac90d`. |
| Existing release controls remain intact | `npm run verify` and `npm run release-check` | Strict doctor and the complete local release gate pass after the remediation. |

Rollback: revert the commit containing this remediation, then rerun the same
focused tests and `npm run release-check`. No user or runtime data migration is
involved.

## Root cause and repair

1. `scripts/wcbs.mjs` verified only manifest-listed files before uninstall,
   then renamed and recursively deleted the entire plugin directory. It now
   scans the tree with `lstat`, blocks every unowned entry and every symlink,
   and revalidates the requested path before the destructive rename.
2. The original path check inspected only the final directory and its direct
   parent. It now walks every existing path component with `lstat`, so live and
   dangling ancestor symlinks are both rejected before directory creation and
   before the install rename.
3. The earlier audit relied on a manual `git diff --check` statement. The
   repository now provides `scripts/check-whitespace.mjs`, which checks the
   effective candidate against the recorded `9cac90d` baseline. It is required
   by `npm run check` and both release-oriented workflows.

## TDD evidence

- **Red:** the new unowned-tree and ancestor-symlink tests in
  `scripts/tests/wcbs-cli.test.mjs` failed against the baseline behavior:
  uninstall returned success after deleting the user file, and install wrote
  through an ancestor symlink.
- **Green:** the same CLI suite passes with 11 tests, including an owned-only
  uninstall lifecycle, unowned file/directory/symlink refusal, live ancestor
  symlink refusal, and dangling ancestor symlink refusal.
- **Adverse-path check:** the whitespace gate initially failed because it
  inspected historical archived whitespace. It was narrowed to the effective
  candidate since `9cac90d`, so it controls newly introduced whitespace without
  rewriting archive history.

## 20 Pass Protocol

| Pass | Concrete improvement made |
|---:|---|
| 1 | Defined the file-safety outcome as observable refusal, not an installer claim. |
| 2 | Kept the CLI operator’s `BLOCKED` result explicit and actionable. |
| 3 | Excluded runtime labels, external services, and V1 behavior from the change. |
| 4 | Named `scripts/wcbs.mjs` and the two canonical test files as the changed surfaces. |
| 5 | Required an explicit plugin directory and inspected every existing component. |
| 6 | Applied Comprehensive APIVR because uninstall can remove data. |
| 7 | Kept path validation, ownership verification, and tree inspection together in the CLI boundary. |
| 8 | Replaced recursive deletion of a mixed-ownership tree with fail-closed refusal. |
| 9 | Made no external runtime, credential, hosted-CI, or provider change. |
| 10 | Added exact test names and workflow paths to the evidence record. |
| 11 | Added executable regression tests before changing V2 installer production code. |
| 12 | Covered unowned files, directories, live symlinks, dangling symlinks, and modified owned files. |
| 13 | Preserved rollback as a normal Git revert with no data migration. |
| 14 | Required independent security re-review before any merge decision. |
| 15 | Recorded Audit, Plan, Implement, Verify, and Re-Audit evidence for this ticket. |
| 16 | Made the whitespace gate a portable Node script with an explicit Git baseline. |
| 17 | Updated the existing package, doctor, and workflow gates instead of adding a parallel release path. |
| 18 | Made refusal messages identify the unsafe ownership or symlink condition. |
| 19 | Added the dangling-symlink challenge after a skeptical review found `existsSync` insufficient. |
| 20 | Kept the change narrow: one CLI, focused tests, one release gate, and evidence corrections. |

Ticket verdict before the full release rerun: **CONDITIONAL PASS**. The two
installer defects are remediated by focused evidence. Overall release readiness
and WCBS-versus-Superpowers superiority remain separately unproven until their
existing external evidence gates are completed.
