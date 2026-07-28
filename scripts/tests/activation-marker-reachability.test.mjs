import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (relative) => fs.readFileSync(path.join(root, ...relative.split("/")), "utf8").replace(/\r\n?/g, "\n");
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
const manifests = fs.readdirSync(path.join(root, "runtime_adapters", "manifests"))
  .filter((file) => file.endsWith(".json"))
  .map((file) => JSON.parse(read(`runtime_adapters/manifests/${file}`)));

test("every runtime entry instruction makes its exact activation marker observable", () => {
  for (const manifest of manifests) {
    const instruction = instructionFiles.get(manifest.runtime_id);
    assert.ok(instruction, `no entry instruction is mapped for ${manifest.runtime_id}`);
    const content = read(instruction);
    assert.ok(content.includes(manifest.activation_marker), `${instruction} does not contain ${manifest.activation_marker}`);
    assert.match(content, /emit this exact string/i, `${instruction} does not direct emission of the marker`);
    assert.match(content, /first response/i, `${instruction} does not define marker timing`);
  }
});

test("each runtime instruction advertises only its own activation marker", () => {
  const markers = manifests.map((manifest) => manifest.activation_marker);
  for (const manifest of manifests) {
    const content = read(instructionFiles.get(manifest.runtime_id));
    for (const marker of markers) {
      if (marker !== manifest.activation_marker) assert.equal(content.includes(marker), false, `${manifest.runtime_id} instruction leaks ${marker}`);
    }
  }
});
