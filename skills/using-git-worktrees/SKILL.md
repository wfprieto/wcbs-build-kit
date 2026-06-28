---
name: using-git-worktrees
description: Use before feature implementation, plan execution, or risky edits that should be isolated. Detects existing isolation, prefers native worktree tools, and falls back to manual git worktrees only when no native tool exists.
---

# Using Git Worktrees

Ensure work happens in an isolated workspace when risk, scope, or user preference warrants it.

Core rule: **detect existing isolation first, prefer native tools second, use manual git worktrees only as fallback.**

## APIVR Gate

Before creating or entering a worktree:

1. Classify APIVR tier using `50_audits/AUDIT_TIER_ROUTER.md`.
2. Identify whether isolation is required by risk, user preference, or implementation plan.
3. Do not create a worktree for Rapid work unless it materially reduces risk or the user asks.

## Step 0: Detect Existing Isolation

Run the platform-equivalent of:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
SUBMODULE_ROOT=$(git rev-parse --show-superproject-working-tree 2>/dev/null)
```

Interpretation:

- If `GIT_DIR != GIT_COMMON` and `SUBMODULE_ROOT` is empty, you are already in a linked worktree. Do not create another one.
- If detached, report that the workspace is externally managed and branch creation may be needed before finishing.
- If in a submodule, treat it as a normal checkout for isolation purposes.

## Step 1: Ask Or Honor Preference

If no existing isolation is detected:

- Honor an explicit user or project instruction to use or avoid worktrees.
- If no preference exists and the work is Standard or above, ask before creating one unless the user already requested isolated work.
- For Critical or Forensic work, recommend isolation and explain the risk control.

## Step 2: Prefer Native Worktree Tools

Use native harness/workspace tools before manual git commands. Look for tools or commands such as:

- `EnterWorktree`
- `WorktreeCreate`
- `/worktree`
- `--worktree`
- Codex worktree environments
- Cursor worktree mode
- Gemini launch-time worktree mode
- Replit branch/fork/workspace isolation if available

The user's consent to create an isolated workspace authorizes the native isolation tool.

Never use `git worktree add` when a native tool is available.

## Step 3: Manual Git Worktree Fallback

Use this only when no native tool exists.

Directory priority:

1. explicit user/project preference;
2. existing `.worktrees/`;
3. existing `worktrees/`;
4. default `.worktrees/` at project root.

Before creating a project-local worktree, verify the directory is ignored:

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

If it is not ignored, add it to `.gitignore` and commit that safety change before creating nested worktree contents.

Create fallback worktree:

```bash
git worktree add ".worktrees/<branch-name>" -b "<branch-name>"
cd ".worktrees/<branch-name>"
```

If sandbox or filesystem permissions block creation, report the blocker and work in place only with user approval.

## Step 4: Setup And Baseline

Run project setup and baseline checks appropriate to the project:

- `npm install` / `npm test`
- `cargo build` / `cargo test`
- `pip install -r requirements.txt` / `pytest`
- `go mod download` / `go test ./...`
- project-specific commands from docs or scripts

If baseline checks fail, record them as existing evidence and ask before proceeding.

## Step 5: Finish And Cleanup Ownership

Whoever created the worktree owns cleanup.

- Native harness-created worktrees: use native finish/PR/cleanup flow.
- Manual fallback under `.worktrees/` or `worktrees/`: this kit may remove it after merge or discard.
- Other paths: treat as externally managed unless the user explicitly says otherwise.

For local merge cleanup, use this order:

1. merge;
2. verify tests;
3. remove worktree from outside that worktree;
4. delete branch;
5. run `git worktree prune`.

For PR flow, do not clean up the worktree until PR iteration is complete.

## Red Flags

Never:

- create a nested worktree when already isolated;
- use manual git worktrees when native worktree tooling exists;
- create project-local worktrees without ignore verification;
- delete a branch before removing the worktree that references it;
- clean up a harness-owned worktree manually;
- proceed from failing baseline tests without recording evidence and user approval.

