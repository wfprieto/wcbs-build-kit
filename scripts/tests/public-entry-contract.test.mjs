import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const readme = read("README.md");
const getStarted = read("GET_STARTED.md");
const bootstrap = read("BOOTSTRAP.md");
const installer = read("scripts/install-adapter.mjs");

const supportedTargets = ["codex", "claude", "cursor", "github-copilot", "gemini", "replit", "manus", "generic-agent"];

test("README gives a single public URL entry path", () => {
  assert.match(readme, /Coding agent given only this GitHub URL:/);
  assert.match(readme, /open `GET_STARTED\.md`/);
  assert.match(readme, /`BOOTSTRAP\.md`/);
  assert.match(readme, /`00_start_here\/bootstrap-controller\.json`/);
  assert.match(readme, /do not claim activation until the installed adapter passes its doctor and smoke test/i);
});

test("GET_STARTED defines autonomous install and verification without overstating URL enforcement", () => {
  assert.match(getStarted, /Coding agent arriving from the GitHub URL/);
  assert.match(getStarted, /node scripts\/install-adapter\.mjs --list-targets/);
  assert.match(getStarted, /--target <runtime> --dest <project> --install/);
  assert.match(getStarted, /--target <runtime> --dest <project> --doctor/);
  assert.match(getStarted, /node scripts\/adapter-smoke-test\.mjs --target <runtime> --dest <project>/);
  assert.match(getStarted, /URL-paste discovery is `REQUESTED`, not `ENFORCED`/);
  assert.match(getStarted, /Do not claim activation/);
});

test("public instructions route through the canonical Kernel and Controller", () => {
  assert.match(bootstrap, /00_start_here\/bootstrap-controller\.json/);
  assert.match(bootstrap, /Fail closed/);
  assert.match(getStarted, /Read `BOOTSTRAP\.md` and follow its transfer to `00_start_here\/bootstrap-controller\.json`/);
});

test("documented runtime discovery covers every installer target", () => {
  for (const target of supportedTargets) {
    assert.equal(installer.includes(`"${target}"`), true, `installer target missing: ${target}`);
  }
});
