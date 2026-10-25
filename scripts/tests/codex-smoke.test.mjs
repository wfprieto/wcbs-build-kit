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
const smokeScript = path.join(root, "scripts", "adapter-smoke-test.mjs");
const rendererRel = "scripts/render-session-bootstrap.mjs";
const hookRel = "hooks/codex-hooks.json";
const marker = "WCBS_KIT_ACTIVE:codex";
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

function snapshot(directory) {
  const result = [];
  function walk(current, relative = "") {
    for (const name of fs.readdirSync(current).sort()) {
      const file = path.join(current, name);
      const rel = relative ? `${relative}/${name}` : name;
      const stat = fs.lstatSync(file);
      if (stat.isDirectory()) { result.push([rel, "directory"]); walk(file, rel); }
      else if (stat.isSymbolicLink()) result.push([rel, "symlink", fs.readlinkSync(file)]);
      else result.push([rel, "file", hash(file)]);
    }
  }
  walk(directory);
  return result;
}

async function withFixture(callback) {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-codex-smoke-"));
  const destination = path.join(parent, "installed package with spaces");
  const outsideCwd = path.join(parent, "unrelated working directory");
  const sentinel = path.join(parent, "installed-renderer-executed.txt");
  fs.mkdirSync(outsideCwd);
  const execute = (script, args, options = {}) => spawnSync(process.execPath, [script, ...args], {
    cwd: outsideCwd, encoding: "utf8", timeout: 30000, maxBuffer: 512 * 1024,
    env: { ...process.env, WCBS_TEST_SMOKE_SENTINEL: sentinel }, ...options
  });
  const smoke = () => execute(smokeScript, ["--target", "codex", "--dest", destination]);
  const doctor = () => execute(installer, ["--target", "codex", "--dest", destination, "--doctor"]);
  try {
    const installed = execute(installer, ["--target", "codex", "--dest", destination, "--install"]);
    assert.equal(installed.status, 0, `${installed.stdout}${installed.stderr}`);
    const receiptFile = path.join(destination, ".wcbs", "adapter-install-manifest.json");
    const rendererFile = path.join(destination, rendererRel);
    const originalRenderer = fs.readFileSync(rendererFile, "utf8");
    const rendered = execute(rendererFile, ["--runtime", "codex", "--shape", "codex"]);
    assert.equal(rendered.status, 0, `${rendered.stdout}${rendered.stderr}`);
    const payload = JSON.parse(rendered.stdout);
    const routerBody = fs.readFileSync(path.join(destination, "skills", "using-wcbs", "SKILL.md"), "utf8").trim();
    const updateReceipt = (change) => {
      const receipt = JSON.parse(fs.readFileSync(receiptFile, "utf8"));
      change(receipt);
      fs.writeFileSync(receiptFile, `${JSON.stringify(receipt, null, 2)}\n`);
    };
    const reseal = (relative) => updateReceipt((receipt) => { receipt.file_hashes[relative] = hash(path.join(destination, relative)); });
    const clearSentinel = () => fs.rmSync(sentinel, { force: true });
    const writeRenderer = (body, seal = true) => {
      clearSentinel();
      fs.writeFileSync(rendererFile, `import { writeFileSync as markExecution } from "node:fs";\nmarkExecution(process.env.WCBS_TEST_SMOKE_SENTINEL, "installed renderer executed\\n");\n${body}\n`);
      if (seal) reseal(rendererRel);
    };
    const emitPayload = (value, prefix = "", suffix = "") => `${prefix}\nprocess.stdout.write(${JSON.stringify(JSON.stringify(value))});\n${suffix}`;
    const rejectOutput = (diagnostic) => {
      const healthy = doctor();
      assert.equal(healthy.status, 0, `${healthy.stdout}${healthy.stderr}`);
      const before = snapshot(destination);
      const result = smoke();
      assert.equal(result.error, undefined, result.error?.message);
      assert.notEqual(result.status, 0, `${result.stdout}${result.stderr}`);
      if (diagnostic) assert.match(`${result.stdout}${result.stderr}`, diagnostic);
      assert.equal(fs.readFileSync(sentinel, "utf8"), "installed renderer executed\n");
      assert.deepEqual(snapshot(destination), before, "smoke must not change installed package or its receipt");
    };
    await callback({ destination, receiptFile, rendererFile, originalRenderer, payload, routerBody, sentinel, smoke, doctor, execute, reseal, updateReceipt, writeRenderer, emitPayload, rejectOutput, clearSentinel });
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
  }
}

test("Codex smoke executes the installed renderer outside the source checkout and reports the evidence boundary", async () => {
  await withFixture(({ destination, rendererFile, originalRenderer, sentinel, smoke, execute, writeRenderer, clearSentinel }) => {
    writeRenderer(originalRenderer.replace(/^#![^\n]*\n/, ""));
    const probe = execute(rendererFile, ["--runtime", "codex", "--shape", "codex"]);
    assert.equal(probe.status, 0, `${probe.stdout}${probe.stderr}`);
    assert.match(JSON.parse(probe.stdout).hookSpecificOutput.additionalContext, /^WCBS_KIT_ACTIVE:codex$/m);
    assert.equal(fs.readFileSync(sentinel, "utf8"), "installed renderer executed\n");
    clearSentinel();
    const before = snapshot(destination);
    const result = smoke();
    assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
    assert.equal(fs.readFileSync(sentinel, "utf8"), "installed renderer executed\n");
    assert.match(`${result.stdout}${result.stderr}`, /executable package/i);
    assert.match(`${result.stdout}${result.stderr}`, /activation.*Not Run/i);
    assert.deepEqual(snapshot(destination), before);
  });
});

test("Codex smoke resolves a destination directory alias to the installed package context", async () => {
  await withFixture(({ destination, originalRenderer, sentinel, execute, writeRenderer }) => {
    writeRenderer(originalRenderer.replace(/^#![^\n]*\n/, ""));
    const alias = path.join(path.dirname(destination), "package directory alias");
    fs.symlinkSync(destination, alias, process.platform === "win32" ? "junction" : "dir");
    const before = snapshot(destination);
    const linkBefore = fs.readlinkSync(alias);
    const result = execute(smokeScript, ["--target", "codex", "--dest", alias]);
    assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
    assert.equal(fs.readFileSync(sentinel, "utf8"), "installed renderer executed\n");
    assert.deepEqual(snapshot(destination), before);
    assert.equal(fs.readlinkSync(alias), linkBefore);
  });
});

test("Codex smoke rejects invalid installed-renderer output after successful doctor verification", async (t) => {
  await withFixture(async ({ destination, payload, routerBody, writeRenderer, emitPayload, rejectOutput }) => {
    const mutate = (change) => {
      const value = structuredClone(payload);
      change(value);
      return emitPayload(value);
    };
    const context = (change) => mutate((value) => { value.hookSpecificOutput.additionalContext = change(value.hookSpecificOutput.additionalContext); });
    const cases = [
      ["nonzero renderer exit", "process.exit(23);"],
      ["invalid JSON", 'process.stdout.write("not JSON");'],
      ["no payload", ""],
      ["wrong hook event", mutate((value) => { value.hookSpecificOutput.hookEventName = "OtherEvent"; })],
      ["missing hook event", mutate((value) => { delete value.hookSpecificOutput.hookEventName; })],
      ["non-string context", mutate((value) => { value.hookSpecificOutput.additionalContext = {}; })],
      ["missing marker", context((text) => text.replaceAll(marker, ""))],
      ["wrong runtime marker", context((text) => text.replaceAll(marker, "WCBS_KIT_ACTIVE:claude"))],
      ["suffixed marker", context((text) => text.replace(marker, `${marker}-extra`))],
      ["duplicate marker", context((text) => `${text}\n${marker}`)],
      ["embedded marker", context((text) => text.replace(marker, `prefix ${marker} suffix`))],
      ["missing catalog path", context((text) => text.replaceAll(path.join(destination, "runtime_adapters", "generated", "skill-catalog.json"), "omitted catalog"))],
      ["missing tool map path", context((text) => text.replaceAll(path.join(destination, "runtime_adapters", "tool_mappings", "codex.json"), "omitted map"))],
      ["partial canonical router body", context((text) => text.replace(routerBody, "# Using WCBS"))],
      ["missing canonical router body", context((text) => text.replace(routerBody, ""))],
      ["duplicate canonical opening tag", context((text) => text.replace("<canonical-using-wcbs-skill>", "<canonical-using-wcbs-skill>\n<canonical-using-wcbs-skill>"))],
      ["duplicate canonical closing tag", context((text) => text.replace("</canonical-using-wcbs-skill>", "</canonical-using-wcbs-skill>\n</canonical-using-wcbs-skill>"))],
      ...["WCBS package root:", "Tool map:", "Core skill catalog:", "Canonical first skill:"].map((label) => [
        `unlabelled ${label} path`, context((text) => text.replace(label, "Unlabelled pointer:"))
      ]),
      ["source checkout context instead of installed package", context((text) => text.replaceAll(destination, root))],
      ["debug output on stdout", emitPayload(payload, 'console.log("debug stdout");')],
      ["debug output on stderr", emitPayload(payload, 'console.error("debug stderr");')]
    ];
    for (const [label, body] of cases) await t.test(label, () => {
      writeRenderer(body);
      rejectOutput();
    });
  });
});

test("Codex smoke rejects an oversized otherwise-valid payload with a bounded output error", async () => {
  await withFixture(({ payload, writeRenderer, emitPayload, rejectOutput }) => {
    const oversized = structuredClone(payload);
    oversized.hookSpecificOutput.additionalContext += `\n${"x".repeat(300 * 1024)}`;
    writeRenderer(emitPayload(oversized));
    rejectOutput(/buffer|output.*(?:limit|budget)|ENOBUFS|too large/i);
  });
});

test("Codex smoke enforces its own renderer timeout", async () => {
  await withFixture(({ writeRenderer, rejectOutput }) => {
    writeRenderer('process.on("SIGTERM", () => markExecution(process.env.WCBS_TEST_SMOKE_SENTINEL, "SIGTERM intercepted\\n"));\nsetTimeout(() => process.exit(0), 12000);\nsetInterval(() => {}, 1000);');
    rejectOutput(/timeout|timed out|ETIMEDOUT/i);
  });
});

test("Codex smoke rejects an empty installed canonical skill even when its matching payload is empty", async () => {
  await withFixture(({ destination, payload, routerBody, reseal, writeRenderer, emitPayload, rejectOutput }) => {
    const relative = "skills/using-wcbs/SKILL.md";
    fs.writeFileSync(path.join(destination, relative), "\n \n");
    reseal(relative);
    const emptyBodyPayload = structuredClone(payload);
    emptyBodyPayload.hookSpecificOutput.additionalContext = emptyBodyPayload.hookSpecificOutput.additionalContext.replace(routerBody, "");
    writeRenderer(emitPayload(emptyBodyPayload));
    rejectOutput();
  });
});

test("Codex smoke rejects a redirected ownership receipt before parsing outside content", async () => {
  await withFixture(({ destination, receiptFile, originalRenderer, sentinel, smoke, writeRenderer }) => {
    writeRenderer(originalRenderer.replace(/^#![^\n]*\n/, ""));
    const outside = path.join(path.dirname(destination), "outside-receipt.json");
    fs.renameSync(receiptFile, outside);
    fs.writeFileSync(outside, "outside content must not be parsed\n");
    fs.symlinkSync(outside, receiptFile, "file");
    const before = snapshot(destination);
    const result = smoke();
    const output = `${result.stdout}${result.stderr}`;
    assert.notEqual(result.status, 0, output);
    assert.match(output, /symbolic.link/i);
    assert.doesNotMatch(output, /outside content must not be parsed/);
    assert.equal(fs.existsSync(sentinel), false);
    assert.deepEqual(snapshot(destination), before);
    assert.equal(fs.readFileSync(outside, "utf8"), "outside content must not be parsed\n");
  });
});

test("Codex smoke rejects unsafe or incomplete packages before executing any hook", async (t) => {
  const cases = [
    ["unsealed renderer modification", ({ rendererFile, receiptFile, originalRenderer, writeRenderer }) => {
      writeRenderer(`${originalRenderer.replace(/^#![^\n]*\n/, "")}\n// distinct unsealed test modification`, false);
      const receipt = JSON.parse(fs.readFileSync(receiptFile, "utf8"));
      assert.notEqual(hash(rendererFile), receipt.file_hashes[rendererRel], "fixture must actually change renderer bytes without resealing");
    }],
    ...[hookRel, rendererRel].map((relative) => [`missing ${relative} omitted from receipt`, ({ destination, updateReceipt }) => {
      fs.rmSync(path.join(destination, relative));
      updateReceipt((receipt) => {
        receipt.files = receipt.files.filter((file) => file !== relative);
        delete receipt.file_hashes[relative];
      });
    }]),
    ["unsafe hook command", ({ destination, reseal }) => {
      const file = path.join(destination, hookRel);
      const config = JSON.parse(fs.readFileSync(file, "utf8"));
      config.hooks.SessionStart[0].hooks[0].command += " && echo unexpected";
      fs.writeFileSync(file, `${JSON.stringify(config)}\n`);
      reseal(hookRel);
    }],
    ["duplicate SessionStart commands", ({ destination, reseal }) => {
      const file = path.join(destination, hookRel);
      const config = JSON.parse(fs.readFileSync(file, "utf8"));
      config.hooks.SessionStart[0].hooks.push(structuredClone(config.hooks.SessionStart[0].hooks[0]));
      fs.writeFileSync(file, `${JSON.stringify(config)}\n`);
      reseal(hookRel);
    }]
  ];
  for (const [label, change] of cases) await t.test(label, async () => {
    await withFixture((fixture) => {
      const { destination, originalRenderer, sentinel, smoke, writeRenderer } = fixture;
      writeRenderer(originalRenderer.replace(/^#![^\n]*\n/, ""));
      change(fixture);
      const before = snapshot(destination);
      const result = smoke();
      assert.equal(result.error, undefined, result.error?.message);
      assert.notEqual(result.status, 0, `${result.stdout}${result.stderr}`);
      assert.equal(fs.existsSync(sentinel), false, "package validation must precede hook execution");
      assert.deepEqual(snapshot(destination), before);
    });
  });
});
