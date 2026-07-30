#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseline = process.env.WCBS_WHITESPACE_BASE ?? "9cac90d5cfabb1b8d3d137058f4558c52149c7be";

function git(args, input = undefined) {
  return spawnSync("git", args, { cwd: root, encoding: "utf8", input });
}

const ancestry = git(["merge-base", "--is-ancestor", baseline, "HEAD"]);
if (ancestry.status !== 0) {
  process.stderr.write(`FAIL: whitespace baseline ${baseline} is unavailable or not an ancestor of HEAD.\n${ancestry.stderr}`);
  process.exitCode = 1;
} else {
  const candidate = git(["diff", "--check", baseline, "--", "."]);
  if (candidate.status !== 0) {
    process.stderr.write(`FAIL: whitespace verification failed for the effective candidate since ${baseline}.\n${candidate.stdout}${candidate.stderr}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: changes since ${baseline} and the working tree contain no Git diff --check whitespace errors.`);
  }
}
