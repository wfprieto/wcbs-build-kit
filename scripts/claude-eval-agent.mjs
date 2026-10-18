#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";

const ARMS = new Set(["neutral", "wcbs", "superpowers"]);
const TOOLS = "Read,Edit,Write,Bash,Skill,Glob,Grep";
const ALLOWED_TOOLS = "Read,Edit,Write,Skill,Glob,Grep,Bash(node --test*),Bash(npm test*),Bash(git status*)";

export function buildClaudeInvocation({ executable, executableSha256, arm, workspace, wcbsPlugin, superpowersPlugin, model, prompt }) {
  if (!ARMS.has(arm)) throw new Error(`Blocked: unknown evaluation arm: ${arm}`);
  if (!path.isAbsolute(executable) || !fs.statSync(executable).isFile()) throw new Error("Blocked: Claude executable must be an existing absolute file.");
  const actualHash = crypto.createHash("sha256").update(fs.readFileSync(executable)).digest("hex");
  if (actualHash !== executableSha256.toLowerCase()) throw new Error("Blocked: Claude executable hash mismatch.");
  if (!path.isAbsolute(workspace) || !fs.statSync(workspace).isDirectory()) throw new Error("Blocked: workspace must be an existing absolute directory.");
  if (typeof model !== "string" || !/^claude-[a-z0-9-]+-\d/.test(model)) throw new Error("Blocked: model must use a full pinned model ID.");
  if (typeof prompt !== "string" || !prompt.trim()) throw new Error("Blocked: prompt is required.");

  const args = [
    "-p", prompt,
    "--model", model,
    "--effort", "medium",
    "--output-format", "stream-json",
    "--verbose",
    "--no-session-persistence",
    "--max-budget-usd", "2.00",
    "--permission-mode", "dontAsk",
    "--strict-mcp-config",
    "--no-chrome",
    "--setting-sources", "",
    "--tools", TOOLS,
    "--allowedTools", ALLOWED_TOOLS
  ];
  const plugin = arm === "wcbs" ? wcbsPlugin : arm === "superpowers" ? superpowersPlugin : null;
  if (plugin) {
    if (!path.isAbsolute(plugin) || !fs.existsSync(plugin) || !fs.statSync(plugin).isDirectory()) throw new Error("Blocked: assigned plugin directory is missing or invalid.");
    args.push("--plugin-dir", plugin);
  }
  return { command: executable, args };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const { values } = parseArgs({
      options: {
        "claude-exe": { type: "string" },
        "claude-sha256": { type: "string" },
        arm: { type: "string" },
        workspace: { type: "string" },
        "plugin-dir": { type: "string" },
        "superpowers-dir": { type: "string" },
        model: { type: "string" },
        prompt: { type: "string" }
      },
      strict: true
    });
    const invocation = buildClaudeInvocation({
      executable: values["claude-exe"],
      executableSha256: values["claude-sha256"],
      arm: values.arm,
      workspace: values.workspace,
      wcbsPlugin: values["plugin-dir"],
      superpowersPlugin: values["superpowers-dir"],
      model: values.model,
      prompt: values.prompt
    });
    const result = spawnSync(invocation.command, invocation.args, { cwd: values.workspace, env: process.env, stdio: "inherit", windowsHide: true });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
