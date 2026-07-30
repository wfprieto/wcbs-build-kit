import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (relative) => fs.readFileSync(path.join(root, ...relative.split("/")), "utf8");

test("Superpowers compatibility governance pins provenance and a decision ledger", () => {
  const compatibility = read("docs/upstream/SUPERPOWERS_COMPATIBILITY.md");
  const ledger = read("docs/upstream/ADOPTION_LEDGER.md");
  assert.match(compatibility, /obra\/superpowers/);
  assert.match(compatibility, /3dcbd5c4b48e02263fbf4a3c01e3fe4f81d584d9/);
  assert.match(compatibility, /MIT/i);
  assert.match(compatibility, /adopt, adapt, defer, or reject/i);
  assert.match(ledger, /using-wcbs/);
  assert.match(ledger, /3dcbd5c4b48e02263fbf4a3c01e3fe4f81d584d9/);
});

test("weekly upstream check creates one durable review issue on drift and cannot import changes", () => {
  const workflow = read(".github/workflows/upstream-superpowers-check.yml");
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /git ls-remote https:\/\/github\.com\/obra\/superpowers\.git HEAD/);
  assert.match(workflow, /actions\/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02/);
  assert.doesNotMatch(workflow, /git (?:merge|cherry-pick|pull|push|commit)/i);
  assert.match(workflow, /issues:\s*write/);
  assert.match(workflow, /Superpowers upstream drift/);
  assert.match(workflow, /ADOPTION_LEDGER\.md/);
});
