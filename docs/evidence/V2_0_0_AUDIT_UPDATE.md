# v2.0.0 Audit Evidence Update

Checked 2026-10-18. APIVR tier: Comprehensive. This supplements, but does not
rerun or supersede, `FINAL_20_PASS_AUDIT.md`. Its invalidated historical Pass 14
remains invalidated. Release-check evidence below is not an independent
re-review of that original audit.

## Release and notification reconciliation

| Event | Verified evidence | Boundary |
|---|---|---|
| v2.0.0 release | [PR #26](https://github.com/wfprieto/wcbs-build-kit/pull/26) merged as `4d07eced7fac10a6cadf27fe54e70c91ec282f4a` with doctor, release gate, and Windows/macOS/Ubuntu checks passing. The tag resolves to that commit; [Release Check push run 39082280830](https://github.com/wfprieto/wcbs-build-kit/actions/runs/39082280830) and [Verify push run 39082206693](https://github.com/wfprieto/wcbs-build-kit/actions/runs/39082206693) passed on it. The [v2.0.0 release](https://github.com/wfprieto/wcbs-build-kit/releases/tag/v2.0.0) contains the ZIP, SHA-256 file, and manifest. | Tests and artifact publication do not prove external agent activation. |
| Failed email notices | [Cross Platform run 39090877955](https://github.com/wfprieto/wcbs-build-kit/actions/runs/39090877955) and [Release Check run 39090877951](https://github.com/wfprieto/wcbs-build-kit/actions/runs/39090877951) failed at PR #30 head `4b111513cc651acb401740d3e316837fc263cfe2`: two entry-point assertions still expected blocked non-paid preflight, while the runner reported `Preflight: PASS` and denied paid execution without `CLAUDE_CODE_OAUTH_TOKEN`. | Real historical CI failures, not failures of the v2.0.0 tag or current main. Do not erase them. |
| Correction and current checks | [PR #30](https://github.com/wfprieto/wcbs-build-kit/pull/30) corrected the assertions and merged as `b85e5e12a105cca07afa4926d991d7333b7a282f`, with all five checks passing. [PR #33](https://github.com/wfprieto/wcbs-build-kit/pull/33) likewise passed all five and merged as `9b36eb1a09904db5499aea5d65f167f8f2d376c9`. | These are later source states. They do not rewrite the v2.0.0 tag. |
| Other GitHub notices | Dependabot [PR #24](https://github.com/wfprieto/wcbs-build-kit/pull/24) (`upload-artifact`) and [PR #25](https://github.com/wfprieto/wcbs-build-kit/pull/25) (`setup-node`) were merged. Earlier upstream drift issue #21 was superseded by durable [issue #23](https://github.com/wfprieto/wcbs-build-kit/issues/23); its review is in `docs/upstream/ADOPTION_LEDGER.md`. | A bot notification is neither a release failure nor an upstream adoption decision. |

## Current decision and open gates

- **Package and release checks: CONDITIONAL PASS.** The tagged release and
  later protected-main PRs have completed checks. The corrected installer
  ticket has a full release rerun, but no independent GitHub review is recorded
  on PR #26 or #30. Do not use the historical 20-pass audit as an unconditional
  current release approval.
- **Runtime activation: BLOCKED.** Every adapter remains `Runtime Verified:
  Not Run` in `runtime_adapters/VERIFIED_SUPPORT_LEVELS.md`. An install, fixture,
  hook marker, or enabled plugin is not a clean authenticated session replay.
- **Behavioral evaluation: BLOCKED.** Gate 0C requires 160 retained scheduled
  attempts; the Superpowers comparison requires 240. Neither complete,
  independently scored protocol outcome is recorded in `evals/README.md`.
  No behavioral superiority claim follows from passing CI.

Next release-claim gate: obtain and review the missing clean-session runtime
records and complete the preregistered evaluation before promoting support or
comparative claims. Keep the historical installer review limitation explicit.
