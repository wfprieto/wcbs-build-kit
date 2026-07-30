#!/usr/bin/env python3
"""Build an exact APIVR review package from a recorded base..head commit range.

Canonical contract: skills/subagent-driven-development/SKILL.md

This helper does NOT accept a hand-supplied diff. It generates the diff itself from
the repository so the reviewer sees the complete task change and nothing else.

Fail-closed rules:
  * base and head resolve to full 40-character SHAs;
  * identical base and head are rejected;
  * base must be an ancestor of head;
  * shortcut refs such as HEAD~1 are rejected, because they silently drop earlier
    commits in a multi-commit task;
  * a dirty worktree is rejected unless --include-working-tree is given, and that
    mode records the uncommitted patch separately from the committed one;
  * artifact hashes are written so a reviewer can detect later mutation.

Standard library only. No third-party dependencies.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

SHORTCUT_TOKENS = ("~", "^", "@{")


def die(message: str):
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(2)


def git(repo: Path, *args: str, allow_fail: bool = False, env: dict | None = None) -> str:
    """Run git. `env` overlays the parent environment (used for GIT_INDEX_FILE)."""
    child_env = None
    if env:
        child_env = os.environ.copy()
        child_env.update(env)
    result = subprocess.run(["git", *args], cwd=repo, capture_output=True, text=True, encoding="utf-8", env=child_env)
    if result.returncode != 0 and not allow_fail:
        die(f"git {' '.join(args)} failed: {result.stderr.strip()}")
    return result.stdout


def read_required(path_str: str, label: str) -> str:
    target = Path(path_str)
    if not target.exists():
        die(f"missing required {label}: {target}")
    return target.read_text(encoding="utf-8")


def read_optional(path_str):
    if not path_str:
        return ""
    target = Path(path_str)
    if not target.exists():
        die(f"missing input file: {target}")
    return target.read_text(encoding="utf-8")


def sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def resolve(repo: Path, ref: str, label: str) -> str:
    if any(token in ref for token in SHORTCUT_TOKENS):
        die(f"{label} uses a shortcut ref ({ref}). Shortcut refs such as HEAD~1 are prohibited: they silently omit earlier commits in a multi-commit task. Record and pass the exact commit SHA captured before dispatch.")
    out = git(repo, "rev-parse", "--verify", f"{ref}^{{commit}}", allow_fail=True).strip()
    if not out:
        die(f"{label} does not resolve to a commit: {ref}")
    return out


def worktree_is_dirty(repo: Path) -> bool:
    return any(git(repo, "status", "--porcelain=v1", "-z").split("\0"))


def main() -> int:
    parser = argparse.ArgumentParser(description="Build an exact base..head APIVR review package.")
    parser.add_argument("--repo", required=True, help="Path to the git repository")
    parser.add_argument("--task-brief", required=True, help="Path to the durable task brief")
    parser.add_argument("--base", required=True, help="Exact task base commit SHA")
    parser.add_argument("--head", required=True, help="Exact task head commit SHA or ref")
    parser.add_argument("--implementer-report", required=True, help="Path to the implementer report")
    parser.add_argument("--evidence", help="Path to an evidence ledger excerpt")
    parser.add_argument("--concerns", help="Path to unresolved implementer concerns")
    parser.add_argument("--global-constraints", help="Binding constraints; copied verbatim into the package")
    parser.add_argument("--output-dir", required=True, help="Directory to write the package into")
    parser.add_argument("--include-working-tree", action="store_true", help="Explicitly allow a dirty worktree and record the uncommitted patch separately")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    if not (repo / ".git").exists():
        die(f"not a git repository: {repo}")
    task_brief = read_required(args.task_brief, "task brief")
    implementer_report = read_required(args.implementer_report, "implementer report")
    evidence = read_optional(args.evidence)
    concerns = read_optional(args.concerns)
    constraints = read_optional(args.global_constraints)
    base_sha = resolve(repo, args.base, "--base")
    head_sha = resolve(repo, args.head, "--head")
    if base_sha == head_sha:
        die("base and head are identical. An empty range cannot be reviewed. Capture the task base commit BEFORE dispatch.")
    ancestor = subprocess.run(["git", "merge-base", "--is-ancestor", base_sha, head_sha], cwd=repo, capture_output=True, text=True, encoding="utf-8")
    if ancestor.returncode != 0:
        die(f"base {base_sha[:12]} is not an ancestor of head {head_sha[:12]}. The review range is ambiguous; re-resolve the task base commit.")
    dirty = worktree_is_dirty(repo)
    if dirty and not args.include_working_tree:
        die("the worktree is dirty. A review package must describe an exact committed range. Commit the work, or pass --include-working-tree to record the uncommitted patch separately as a declared exception.")
    out = Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)
    diff = git(repo, "diff", "--patch", f"{base_sha}..{head_sha}")
    stat = git(repo, "diff", "--stat", f"{base_sha}..{head_sha}").strip()
    files = [f for f in git(repo, "diff", "--name-only", f"{base_sha}..{head_sha}").splitlines() if f]
    commits = [c for c in git(repo, "log", "--oneline", f"{base_sha}..{head_sha}").splitlines() if c]
    artifacts = {}
    (out / "diff.patch").write_text(diff, encoding="utf-8")
    artifacts["diff.patch"] = sha256(diff)
    working_tree_patch = ""
    untracked_files: list[str] = []
    if dirty and args.include_working_tree:
        untracked_files = [record for record in git(repo, "ls-files", "--others", "--exclude-standard", "-z").split("\0") if record]
        with tempfile.TemporaryDirectory() as scratch:
            temp_index = Path(scratch) / "index"
            env = {"GIT_INDEX_FILE": str(temp_index)}
            git(repo, "read-tree", "HEAD", env=env)
            for entry in untracked_files:
                result = subprocess.run(["git", "add", "--intent-to-add", "--", entry], cwd=repo, capture_output=True, text=True, encoding="utf-8", env={**os.environ, **env})
                if result.returncode != 0:
                    die(f"could not stage untracked path {entry!r} for review: {result.stderr.strip()}. Refusing to emit a review package that silently omits uncommitted evidence.")
            working_tree_patch = git(repo, "diff", "HEAD", env=env)
        if untracked_files and not working_tree_patch.strip():
            die("untracked files were detected but produced no patch. Refusing to emit a review package that claims to include uncommitted work while containing none.")
        (out / "working-tree.patch").write_text(working_tree_patch, encoding="utf-8")
        artifacts["working-tree.patch"] = sha256(working_tree_patch)
    changed = {"base_sha":base_sha,"head_sha":head_sha,"files":files,"file_count":len(files),"commits":commits,"commit_count":len(commits),"diffstat":stat}
    changed_text = json.dumps(changed, indent=2) + "\n"
    (out / "changed-files.json").write_text(changed_text, encoding="utf-8")
    artifacts["changed-files.json"] = sha256(changed_text)
    artifacts["task-brief"] = sha256(task_brief)
    artifacts["implementer-report"] = sha256(implementer_report)
    if constraints:
        artifacts["global-constraints"] = sha256(constraints)
    sections = [
        "# APIVR Review Package","","You are reviewing an exact committed range. The diff below is the complete task change.","","| Field | Value |","|---|---|",f"| Base SHA | `{base_sha}` |",f"| Head SHA | `{head_sha}` |",f"| Commits in range | {len(commits)} |",f"| Files changed | {len(files)} |",f"| Uncommitted changes included | {'yes (see working-tree.patch)' if working_tree_patch else 'no'} |",f"| Untracked files in that patch | {', '.join(untracked_files) if untracked_files else 'none'} |",f"| Generated | {datetime.now(timezone.utc).isoformat()} |","","## Reviewer Rules","","- Review the diff first, not the implementer's narrative.","- Stay inside the task brief scope plus the binding constraints below.","- Give file-and-line evidence for every finding.","- Use `CANNOT_VERIFY_FROM_DIFF` when the package cannot establish a required fact.","  Do not guess, and do not let uncertainty silently become a pass.","","## Binding Global Constraints (verbatim)","",constraints.strip() or "_No global constraints supplied._","","## Task Brief (verbatim)","",task_brief.strip(),"","## Commits In Range","","```text","\n".join(commits) or "(none)","```","","## Diffstat","","```text",stat or "(empty)","```","","## Implementer Report","",implementer_report.strip(),"","## Evidence","",evidence.strip() or "_No evidence excerpt supplied._","","## Unresolved Implementer Concerns","",concerns.strip() or "_None declared._","","## Artifacts","","| Artifact | SHA-256 |","|---|---|",*[f"| `{name}` | `{digest}` |" for name,digest in sorted(artifacts.items())],"","## Required Review Output","","Findings (ID, severity, file:line, evidence), Evidence State, Required Fixes, Verdict.",""]
    (out / "review-package.md").write_text("\n".join(sections), encoding="utf-8")
    meta = {"base_sha":base_sha,"head_sha":head_sha,"commit_count":len(commits),"files":files,"include_working_tree":bool(working_tree_patch),"untracked_files":untracked_files,"generated_utc":datetime.now(timezone.utc).isoformat(),"artifact_hashes":artifacts}
    (out / "review-package.json").write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")
    print(f"Review package written to {out}")
    print(f"Range {base_sha[:12]}..{head_sha[:12]}  commits={len(commits)}  files={len(files)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
