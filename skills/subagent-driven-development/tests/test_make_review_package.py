"""Tests for the exact base..head review-package helper.

Standard library only. Run: python3 -m unittest discover -s skills/subagent-driven-development/tests
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
HELPER = REPO_ROOT / "skills" / "subagent-driven-development" / "scripts" / "make-review-package.py"


def git(repo: Path, *args: str) -> str:
    result = subprocess.run(["git", *args], cwd=repo, capture_output=True, text=True, check=True)
    return result.stdout.strip()


def commit(repo: Path, name: str, body: str) -> str:
    (repo / name).write_text(body, encoding="utf-8")
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", f"add {name}")
    return git(repo, "rev-parse", "HEAD")


class HelperCase(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.tmp = Path(self._tmp.name)
        self.repo = self.tmp / "repo"
        self.repo.mkdir()
        git(self.repo, "init", "-q", "-b", "main")
        git(self.repo, "config", "user.email", "t@example.com")
        git(self.repo, "config", "user.name", "T")
        self.base = commit(self.repo, "seed.txt", "seed\n")
        self.brief = self.tmp / "task-brief.md"
        self.brief.write_text("# Task Brief\n\nObjective: demo\n", encoding="utf-8")
        self.report = self.tmp / "implementer-report.md"
        self.report.write_text("# Implementer Report\n\nstatus: DONE\n", encoding="utf-8")
        self.outdir = self.tmp / "out"

    def tearDown(self) -> None:
        self._tmp.cleanup()

    def run_helper(self, *extra: str, base: str | None = None, head: str = "HEAD"):
        args = [sys.executable,str(HELPER),"--repo",str(self.repo),"--task-brief",str(self.brief),"--base",base or self.base,"--head",head,"--implementer-report",str(self.report),"--output-dir",str(self.outdir),*extra]
        return subprocess.run(args, capture_output=True, text=True)

    def test_multi_commit_task_includes_all_task_commits(self):
        commit(self.repo,"a.txt","a\n"); commit(self.repo,"b.txt","b\n")
        proc=self.run_helper(); self.assertEqual(proc.returncode,0,proc.stderr)
        diff=(self.outdir/"diff.patch").read_text(encoding="utf-8")
        self.assertIn("a.txt",diff); self.assertIn("b.txt",diff)
        changed=json.loads((self.outdir/"changed-files.json").read_text(encoding="utf-8"))
        self.assertEqual(sorted(changed["files"]),["a.txt","b.txt"])

    def test_identical_base_and_head_fails(self):
        proc=self.run_helper(head=self.base); self.assertNotEqual(proc.returncode,0); self.assertIn("identical",(proc.stderr+proc.stdout).lower())

    def test_non_ancestor_base_fails(self):
        commit(self.repo,"a.txt","a\n"); git(self.repo,"checkout","-q","-b","side",self.base); orphan=commit(self.repo,"side.txt","side\n"); git(self.repo,"checkout","-q","main")
        proc=self.run_helper(base=orphan); self.assertNotEqual(proc.returncode,0); self.assertIn("ancestor",(proc.stderr+proc.stdout).lower())

    def test_dirty_worktree_fails_by_default(self):
        commit(self.repo,"a.txt","a\n"); (self.repo/"dirty.txt").write_text("dirty\n",encoding="utf-8")
        proc=self.run_helper(); self.assertNotEqual(proc.returncode,0); self.assertIn("dirty",(proc.stderr+proc.stdout).lower())

    def test_working_tree_mode_separates_committed_and_uncommitted(self):
        commit(self.repo,"a.txt","a\n"); (self.repo/"a.txt").write_text("a changed\n",encoding="utf-8")
        proc=self.run_helper("--include-working-tree"); self.assertEqual(proc.returncode,0,proc.stderr)
        self.assertTrue((self.outdir/"diff.patch").exists()); wt=self.outdir/"working-tree.patch"; self.assertTrue(wt.exists()); self.assertIn("a changed",wt.read_text(encoding="utf-8"))

    def test_missing_task_brief_fails(self):
        self.brief.unlink(); commit(self.repo,"a.txt","a\n"); self.assertNotEqual(self.run_helper().returncode,0)

    def test_artifact_hashes_are_written(self):
        commit(self.repo,"a.txt","a\n"); proc=self.run_helper(); self.assertEqual(proc.returncode,0,proc.stderr)
        meta=json.loads((self.outdir/"review-package.json").read_text(encoding="utf-8")); self.assertIn("diff.patch",meta["artifact_hashes"]); self.assertEqual(len(meta["artifact_hashes"]["diff.patch"]),64); self.assertEqual(len(meta["base_sha"]),40); self.assertEqual(len(meta["head_sha"]),40)

    def test_shortcut_ref_is_rejected(self):
        commit(self.repo,"a.txt","a\n"); proc=self.run_helper(base="HEAD~1"); self.assertNotEqual(proc.returncode,0); self.assertIn("shortcut",(proc.stderr+proc.stdout).lower())

    def test_hand_supplied_diff_interface_is_gone(self):
        source=HELPER.read_text(encoding="utf-8"); self.assertNotIn('"--diff"',source); self.assertIn("--include-working-tree",source)

    def test_review_package_embeds_brief_and_constraints_verbatim(self):
        commit(self.repo,"a.txt","a\n"); constraints=self.tmp/"constraints.md"; constraints.write_text("MUST NOT weaken tests.\n",encoding="utf-8")
        proc=self.run_helper("--global-constraints",str(constraints)); self.assertEqual(proc.returncode,0,proc.stderr)
        pkg=(self.outdir/"review-package.md").read_text(encoding="utf-8"); self.assertIn("Objective: demo",pkg); self.assertIn("MUST NOT weaken tests.",pkg)

    def test_untracked_file_is_not_silently_dropped(self):
        commit(self.repo,"a.txt","a\n"); (self.repo/"brand_new.txt").write_text("untracked content\n",encoding="utf-8")
        proc=self.run_helper("--include-working-tree"); self.assertEqual(proc.returncode,0,proc.stderr)
        meta=json.loads((self.outdir/"review-package.json").read_text(encoding="utf-8")); self.assertTrue(meta["include_working_tree"])
        wt=(self.outdir/"working-tree.patch").read_text(encoding="utf-8"); self.assertIn("brand_new.txt",wt); self.assertIn("untracked content",wt); self.assertIn("brand_new.txt",meta.get("untracked_files",[]))

    def test_untracked_file_alone_still_counts_as_dirty(self):
        commit(self.repo,"a.txt","a\n"); (self.repo/"only_untracked.txt").write_text("x\n",encoding="utf-8")
        proc=self.run_helper(); self.assertNotEqual(proc.returncode,0); self.assertIn("dirty",(proc.stderr+proc.stdout).lower())

    def test_helper_does_not_mutate_the_repository_index(self):
        commit(self.repo,"a.txt","a\n"); (self.repo/"brand_new.txt").write_text("untracked\n",encoding="utf-8")
        before=git(self.repo,"status","--porcelain"); proc=self.run_helper("--include-working-tree"); self.assertEqual(proc.returncode,0,proc.stderr); after=git(self.repo,"status","--porcelain"); self.assertEqual(before,after); self.assertIn("brand_new.txt",(self.outdir/"working-tree.patch").read_text(encoding="utf-8"))

    def test_untracked_paths_with_awkward_names_are_captured(self):
        commit(self.repo,"a.txt","a\n"); awkward=["my file.txt","café.txt","quote'name.txt"," leading.txt","trailing.txt "]
        for name in awkward: (self.repo/name).write_text("content\n",encoding="utf-8")
        proc=self.run_helper("--include-working-tree"); self.assertEqual(proc.returncode,0,proc.stderr)
        meta=json.loads((self.outdir/"review-package.json").read_text(encoding="utf-8"));
        expected = [name for name in awkward if not (os.name == "nt" and name.endswith(" "))]
        for name in expected: self.assertIn(name,meta["untracked_files"])

    def test_untracked_path_with_unicode_content_is_in_the_patch(self):
        commit(self.repo,"a.txt","a\n"); (self.repo/"café menu.txt").write_text("espresso\n",encoding="utf-8")
        proc=self.run_helper("--include-working-tree"); self.assertEqual(proc.returncode,0,proc.stderr); self.assertIn("espresso",(self.outdir/"working-tree.patch").read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
