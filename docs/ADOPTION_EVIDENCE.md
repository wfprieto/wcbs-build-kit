# Adoption Evidence

This is the public claim ledger, not a count of assumed users. Evidence checked
2026-10-18. See `SUPPORT_MATRIX.md` for support status and
`runtime_adapters/VERIFIED_SUPPORT_LEVELS.md` for the separate runtime bar.

| Claim | Evidence and source | Evidence state | Limit |
|---|---|---|---|
| Release download exists | [v2.0.0 release](https://github.com/wfprieto/wcbs-build-kit/releases/tag/v2.0.0) has `super-build-kit-2.0.0.zip`, `SHA256SUMS.txt`, and `RELEASE_ARTIFACT_MANIFEST.json`. GitHub reported ZIP digest `sha256:98f6765345ec47b10ae9ff07b3065cc8347681ab1a9f8d2238114bf65503bc37`. | Verified | GitHub asset metadata was observed; this check did not re-hash a downloaded ZIP. Asset download counters were zero at the check, not independent adoption. |
| Codex self-hosted GitHub marketplace | In an isolated `CODEX_HOME`, Codex CLI `0.163.0-alpha.10.2` accepted `codex plugin marketplace add wfprieto/wcbs-build-kit --ref v2.0.0`, discovered `wcbs-build-kit@wcbs-build-kit`, and installed it. `codex plugin list --json` reported `installed: true`, `enabled: true`, version `2.0.0`. | Verified | Registration/install at release tag only; no fresh agent-session activation was tested. This is not an OpenAI plugin-directory listing. |
| Claude self-hosted GitHub marketplace | In an isolated `CLAUDE_CONFIG_DIR`, Claude Code `2.1.228` accepted `claude plugin marketplace add wfprieto/wcbs-build-kit` and `claude plugin install wcbs-build-kit@wcbs-build-kit`. `claude plugin list` reported version `2.0.0`, user scope, enabled. | Verified | Registration/install from then-current `main` only; no fresh agent-session activation was tested. This is not an Anthropic directory listing. |
| Official plugin directories | No directory submission approval or public listing receipt is recorded. | Not Run | The repository's self-hosted marketplace manifests do not establish official-directory publication. |
| Independent first-install feedback | [Public first-install feedback template](https://github.com/wfprieto/wcbs-build-kit/issues/new?template=first_install_feedback.md) accepts success, partial success, and failure. No report from an outside user was present in the issue tracker at this check. | Unknown | Maintainer-run installs and repository stars are not independent user feedback. Do not claim adoption from the existence of the template. |
| Runtime activation | See `docs/V2_RUNTIME_EVIDENCE.md` and `runtime_adapters/VERIFIED_SUPPORT_LEVELS.md`. | Not Run | Marketplace install and enabled-state observations do not promote an adapter to Runtime Verified. |

The public repository also has local and GitHub verification workflows and
behavioral adapter fixtures. These are product checks, not evidence that an
outside user installed or used the kit.

## Distribution Decision

Keep npm publication inactive and `package.json` private for v2.0.0. The
published ZIP and self-hosted GitHub marketplaces cover current distribution;
adding an npm package without a distinct user need would create another update
and support surface. `DISTRIBUTION_POLICY.md` owns the revisit criteria.

## Next Evidence Needed

1. An independent user's first-install report with runtime, version, outcome,
   and sanitized reproduction details. Do not count a maintainer test.
2. A replayable clean-session transcript before upgrading runtime support.
3. A public directory listing URL or approval receipt before claiming official
   marketplace publication. Directory submission is a separate decision.
