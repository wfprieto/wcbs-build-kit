# Release Notes

## 3.0.0 (unreleased)

The current source reserves rights in owner material under `LICENSE`. Its
package and plugin manifests use `UNLICENSED`. The tagged v2.0.0 release
remains MIT-licensed. This source state has not been published as a release;
installation checks for v2.0.0 do not establish v3.0.0 runtime behavior.

## Current Installation Guidance

Project-local V1 installation remains the default until a target-specific V2
registration path has independent clean-session proof. V2 `doctor` verifies
package integrity, not runtime activation. See `GET_STARTED.md` and
`docs/V2_RUNTIME_EVIDENCE.md` before changing routes.

## 2.0.0

WCBS 2.0.0 adds an explicit native plugin bundle alongside the current
project-local default. It includes a generated adapter and skill registry,
compact startup payload, executable core skills, native package contracts,
hash-backed V1 ownership, safe install/doctor/status/uninstall/migration
commands, a web application security audit, and a pre-registered blinded
behavioral-evaluation design. V2 package integrity is not evidence of native
runtime registration or activation.

Known limitations: package and deterministic adapter checks are complete, but
real clean-session proof and paid blinded behavioral runs are still required
before any adapter is labelled Runtime Verified or WCBS is claimed to match or
exceed another system operationally.

## 1.2.0

Super Build Kit 1.2.0 hardens the repository into a software-ready system:

- APIVR and Elite Build Goals remain the permanent authority.
- `npm run release-check` verifies doctor, capability matrix, version drift, behavior fixtures, Node tests, Python tests, system test, install/smoke tests, and release artifact generation.
- Runtime adapters now have verified support levels separate from designed support.
- The adapter installer supports project-local install, update, uninstall, doctor, owned-file verification, repair, dry-run, JSON output, and target listing.
- Release artifacts include a zip, manifest, and SHA256 checksums.

Known limitation: runtime adapters are behaviorally verified through isolated fixtures, not yet marketplace or clean-session runtime verified.
