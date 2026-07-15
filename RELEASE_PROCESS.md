# Release Process

Use APIVR before every release.

## Release Steps

1. Confirm scope and version.
2. Run:

```bash
npm run verify
npm run version:audit
npm run behavior-test
npm run system-test
npm run check-install
npm run build:release-artifacts
```

3. Review:
   - `CHANGELOG.md`
   - `VERSIONING.md`
   - `60_templates/RELEASE_READINESS_DASHBOARD_TEMPLATE.md`
4. Confirm no local-only files are staged.
5. Confirm GitHub Actions pass.
6. Tag release:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

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

- Doctor failure.
- System-test failure.
- Install/smoke-test failure for reference adapters.
- Missing release artifact checksum.
- Unknown core security evidence.
- Untracked generated artifacts intended for release.
- Active docs pointing at missing active files.
