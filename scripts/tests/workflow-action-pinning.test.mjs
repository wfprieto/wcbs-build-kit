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
