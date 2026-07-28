import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (relative) => fs.readFileSync(path.join(root, ...relative.split("/")), "utf8");

test("Cursor package declares the tested session-start bridge shape", () => {
  const plugin = JSON.parse(read(".cursor-plugin/plugin.json"));
  const hooks = JSON.parse(read("hooks/hooks-cursor.json"));
  assert.equal(plugin.hooks, "./hooks/hooks-cursor.json");
  assert.deepEqual(hooks.hooks.sessionStart, [{ command: "./hooks/run-hook.cmd session-start" }]);
});

test("Codex package is a self-contained local marketplace with a resolvable plugin source", () => {
  const plugin = JSON.parse(read(".codex-plugin/plugin.json"));
  const marketplace = JSON.parse(read(".agents/plugins/marketplace.json"));
  assert.equal(plugin.name, "wcbs-build-kit");
  assert.ok(plugin.interface.defaultPrompt.length <= 3, "Codex accepts at most three default prompts");
  for (const prompt of plugin.interface.defaultPrompt) assert.ok(prompt.length <= 128, `Codex default prompt exceeds 128 characters: ${prompt}`);
  assert.equal(marketplace.plugins[0].name, plugin.name);
  assert.deepEqual(marketplace.plugins[0].source, { source: "local", path: "./" });
  assert.equal(marketplace.plugins[0].policy.installation, "AVAILABLE");
  assert.equal(fs.existsSync(path.join(root, ".codex-plugin", "plugin.json")), true);
  const registry = JSON.parse(read("runtime_adapters/adapter-registry.yaml"));
  const codex = registry.adapters.find((adapter) => adapter.runtime_id === "codex");
  assert.equal(codex.packaging.marketplace_path, ".agents/plugins");
});

test("Kimi package requests the using-wcbs skill and an observable first-response marker", () => {
  const plugin = JSON.parse(read(".kimi-plugin/plugin.json"));
  assert.equal(plugin.sessionStart.skill, "using-wcbs");
  assert.match(plugin.skillInstructions, /WCBS_KIT_ACTIVE:kimi/);
  assert.match(plugin.skillInstructions, /emit this exact string/i);
  assert.match(plugin.skillInstructions, /first response/i);
});

test("OpenCode plugin loads the generated bootstrap into a live plugin hook contract", async () => {
  const module = await import(pathToFileURL(path.join(root, ".opencode", "plugins", "wcbs.js")).href);
  const plugin = await module.WCBSPlugin();
  const config = {};
  await plugin.config(config);
  assert.equal(config.skills.paths.length, 1);
  const output = { messages: [{ info: { role: "user" }, parts: [{ type: "text", text: "hello" }] }] };
  await plugin["experimental.chat.messages.transform"]({}, output);
  assert.match(output.messages[0].parts[0].text, /WCBS_KIT_ACTIVE:opencode/);
  await plugin["experimental.chat.messages.transform"]({}, output);
  assert.equal(output.messages[0].parts.filter((part) => part.text.includes("WCBS_KIT_ACTIVE:opencode")).length, 1);
});

test("Pi extension is a package-contract adapter and defers runtime support claims", () => {
  const source = read(".pi/extensions/wcbs.ts");
  assert.match(source, /WCBS_KIT_ACTIVE:pi/);
  assert.match(source, /resources_discover/);
  assert.match(source, /session_start/);
  assert.match(source, /using-wcbs-bootstrap\.md/);
  const registry = JSON.parse(read("runtime_adapters/adapter-registry.yaml"));
  const pi = registry.adapters.find((adapter) => adapter.runtime_id === "pi");
  assert.equal(pi.support.verified, "Not Run");
  assert.equal(pi.support.label, "Experimental");
});
