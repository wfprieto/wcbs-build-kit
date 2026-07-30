import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8").replace(/\r\n?/g, "\n");

test("critical WCBS paths have an explicit repository owner", () => {
  const codeowners = read(".github/CODEOWNERS");
  for (const entry of [
    "/scripts/install-adapter.mjs @wfprieto",
    "/scripts/check-install.mjs @wfprieto",
    "/scripts/wcbs.mjs @wfprieto",
    "/scripts/wcbs-doctor.mjs @wfprieto",
    "/scripts/build-release-artifacts.mjs @wfprieto",
    "/scripts/lib/evaluation-protocol.mjs @wfprieto",
    "/scripts/lib/hardened-git.mjs @wfprieto",
    "/runtime_adapters/adapter-registry.yaml @wfprieto",
    "/.github/workflows/ @wfprieto",
    "/.github/RELEASE_CANDIDATE_CHECKLIST.md @wfprieto",
    "/evals/ @wfprieto",
    "/SECURITY.md @wfprieto",
    "/RELEASE_PROCESS.md @wfprieto",
    "/10_governance/RELEASE_GATES.md @wfprieto"
  ]) assert.match(codeowners, new RegExp(`^${entry.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"));
});

test("Dependabot reviews Node and GitHub Actions dependencies weekly", () => {
  const config = read(".github/dependabot.yml");
  assert.match(config, /^version: 2$/m);
  for (const ecosystem of ["npm", "github-actions"]) {
    assert.match(config, new RegExp(
      `- package-ecosystem: ${ecosystem}\\n\\s+directory: "\\/"\\n\\s+schedule:\\n\\s+interval: weekly`
    ));
  }
});
