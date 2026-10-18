# Support Matrix

| Area | Status | Notes |
|---|---|---|
| Windows local verification | Supported | Use `npm.cmd run verify` if PowerShell blocks `npm.ps1`. |
| macOS/Linux local verification | Supported | Use `npm run verify`. |
| GitHub Actions verification | Supported | `.github/workflows/verify.yml`. |
| Runtime adapters | Supported | See `runtime_adapters/INSTALLATION_MATRIX.md`. |
| Runtime adapter verified support | In progress | Documented compatibility is not the same as runtime-proven support. See `runtime_adapters/VERIFIED_SUPPORT_LEVELS.md`. |
| GitHub release ZIP | Published | v2.0.0 ZIP, checksums, and manifest; see `docs/ADOPTION_EVIDENCE.md`. |
| Self-hosted GitHub marketplaces | Install verified | Fresh-profile Codex and Claude registration and install passed. Marketplace registration and install do not prove runtime activation. |
| Official plugin directories | Not verified | No directory submission or listing receipt is recorded. GitHub-hosted marketplaces are separate. |
| Independent first-install feedback | Not yet received | Public feedback intake is available; no independent user report is recorded. |
| NPM package publication | Deliberately inactive | `package.json` remains private. See `DISTRIBUTION_POLICY.md` for the decision and revisit criteria. |
| Live security testing | Authorization-gated | See cybersecurity routing and security authorization template. |
| External provider testing | Authorization-gated | See external integration launch gate. |
