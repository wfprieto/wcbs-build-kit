# Release Notes

## 1.2.0

Super Build Kit 1.2.0 hardens the repository into a software-ready system:

- APIVR and Elite Build Goals remain the permanent authority.
- `npm run release-check` verifies doctor, capability matrix, version drift, behavior fixtures, Node tests, Python tests, system test, install/smoke tests, and release artifact generation.
- Runtime adapters now have verified support levels separate from designed support.
- The adapter installer supports project-local install, update, uninstall, doctor, owned-file verification, repair, dry-run, JSON output, and target listing.
- Release artifacts include a zip, manifest, and SHA256 checksums.

Known limitation: runtime adapters are behaviorally verified through isolated fixtures, not yet marketplace or clean-session runtime verified.

