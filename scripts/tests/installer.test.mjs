import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
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

function hash(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
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

const codexHookFiles = ["hooks/codex-hooks.json", "scripts/render-session-bootstrap.mjs"];

function assertInstalledCodexHook(dir) {
  const plugin = JSON.parse(fs.readFileSync(path.join(dir, ".codex-plugin", "plugin.json"), "utf8"));
  const hookFile = path.resolve(dir, plugin.hooks);
  assert.ok(fs.existsSync(hookFile), `Missing declared Codex hook: ${plugin.hooks}`);
  const hook = JSON.parse(fs.readFileSync(hookFile, "utf8")).hooks.SessionStart[0].hooks[0];
  const invocation = /^node "\$\{PLUGIN_ROOT\}\/([^"]+)" --runtime (\S+) --shape (\S+)$/.exec(hook.command);
  assert.ok(invocation, `Unexpected Codex hook command: ${hook.command}`);
  assert.equal(invocation[2], "codex");
  assert.equal(invocation[3], "codex");
  const renderer = path.resolve(dir, invocation[1]);
  assert.ok(fs.existsSync(renderer), "Missing installed Codex renderer");
  const receipt = JSON.parse(fs.readFileSync(path.join(dir, ".wcbs", "adapter-install-manifest.json"), "utf8"));
  for (const rel of [plugin.hooks.replace(/^\.\//, ""), invocation[1]]) {
    assert.ok(receipt.files.includes(rel), `Codex hook dependency is not owned: ${rel}`);
    assert.equal(receipt.file_hashes[rel], hash(path.resolve(dir, rel)));
  }
  const rendered = spawnSync(process.execPath, [renderer, "--runtime", invocation[2], "--shape", invocation[3]], {
    cwd: os.tmpdir(), encoding: "utf8"
  });
  assert.equal(rendered.status, 0, `${rendered.stdout}${rendered.stderr}`);
  assert.equal(rendered.stderr, "");
  const payload = JSON.parse(rendered.stdout);
  assert.deepEqual(Object.keys(payload), ["hookSpecificOutput"]);
  assert.equal(payload.hookSpecificOutput.hookEventName, "SessionStart");
  const context = payload.hookSpecificOutput.additionalContext;
  assert.equal(context.split("WCBS_KIT_ACTIVE:codex").length - 1, 1);
  assert.ok(context.includes(path.join(dir, "skills", "using-wcbs", "SKILL.md")));
  assert.ok(context.includes(path.join(dir, "runtime_adapters", "tool_mappings", "codex.json")));
}

function retainPreHookCodexReceipt(dir) {
  const file = path.join(dir, ".wcbs", "adapter-install-manifest.json");
  const receipt = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const rel of codexHookFiles) {
    fs.rmSync(path.resolve(dir, rel), { force: true });
    receipt.files = receipt.files.filter((owned) => owned !== rel);
    delete receipt.file_hashes[rel];
  }
  fs.writeFileSync(file, `${JSON.stringify(receipt, null, 2)}\n`);
}

test("default Codex install delivers an owned, runnable SessionStart hook without unrelated hooks", () => {
  const parent = tmp();
  const dir = path.join(parent, "project with spaces");
  const userHook = path.join(dir, "hooks", "hooks.json");
  try {
    fs.mkdirSync(path.dirname(userHook), { recursive: true });
    fs.writeFileSync(userHook, "user hook sentinel\n");
    const installed = run(["--target", "codex", "--dest", dir, "--install"]);
    assert.equal(installed.code, 0, installed.output);
    assertInstalledCodexHook(dir);
    const removed = run(["--target", "codex", "--dest", dir, "--uninstall"]);
    assert.equal(removed.code, 0, removed.output);
    for (const rel of codexHookFiles) assert.equal(exists(dir, rel), false);
    assert.equal(fs.readFileSync(userHook, "utf8"), "user hook sentinel\n");
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
  }
});

test("Codex update adds the hook to a pre-fix hashed receipt and removes it on uninstall", () => {
  const dir = tmp();
  try {
    fs.writeFileSync(path.join(dir, "app.txt"), "user sentinel\n");
    const installed = run(["--target", "codex", "--dest", dir, "--install"]);
    assert.equal(installed.code, 0, installed.output);
    retainPreHookCodexReceipt(dir);
    const updated = run(["--target", "codex", "--dest", dir, "--update"]);
    assert.equal(updated.code, 0, updated.output);
    assertInstalledCodexHook(dir);
    const removed = run(["--target", "codex", "--dest", dir, "--uninstall"]);
    assert.equal(removed.code, 0, removed.output);
    for (const rel of codexHookFiles) assert.equal(exists(dir, rel), false);
    assert.equal(fs.readFileSync(path.join(dir, "app.txt"), "utf8"), "user sentinel\n");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("Codex hook upgrade rejects unowned dependency collisions before writing any file", () => {
  for (const rel of codexHookFiles) {
    const dir = tmp();
    try {
      const installed = run(["--target", "codex", "--dest", dir, "--install"]);
      assert.equal(installed.code, 0, installed.output);
      retainPreHookCodexReceipt(dir);
      const userFile = path.resolve(dir, rel);
      fs.mkdirSync(path.dirname(userFile), { recursive: true });
      fs.writeFileSync(userFile, "user dependency sentinel\n");
      const before = filesBelow(dir).map((file) => [file, hash(path.resolve(dir, file))]);
      const updated = run(["--target", "codex", "--dest", dir, "--update"]);
      assert.notEqual(updated.code, 0, updated.output);
      assert.match(updated.output, /unowned existing file/);
      assert.deepEqual(filesBelow(dir).map((file) => [file, hash(path.resolve(dir, file))]), before);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

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

test("installer records immutable per-file hashes and refuses to overwrite or delete edited files", () => {
  const dir = tmp();
  try {
    assert.equal(run(["--target", "codex", "--dest", dir, "--install"]).code, 0);
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, ".wcbs", "adapter-install-manifest.json"), "utf8"));
    assert.equal(manifest.schema_version, 2);
    assert.equal(manifest.file_hashes["AGENTS.md"], hash(path.join(dir, "AGENTS.md")));
    fs.appendFileSync(path.join(dir, "AGENTS.md"), "\nuser edit\n");
    const before = hash(path.join(dir, "GET_STARTED.md"));
    for (const action of ["--update", "--repair", "--uninstall", "--doctor", "--verify-owned-files"]) {
      const result = run(["--target", "codex", "--dest", dir, action]);
      assert.notEqual(result.code, 0, `${action}: ${result.output}`);
      assert.match(result.output, /modified|changed|integrity/i);
      assert.match(fs.readFileSync(path.join(dir, "AGENTS.md"), "utf8"), /user edit/);
      assert.equal(hash(path.join(dir, "GET_STARTED.md")), before);
      assert.ok(exists(dir, ".wcbs/adapter-install-manifest.json"));
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("repair restores only missing owned files without rewriting the receipt or intact files", () => {
  const dir = tmp();
  try {
    assert.equal(run(["--target", "codex", "--dest", dir, "--install"]).code, 0);
    const manifest = path.join(dir, ".wcbs", "adapter-install-manifest.json");
    const receiptBefore = fs.readFileSync(manifest, "utf8");
    const intact = path.join(dir, "GET_STARTED.md");
    const oldTime = new Date("2001-01-01T00:00:00Z");
    fs.utimesSync(intact, oldTime, oldTime);
    const intactMtime = fs.statSync(intact).mtimeMs;
    fs.rmSync(path.join(dir, "AGENTS.md"));
    const result = run(["--target", "codex", "--dest", dir, "--repair"]);
    assert.equal(result.code, 0, result.output);
    assert.equal(fs.readFileSync(manifest, "utf8"), receiptBefore);
    assert.equal(fs.statSync(intact).mtimeMs, intactMtime);
    assert.equal(run(["--target", "codex", "--dest", dir, "--doctor"]).code, 0);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("uninstall rejects a manifest traversal path before touching an outside sentinel", () => {
  const parent = tmp();
  const dir = path.join(parent, "project");
  fs.mkdirSync(dir);
  const sentinel = path.join(parent, "sentinel.txt");
  fs.writeFileSync(sentinel, "keep me\n");
  try {
    assert.equal(run(["--target", "codex", "--dest", dir, "--install"]).code, 0);
    const file = path.join(dir, ".wcbs", "adapter-install-manifest.json");
    const record = JSON.parse(fs.readFileSync(file, "utf8"));
    record.files.push("../sentinel.txt");
    record.file_hashes ??= {};
    record.file_hashes["../sentinel.txt"] = hash(sentinel);
    fs.writeFileSync(file, JSON.stringify(record));
    const result = run(["--target", "codex", "--dest", dir, "--uninstall"]);
    assert.notEqual(result.code, 0, result.output);
    assert.equal(fs.readFileSync(sentinel, "utf8"), "keep me\n");
    assert.ok(exists(dir, "AGENTS.md"));
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
  }
});

test("legacy hashless manifest blocks destructive actions without touching installed files", () => {
  const dir = tmp();
  try {
    assert.equal(run(["--target", "codex", "--dest", dir, "--install"]).code, 0);
    const file = path.join(dir, ".wcbs", "adapter-install-manifest.json");
    const record = JSON.parse(fs.readFileSync(file, "utf8"));
    delete record.schema_version;
    delete record.file_hashes;
    fs.writeFileSync(file, JSON.stringify(record));
    for (const action of ["--update", "--repair", "--uninstall"]) {
      const result = run(["--target", "codex", "--dest", dir, action]);
      assert.notEqual(result.code, 0, result.output);
      assert.match(result.output, /legacy|hashless|file hashes/i);
      assert.ok(exists(dir, "AGENTS.md"));
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("uninstall rollback restores all files after a controlled removal failure", () => {
  const dir = tmp();
  try {
    assert.equal(run(["--target", "codex", "--dest", dir, "--install"]).code, 0);
    const before = hash(path.join(dir, "AGENTS.md"));
    const failed = run(["--target", "codex", "--dest", dir, "--uninstall"], root, { WCBS_TEST_FAIL_UNINSTALL_AFTER_REMOVALS: "2" });
    assert.notEqual(failed.code, 0, failed.output);
    assert.match(failed.output, /Injected uninstall removal failure/);
    assert.equal(hash(path.join(dir, "AGENTS.md")), before);
    assert.ok(exists(dir, ".wcbs/adapter-install-manifest.json"));
    assert.equal(run(["--target", "codex", "--dest", dir, "--doctor"]).code, 0);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("incomplete uninstall rollback preserves staged backups for manual recovery", () => {
  const dir = tmp();
  try {
    assert.equal(run(["--target", "codex", "--dest", dir, "--install"]).code, 0);
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, ".wcbs", "adapter-install-manifest.json"), "utf8"));
    const firstRemoved = [...manifest.files].sort((a, b) => b.length - a.length)[0];
    const result = run(["--target", "codex", "--dest", dir, "--uninstall"], root, {
      WCBS_TEST_FAIL_UNINSTALL_AFTER_REMOVALS: "2",
      WCBS_TEST_FAIL_ROLLBACK_REL: firstRemoved
    });
    assert.notEqual(result.code, 0, result.output);
    assert.match(result.output, /rollback was incomplete/i);
    const record = JSON.parse(fs.readFileSync(path.join(dir, ".wcbs", "adapter-install-recovery.json"), "utf8"));
    assert.ok(record.backup_directory);
    assert.ok(fs.existsSync(path.join(record.backup_directory, ...firstRemoved.split("/"))));
  } finally {
    const recovery = path.join(dir, ".wcbs", "adapter-install-recovery.json");
    if (fs.existsSync(recovery)) {
      const record = JSON.parse(fs.readFileSync(recovery, "utf8"));
      const backup = path.resolve(record.backup_directory ?? "");
      if (path.dirname(backup) === path.resolve(os.tmpdir()) && path.basename(backup).startsWith("wcbs-adapter-uninstall-")) fs.rmSync(backup, { recursive: true, force: true });
    }
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("a target mismatch or unrecognized owned path cannot delete project files", () => {
  const dir = tmp();
  try {
    fs.writeFileSync(path.join(dir, "user.txt"), "user data\n");
    assert.equal(run(["--target", "codex", "--dest", dir, "--install"]).code, 0);
    const wrongTarget = run(["--target", "cursor", "--dest", dir, "--uninstall"]);
    assert.notEqual(wrongTarget.code, 0, wrongTarget.output);
    const file = path.join(dir, ".wcbs", "adapter-install-manifest.json");
    const record = JSON.parse(fs.readFileSync(file, "utf8"));
    record.files.push("user.txt");
    record.file_hashes["user.txt"] = hash(path.join(dir, "user.txt"));
    fs.writeFileSync(file, JSON.stringify(record));
    const poisoned = run(["--target", "codex", "--dest", dir, "--uninstall"]);
    assert.notEqual(poisoned.code, 0, poisoned.output);
    assert.equal(fs.readFileSync(path.join(dir, "user.txt"), "utf8"), "user data\n");
    assert.ok(exists(dir, "AGENTS.md"));
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

test("installer accepts a destination path that resolves through a filesystem alias", () => {
  const actual = tmp();
  const alias = `${actual}-alias`;
  try {
    fs.symlinkSync(actual, alias, "dir");
    const install = run(["--target", "codex", "--dest", alias, "--install"]);
    assert.equal(install.code, 0, install.output);
    assert.ok(exists(actual, "AGENTS.md"));
    assert.ok(exists(actual, ".wcbs/adapter-install-manifest.json"));
  } finally {
    fs.rmSync(alias, { force: true });
    fs.rmSync(actual, { recursive: true, force: true });
  }
});

test("installer preserves an ordinary project README through install and uninstall", () => {
  const dir = tmp();
  try {
    fs.writeFileSync(path.join(dir, "README.md"), "# User project\n\nDo not change this file.\n", "utf8");
    fs.writeFileSync(path.join(dir, "package.json"), "{\"name\":\"user-project\"}\n", "utf8");
    fs.mkdirSync(path.join(dir, "src"));
    fs.writeFileSync(path.join(dir, "src", "index.js"), "export default 'user code';\n", "utf8");
    const result = run(["--target", "codex", "--dest", dir, "--install"]);
    assert.equal(result.code, 0, result.output);
    assert.equal(fs.readFileSync(path.join(dir, "README.md"), "utf8"), "# User project\n\nDo not change this file.\n");
    assert.equal(fs.readFileSync(path.join(dir, "package.json"), "utf8"), "{\"name\":\"user-project\"}\n");
    assert.equal(fs.readFileSync(path.join(dir, "src", "index.js"), "utf8"), "export default 'user code';\n");
    assert.ok(exists(dir, "AGENTS.md"));
    assert.ok(exists(dir, ".codex-plugin/plugin.json"));
    assert.ok(exists(dir, ".wcbs/adapter-install-manifest.json"));
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, ".wcbs", "adapter-install-manifest.json"), "utf8"));
    assert.equal(manifest.files.includes("README.md"), false);

    const uninstall = run(["--target", "codex", "--dest", dir, "--uninstall"]);
    assert.equal(uninstall.code, 0, uninstall.output);
    assert.equal(fs.readFileSync(path.join(dir, "README.md"), "utf8"), "# User project\n\nDo not change this file.\n");
    assert.equal(fs.readFileSync(path.join(dir, "package.json"), "utf8"), "{\"name\":\"user-project\"}\n");
    assert.equal(fs.readFileSync(path.join(dir, "src", "index.js"), "utf8"), "export default 'user code';\n");
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
    fs.writeFileSync(path.join(dir, "AGENTS.md"), "agent sentinel\n", "utf8");
    fs.writeFileSync(path.join(dir, "GET_STARTED.md"), "getting started sentinel\n", "utf8");
    const before = filesBelow(dir);
    const result = run(["--target", "codex", "--dest", dir, "--install"]);
    assert.notEqual(result.code, 0);
    assert.match(result.output, /AGENTS\.md \(unowned existing file\).*GET_STARTED\.md \(unowned existing file\)/s);
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
    assert.ok(recovery.residual_paths.includes(".codex-plugin/plugin.json"));
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
