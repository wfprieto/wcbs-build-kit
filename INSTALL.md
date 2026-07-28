# Install Super Build Kit

Repository slug: `wfprieto/wcbs-build-kit`.

System name: Super Build Kit.

## First Check

After downloading or cloning the repository, run:

```bash
npm run verify
```

On Windows PowerShell, if script execution blocks `npm`, run:

```powershell
npm.cmd run verify
```

## Agent Runtime Setup

## V2 Native Plugin Install (Default)

Choose the runtime identity and that runtime's dedicated plugin directory. The
directory is explicit because WCBS will not infer a user project or modify one
to simulate plugin installation.

```bash
npm run wcbs -- status --json
npm run wcbs -- install --target <runtime> --plugin-dir <runtime-plugin-directory> --json
npm run wcbs -- doctor --plugin-dir <runtime-plugin-directory> --json
```

For Codex CLI, add the installed plugin's marketplace root and install the
listed plugin through Codex itself. Start a new session after installation:

```bash
codex plugin marketplace add <runtime-plugin-directory>
codex plugin add wcbs-build-kit@wcbs-build-kit
```

If Codex CLI is installed, replay the isolated native marketplace lifecycle
(this checks package installation, not model activation):

```bash
npm run codex:marketplace-check
```

The V2 bundle contains only WCBS-owned package files beneath the selected
plugin directory. `doctor` validates hashes and generated metadata. It reports
runtime activation as `Not Run` until the clean-session procedure in
`docs/V2_RUNTIME_EVIDENCE.md` has been executed and independently replayed.

To remove V2, use the same explicit directory:

```bash
npm run wcbs -- uninstall --plugin-dir <runtime-plugin-directory> --json
```

Uninstall refuses modified owned files; it never deletes a plugin directory
without a valid V2 ownership manifest.

## V1 Project-Local Compatibility Route

The following project-local commands are retained only for existing V1
installations and safe migration. They vendor WCBS files into the destination,
so they are not the default V2 path.

Use the adapter file for your runtime:

| Runtime | Read First |
|---|---|
| Codex / generic OpenAI agents | `AGENTS.md` |
| Claude / Claude Code | `CLAUDE.md` |
| Cursor | `.cursor/rules/super-build-kit.mdc` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Gemini | `GEMINI.md` |
| Replit Agent | `REPLIT.md` and `runtime_adapters/REPLIT_AGENT.md` |
| Manus | `Manus.md` |
| Generic LLM agent | `00_start_here/START_HERE.md` |

## Activation Test

Canonical activation tests live in `runtime_adapters/ACTIVATION_TESTS.md`.

Ask the agent:

```text
Read the Super Build Kit startup files and report the APIVR tier, applicable skills, evidence requirements, and final stop conditions for a Standard feature plan.
```

Activation passes only when the agent names:

- `00_start_here/START_HERE.md`;
- `00_start_here/SOURCE_OF_TRUTH.md`;
- `00_start_here/LOAD_ORDER.md`;
- `50_audits/AUDIT_TIER_ROUTER.md`;
- APIVR;
- Elite Build Goals;
- evidence states.

## Local Health Commands

```bash
npm run verify
npm run system-test
node scripts/check-install.mjs
node scripts/install-adapter.mjs --target codex --dry-run
node scripts/install-adapter.mjs --list-targets
```

## Project-Local Adapter Install (V1 compatibility)

Resolve runtime and destination before using an installation command:

```bash
node scripts/resolve-install-context.mjs --target codex --dest ../my-project
```

If the destination is not resolved, omit `--dest` and pass any plausible project roots with repeated `--candidate <path>` arguments. The resolver asks one bounded destination question and returns `Blocked` without writing files.

The installer is safe by default. `--dry-run` prints the planned file set. Real install, update, uninstall, and doctor modes require an explicit destination. The installer rejects the Build Kit source as its own destination.

```bash
node scripts/install-adapter.mjs --target codex --dest ../my-project --install
node scripts/install-adapter.mjs --target codex --dest ../my-project --doctor
node scripts/install-adapter.mjs --target codex --dest ../my-project --verify-owned-files
node scripts/install-adapter.mjs --target codex --dest ../my-project --repair
node scripts/adapter-smoke-test.mjs --target codex --dest ../my-project
node scripts/install-adapter.mjs --target codex --dest ../my-project --uninstall
```

Supported target names:

- `codex`
- `claude`
- `cursor`
- `github-copilot`
- `gemini`
- `replit`
- `manus`
- `generic-agent`

The installer records owned files in `.wcbs/adapter-install-manifest.json`. Uninstall refuses to run without that manifest so it cannot remove unowned project files.
