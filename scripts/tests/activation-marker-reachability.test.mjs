import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (relative) => fs.readFileSync(path.join(root, ...relative.split("/")), "utf8").replace(/\r\n?/g, "\n");
const registry = JSON.parse(read("runtime_adapters/adapter-registry.yaml"));
const instructionFiles = new Map([
  ["claude", "CLAUDE.md"],
  ["codex", "AGENTS.md"],
  ["cursor", ".cursor/rules/super-build-kit.mdc"],
  ["gemini", "GEMINI.md"],
  ["generic-agent", "BOOTSTRAP.md"],
  ["github-copilot", ".github/copilot-instructions.md"],
  ["manus", "Manus.md"],
  ["replit", "REPLIT.md"]
]);
const nativeArtifacts = new Map([
  ["kimi", ".kimi-plugin/plugin.json"],
  ["opencode", ".opencode/plugins/wcbs.js"],
  ["pi", ".pi/extensions/wcbs.ts"]
]);

test("every registry adapter has one observable activation route", () => {
  for (const adapter of registry.adapters) {
    const manifest = adapter.manifest;
    const instruction = instructionFiles.get(manifest.runtime_id);
    const native = nativeArtifacts.get(manifest.runtime_id);
    assert.ok(instruction || native, `no activation artifact is mapped for ${manifest.runtime_id}`);
    const artifact = instruction ?? native;
    const content = read(artifact);
    assert.ok(content.includes(manifest.activation_marker), `${artifact} does not contain ${manifest.activation_marker}`);
    assert.match(content, /using-wcbs|using-wcbs-bootstrap|BOOTSTRAP\.md|WCBS EOS Kernel/i, `${artifact} does not route through WCBS bootstrap`);
    if (instruction || manifest.runtime_id === "kimi") {
      assert.match(content, /emit this exact string/i, `${artifact} does not direct emission of the marker`);
      assert.match(content, /first response/i, `${artifact} does not define marker timing`);
    }
  }
});

test("activation artifacts do not leak a different runtime marker", () => {
  const markers = registry.adapters.map((adapter) => adapter.manifest.activation_marker);
  for (const adapter of registry.adapters) {
    const artifact = instructionFiles.get(adapter.runtime_id) ?? nativeArtifacts.get(adapter.runtime_id);
    const content = read(artifact);
    for (const marker of markers) {
      if (marker !== adapter.manifest.activation_marker) {
        assert.equal(content.includes(marker), false, `${artifact} leaks ${marker}`);
      }
    }
  }
});
