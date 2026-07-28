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

function run(args, cwd = root, env = {}) {
  const result = spawnSync(process.execPath, [installer, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...env }
  });
  return { code: result.status, output: `${result.stdout}${result.stderr}` };
}

function runSmoke(args, cwd = root) {
  const result = spawnSync(process.execPath, [smoke, ...args], { cwd, encoding: "utf8" });
  return { code: result.status, output: `${result.stdout}${result.stderr}` };
}

function exists(dir, rel) {
  return fs.existsSync(path.join(dir, ...rel.split("/")));
}

function filesBelow(dir) {
  const files = [];
  const walk = (current) => {
    if (!fs.existsSync(current)) return;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else files.push(path.relative(dir, absolute).split(path.sep).join("/"));
    }
  };
  walk(dir);
  return files.sort();
}

test("codex adapter installs, verifies, updates, and uninstalls transactionally", () => {
  const dir = tmp();
  try {
    fs.writeFileSync(path.join(dir, "app.txt"), "user sentinel\n", "utf8");
    let result = run(["--target", "codex", "--dest", dir, "--install"]);
    assert.equal(result.code, 0, result.output);
    assert.ok(exists(dir, "AGENTS.md"));
    assert.ok(exists(dir, ".codex-plugin/plugin.json"));
    assert.ok(exists(dir, ".wcbs/adapter-install-manifest.json"));

    result = run(["--target", "codex", "--dest", dir, "--doctor"]);
    assert.equal(result.code, 0, result.output);
    assert.match(result.output, /structurally healthy/);

    result = run(["--target", "codex", "--dest", dir, "--verify-owned-files"]);
    assert.equal(result.code, 0, result.output);

    result = runSmoke(["--target", "codex", "--dest", dir]);
    assert.equal(result.code, 0, result.output);
    assert.match(result.output, /smoke test passed/);

    result = run(["--target", "codex", "--dest", dir, "--update"]);
    assert.equal(result.code, 0, result.output);

    result = run(["--target", "codex", "--dest", dir, "--uninstall"]);
    assert.equal(result.code, 0, result.output);
    assert.equal(exists(dir, "AGENTS.md"), false);
    assert.equal(exists(dir, ".wcbs/adapter-install-manifest.json"), false);
    assert.equal(fs.readFileSync(path.join(dir, "app.txt"), "utf8"), "user sentinel\n");
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

test("preflight collision writes no WCBS payload or activation surface", () => {
  const dir = tmp();
  try {
    fs.writeFileSync(path.join(dir, "README.md"), "user owned readme\n", "utf8");
    const before = filesBelow(dir);
    const result = run(["--target", "codex", "--dest", dir, "--install"]);
    assert.notEqual(result.code, 0);
    assert.match(result.output, /Preflight collision\(s\); no files written/);
    assert.match(result.output, /README\.md \(unowned existing file\)/);
    assert.deepEqual(filesBelow(dir), before);
    assert.equal(fs.readFileSync(path.join(dir, "README.md"), "utf8"), "user owned readme\n");
    assert.equal(exists(dir, "AGENTS.md"), false);
    assert.equal(exists(dir, ".codex-plugin/plugin.json"), false);
    assert.equal(exists(dir, ".wcbs/adapter-install-manifest.json"), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("preflight reports multiple collisions deterministically before mutation", () => {
  const dir = tmp();
  try {
    fs.writeFileSync(path.join(dir, "README.md"), "readme sentinel\n", "utf8");
    fs.writeFileSync(path.join(dir, "AGENTS.md"), "agent sentinel\n", "utf8");
    const before = filesBelow(dir);
    const result = run(["--target", "codex", "--dest", dir, "--install"]);
    assert.notEqual(result.code, 0);
    assert.match(result.output, /AGENTS\.md \(unowned existing file\).*README\.md \(unowned existing file\)/s);
    assert.deepEqual(filesBelow(dir), before);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("controlled commit failure rolls back every created artifact", () => {
  const dir = tmp();
  try {
    fs.writeFileSync(path.join(dir, "app.txt"), "user sentinel\n", "utf8");
    const before = filesBelow(dir);
    const result = run(
      ["--target", "codex", "--dest", dir, "--install"],
      root,
      { WCBS_TEST_FAIL_AFTER_WRITES: "3" }
    );
    assert.notEqual(result.code, 0);
    assert.match(result.output, /Injected commit failure/);
    assert.deepEqual(filesBelow(dir), before);
    assert.equal(exists(dir, "AGENTS.md"), false);
    assert.equal(exists(dir, ".codex-plugin/plugin.json"), false);
    assert.equal(exists(dir, ".wcbs/adapter-install-manifest.json"), false);
    assert.equal(exists(dir, ".wcbs/adapter-install-recovery.json"), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("rollback failure produces a distinct recovery record with residual paths", () => {
  const dir = tmp();
  try {
    const result = run(
      ["--target", "codex", "--dest", dir, "--install"],
      root,
      {
        WCBS_TEST_FAIL_AFTER_WRITES: "1",
        WCBS_TEST_FAIL_ROLLBACK_REL: ".codex-plugin/plugin.json"
      }
    );
    assert.notEqual(result.code, 0);
    assert.match(result.output, /CRITICAL: installation failed and rollback was incomplete/);
    assert.equal(exists(dir, ".wcbs/adapter-install-recovery.json"), true);
    const recovery = JSON.parse(fs.readFileSync(path.join(dir, ".wcbs", "adapter-install-recovery.json"), "utf8"));
    assert.equal(recovery.status, "ROLLBACK_INCOMPLETE");
    assert.deepEqual(recovery.residual_paths, [".codex-plugin/plugin.json"]);
    assert.equal(exists(dir, ".wcbs/adapter-install-manifest.json"), false);
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

test("installer rejects the Build Kit source as its own destination", () => {
  const dir = tmp();
  try {
    const kitClone = path.join(dir, "wcbs-build-kit");
    fs.cpSync(root, kitClone, {
      recursive: true,
      filter: (source) => !source.includes(`${path.sep}.git${path.sep}`) && !source.endsWith(`${path.sep}.git`)
    });
    const fixtureInstaller = path.join(kitClone, "scripts", "install-adapter.mjs");
    const result = spawnSync(process.execPath, [
      fixtureInstaller,
      "--target", "codex",
      "--dest", kitClone,
      "--install"
    ], { cwd: kitClone, encoding: "utf8" });
    const output = `${result.stdout}${result.stderr}`;
    assert.notEqual(result.status, 0, output);
    assert.match(output, /Build Kit source cannot be its own adapter destination/);
    assert.equal(exists(kitClone, ".wcbs/adapter-install-manifest.json"), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
