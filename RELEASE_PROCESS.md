# Release Process

Use APIVR before every release.

`npm run release-check` is the authoritative local release verification command.
Its component commands are defined in `package.json`; individual checks are
available for diagnosis and do not replace the complete gate.

## Release Steps

1. Confirm scope and version. Commit the intended release candidate, excluding local-only files.
2. From the repository root with a clean working tree, run:

   ```bash
   npm run release-check
   ```

   Record the candidate commit and complete command output. Release artifacts
   are built from committed Git content, so uncommitted source changes would
   make the checked files and packaged files differ.

3. Review:
   - `CHANGELOG.md`
   - `VERSIONING.md`
   - `60_templates/RELEASE_READINESS_DASHBOARD_TEMPLATE.md`
4. Confirm all required GitHub Actions pass for that candidate, including cross-platform verification and extracted-artifact transport checks. A local pass does not replace hosted checks.
5. Confirm `HEAD` is still the recorded candidate before tagging. If the revision or tracked files changed, repeat verification. Tag the verified candidate:

   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

6. Confirm the tag-triggered `Release Check` workflow passes before publishing the release. Use artifacts from that verified tag.
7. Create GitHub release notes with:
   - APIVR tier;
   - evidence;
   - verification performed;
   - known limitations;
   - upgrade notes.
8. Attach generated artifacts from `dist/release-artifacts/`:
   - `super-build-kit-X.Y.Z.zip`
   - `SHA256SUMS.txt`
   - `RELEASE_ARTIFACT_MANIFEST.json`

## Release Blockers

- Any failed, incomplete, or unrun required local or hosted release check.
- Missing release artifact checksum.
- Unknown core security evidence.
- Release artifacts missing from `dist/release-artifacts/` or not generated from the verified tag.
- Active docs pointing at missing active files.
