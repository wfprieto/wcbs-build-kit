import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validateIntegrationMatrix } from "../lib/upstream-integration.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (relative) => fs.readFileSync(path.join(root, ...relative.split("/")), "utf8");
const readJson = (relative) => JSON.parse(read(relative));
const upstreamCommit = "44c9b2d6e889982ac18c27d05a19fefe335194e1";
const upstreamTree = "dcb98a8f3aa03c8aef4144efda4e2bf9a77c40de";

test("Superpowers compatibility governance pins provenance and a decision ledger", () => {
  const compatibility = read("docs/upstream/SUPERPOWERS_COMPATIBILITY.md");
  const ledger = read("docs/upstream/ADOPTION_LEDGER.md");
  assert.match(compatibility, /obra\/superpowers/);
  assert.match(compatibility, new RegExp(upstreamCommit));
  assert.match(compatibility, /MIT/i);
  assert.match(compatibility, /adopt, adapt, defer, or reject/i);
  assert.match(compatibility, /one durable review issue/i);
  assert.match(ledger, /using-wcbs/);
  assert.match(ledger, new RegExp(upstreamCommit));
  assert.match(ledger, /bb92a77741419a4ab5f06e711a283343f1ada0c3/);
  assert.match(ledger, /compatibility of the unreviewed delta is `Unknown`/);
});

test("complete Superpowers integration matrix is pinned, reviewable, and decision-complete", () => {
  const matrix = readJson("docs/upstream/SUPERPOWERS_INTEGRATION_MATRIX.json");
  const inventory = readJson("docs/upstream/SUPERPOWERS_PATH_INVENTORY.json");
  const result = validateIntegrationMatrix(matrix, { upstreamCommit, upstreamTree, inventory });
  assert.deepEqual(result.errors, []);
  assert.equal(matrix.entries.length, 29);
  assert.deepEqual(
    matrix.entries.map((entry) => entry.capability_id),
    Array.from({ length: 29 }, (_, index) => index + 1)
  );
  assert.ok(matrix.entries.every((entry) => entry.final_status === "Reviewed"));
  assert.ok(matrix.entries.every((entry) => entry.disposition !== "DEFER" || entry.verification_state !== "Verified"));
  for (const skill of [
    "brainstorming", "dispatching-parallel-agents", "executing-plans", "finishing-a-development-branch",
    "receiving-code-review", "requesting-code-review", "subagent-driven-development", "systematic-debugging",
    "test-driven-development", "using-git-worktrees", "using-superpowers", "verification-before-completion",
    "writing-plans", "writing-skills"
  ]) assert.match(JSON.stringify(matrix.entries), new RegExp(`skills/${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/SKILL\\.md`));
});

test("weekly upstream check maintains one durable review issue on drift and cannot import changes", () => {
  const workflow = read(".github/workflows/upstream-superpowers-check.yml");
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /git ls-remote https:\/\/github\.com\/obra\/superpowers\.git HEAD/);
  assert.match(workflow, /actions\/upload-artifact@[0-9a-f]{40}/);
  assert.doesNotMatch(workflow, /git (?:merge|cherry-pick|pull|push|commit)/i);
  assert.match(workflow, /issues:\s*write/);
  assert.match(workflow, /concurrency:/);
  assert.match(workflow, /title="\[WCBS\] Superpowers upstream adoption review"/);
  assert.doesNotMatch(workflow, /title=.*OBSERVED/);
  assert.match(workflow, /gh issue list .*--state all/);
  assert.match(workflow, /if \(\( count > 1 \)\)/);
  assert.match(workflow, /gh issue reopen/);
  assert.match(workflow, /superpowers-observed:\$OBSERVED/);
  assert.match(workflow, /gh issue comment/);
  assert.ok(workflow.indexOf('if [[ "$previous_body" !=') < workflow.indexOf('gh issue reopen'),
    "an already-reviewed SHA must not reopen a closed issue on every poll");
  assert.ok(workflow.indexOf('gh issue comment') < workflow.indexOf('gh issue edit'),
    "a failed comment must not advance the observed-SHA marker and hide the alert");
  assert.match(workflow, /ADOPTION_LEDGER\.md/);
  assert.match(workflow, new RegExp(upstreamCommit));
});
