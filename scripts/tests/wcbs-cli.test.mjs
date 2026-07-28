import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const cli = "scripts/wcbs.mjs";
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

function projectFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-v2-cli-"));
  fs.mkdirSync(path.join(dir, "src"), { recursive: true });
  fs.writeFileSync(path.join(dir, "README.md"), "# User project\n");
  fs.writeFileSync(path.join(dir, "package.json"), "{\"name\":\"user-project\"}\n");
  fs.writeFileSync(path.join(dir, "src", "index.js"), "export const userOwned = true;\n");
  return dir;
}

function run(args, cwd = root, env = process.env) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8", env });
}

function userHashes(project) {
  return Object.fromEntries(["README.md", "package.json", "src/index.js"].map((file) => [file, hash(path.join(project, file))]));
}

test("native V2 plugin install, doctor, status, and uninstall preserve an ordinary project", () => {
  const project = projectFixture();
  const plugin = path.join(project, "runtime-plugins", "wcbs-opencode");
  const before = userHashes(project);
  try {
    const install = run(["install", "--target", "opencode", "--plugin-dir", plugin, "--json"]);
    assert.equal(install.status, 0, `${install.stdout}${install.stderr}`);
    const receipt = JSON.parse(install.stdout);
    assert.equal(receipt.status, "PASS");
    assert.equal(receipt.evidence, "Installed In Isolated Fixture");
    assert.equal(fs.existsSync(path.join(plugin, ".wcbs", "v2-plugin-install-manifest.json")), true);
    assert.deepEqual(userHashes(project), before);

    for (const command of ["doctor", "status"]) {
      const result = run([command, "--plugin-dir", plugin, "--json"]);
      assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
      assert.equal(JSON.parse(result.stdout).status, "PASS");
    }

    const uninstall = run(["uninstall", "--plugin-dir", plugin, "--json"]);
    assert.equal(uninstall.status, 0, `${uninstall.stdout}${uninstall.stderr}`);
    assert.equal(fs.existsSync(plugin), false);
    assert.deepEqual(userHashes(project), before);
  } finally {
    fs.rmSync(project, { recursive: true, force: true });
  }
});

test("Codex V2 installation includes the self-contained marketplace manifest without touching user files", () => {
  const project = projectFixture();
  const plugin = path.join(project, "runtime-plugins", "wcbs-codex");
  const before = userHashes(project);
  try {
    const install = run(["install", "--target", "codex", "--plugin-dir", plugin, "--json"]);
    assert.equal(install.status, 0, `${install.stdout}${install.stderr}`);
    const marketplace = JSON.parse(fs.readFileSync(path.join(plugin, ".agents", "plugins", "marketplace.json"), "utf8"));
    assert.deepEqual(marketplace.plugins[0].source, { source: "local", path: "./" });
    assert.equal(fs.existsSync(path.join(plugin, ".codex-plugin", "plugin.json")), true);
    assert.equal(fs.existsSync(path.join(plugin, "package.json")), false, "the native plugin bundle must not ship package-manager scripts whose sources are intentionally excluded");
    assert.deepEqual(userHashes(project), before);
    assert.equal(run(["uninstall", "--plugin-dir", plugin]).status, 0);
    assert.deepEqual(userHashes(project), before);
  } finally {
    fs.rmSync(project, { recursive: true, force: true });
  }
});

test("V2 install blocks an ambiguous target and writes nothing", () => {
  const project = projectFixture();
  const plugin = path.join(project, "runtime-plugins", "wcbs");
  try {
    const result = run(["install", "--plugin-dir", plugin]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Blocked: choose --target/i);
    assert.equal(fs.existsSync(plugin), false);
  } finally {
    fs.rmSync(project, { recursive: true, force: true });
  }
});

test("V2 uninstall refuses a modified owned plugin file and leaves the plugin intact", () => {
  const project = projectFixture();
  const plugin = path.join(project, "runtime-plugins", "wcbs-cursor");
  try {
    assert.equal(run(["install", "--target", "cursor", "--plugin-dir", plugin]).status, 0);
    fs.appendFileSync(path.join(plugin, "runtime_adapters", "generated", "using-wcbs-bootstrap.md"), "tampered\n");
    const result = run(["uninstall", "--plugin-dir", plugin]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /modified owned plugin files/i);
    assert.equal(fs.existsSync(plugin), true);
  } finally {
    fs.rmSync(project, { recursive: true, force: true });
  }
});

test("V1 migration is dry-run first, preserves user files, and removes only verified V1-owned files on apply", () => {
  const project = projectFixture();
  const plugin = path.join(project, "runtime-plugins", "wcbs-codex");
  const before = userHashes(project);
  try {
    const legacy = spawnSync(process.execPath, ["scripts/install-adapter.mjs", "--target", "codex", "--dest", project, "--install"], { cwd: root, encoding: "utf8" });
    assert.equal(legacy.status, 0, `${legacy.stdout}${legacy.stderr}`);
    assert.equal(fs.existsSync(path.join(project, ".wcbs", "adapter-install-manifest.json")), true);

    const dryRun = run(["migrate", "--project", project, "--plugin-dir", plugin, "--dry-run", "--json"]);
    assert.equal(dryRun.status, 0, `${dryRun.stdout}${dryRun.stderr}`);
    assert.equal(JSON.parse(dryRun.stdout).status, "DRY_RUN");
    assert.equal(fs.existsSync(plugin), false);
    assert.deepEqual(userHashes(project), before);

    const apply = run(["migrate", "--project", project, "--plugin-dir", plugin, "--apply", "--json"]);
    assert.equal(apply.status, 0, `${apply.stdout}${apply.stderr}`);
    assert.equal(fs.existsSync(path.join(plugin, ".wcbs", "v2-plugin-install-manifest.json")), true);
    assert.equal(fs.existsSync(path.join(project, ".wcbs", "adapter-install-manifest.json")), false);
    assert.deepEqual(userHashes(project), before);
  } finally {
    fs.rmSync(project, { recursive: true, force: true });
  }
});

test("V1 migration refuses a changed V1-owned file before it creates a V2 plugin", () => {
  const project = projectFixture();
  const plugin = path.join(project, "runtime-plugins", "wcbs-codex");
  try {
    const legacy = spawnSync(process.execPath, ["scripts/install-adapter.mjs", "--target", "codex", "--dest", project, "--install"], { cwd: root, encoding: "utf8" });
    assert.equal(legacy.status, 0, `${legacy.stdout}${legacy.stderr}`);
    fs.appendFileSync(path.join(project, "skills", "super-build-kit", "SKILL.md"), "user edit\n");
    const result = run(["migrate", "--project", project, "--plugin-dir", plugin, "--apply"]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /V1-owned files changed or are unverifiable/i);
    assert.equal(fs.existsSync(plugin), false);
    assert.equal(fs.existsSync(path.join(project, ".wcbs", "adapter-install-manifest.json")), true);
  } finally {
    fs.rmSync(project, { recursive: true, force: true });
  }
});

test("V1 migration rolls back both ownership trees when old-file removal is interrupted", () => {
  const project = projectFixture();
  const plugin = path.join(project, "runtime-plugins", "wcbs-codex");
  const before = userHashes(project);
  try {
    const legacy = spawnSync(process.execPath, ["scripts/install-adapter.mjs", "--target", "codex", "--dest", project, "--install"], { cwd: root, encoding: "utf8" });
    assert.equal(legacy.status, 0, `${legacy.stdout}${legacy.stderr}`);
    const tracked = JSON.parse(fs.readFileSync(path.join(project, ".wcbs", "adapter-install-manifest.json"), "utf8")).files;
    const result = run(["migrate", "--project", project, "--plugin-dir", plugin, "--apply"], root, { ...process.env, WCBS_TEST_FAIL_MIGRATION_AFTER_REMOVALS: "2" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Injected migration removal failure/);
    assert.equal(fs.existsSync(plugin), false);
    assert.equal(fs.existsSync(path.join(project, ".wcbs", "adapter-install-manifest.json")), true);
    for (const relative of tracked) assert.equal(fs.existsSync(path.join(project, ...relative.split("/"))), true, `missing restored V1 file ${relative}`);
    assert.deepEqual(userHashes(project), before);
  } finally {
    fs.rmSync(project, { recursive: true, force: true });
  }
});

test("activation verification stays blocked until a raw clean-session transcript is supplied", () => {
  const result = run(["verify-activation", "--target", "claude", "--json"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /Blocked/i);
  assert.doesNotMatch(result.stdout, /Runtime Verified/i);
});
