import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const workflowsDir = path.join(root, ".github", "workflows");

test("GitHub Actions dependencies are pinned to immutable full commit SHAs", () => {
  const unpinned = [];

  for (const file of fs.readdirSync(workflowsDir).filter((entry) => entry.endsWith(".yml")).sort()) {
    const text = fs.readFileSync(path.join(workflowsDir, file), "utf8");
    for (const [lineNumber, line] of text.split(/\r?\n/).entries()) {
      const match = line.match(/^\s*uses:\s+([\w.-]+\/[\w.-]+)@([^\s#]+)/);
      if (match && !/^[a-f0-9]{40}$/i.test(match[2])) unpinned.push(`${file}:${lineNumber + 1} ${match[1]}@${match[2]}`);
    }
  }

  assert.deepEqual(unpinned, [], `Mutable GitHub Action references found:\n${unpinned.join("\n")}`);
});

test("the authoritative release gate is required on pull requests to main", () => {
  const release = fs.readFileSync(path.join(workflowsDir, "release-check.yml"), "utf8");
  assert.match(release, /^ {2}pull_request:\s*\n {4}branches:\s*\n {6}- main\s*$/m);
  assert.match(release, /^\s*run:\s*npm run release-check\s*(?:#.*)?$/m);
  assert.doesNotMatch("  # pull_request:\n    # branches:\n      # - main\n        # run: npm run release-check\n", /^ {2}pull_request:\s*\n {4}branches:\s*\n {6}- main\s*$/m);
  assert.doesNotMatch("        # run: npm run release-check\n", /^\s*run:\s*npm run release-check\s*(?:#.*)?$/m);
});
