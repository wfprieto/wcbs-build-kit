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
```
