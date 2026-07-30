#!/usr/bin/env node
/**
 * Replay the native Codex CLI marketplace lifecycle against an isolated,
 * disposable profile. This checks Codex's real parser and installer; it does
 * not invoke a model and therefore does not claim runtime activation.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const codex = process.env.WCBS_CODEX_BIN || "codex";
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-codex-marketplace-"));
const project = path.join(tmp, "ordinary-project");
const pluginDir = path.join(project, "runtime-plugins", "wcbs-codex");
const codexHome = path.join(tmp, "codex-home");
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

function run(binary, arguments_, options = {}) {
  const result = spawnSync(binary, arguments_, { cwd: root, encoding: "utf8", ...options });
  if (result.error) throw new Error(`Unable to start ${binary}: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${binary} ${arguments_.join(" ")} failed (${result.status}):\n${result.stdout}${result.stderr}`);
  return result;
}
function jsonRun(arguments_) {
  const result = run(codex, arguments_, { env: { ...process.env, CODEX_HOME: codexHome } });
  try { return JSON.parse(result.stdout); }
  catch { throw new Error(`Codex returned non-JSON output for ${arguments_.join(" ")}:\n${result.stdout}${result.stderr}`); }
}

try {
  const version = run(codex, ["--version"]).stdout.trim();
  fs.mkdirSync(path.join(project, "src"), { recursive: true });
  fs.writeFileSync(path.join(project, "README.md"), "# Ordinary project\n", "utf8");
  fs.writeFileSync(path.join(project, "package.json"), "{\"name\":\"ordinary-project\"}\n", "utf8");
  fs.writeFileSync(path.join(project, "src", "index.js"), "export const userOwned = true;\n", "utf8");
  fs.mkdirSync(codexHome, { recursive: true });
  const userFiles = ["README.md", "package.json", "src/index.js"];
  const before = Object.fromEntries(userFiles.map(relative => [relative, hash(path.join(project, ...relative.split("/")))]));

  run(process.execPath, ["scripts/wcbs.mjs", "install", "--target", "codex", "--plugin-dir", pluginDir, "--json"]);
  const marketplace = jsonRun(["plugin", "marketplace", "add", pluginDir, "--json"]);
  if (marketplace.marketplaceName !== "wcbs-build-kit") throw new Error(`Unexpected marketplace name: ${marketplace.marketplaceName}`);
  const available = jsonRun(["plugin", "list", "--available", "--json"]);
  if (!available.available?.some(plugin => plugin.pluginId === "wcbs-build-kit@wcbs-build-kit" && plugin.source?.source === "local")) throw new Error("Codex did not expose the WCBS local plugin as available.");
  const installed = jsonRun(["plugin", "add", "wcbs-build-kit@wcbs-build-kit", "--json"]);
  if (installed.pluginId !== "wcbs-build-kit@wcbs-build-kit") throw new Error(`Unexpected installed plugin: ${installed.pluginId}`);
  const listed = jsonRun(["plugin", "list", "--json"]);
  if (!listed.installed?.some(plugin => plugin.pluginId === "wcbs-build-kit@wcbs-build-kit" && plugin.enabled === true)) throw new Error("Codex did not report WCBS as enabled after installation.");
  jsonRun(["plugin", "remove", "wcbs-build-kit@wcbs-build-kit", "--json"]);
  jsonRun(["plugin", "marketplace", "remove", "wcbs-build-kit", "--json"]);
  run(process.execPath, ["scripts/wcbs.mjs", "uninstall", "--plugin-dir", pluginDir, "--json"]);
  if (fs.existsSync(pluginDir)) throw new Error("WCBS uninstall left the owned plugin bundle behind.");
  for (const [relative, expected] of Object.entries(before)) {
    const actual = hash(path.join(project, ...relative.split("/")));
    if (actual !== expected) throw new Error(`Native marketplace replay altered user-owned file: ${relative}`);
  }
  console.log(`PASS: ${version} marketplace add/list/add/remove replay passed; the ordinary project stayed byte-identical.`);
} catch (error) {
  console.error(`BLOCKED: ${error.message}`);
  process.exitCode = 1;
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
