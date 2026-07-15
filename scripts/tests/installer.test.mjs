import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const installer = path.join(root, "scripts", "install-adapter.mjs");
const smoke = path.join(root, "scripts", "adapter-smoke-test.mjs");

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-install-"));
}

function run(args, cwd = root) {
  const result = spawnSync(process.execPath, [installer, ...args], { cwd, encoding: "utf8" });
  return { code: result.status, output: `${result.stdout}${result.stderr}` };
}

function runSmoke(args, cwd = root) {
  const result = spawnSync(process.execPath, [smoke, ...args], { cwd, encoding: "utf8" });
  return { code: result.status, output: `${result.stdout}${result.stderr}` };
}

function exists(dir, rel) {
  return fs.existsSync(path.join(dir, ...rel.split("/")));
}

test("codex adapter installs, doctors, updates, and uninstalls in an isolated fixture", () => {
  const dir = tmp();
  try {
    let result = run(["--target", "codex", "--dest", dir, "--install"]);
    assert.equal(result.code, 0, result.output);
    assert.ok(exists(dir, "AGENTS.md"));
    assert.ok(exists(dir, ".codex-plugin/plugin.json"));
    assert.ok(exists(dir, ".wcbs/adapter-install-manifest.json"));

    result = run(["--target", "codex", "--dest", dir, "--doctor"]);
    assert.equal(result.code, 0, result.output);
    assert.match(result.output, /structurally healthy/);

    result = runSmoke(["--target", "codex", "--dest", dir]);
    assert.equal(result.code, 0, result.output);
    assert.match(result.output, /smoke test passed/);

    result = run(["--target", "codex", "--dest", dir, "--update"]);
    assert.equal(result.code, 0, result.output);

    result = run(["--target", "codex", "--dest", dir, "--uninstall"]);
    assert.equal(result.code, 0, result.output);
    assert.equal(exists(dir, "AGENTS.md"), false);
    assert.equal(exists(dir, ".wcbs/adapter-install-manifest.json"), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("cursor adapter installs project rule in an isolated fixture", () => {
  const dir = tmp();
  try {
    const install = run(["--target=cursor", `--dest=${dir}`, "--install"]);
    assert.equal(install.code, 0, install.output);
    assert.ok(exists(dir, ".cursor/rules/super-build-kit.mdc"));
    const doctor = run(["--target=cursor", `--dest=${dir}`, "--doctor"]);
    assert.equal(doctor.code, 0, doctor.output);
    const smokeResult = runSmoke(["--target=cursor", `--dest=${dir}`]);
    assert.equal(smokeResult.code, 0, smokeResult.output);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("installer refuses to overwrite unowned destination files", () => {
  const dir = tmp();
  try {
    fs.writeFileSync(path.join(dir, "AGENTS.md"), "user owned instructions\n", "utf8");
    const result = run(["--target", "codex", "--dest", dir, "--install"]);
    assert.notEqual(result.code, 0);
    assert.match(result.output, /Refusing to overwrite unowned file/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("uninstall refuses to run without an ownership manifest", () => {
  const dir = tmp();
  try {
    const result = run(["--target", "codex", "--dest", dir, "--uninstall"]);
    assert.notEqual(result.code, 0);
    assert.match(result.output, /ownership is unknown/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
