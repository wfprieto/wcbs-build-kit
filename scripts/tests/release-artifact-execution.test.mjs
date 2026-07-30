import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const isWindows = process.platform === "win32";
const expectedModes = new Map([
  ["hooks/run-hook", 0o755],
  ["hooks/run-hook.cmd", 0o755],
  ["hooks/session-start", 0o755],
  ["skills/subagent-driven-development/scripts/make-review-package.py", 0o755],
  ["package.json", 0o644]
]);

function readPackage() {
  return JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
}

function buildReleaseArtifacts(outDir) {
  const result = spawnSync(process.execPath, ["scripts/build-release-artifacts.mjs", "--out", outDir], {
    cwd: root,
    encoding: "utf8"
  });
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
}

function gitIndexMode(relative) {
  const result = spawnSync("git", ["ls-files", "--stage", "--", relative], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  const match = result.stdout.match(/^(\d{6})\s+[0-9a-f]{40}\s+\d+\t/m);
  assert.ok(match, `${relative} must have a Git index mode`);
  return Number.parseInt(match[1], 8) & 0o777;
}

function resolveExistingArtifactDirectory(directory) {
  const resolved = path.resolve(root, directory);
  const relative = path.relative(root, resolved);
  assert.ok(relative && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative), "external release artifact directory must remain inside the repository");
  return resolved;
}

function readCentralDirectory(zipPath) {
  const archive = fs.readFileSync(zipPath);
  let end = -1;
  for (let offset = archive.length - 22; offset >= Math.max(0, archive.length - 0x10016); offset -= 1) {
    if (archive.readUInt32LE(offset) === 0x06054b50) {
      end = offset;
      break;
    }
  }
  assert.notEqual(end, -1, "release ZIP must have an end-of-central-directory record");

  const centralOffset = archive.readUInt32LE(end + 16);
  const centralSize = archive.readUInt32LE(end + 12);
  const entries = new Map();
  let offset = centralOffset;
  const limit = centralOffset + centralSize;

  while (offset < limit) {
    assert.equal(archive.readUInt32LE(offset), 0x02014b50, "release ZIP central directory is malformed");
    const nameLength = archive.readUInt16LE(offset + 28);
    const extraLength = archive.readUInt16LE(offset + 30);
    const commentLength = archive.readUInt16LE(offset + 32);
    const name = archive.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
    entries.set(name, {
      versionMadeBy: archive.readUInt16LE(offset + 4),
      externalAttributes: archive.readUInt32LE(offset + 38)
    });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  assert.equal(offset, limit, "release ZIP central-directory size must match its entries");
  return entries;
}

function extract(zipPath, destination) {
  const result = isWindows
    ? spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", "Expand-Archive -LiteralPath $env:WCBS_RELEASE_ZIP -DestinationPath $env:WCBS_RELEASE_DESTINATION -Force"], {
      encoding: "utf8",
      env: { ...process.env, WCBS_RELEASE_ZIP: zipPath, WCBS_RELEASE_DESTINATION: destination }
    })
    : spawnSync("unzip", ["-q", zipPath, "-d", destination], { encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
}

function parseSinglePayload(result) {
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  assert.equal(result.stderr, "", "release transport must not write to stderr");
  const lines = result.stdout.trim().split("\n");
  assert.equal(lines.length, 1, "release transport must emit exactly one JSON envelope");
  return JSON.parse(lines[0]);
}

function invokeExtractedTransport(packageRoot, runtime) {
  const env = { ...process.env, HOME: os.tmpdir(), CURSOR_PLUGIN_ROOT: packageRoot };
  if (isWindows) {
    return spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", `call run-hook.cmd session-start --runtime ${runtime}`], {
      cwd: path.join(packageRoot, "hooks"),
      encoding: "utf8",
      env
    });
  }
  return spawnSync(path.join(packageRoot, "hooks", "run-hook"), ["session-start", "--runtime", runtime], {
    cwd: packageRoot,
    encoding: "utf8",
    env
  });
}

test("release ZIP preserves executable metadata and runs the extracted native transport", () => {
  const artifactDirectory = process.env.WCBS_RELEASE_ARTIFACT_DIRECTORY;
  const directory = artifactDirectory
    ? resolveExistingArtifactDirectory(artifactDirectory)
    : fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-release-artifact-execution-"));
  const ownsDirectory = !artifactDirectory;
  const extraction = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-release-artifact-extraction-"));
  try {
    if (ownsDirectory) buildReleaseArtifacts(directory);
    const pkg = readPackage();
    const packageRootName = `super-build-kit-${pkg.version}`;
    const zipPath = path.join(directory, `${packageRootName}.zip`);
    const entries = readCentralDirectory(zipPath);

    for (const [relative, expectedMode] of expectedModes) {
      const entry = entries.get(`${packageRootName}/${relative}`);
      assert.ok(entry, `release ZIP must contain ${relative}`);
      assert.equal(entry.versionMadeBy >>> 8, 3, `${relative} must be written as a Unix ZIP entry`);
      const mode = entry.externalAttributes >>> 16;
      assert.equal(mode & 0o170000, 0o100000, `${relative} must remain a regular file`);
      assert.equal(gitIndexMode(relative), expectedMode, `${relative} Git index mode must stay intentional`);
      assert.equal(mode & 0o777, expectedMode, `${relative} ZIP mode must match its source mode`);
    }

    extract(zipPath, extraction);
    const packageRoot = path.join(extraction, packageRootName);
    if (!isWindows) {
      for (const [relative, expectedMode] of expectedModes) {
        assert.equal(fs.statSync(path.join(packageRoot, relative)).mode & 0o777, expectedMode, `${relative} must retain its mode after extraction`);
      }
    }

    for (const [runtime, key] of [
      ["claude", "hookSpecificOutput"],
      ["cursor", "additional_context"],
      ["github-copilot", "additionalContext"]
    ]) {
      const payload = parseSinglePayload(invokeExtractedTransport(packageRoot, runtime));
      assert.deepEqual(Object.keys(payload), [key]);
      const context = key === "hookSpecificOutput" ? payload[key].additionalContext : payload[key];
      assert.match(context, new RegExp(`WCBS_KIT_ACTIVE:${runtime}`));
    }
  } finally {
    fs.rmSync(extraction, { recursive: true, force: true });
    if (ownsDirectory) fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("ZIP verifier rejects every local central and EOCD header mutation", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-release-zip-grammar-"));
  try {
    const utcOut = path.join(directory, "utc");
    const pacificOut = path.join(directory, "pacific");
    for (const [out, timezone] of [[utcOut, "UTC"], [pacificOut, "Pacific/Honolulu"]]) {
      const build = spawnSync(process.execPath, ["scripts/build-release-artifacts.mjs", "--out", out], {
        cwd: root,
        encoding: "utf8",
        env: { ...process.env, TZ: timezone }
      });
      assert.equal(build.status, 0, `${build.stdout}${build.stderr}`);
    }
    const pkg = readPackage();
    const zipPath = path.join(utcOut, `super-build-kit-${pkg.version}.zip`);
    const manifestPath = path.join(utcOut, "RELEASE_ARTIFACT_MANIFEST.json");
    const original = fs.readFileSync(zipPath);
    assert.deepEqual(original, fs.readFileSync(path.join(pacificOut, `super-build-kit-${pkg.version}.zip`)), "canonical archive bytes must not vary with TZ");
    const centralOffset = original.readUInt32LE(original.length - 6);
    const mutate = [
      ["local version", (zip) => { zip[4] ^= 0x01; }],
      ["local time", (zip) => { zip[10] ^= 0x01; }],
      ["local date", (zip) => { zip[12] ^= 0x01; }],
      ["central made by", (zip) => { zip[centralOffset + 4] ^= 0x01; }],
      ["central needed", (zip) => { zip[centralOffset + 6] ^= 0x01; }],
      ["central time", (zip) => { zip[centralOffset + 12] ^= 0x01; }],
      ["central date", (zip) => { zip[centralOffset + 14] ^= 0x01; }],
      ["both timestamps", (zip) => { zip[10] ^= 0x01; zip[centralOffset + 12] ^= 0x01; }]
    ];
    for (const [label, change] of mutate) {
      const candidate = path.join(directory, `${label.replaceAll(" ", "-")}.zip`);
      const bytes = Buffer.from(original);
      change(bytes);
      fs.writeFileSync(candidate, bytes);
      const verify = spawnSync(process.execPath, ["scripts/build-release-artifacts.mjs", "--verify-zip", candidate, "--verify-manifest", manifestPath], { cwd: root, encoding: "utf8" });
      assert.notEqual(verify.status, 0, `${label} mutation was accepted`);
      assert.doesNotMatch(`${verify.stdout}${verify.stderr}`, /PASS: verified/);
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
