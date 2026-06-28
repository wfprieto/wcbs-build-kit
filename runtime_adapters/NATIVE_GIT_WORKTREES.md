# Native Git Worktree Integration

This adapter is based on the Superpowers detect-and-defer model and is governed by APIVR and the Elite Build Goals.

## Purpose

Use isolated workspaces for feature work, risky implementation, plan execution, and multi-step changes without polluting the user's current branch.

## Load Order

When worktree isolation is relevant, load:

1. `skills/using-git-worktrees/SKILL.md`
2. `00_start_here/SOURCE_OF_TRUTH.md`
3. `50_audits/AUDIT_TIER_ROUTER.md`
4. `60_templates/IMPLEMENTATION_BLUEPRINT_TEMPLATE.md`

## Native-First Rule

Prefer platform-native isolation tools over manual `git worktree add`.

Examples:

- Claude Code: `EnterWorktree`
- Codex App: Codex-managed worktree environments
- Cursor: `/worktree` or Cursor worktree mode
- Gemini: launch-time `--worktree` mode
- Replit: branch/fork/workspace isolation where available

Manual git worktrees are fallback only.

## Detection Rule

Use Git primitives rather than platform guessing:

- `git rev-parse --git-dir`
- `git rev-parse --git-common-dir`
- `git rev-parse --show-superproject-working-tree`
- `git branch --show-current`

If `git-dir` and `git-common-dir` differ and the repo is not a submodule, treat the workspace as already isolated.

## Ownership Rule

- Native-created worktrees are owned by the harness.
- Manual fallback worktrees under `.worktrees/` or `worktrees/` are owned by this kit.
- Other paths are externally managed unless the user explicitly says otherwise.

## Finish Rule

For PR flow, keep the worktree. For local merge/discard, clean up only owned worktrees and only after evidence-based verification.

