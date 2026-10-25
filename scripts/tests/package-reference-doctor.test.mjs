import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const pluginPath = ".codex-plugin/plugin.json";
const hookPath = "hooks/codex-hooks.json";
const rendererPath = "scripts/render-session-bootstrap.mjs";
const runtimePath = "runtime_adapters/manifests/codex.json";
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

function snapshot(directory) {
  const entries = [];
  function walk(current, relative = "") {
    for (const name of fs.readdirSync(current).sort()) {
      const file = path.join(current, name);
      const rel = relative ? `${relative}/${name}` : name;
      const stat = fs.lstatSync(file);
      if (stat.isSymbolicLink()) entries.push([rel, "link", fs.readlinkSync(file)]);
      else if (stat.isDirectory()) { entries.push([rel, "directory"]); walk(file, rel); }
      else entries.push([rel, "file", hash(file)]);
    }
  }
  walk(directory);
  return entries;
}

async function withFixture(mode, callback, target = "codex") {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-package-reference-"));
  const directory = path.join(parent, "installed package");
  const receiptPath = path.join(directory, ".wcbs", mode === "v1" ? "adapter-install-manifest.json" : "v2-plugin-install-manifest.json");
  const command = (args) => spawnSync(process.execPath, args, {
    cwd: root, encoding: "utf8", env: { ...process.env, WCBS_TEST_HOOK_SENTINEL: path.join(parent, "hook-executed.txt") }
  });
  const doctor = () => command(mode === "v1"
    ? ["scripts/install-adapter.mjs", "--target", target, "--dest", directory, "--doctor"]
    : ["scripts/wcbs.mjs", "doctor", "--plugin-dir", directory, "--json"]);
  const status = () => command(["scripts/wcbs.mjs", "status", "--plugin-dir", directory, "--json"]);
  const uninstall = () => command(mode === "v1"
    ? ["scripts/install-adapter.mjs", "--target", target, "--dest", directory, "--uninstall"]
    : ["scripts/wcbs.mjs", "uninstall", "--plugin-dir", directory, "--json"]);
  const updateReceipt = (change) => {
    const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
    change(receipt);
    fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  };
  const reseal = (relative) => updateReceipt((receipt) => {
    const digest = hash(path.join(directory, relative));
    if (mode === "v1") receipt.file_hashes[relative] = digest;
    else receipt.files.find((entry) => entry.path === relative).sha256 = digest;
  });
  const changeJson = (relative, change) => {
    const file = path.join(directory, relative);
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    change(data);
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
    reseal(relative);
  };
  const expectRejected = (check = doctor, diagnostic = /package reference|integrity|symbolic.link|missing|invalid|malformed|unsafe|unowned/i) => {
    const before = snapshot(parent);
    const result = check();
    const output = `${result.stdout}${result.stderr}`;
    assert.notEqual(result.status, 0, output);
    assert.match(output, diagnostic, output);
    assert.deepEqual(snapshot(parent), before, "doctor must not mutate package, receipt, or outside files");
    assert.equal(fs.existsSync(path.join(parent, "hook-executed.txt")), false, "doctor must not execute hook commands");
  };
  try {
    const installed = command(mode === "v1"
      ? ["scripts/install-adapter.mjs", "--target", target, "--dest", directory, "--install"]
      : ["scripts/wcbs.mjs", "install", "--target", target, "--plugin-dir", directory, "--json"]);
    assert.equal(installed.status, 0, `${installed.stdout}${installed.stderr}`);
    await callback({ parent, directory, receiptPath, doctor, status, uninstall, updateReceipt, reseal, changeJson, expectRejected });
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
  }
}

for (const mode of ["v1", "v2"]) {
  test(`${mode} doctor accepts intact Codex package-relative references without claiming runtime activation`, async () => {
    await withFixture(mode, ({ parent, doctor }) => {
      const before = snapshot(parent);
      const result = doctor();
      assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
      if (mode === "v2") assert.equal(JSON.parse(result.stdout).runtime_state, "Not Run");
      assert.deepEqual(snapshot(parent), before);
    });
  });

  for (const relative of [hookPath, rendererPath]) {
    test(`${mode} doctor rejects a required ${relative} omitted from both payload and receipt`, async () => {
      await withFixture(mode, ({ directory, updateReceipt, expectRejected }) => {
        const file = path.join(directory, relative);
        fs.rmSync(file);
        updateReceipt((receipt) => {
          if (mode === "v1") {
            receipt.files = receipt.files.filter((entry) => entry !== relative);
            delete receipt.file_hashes[relative];
          } else receipt.files = receipt.files.filter((entry) => entry.path !== relative);
        });
        let current = path.dirname(file);
        while (current !== directory && fs.readdirSync(current).length === 0) {
          fs.rmdirSync(current);
          current = path.dirname(current);
        }
        expectRejected();
      });
    });
  }

  test(`${mode} doctor validates manifest paths even when ownership hashes match`, async (t) => {
    await withFixture(mode, async (fixture) => {
      const { parent, directory, receiptPath, changeJson, expectRejected } = fixture;
      const manifestFile = path.join(directory, pluginPath);
      const originalManifest = fs.readFileSync(manifestFile);
      const originalReceipt = fs.readFileSync(receiptPath);
      const cases = [
        ["hooks", undefined, "missing hook reference"], ["hooks", null, "null hook reference"],
        ["hooks", {}, "non-string hook reference"], ["hooks", "", "empty hook reference"],
        ["hooks", "../outside.json", "parent escape"], ["hooks", path.join(parent, "outside.json"), "absolute path"],
        ["hooks", "C:/outside.json", "Windows absolute path"], ["hooks", "C:outside.json", "Windows drive-relative path"],
        ["hooks", "https://example.invalid/hooks.json", "URL"], ["hooks", ".\\hooks\\codex-hooks.json", "backslash path"],
        ["skills", null, "invalid skills reference"], ["skills", "./missing-skills/", "missing skills directory"],
        ["skills", "./runtime_adapters/", "owned directory without a skill entry"]
      ];
      fs.writeFileSync(path.join(parent, "outside.json"), "outside sentinel\n");
      for (const [field, value, label] of cases) {
        await t.test(label, () => {
          try {
            changeJson(pluginPath, (manifest) => { if (value === undefined) delete manifest[field]; else manifest[field] = value; });
            expectRejected();
          } finally {
            fs.writeFileSync(manifestFile, originalManifest);
            fs.writeFileSync(receiptPath, originalReceipt);
          }
        });
      }
    });
  });

  test(`${mode} doctor validates declared renderer commands without executing them`, async (t) => {
    await withFixture(mode, async ({ directory, receiptPath, changeJson, expectRejected }) => {
      const originalHook = fs.readFileSync(path.join(directory, hookPath));
      const originalReceipt = fs.readFileSync(receiptPath);
      const cases = [
        ["missing renderer", 'node "${PLUGIN_ROOT}/scripts/missing-renderer.mjs" --runtime codex --shape codex'],
        ["escaping renderer", 'node "${PLUGIN_ROOT}/../outside.mjs" --runtime codex --shape codex'],
        ["wrong owned renderer", 'node "${PLUGIN_ROOT}/LICENSE" --runtime codex --shape codex'],
        ["arbitrary command", `node -e "require('node:fs').writeFileSync(process.env.WCBS_TEST_HOOK_SENTINEL,'executed')"`]
      ];
      for (const [label, command] of cases) await t.test(label, () => {
        try {
          changeJson(hookPath, (hook) => { hook.hooks.SessionStart[0].hooks[0].command = command; });
          expectRejected();
        } finally {
          fs.writeFileSync(path.join(directory, hookPath), originalHook);
          fs.writeFileSync(receiptPath, originalReceipt);
        }
      });
    });
  });

  test(`${mode} doctor validates active runtime manifest references`, async (t) => {
    await withFixture(mode, async ({ directory, receiptPath, changeJson, expectRejected }) => {
      const originalReceipt = fs.readFileSync(receiptPath);
      for (const [relative, field, value] of [
        [runtimePath, "bootstrap_path", "../outside.json"],
        [runtimePath, "tool_mapping_path", "runtime_adapters/tool_mappings/missing.json"],
        [runtimePath, "tool_mapping_path", runtimePath],
        [runtimePath, "runtime_id", "claude"],
        ["runtime_adapters/tool_mappings/codex.json", "runtime_id", "claude"]
      ]) {
        await t.test(`${relative}: ${field}=${value}`, () => {
          const original = fs.readFileSync(path.join(directory, relative));
          try {
            changeJson(relative, (manifest) => { manifest[field] = value; });
            expectRejected();
          } finally {
            fs.writeFileSync(path.join(directory, relative), original);
            fs.writeFileSync(receiptPath, originalReceipt);
          }
        });
      }
    });
  });

  for (const redirect of ["file", "directory"]) {
    test(`${mode} doctor rejects ${redirect} symlink redirects without mutation`, async () => {
      await withFixture(mode, ({ parent, directory, expectRejected }) => {
        const original = path.join(directory, redirect === "file" ? hookPath : "hooks");
        const outside = path.join(parent, `outside-${redirect}`);
        fs.renameSync(original, outside);
        fs.symlinkSync(outside, original, redirect === "directory" ? (process.platform === "win32" ? "junction" : "dir") : "file");
        expectRejected();
      });
    });
  }
}

test("V1 doctor permits unrelated user files beside the owned skills directory", async () => {
  await withFixture("v1", ({ parent, directory, doctor }) => {
    fs.writeFileSync(path.join(directory, "skills", "user-file.txt"), "user sentinel\n");
    const before = snapshot(parent);
    const result = doctor();
    assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
    assert.deepEqual(snapshot(parent), before);
  });
});

test("V2 package reference failure blocks doctor and status but preserves safe ownership-based uninstall", async () => {
  await withFixture("v2", ({ parent, directory, status, uninstall, changeJson, expectRejected }) => {
    const outside = path.join(parent, "outside.json");
    fs.writeFileSync(outside, "outside sentinel\n");
    changeJson(pluginPath, (manifest) => { manifest.hooks = "../outside.json"; });
    expectRejected();
    expectRejected(status);
    const result = uninstall();
    assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
    assert.equal(fs.existsSync(directory), false);
    assert.equal(fs.readFileSync(outside, "utf8"), "outside sentinel\n");
  });
});

test("V2 doctor rejects a symlinked ownership receipt before parsing outside content", async () => {
  await withFixture("v2", ({ parent, receiptPath, doctor, expectRejected }) => {
    const outside = path.join(parent, "outside-receipt.json");
    fs.renameSync(receiptPath, outside);
    fs.writeFileSync(outside, "outside content must not be parsed\n");
    fs.symlinkSync(outside, receiptPath, "file");
    expectRejected(doctor, /symbolic.link/i);
  });
});

for (const { mode, target, relative, label, mutate } of [
  {
    mode: "v1", target: "claude", relative: ".claude-plugin/plugin.json", label: "escaping skills reference",
    mutate: (config) => { config.skills = "../outside-skills"; }
  },
  {
    mode: "v1", target: "claude", relative: "hooks/hooks.json", label: "wrong owned bridge",
    mutate: (config) => { config.hooks.SessionStart[0].hooks[0].command = '"${CLAUDE_PLUGIN_ROOT}/LICENSE" session-start --runtime claude'; }
  },
  {
    mode: "v1", target: "cursor", relative: ".cursor/hooks.json", label: "missing native command",
    mutate: (config) => { delete config.hooks.sessionStart[0].command; }
  },
  {
    mode: "v1", target: "cursor", relative: ".cursor/hooks.json", label: "malformed native command",
    mutate: (config) => { config.hooks.sessionStart[0].command = "./hooks/run-hook session-start --runtime cursor && echo unexpected"; }
  },
  {
    mode: "v1", target: "cursor", relative: ".cursor/hooks.json", label: "wrong owned bridge",
    mutate: (config) => { config.hooks.sessionStart[0].command = "./LICENSE session-start --runtime cursor"; }
  },
  {
    mode: "v1", target: "github-copilot", relative: ".github/hooks/wcbs-session-start.json", label: "escaping hook cwd",
    mutate: (config) => { config.hooks.sessionStart[0].cwd = "../"; }
  },
  {
    mode: "v1", target: "github-copilot", relative: ".github/hooks/wcbs-session-start.json", label: "non-root hook cwd",
    mutate: (config) => { config.hooks.sessionStart[0].cwd = "./skills"; }
  },
  {
    mode: "v1", target: "github-copilot", relative: ".github/hooks/wcbs-session-start.json", label: "invalid PowerShell command",
    mutate: (config) => { config.hooks.sessionStart[0].powershell = "cmd.exe /c echo unexpected"; }
  },
  {
    mode: "v2", target: "kimi", relative: ".kimi-plugin/plugin.json", label: "missing SessionStart skill",
    mutate: (config) => { delete config.sessionStart.skill; }
  },
  {
    mode: "v2", target: "codex", relative: ".agents/plugins/marketplace.json", label: "escaping local marketplace source",
    mutate: (config) => { config.plugins[0].source.path = "../"; }
  },
  {
    mode: "v2", target: "codex", relative: ".agents/plugins/marketplace.json", label: "nested local marketplace source without a plugin",
    mutate: (config) => { config.plugins[0].source.path = "./skills"; }
  },
  ...["v1", "v2"].flatMap((mode) => [
    {
      mode, target: "claude", relative: ".claude-plugin/plugin.json", label: "explicit Claude hooks registration",
      mutate: (config) => { config.hooks = "./hooks/missing.json"; }
    },
    {
      mode, target: "claude", relative: ".claude-plugin/plugin.json", label: "null explicit Claude hooks registration",
      mutate: (config) => { config.hooks = null; }
    }
  ])
]) {
  test(`${mode} ${target} doctor rejects ${label}`, async () => {
    await withFixture(mode, ({ doctor, changeJson, expectRejected }) => {
      const intact = doctor();
      assert.equal(intact.status, 0, `${intact.stdout}${intact.stderr}`);
      changeJson(relative, mutate);
      expectRejected();
    }, target);
  });
}
