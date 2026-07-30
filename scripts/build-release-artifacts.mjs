#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { HARDENED_GIT_POLICY_VERSION, inspectHardenedGitPolicy, requireHardenedGit } from "./lib/hardened-git.mjs";

const args = process.argv.slice(2);
const readArg = (name) => {
  const equal = args.find((arg) => arg.startsWith(`${name}=`));
  if (equal) return equal.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const callerRoot = path.resolve(readArg("--repository-root") ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));
const outDir = path.resolve(readArg("--out") ?? "dist/release-artifacts");
const requestedCommit = readArg("--source-commit");
const requestedTree = readArg("--source-tree");

const excludedDirs = new Set([".git", "node_modules", "dist", "Updates", ".wcbs", "__pycache__"]);
const excludedFiles = [/\.pyc$/i, /\.tar\d*\.gz$/i, /\.zip$/i];
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const posix = (value) => value.split(path.sep).join("/");

function canonicalValue(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean" || typeof value === "number") return value;
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (!value || typeof value !== "object") throw new Error("release manifest contains an unsupported value");
  return Object.fromEntries(Object.keys(value).sort((left, right) => left.localeCompare(right)).map((key) => [key, canonicalValue(value[key])]));
}

function canonicalJson(value) { return `${JSON.stringify(canonicalValue(value))}\n`; }

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

const DOS_UTC_TIME = 0;
const DOS_UTC_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;
const ZIP32_MAX = 0xffffffff;
function writeUInt32(value) { const b = Buffer.alloc(4); b.writeUInt32LE(value >>> 0); return b; }
function writeUInt16(value) { const b = Buffer.alloc(2); b.writeUInt16LE(value & 0xffff); return b; }

function git(args, encoding = "utf8") {
  return requireHardenedGit(args, { cwd: callerRoot, encoding }, `release builder Git ${args[0] ?? "command"}`);
}

function resolveIdentity() {
  const commit = git(["rev-parse", requestedCommit ?? "HEAD"]).trim();
  const tree = git(["rev-parse", `${commit}^{tree}`]).trim();
  if (requestedTree && requestedTree !== tree) throw new Error(`--source-tree does not match ${commit}: expected ${tree}, received ${requestedTree}`);
  return { commit, tree };
}

function shouldIncludeRelative(relative) {
  if (!relative || relative.startsWith("/") || relative.split("/").includes("..")) return false;
  if (relative.split("/").some((part) => excludedDirs.has(part))) return false;
  return !excludedFiles.some((pattern) => pattern.test(relative));
}

function gitEntries(commit) {
  const rows = git(["ls-tree", "-r", "-z", commit], null).toString("utf8").split("\0").filter(Boolean);
  const entries = [];
  for (const row of rows) {
    const separator = row.indexOf("\t");
    if (separator === -1) throw new Error("git tree entry is malformed");
    const [mode, type] = row.slice(0, separator).split(" ");
    const relative = row.slice(separator + 1);
    if (!shouldIncludeRelative(relative)) continue;
    if (type !== "blob" || !/^100[67][0-7]{2}$/.test(mode)) throw new Error(`release artifact refuses non-regular Git entry ${relative}`);
    entries.push({ relative, unix_mode: Number.parseInt(mode, 8) & 0o777 });
  }
  return entries.sort((left, right) => left.relative.localeCompare(right.relative));
}

function materialize(commit) {
  const sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-release-source-"));
  const archive = git(["archive", "--format=tar", commit], null);
  const extract = spawnSync("tar", ["-xf", "-", "-C", sourceRoot], { input: archive, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  if (extract.status !== 0) {
    fs.rmSync(sourceRoot, { recursive: true, force: true });
    throw new Error(`could not materialize immutable Git revision: ${extract.stderr || "tar failed"}`);
  }
  return sourceRoot;
}

function collectMaterializedFiles(sourceRoot, expected) {
  const actual = [];
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      const relative = posix(path.relative(sourceRoot, absolute));
      if (!shouldIncludeRelative(relative)) continue;
      const stat = fs.lstatSync(absolute);
      if (stat.isSymbolicLink()) throw new Error(`release artifact refuses symbolic link ${relative}`);
      if (stat.isDirectory()) walk(absolute);
      else if (stat.isFile()) actual.push({ absolute, relative });
      else throw new Error(`release artifact refuses unsupported materialized entry ${relative}`);
    }
  };
  walk(sourceRoot);
  actual.sort((left, right) => left.relative.localeCompare(right.relative));
  const actualNames = actual.map((entry) => entry.relative);
  const expectedNames = expected.map((entry) => entry.relative);
  if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) throw new Error("materialized release input differs from the immutable Git tree");
  const modes = new Map(expected.map((entry) => [entry.relative, entry.unix_mode]));
  return actual.map((entry) => ({ ...entry, unix_mode: modes.get(entry.relative) }));
}

function makeZip(entries, zipPath, packageName) {
  if (!Array.isArray(entries) || !entries.length || entries.length > 0xffff) throw new Error("release ZIP entry count exceeds ZIP32 bounds");
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const entry of entries) {
    const name = `${packageName}/${entry.relative}`;
    const nameBuf = Buffer.from(name, "utf8");
    const data = fs.readFileSync(entry.absolute);
    if (!nameBuf.length || nameBuf.length > 0xffff || data.length > ZIP32_MAX || offset > ZIP32_MAX) throw new Error(`release ZIP entry exceeds ZIP32 bounds: ${entry.relative}`);
    const crc = crc32(data);
    const localHeader = Buffer.concat([
      writeUInt32(0x04034b50), writeUInt16(20), writeUInt16(0), writeUInt16(0),
      writeUInt16(DOS_UTC_TIME), writeUInt16(DOS_UTC_DATE), writeUInt32(crc),
      writeUInt32(data.length), writeUInt32(data.length), writeUInt16(nameBuf.length), writeUInt16(0), nameBuf
    ]);
    localParts.push(localHeader, data);
    const central = Buffer.concat([
      writeUInt32(0x02014b50), writeUInt16((3 << 8) | 20), writeUInt16(20), writeUInt16(0), writeUInt16(0),
      writeUInt16(DOS_UTC_TIME), writeUInt16(DOS_UTC_DATE), writeUInt32(crc), writeUInt32(data.length), writeUInt32(data.length),
      writeUInt16(nameBuf.length), writeUInt16(0), writeUInt16(0), writeUInt16(0), writeUInt16(0),
      writeUInt32(((0o100000 | entry.unix_mode) & 0xffff) * 0x10000), writeUInt32(offset), nameBuf
    ]);
    centralParts.push(central);
    offset += localHeader.length + data.length;
    if (offset > ZIP32_MAX) throw new Error("release ZIP local region exceeds ZIP32 bounds");
  }
  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  if (centralSize > ZIP32_MAX || offset > ZIP32_MAX || offset + centralSize + 22 > ZIP32_MAX) throw new Error("release ZIP central directory exceeds ZIP32 bounds");
  const end = Buffer.concat([
    writeUInt32(0x06054b50), writeUInt16(0), writeUInt16(0), writeUInt16(entries.length), writeUInt16(entries.length),
    writeUInt32(centralSize), writeUInt32(offset), writeUInt16(0)
  ]);
  fs.writeFileSync(zipPath, Buffer.concat([...localParts, ...centralParts, end]));
}

function zipContentManifest(zipPath) {
  const archive = fs.readFileSync(zipPath);
  const fail = (message) => { throw new Error(`release ZIP is not a closed stored archive: ${message}`); };
  const requireRange = (offset, length, label) => {
    if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) || offset < 0 || length < 0 || offset + length > archive.length) fail(`${label} is out of bounds`);
  };
  const u16 = (offset, label) => { requireRange(offset, 2, label); return archive.readUInt16LE(offset); };
  const u32 = (offset, label) => { requireRange(offset, 4, label); return archive.readUInt32LE(offset); };
  const utf8 = new TextDecoder("utf-8", { fatal: true });
  const safeName = (bytes, label) => {
    let name;
    try { name = utf8.decode(bytes); } catch { fail(`${label} name is not valid UTF-8`); }
    if (!name || name.includes("\\") || name.startsWith("/") || name.endsWith("/") || name.includes("\0") || name.split("/").some((part) => !part || part === "." || part === "..")) fail(`${label} name is unsafe`);
    return name;
  };
  if (archive.length < 22) fail("missing EOCD");
  const end = archive.length - 22;
  if (u32(end, "EOCD signature") !== 0x06054b50) fail("EOCD must be exactly at EOF with no comment or trailing bytes");
  const disk = u16(end + 4, "EOCD disk");
  const centralDisk = u16(end + 6, "EOCD central disk");
  const entriesOnDisk = u16(end + 8, "EOCD entry count");
  const count = u16(end + 10, "EOCD total entry count");
  const centralSize = u32(end + 12, "EOCD central size");
  const centralOffset = u32(end + 16, "EOCD central offset");
  const commentLength = u16(end + 20, "EOCD comment length");
  if (disk !== 0 || centralDisk !== 0 || entriesOnDisk !== count || !count || commentLength !== 0) fail("EOCD permits one disk, one nonempty central directory, and no comment only");
  if (centralOffset + centralSize !== end || centralOffset <= 0) fail("central directory does not form a contiguous EOF partition");

  const central = [];
  const names = new Set();
  let cursor = centralOffset;
  for (let index = 0; index < count; index += 1) {
    requireRange(cursor, 46, "central header");
    if (u32(cursor, "central signature") !== 0x02014b50) fail("central header signature is malformed");
    const versionMadeBy = u16(cursor + 4, "central version made by");
    const versionNeeded = u16(cursor + 6, "central version needed");
    const flags = u16(cursor + 8, "central flags");
    const method = u16(cursor + 10, "central method");
    const time = u16(cursor + 12, "central DOS time");
    const date = u16(cursor + 14, "central DOS date");
    const crc = u32(cursor + 16, "central CRC");
    const compressedSize = u32(cursor + 20, "central compressed size");
    const uncompressedSize = u32(cursor + 24, "central uncompressed size");
    const nameLength = u16(cursor + 28, "central name length");
    const extraLength = u16(cursor + 30, "central extra length");
    const commentLength = u16(cursor + 32, "central comment length");
    const diskStart = u16(cursor + 34, "central disk start");
    const internalAttributes = u16(cursor + 36, "central internal attributes");
    const externalAttributes = u32(cursor + 38, "central external attributes");
    const localOffset = u32(cursor + 42, "central local offset");
    const recordLength = 46 + nameLength + extraLength + commentLength;
    requireRange(cursor, recordLength, "central record");
    if (versionMadeBy !== ((3 << 8) | 20) || versionNeeded !== 20 || flags !== 0 || method !== 0 || time !== DOS_UTC_TIME || date !== DOS_UTC_DATE || extraLength !== 0 || commentLength !== 0 || diskStart !== 0 || internalAttributes !== 0) fail("central record uses unsupported ZIP metadata");
    if ([compressedSize, uncompressedSize, localOffset].some((value) => value === 0xffffffff)) fail("ZIP64 marker is forbidden");
    if (compressedSize !== uncompressedSize) fail("compressed entries are forbidden");
    const name = safeName(archive.subarray(cursor + 46, cursor + 46 + nameLength), "central record");
    if (names.has(name)) fail("duplicate entry name");
    names.add(name);
    const unixMode = (externalAttributes >>> 16) & 0xffff;
    if ((externalAttributes & 0xffff) !== 0 || (unixMode & 0o170000) !== 0o100000) fail(`entry ${name} lacks canonical Unix regular-file metadata`);
    central.push({ name, versionMadeBy, versionNeeded, flags, method, time, date, crc, compressedSize, uncompressedSize, externalAttributes, localOffset });
    cursor += recordLength;
  }
  if (cursor !== end || cursor !== centralOffset + centralSize) fail("central directory has a gap, overlap, or inaccurate size");

  const byOffset = new Map(central.map((entry) => [entry.localOffset, entry]));
  if (byOffset.size !== central.length) fail("central directory repeats a local header offset");
  const entries = [];
  cursor = 0;
  while (cursor < centralOffset) {
    requireRange(cursor, 30, "local header");
    if (u32(cursor, "local signature") !== 0x04034b50) fail("local region has a gap or malformed header");
    const entry = byOffset.get(cursor);
    if (!entry) fail("local header is not declared by the central directory");
    const versionNeeded = u16(cursor + 4, "local version needed");
    const flags = u16(cursor + 6, "local flags");
    const method = u16(cursor + 8, "local method");
    const time = u16(cursor + 10, "local DOS time");
    const date = u16(cursor + 12, "local DOS date");
    const crc = u32(cursor + 14, "local CRC");
    const compressedSize = u32(cursor + 18, "local compressed size");
    const uncompressedSize = u32(cursor + 22, "local uncompressed size");
    const nameLength = u16(cursor + 26, "local name length");
    const extraLength = u16(cursor + 28, "local extra length");
    const dataStart = cursor + 30 + nameLength + extraLength;
    requireRange(cursor, 30 + nameLength + extraLength + compressedSize, "local record");
    if (versionNeeded !== 20 || flags !== 0 || method !== 0 || time !== DOS_UTC_TIME || date !== DOS_UTC_DATE || extraLength !== 0 || compressedSize !== uncompressedSize || [compressedSize, uncompressedSize].some((value) => value === 0xffffffff)) fail("local record uses unsupported ZIP metadata");
    const name = safeName(archive.subarray(cursor + 30, cursor + 30 + nameLength), "local record");
    if (name !== entry.name || versionNeeded !== entry.versionNeeded || flags !== entry.flags || method !== entry.method || time !== entry.time || date !== entry.date || crc !== entry.crc || compressedSize !== entry.compressedSize || uncompressedSize !== entry.uncompressedSize) fail(`local and central record disagree for ${entry.name}`);
    const data = archive.subarray(dataStart, dataStart + compressedSize);
    if (crc32(data) !== crc) fail(`entry ${name} has an invalid CRC32`);
    const unixMode = (entry.externalAttributes >>> 16) & 0xffff;
    entries.push({ name, sha256: sha256(data), type: "regular-file", unix_mode: unixMode & 0o777, origin: { zip_host_os: entry.versionMadeBy >>> 8, zip_version_made_by: entry.versionMadeBy } });
    cursor = dataStart + compressedSize;
  }
  if (cursor !== centralOffset || entries.length !== central.length) fail("local region does not form an exact contiguous partition");
  entries.sort((left, right) => left.name.localeCompare(right.name));
  const content_manifest = { schema_version: 1, entries };
  return { content_manifest, content_manifest_sha256: sha256(canonicalJson(content_manifest)) };
}

function verifyExpectedEntries(entries, packageName, manifest) {
  const expected = entries.map((entry) => ({ name: `${packageName}/${entry.relative}`, unix_mode: entry.unix_mode })).sort((left, right) => left.name.localeCompare(right.name));
  const actual = manifest.content_manifest.entries.map((entry) => ({ name: entry.name, unix_mode: entry.unix_mode }));
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error("actual release ZIP content manifest does not match immutable Git entry names and modes");
}

const verifyZipPath = readArg("--verify-zip");
const verifyManifestPath = readArg("--verify-manifest");
if (verifyZipPath || verifyManifestPath) {
  if (!verifyZipPath || !verifyManifestPath) throw new Error("--verify-zip and --verify-manifest must be supplied together.");
  const declared = JSON.parse(fs.readFileSync(path.resolve(verifyManifestPath), "utf8"));
  const observed = zipContentManifest(path.resolve(verifyZipPath));
  if (declared?.content_manifest_sha256 !== observed.content_manifest_sha256 || canonicalJson(declared?.content_manifest) !== canonicalJson(observed.content_manifest)) throw new Error("release ZIP content manifest no longer matches the declared artifact identity.");
  console.log(`PASS: verified release ZIP content manifest ${observed.content_manifest_sha256}`);
  process.exit(0);
}

const identity = resolveIdentity();
const hardenedGit = inspectHardenedGitPolicy(callerRoot);
const sourceRoot = materialize(identity.commit);
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(sourceRoot, "package.json"), "utf8"));
  const packageName = `super-build-kit-${pkg.version}`;
  const entries = collectMaterializedFiles(sourceRoot, gitEntries(identity.commit));
  fs.mkdirSync(outDir, { recursive: true });
  const zipPath = path.join(outDir, `${packageName}.zip`);
  makeZip(entries, zipPath, packageName);
  const zipManifest = zipContentManifest(zipPath);
  verifyExpectedEntries(entries, packageName, zipManifest);
  const manifestPath = path.join(outDir, "RELEASE_ARTIFACT_MANIFEST.json");
  const manifest = {
    schema_version: 2,
    package: packageName,
    version: pkg.version,
    source: identity,
    artifact: path.basename(zipPath),
    files_included: entries.length,
    excludes: [...excludedDirs].sort(),
    ...zipManifest,
    evidence: "Dependency-free stored ZIP generated from a fresh immutable Git materialization; content identity is parsed from its actual central directory."
  };
  manifest.hardened_git = { policy_version: HARDENED_GIT_POLICY_VERSION, ...hardenedGit };
  fs.writeFileSync(manifestPath, canonicalJson(manifest), "utf8");
  const sumsPath = path.join(outDir, "SHA256SUMS.txt");
  fs.writeFileSync(sumsPath, `${sha256(fs.readFileSync(zipPath))}  ${path.basename(zipPath)}\n${sha256(fs.readFileSync(manifestPath))}  ${path.basename(manifestPath)}\n`, "utf8");
  console.log(`PASS: built release artifacts in ${outDir}`);
  console.log(`Artifact: ${path.basename(zipPath)}`);
  console.log(`Files included: ${entries.length}`);
  console.log(`Content manifest: ${zipManifest.content_manifest_sha256}`);
} finally {
  fs.rmSync(sourceRoot, { recursive: true, force: true });
}
