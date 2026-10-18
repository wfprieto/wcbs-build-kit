#!/usr/bin/env node
/** Render one exact runtime hook payload from the V2 adapter registry. */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(name);
  if (index >= 0) return args[index + 1] ?? null;
  const prefixed = args.find((arg) => arg.startsWith(`${name}=`));
  return prefixed ? prefixed.slice(name.length + 1) : null;
};

function derivedRuntime() {
  if (process.env.CURSOR_PLUGIN_ROOT) return "cursor";
  if (process.env.CLAUDE_PLUGIN_ROOT && !process.env.COPILOT_CLI) return "claude";
  return "github-copilot";
}

function derivedShape(runtime) {
  if (runtime === "cursor") return "cursor";
  if (runtime === "claude" || runtime === "codex") return runtime;
  return "sdk";
}

function fail(message) {
  console.error(`BLOCKED: ${message}`);
  process.exit(1);
}

const runtime = option("--runtime") ?? derivedRuntime();
const shape = option("--shape") ?? derivedShape(runtime);
const registryPath = path.join(root, "runtime_adapters", "adapter-registry.yaml");
const templatePath = path.join(root, "runtime_adapters", "generated", "using-wcbs-bootstrap.md");
const routerPath = path.join(root, "skills", "using-wcbs", "SKILL.md");
const catalogPath = path.join(root, "runtime_adapters", "generated", "skill-catalog.json");

for (const file of [registryPath, templatePath, routerPath, catalogPath]) {
  if (!fs.existsSync(file) || !fs.lstatSync(file).isFile()) fail("canonical V2 bootstrap inputs are unreadable");
}
let registry;
try {
  registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
} catch (error) {
  fail(`adapter registry is invalid: ${error.message}`);
}
const adapter = registry.adapters?.find((candidate) => candidate.runtime_id === runtime);
if (!adapter) fail(`unknown runtime: ${runtime}`);
if (!adapter.manifest?.activation_marker || adapter.bootstrap?.source_skill !== "using-wcbs") fail(`runtime ${runtime} has incomplete bootstrap metadata`);
const toolMapPath = path.resolve(root, adapter.manifest.tool_mapping_path);
if (!toolMapPath.startsWith(`${root}${path.sep}`) || !fs.existsSync(toolMapPath) || !fs.lstatSync(toolMapPath).isFile()) fail(`runtime ${runtime} tool map is unreadable`);

let context = fs.readFileSync(templatePath, "utf8").replace("{{activation_marker}}", adapter.manifest.activation_marker).trim();
context += `\n\nActive runtime: ${runtime}. WCBS package root: ${root}.`;
context += `\nTool map: ${toolMapPath}. Core skill catalog: ${catalogPath}.`;
context += `\nCanonical first skill: ${routerPath}. It is loaded below; apply its hard gate before project work. For a task-specific skill, use the runtime's native skill invocation or read its SKILL.md under ${path.join(root, "skills")}. If neither is available, stop with Blocked.`;
context += `\n\n<canonical-using-wcbs-skill>\n${fs.readFileSync(routerPath, "utf8").trim()}\n</canonical-using-wcbs-skill>`;
if (context.includes("{{activation_marker}}") || !context.includes(adapter.manifest.activation_marker)) fail(`runtime ${runtime} bootstrap did not transfer its activation marker`);
const occurrences = context.split(adapter.manifest.activation_marker).length - 1;
if (occurrences !== 1) fail(`runtime ${runtime} bootstrap contains ${occurrences} activation markers; expected one`);

let payload;
if (shape === "claude" || shape === "codex") payload = { hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context } };
else if (shape === "cursor") payload = { additional_context: context };
else if (shape === "sdk") payload = { additionalContext: context };
else fail(`invalid hook output shape: ${shape}`);

console.log(JSON.stringify(payload));
