import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const isWindows = process.platform === "win32";

function read(relative) {
  return fs.readFileSync(path.join(root, ...relative.split("/")), "utf8");
}

function readJson(relative) {
  return JSON.parse(read(relative));
}

function runHook({ args = ["session-start"], env = {}, cwd = root } = {}) {
  const result = spawnSync(path.join(root, "hooks", "run-hook"), args, {
    cwd,
    encoding: "utf8",
    env: { PATH: process.env.PATH, HOME: os.tmpdir(), ...env }
  });
  return { status: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "", error: result.error };
}

function runPowerShell(command, { env = {}, cwd = root } = {}) {
  const result = spawnSync("pwsh", ["-NoProfile", "-NonInteractive", "-Command", command], {
    cwd,
    encoding: "utf8",
    env: { PATH: process.env.PATH, HOME: os.tmpdir(), ...env }
  });
  return { status: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "", error: result.error };
}

test("POSIX bridge is a direct-executable wrapper while the Windows bridge remains available", { skip: isWindows }, () => {
  const posixBridge = path.join(root, "hooks", "run-hook");
  assert.equal(fs.existsSync(posixBridge), true, "macOS and POSIX hooks need a shebang-bearing entrypoint");
  assert.notEqual(fs.statSync(posixBridge).mode & 0o111, 0, "POSIX bridge must be executable by bare path");
  assert.match(read("hooks/run-hook"), /^#!\/bin\/sh\n/, "POSIX bridge must declare a portable shell for direct execution");
  assert.match(read("hooks/run-hook"), /^unset BASH_ENV ENV CDPATH GLOBIGNORE$/m, "POSIX bridge must not inherit shell startup hooks into the transport");
  assert.equal(fs.existsSync(path.join(root, "hooks", "run-hook.cmd")), true, "Windows bridge must remain available");
});

function parseSinglePayload(result) {
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  assert.equal(result.stderr, "", "hook stderr must not contaminate the JSON payload channel");
  assert.equal(result.stdout.trim().split("\n").length, 1, "a hook emits exactly one final JSON object");
  return JSON.parse(result.stdout);
}

test("transport files are executable and the cross-platform wrapper stays LF/polyglot", { skip: isWindows }, () => {
  for (const relative of ["hooks/session-start", "hooks/run-hook"]) {
    assert.notEqual(fs.statSync(path.join(root, relative)).mode & 0o111, 0, `${relative} must be executable when the harness invokes its bare path`);
  }
  const posixWrapper = read("hooks/run-hook");
  assert.match(posixWrapper, /^#!\/bin\/sh\n/, "POSIX wrapper needs a direct-execution shebang");
  assert.match(posixWrapper, /exec bash --noprofile --norc/, "POSIX wrapper must delegate without adding output");
  assert.equal(posixWrapper.includes("\r\n"), false, "the POSIX wrapper must remain LF-only");
  const cmdWrapper = read("hooks/run-hook.cmd");
  assert.match(cmdWrapper, /^: << 'CMDBLOCK'/, "Windows wrapper needs a cmd/bash polyglot guard");
  assert.equal(cmdWrapper.includes("\r\n"), false, "the cmd/bash polyglot wrapper must remain LF-only");
  const syntax = spawnSync("bash", ["-n", path.join(root, "hooks", "run-hook.cmd")], { encoding: "utf8" });
  assert.equal(syntax.status, 0, syntax.stderr);
});

test("each native hook registration points to an executable project-safe transport", () => {
  const claude = readJson("hooks/hooks.json");
  const claudeCommand = claude.hooks.SessionStart[0].hooks[0].command;
  assert.match(claudeCommand, /run-hook\.cmd/);
  assert.match(claudeCommand, /"\$\{CLAUDE_PLUGIN_ROOT\}\/hooks\/run-hook\.cmd"/, "Claude plugin root must be quoted");
  assert.match(claudeCommand, /--runtime claude/);

  const cursor = readJson(".cursor/hooks.json");
  assert.equal(cursor.version, 1);
  assert.deepEqual(cursor.hooks.sessionStart, [{ command: "./hooks/run-hook session-start --runtime cursor", timeout: 30, failClosed: false }]);

  const copilot = readJson(".github/hooks/wcbs-session-start.json");
  assert.deepEqual(copilot.hooks.sessionStart, [{
    type: "command",
    bash: "./hooks/run-hook session-start --runtime github-copilot",
    powershell: "& .\\hooks\\run-hook.cmd session-start --runtime github-copilot"
  }]);
});

test("Copilot's configured PowerShell SessionStart path emits one fail-open-safe envelope on Windows", () => {
  const copilot = readJson(".github/hooks/wcbs-session-start.json");
  const [sessionStart] = copilot.hooks.sessionStart;
  assert.equal(sessionStart.powershell, "& .\\hooks\\run-hook.cmd session-start --runtime github-copilot", "Windows requires the documented PowerShell SessionStart route");
  if (!isWindows) return;

  const success = parseSinglePayload(runPowerShell(sessionStart.powershell));
  assert.deepEqual(Object.keys(success), ["additionalContext"]);
  assert.match(success.additionalContext, /WCBS_KIT_ACTIVE:github-copilot/);

  const failOpen = parseSinglePayload(runPowerShell(sessionStart.powershell, { env: { NODE: "C:\\definitely\\missing\\node.exe" } }));
  assert.deepEqual(Object.keys(failOpen), ["additionalContext"]);
  assert.match(failOpen.additionalContext, /"kernel_status":"unable_to_transfer"/);
  assert.match(failOpen.additionalContext, /"reason":"kernel_artifact_unreadable"/);
});

test("hook transport emits one harness-specific envelope on the executable path", { skip: isWindows }, () => {
  const cases = [
    ["claude", ["session-start", "--runtime", "claude"], "hookSpecificOutput"],
    ["cursor", ["session-start", "--runtime", "cursor"], "additional_context"],
    ["github-copilot", ["session-start", "--runtime", "github-copilot"], "additionalContext"]
  ];
  for (const [runtime, args, expectedKey] of cases) {
    const payload = parseSinglePayload(runHook({ args }));
    assert.deepEqual(Object.keys(payload), [expectedKey], `${runtime} receives only its documented output envelope`);
    const context = expectedKey === "hookSpecificOutput" ? payload.hookSpecificOutput.additionalContext : payload[expectedKey];
    assert.match(context, new RegExp(`WCBS_KIT_ACTIVE:${runtime}`));
  }
});

test("renderer failure fails open with one harness-correct blocked envelope", { skip: isWindows }, () => {
  const payload = parseSinglePayload(runHook({ args: ["session-start", "--runtime", "cursor"], env: { NODE: "/definitely/missing/node" } }));
  assert.deepEqual(Object.keys(payload), ["additional_context"]);
  assert.match(payload.additional_context, /"kernel_status":"unable_to_transfer"/);
  assert.match(payload.additional_context, /"reason":"kernel_artifact_unreadable"/);
});

test("POSIX bridge fails open with one native envelope when Bash is unavailable", { skip: isWindows }, () => {
  const payload = parseSinglePayload(runHook({ args: ["session-start", "--runtime", "github-copilot"], env: { PATH: "/definitely/missing" } }));
  assert.deepEqual(Object.keys(payload), ["additionalContext"]);
  assert.match(payload.additionalContext, /"kernel_status":"unable_to_transfer"/);
  assert.match(payload.additionalContext, /"reason":"delivery_environment_unresolved"/);
});

test("POSIX bridge does not let BASH_ENV contaminate a hook payload", { skip: isWindows }, () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-hook-startup-"));
  try {
    const startup = path.join(fixture, "bash-env");
    fs.writeFileSync(startup, "printf 'startup-contamination\\n' >&2\n", "utf8");
    const payload = parseSinglePayload(runHook({ args: ["session-start", "--runtime", "cursor"], env: { BASH_ENV: startup } }));
    assert.deepEqual(Object.keys(payload), ["additional_context"]);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test("Claude plugin component paths resolve from the plugin root without parent traversal", () => {
  const manifest = readJson(".claude-plugin/plugin.json");
  for (const [key, expected] of Object.entries({ hooks: "./hooks/hooks.json", skills: "./skills/" })) {
    assert.equal(manifest[key], expected);
    assert.equal(manifest[key].includes(".."), false, `${key} must not escape the plugin root`);
    assert.equal(fs.existsSync(path.join(root, ...manifest[key].replace(/^\.\//, "").split("/"))), true, `${key} must resolve in the plugin root`);
  }
});

test("legacy Cursor and Copilot installs deliver their documented hook registrations", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-transport-install-"));
  try {
    for (const [adapter, expected, runtime, expectedKey] of [
      ["cursor", ".cursor/hooks.json", "cursor", "additional_context"],
      ["github-copilot", ".github/hooks/wcbs-session-start.json", "github-copilot", "additionalContext"]
    ]) {
      const result = spawnSync(process.execPath, ["scripts/install-adapter.mjs", "--target", adapter, "--dest", target, "--install"], { cwd: root, encoding: "utf8" });
      assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
      assert.equal(fs.existsSync(path.join(target, ...expected.split("/"))), true, `${adapter} install must include ${expected}`);
      const installedHook = path.join(target, "hooks", "run-hook");
      assert.equal(fs.existsSync(installedHook), true, `${adapter} install must include its transport`);
      assert.equal(fs.existsSync(path.join(target, "hooks", "run-hook.cmd")), true, `${adapter} install must retain the Windows transport`);
      if (!isWindows) {
        assert.notEqual(fs.statSync(installedHook).mode & 0o111, 0, `${adapter} transport must preserve its execute bit`);
        const invocation = spawnSync(installedHook, ["session-start", "--runtime", runtime], {
          cwd: target,
          encoding: "utf8",
          env: { PATH: process.env.PATH, HOME: os.tmpdir() }
        });
        const payload = parseSinglePayload(invocation);
        assert.deepEqual(Object.keys(payload), [expectedKey], `${adapter} installed transport must keep its native envelope`);
      }
      const uninstall = spawnSync(process.execPath, ["scripts/install-adapter.mjs", "--target", adapter, "--dest", target, "--uninstall"], { cwd: root, encoding: "utf8" });
      assert.equal(uninstall.status, 0, `${uninstall.stdout}${uninstall.stderr}`);
      assert.equal(fs.existsSync(path.join(target, ...expected.split("/"))), false, `${adapter} uninstall must remove ${expected}`);
      assert.equal(fs.existsSync(installedHook), false, `${adapter} uninstall must remove its owned transport`);
    }
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});
