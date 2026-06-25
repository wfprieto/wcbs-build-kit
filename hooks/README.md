# WCBS Enforcement Hooks

Two Claude Code hooks that turn the kit's rules from "asked" into "enforced".
Both **fail open** (any error → allow), so they can never strand a session.

| Hook | Event | What it does |
|------|-------|--------------|
| `wcbs-completion-lock.cjs` | `Stop` | If the final reply claims *complete / verified / safe / ready* with no evidence label (Verified / Likely / Suspected / Unknown), blocks **once** and asks Claude to cite evidence or downgrade. Loop-guarded via `stop_hook_active`. |
| `wcbs-scrummaster-challenge.cjs` | `PreToolUse` (Write\|Edit\|MultiEdit) | On edits to risky paths (auth / data / migration / payments / webhooks), denies **once** with a 4-point challenge, then allows the retry (per-session-per-file marker). |

## Install
1. Copy both `.cjs` files to `~/.claude/helpers/`.
2. Merge `settings-hooks-snippet.json` into the `hooks` block of `~/.claude/settings.json`
   (append to any existing `Stop` / `PreToolUse` arrays — don't replace them).
   - **Windows:** use the snippet as-is (`cmd /c ...`).
   - **macOS / Linux:** replace each command with `node "$HOME/.claude/helpers/<file>"`.
3. Reload config: run `/hooks` once in Claude Code, or restart.

Requires Node.js on PATH.
