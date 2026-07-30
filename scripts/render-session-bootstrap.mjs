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
  if (runtime === "claude") return "claude";
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

if (!fs.existsSync(registryPath) || !fs.existsSync(templatePath)) fail("canonical V2 bootstrap inputs are unreadable");
let registry;
try {
  registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
} catch (error) {
  fail(`adapter registry is invalid: ${error.message}`);
}
const adapter = registry.adapters?.find((candidate) => candidate.runtime_id === runtime);
if (!adapter) fail(`unknown runtime: ${runtime}`);
if (!adapter.manifest?.activation_marker || adapter.bootstrap?.source_skill !== "using-wcbs") fail(`runtime ${runtime} has incomplete bootstrap metadata`);

let context = fs.readFileSync(templatePath, "utf8").replace("{{activation_marker}}", adapter.manifest.activation_marker).trim();
context += `\n\nActive runtime: ${runtime}. Tool map: ${adapter.manifest.tool_mapping_path}.`;
if (context.includes("{{activation_marker}}") || !context.includes(adapter.manifest.activation_marker)) fail(`runtime ${runtime} bootstrap did not transfer its activation marker`);
const occurrences = context.split(adapter.manifest.activation_marker).length - 1;
if (occurrences !== 1) fail(`runtime ${runtime} bootstrap contains ${occurrences} activation markers; expected one`);

let payload;
if (shape === "claude") payload = { hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context } };
else if (shape === "cursor") payload = { additional_context: context };
else if (shape === "sdk") payload = { additionalContext: context };
else fail(`invalid hook output shape: ${shape}`);

console.log(JSON.stringify(payload));
