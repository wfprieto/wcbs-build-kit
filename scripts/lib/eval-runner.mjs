import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const DEFAULT_ENV_ALLOWLIST = ["PATH", "PATHEXT", "SYSTEMROOT", "WINDIR", "COMSPEC", "TMP", "TEMP", "TMPDIR", "LANG", "LC_ALL", "TERM"];
const MIN_PROTECTED_VALUE_LENGTH = 12;
const BASE64_TOKEN = /(?<![A-Za-z0-9+/=])[A-Za-z0-9+/]{8,}={0,2}(?![A-Za-z0-9+/=])/g;

function protectedVariants(value) {
  const variants = new Set([
    value,
    Buffer.from(value, "utf8").toString("base64"),
    encodeURIComponent(value),
    JSON.stringify(value).slice(1, -1)
  ]);
  return [...variants].filter(Boolean);
}

function redactContainingBase64(text, protectedValues) {
  return text.replace(BASE64_TOKEN, (token) => {
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      return protectedValues.some((value) => decoded.includes(value)) ? "[REDACTED]" : token;
    } catch {
      return token;
    }
  });
}

export function redactValues(text, protectedValues) {
  let output = String(text);
  const values = [...new Set(protectedValues.filter((value) => typeof value === "string" && value.length > 0))];
  output = redactContainingBase64(output, values);
  const variants = [...new Set(values.flatMap(protectedVariants))].sort((a, b) => b.length - a.length);
  for (const variant of variants) output = output.split(variant).join("[REDACTED]");
  return output;
}

export function buildEvalEnvironment({ credential, credentialName = "WCBS_EVAL_CREDENTIAL", extra = {}, source = process.env } = {}) {
  const env = {};
  for (const key of DEFAULT_ENV_ALLOWLIST) if (source[key] !== undefined) env[key] = source[key];
  for (const [key, value] of Object.entries(extra)) env[key] = String(value);
  if (credential !== undefined) env[credentialName] = String(credential);
  return env;
}

function atomicWrite(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporary, content, { encoding: "utf8", mode: 0o600 });
  fs.renameSync(temporary, file);
}

export async function runEval({ command, args = [], cwd = process.cwd(), transcriptPath, credential, credentialName = "WCBS_EVAL_CREDENTIAL", env = {}, timeoutMs = 120000 }) {
  if (!command) throw new Error("command is required");
  if (!transcriptPath) throw new Error("transcriptPath is required");
  const protectedValue = String(credential ?? "");
  if (protectedValue.length < MIN_PROTECTED_VALUE_LENGTH) throw new Error(`Blocked: protected credential values must be at least ${MIN_PROTECTED_VALUE_LENGTH} characters`);
  const temporaryHome = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-eval-home-"));
  const childEnv = buildEvalEnvironment({ credential: protectedValue, credentialName, extra: { ...env, HOME: temporaryHome, USERPROFILE: temporaryHome } });
  const secrets = [protectedValue];
  let stdout = "", stderr = "", settled = false;
  let child;
  const cleanup = () => fs.rmSync(temporaryHome, { recursive: true, force: true });
  const stop = (signal) => { if (child && !child.killed) child.kill(signal); };
  const handlers = new Map([["SIGINT", () => stop("SIGINT")], ["SIGTERM", () => stop("SIGTERM")]]);
  for (const [signal, handler] of handlers) process.once(signal, handler);
  try {
    const result = await new Promise((resolve, reject) => {
      child = spawn(command, args, { cwd, env: childEnv, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
      const timer = setTimeout(() => { stop("SIGTERM"); reject(new Error(`eval timed out after ${timeoutMs}ms`)); }, timeoutMs);
      child.stdout.on("data", (chunk) => { stdout += chunk.toString("utf8"); });
      child.stderr.on("data", (chunk) => { stderr += chunk.toString("utf8"); });
      child.once("error", (error) => { clearTimeout(timer); reject(error); });
      child.once("close", (code, signal) => { clearTimeout(timer); resolve({ code, signal }); });
    });
    const transcript = {
      command: [command, ...args],
      exit_code: result.code,
      signal: result.signal,
      stdout: redactValues(stdout, secrets),
      stderr: redactValues(stderr, secrets)
    };
    atomicWrite(transcriptPath, `${JSON.stringify(transcript, null, 2)}\n`);
    settled = true;
    return transcript;
  } finally {
    for (const [signal, handler] of handlers) process.removeListener(signal, handler);
    cleanup();
    if (!settled) {
      try { fs.rmSync(transcriptPath, { force: true }); } catch {}
    }
  }
}
