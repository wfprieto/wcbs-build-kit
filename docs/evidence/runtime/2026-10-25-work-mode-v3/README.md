# Work Mode runtime evidence attempt, 2026-10-25

**Verdict: PARTIAL. Authenticated runtime evidence: Blocked.**

This records the host actually used: ChatGPT Work Mode with cloud execution.
It is not a fresh Codex CLI session. The exact Work host build is unavailable;
Node `v24.22.1` and Python `3.12.14` identify executors, not the agent runtime.
The selected WCBS adapter is `codex`; this record does not add a Work adapter
or establish compatibility between these runtime surfaces.

## Exact package under test

- Version: `3.0.0`, current v3 source, not a published v3 release.
- Commit: `48cdbf25a1756704655d8dc9b80311b525ad56cc`.
- Source tree: `97f0b58571d62a6ab2c009b733872813e99266f3`.
- Installation route: project-local V1, with 233 owned files.
- Source, installed receipt, sentinel, and evidence hashes: `manifest.json`.

The evidence commit that adds this record is separate from the source commit
tested above. Historical v2 marketplace receipts are not inputs to this result.

## Observed results

| Step | State | What the result proves or leaves blocked |
|---|---|---|
| Exact agent runtime version | Blocked | Work build identity is not exposed. `codex --version` could not start; the CLI is absent from PATH and no `WCBS_CODEX_BIN` override is present. |
| Clean package installation | Verified | An ordinary new project with README, package file, and source file received the exact V1 package. All user sentinel hashes were preserved. This is not a clean runtime profile. |
| Package doctor and ownership | Verified | The installed package passed reference and owned-file validation. |
| Installed renderer execution | Verified | Executable smoke passed its SessionStart JSON, exact activation marker, installed paths, and canonical router checks. No model or fresh session was involved. |
| Native registration and hook trust | Blocked | The current tools expose no native WCBS registration/trust interface. Plugin search for `WCBS` returned no matches; that search is not exhaustive. V1 file placement does not register a native plugin. |
| Clean authenticated activation | Blocked | No fresh authenticated runtime profile or native startup trace is available. This conversation already contains WCBS instructions and cannot be used as clean-session evidence. |
| Representative skill invocation | Blocked | No fresh-session native skill-load trace is available. Manual file reads and a text-only claim that a skill loaded do not satisfy this step. |
| Owned-file uninstall | Verified | All 233 owned files and the receipt were removed; original user files and an outside sentinel were preserved. **86 directory paths remained without WCBS files**, so complete directory cleanup is not verified. |
| Controlled package rollback | Verified | An injected uninstall failure restored the exact installed package snapshot, then doctor and smoke passed. An injected partial-install failure restored the complete original project snapshot. |
| Native uninstall and runtime rollback | Blocked | No native registration or prior authenticated runtime baseline exists in this environment. Local file rollback is separate evidence. |
| Three fresh-profile runs | Blocked | Profiles 1, 2, and 3 have no authenticated transcripts. Runtime support remains unchanged. |

Official OpenAI documentation distinguishes plugin installation from hook trust
and states that plugin hooks are unsupported in cloud-orchestrated Work.
Those documented limits are separate from this host's observed lack of a CLI
or a native registration interface. Sources checked on 2026-10-25:

- [Plugins](https://learn.chatgpt.com/docs/plugins).
- [Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference).

## Evidence and limits

`manifest.json` contains the required Codex proof-pack identity, command,
expected/actual result, timestamp, reviewer, evidence reference, and state
fields. Its actual host ID is `chatgpt-work-mode`; `target_adapter_id` and
`proof_pack_runtime_id` identify the selected `codex` adapter without equating
the two environments.

`package-checks.json` retains every command's exact arguments, test-only
environment overrides, exit code, full stdout/stderr, and assertions. Only
declared synthetic source, fixture, executor, and disposable paths are
normalized; output is not truncated. Pre-redaction output hashes are observation
identifiers, not independently verifiable receipts for retained raw files.
Replay timestamps, temporary paths, and the installed receipt hash can differ.

`initial-capture-limit.log` preserves the first capture driver's failed
assumption that uninstall removes empty directories. That attempt was not
reported as a pass. The final capture records the directory residue explicitly.
Temporary test projects were removed after observation. No account settings,
credentials, user runtime profiles, or support labels were changed.

## Replay the available package evidence

Use a separate checkout of the exact commit above. Do not reset an existing
working project. Node and Python versions and the source file hashes should be
recorded before replay. The selected existing regression cases reproduce the
successful lifecycle and both controlled rollback paths:

```bash
node --test --test-name-pattern='codex adapter installs, verifies, updates, and uninstalls transactionally|uninstall rollback restores all files after a controlled removal failure|controlled commit failure rolls back every created artifact' scripts/tests/installer.test.mjs
```

For the explicit CLI lifecycle, create a new temporary ordinary project with
`README.md`, `package.json`, and `src/index.js`. Record SHA-256 hashes of those
three files and an outside sentinel. Substitute that project for `<project>`
and retain complete output and exit codes for each command:

```bash
node scripts/install-adapter.mjs --target codex --dest <project> --install --json
node scripts/install-adapter.mjs --target codex --dest <project> --doctor --json
node scripts/install-adapter.mjs --target codex --dest <project> --verify-owned-files --json
node scripts/adapter-smoke-test.mjs --target codex --dest <project>
node scripts/install-adapter.mjs --target codex --dest <project> --uninstall --json
```

Require exit 0, preserved user hashes, removal of every receipt-owned file,
and removal of the receipt. Inventory remaining directories rather than
assuming there are none. The controlled-failure commands and expected exit 1
are preserved in `package-checks.json`; the existing tests above exercise them
without changing global settings. A passing test proves these package paths,
not native registration or authenticated runtime behavior.

## Unblock authenticated evidence

1. Use an actual supported, versioned Codex runtime with its native plugin and
   trust interface. Record the runtime/CLI version and the exact package source
   identity; keep its evidence separate from this Work attempt.
2. Follow `docs/V2_RUNTIME_EVIDENCE.md` and the `codex` pack in
   `runtime_adapters/RUNTIME_PROOF_PACKS.json`. For native marketplace
   registration, use the documented V2 dedicated bundle route. The default V1
   installation does not supply a marketplace root; do not invent a V1
   marketplace command. `npm run codex:marketplace-check` is the existing
   disposable native lifecycle probe; its attempt here ended `Blocked: ENOENT`.
3. In three separate new authenticated profiles, retain registration and hook
   trust results, raw startup traces, and the first text-bearing assistant
   response. Use the neutral prompt from the evidence procedure without naming
   WCBS or pasting its instructions. Require the exact first-line marker,
   canonical router/startup evidence, and actual native tool events loading
   each selected task skill. A marker observation alone is insufficient.
4. Request a small plan-only change and preserve the native skill-load events
   and plan. Record model identity if the runtime exposes it; otherwise mark
   that measurement unavailable.
5. Record native uninstall and a new-session removal check. Restore a specified
   prior accepted package and native registration, then repeat activation and
   invocation. Without an authenticated prior baseline, runtime rollback stays
   Blocked even if file restoration passes.
6. Have an independent reviewer inspect and replay the retained evidence before
   advancing support. Do not copy authentication material into the repository.

The next required action is an authenticated replay on a supported native
runtime. This record does not supply that evidence or advance a support tier.
