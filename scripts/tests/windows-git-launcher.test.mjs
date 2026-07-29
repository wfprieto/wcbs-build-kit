import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { runGitCommand } from "../lib/evaluation-protocol.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function diagnostic(result) {
  return [result.error?.message, result.stderr?.toString(), result.stdout?.toString()].filter(Boolean).join("\n");
}

test("Windows Git launcher does not execute a source-shadowed cmd.exe while retaining the workspace drive", { skip: process.platform !== "win32" }, () => {
  const original = process.cwd();
  let source = null;
  try {
    const scratch = path.join(root, "dist");
    fs.mkdirSync(scratch, { recursive: true });
    source = fs.mkdtempSync(path.join(scratch, "wcbs-windows-cmd-shadow-"));
    fs.writeFileSync(path.join(source, "cmd.exe"), "this must never execute\n");
    process.chdir(source);
    const version = runGitCommand(["--version"], { cwd: source, encoding: "utf8" });
    assert.equal(version.status, 0, diagnostic(version));
    assert.match(version.stdout, /^git version /);
    const revision = runGitCommand(["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" });
    assert.equal(revision.status, 0, diagnostic(revision));
    assert.match(revision.stdout, /^[a-f0-9]{40}\r?\n$/i);
    assert.equal(process.cwd(), source, "the launcher must not change the parent process directory");
  } finally {
    try { process.chdir(original); }
    finally {
      if (source) fs.rmSync(source, { recursive: true, force: true });
    }
  }
});
