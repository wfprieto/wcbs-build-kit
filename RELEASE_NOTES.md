# Release Notes

## 2.0.0

WCBS 2.0.0 changes the default delivery path from V1 project vendoring to an
explicit native plugin directory. It adds a generated adapter and skill
registry, compact startup payload, executable core skills, native package
contracts, safe install/doctor/status/uninstall/migration commands, and a
pre-registered blinded behavioral-evaluation design.

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
