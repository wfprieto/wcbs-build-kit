#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const readArg = (name) => {
  const equal = args.find((arg) => arg.startsWith(`${name}=`));
  if (equal) return equal.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const outDir = path.resolve(readArg("--out") ?? "dist/release-artifacts");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const packageName = `super-build-kit-${pkg.version}`;

const excludedDirs = new Set([".git", "node_modules", "dist", "Updates", ".wcbs", "__pycache__"]);
const excludedFiles = [/\.pyc$/i, /\.tar\d*\.gz$/i, /\.zip$/i];

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosTime(date) {
  return ((date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)) & 0xffff;
}

function dosDate(date) {
  return (((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()) & 0xffff;
}

function shouldInclude(abs) {
  const rel = path.relative(root, abs).split(path.sep).join("/");
  if (!rel) return true;
  if (rel.split("/").some((part) => excludedDirs.has(part))) return false;
  return !excludedFiles.some((pattern) => pattern.test(rel));
}

function collectFiles(dir = root) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (!shouldInclude(abs)) continue;
    if (entry.isDirectory()) files.push(...collectFiles(abs));
    else if (entry.isFile()) files.push(abs);
  }
  return files.sort((a, b) => a.localeCompare(b));
}

function loadGitFileModes() {
  try {
    const output = execFileSync("git", ["ls-files", "--stage", "-z"], { cwd: root, encoding: "utf8" });
    const modes = new Map();
    for (const record of output.split("\0")) {
      if (!record) continue;
      const separator = record.indexOf("\t");
      if (separator === -1) continue;
      const mode = record.slice(0, separator).split(" ")[0];
      const relative = record.slice(separator + 1);
      if (/^100[67][0-7]{2}$/.test(mode)) modes.set(relative, Number.parseInt(mode, 8) & 0o777);
    }
    return modes;
  } catch {
    return new Map();
  }
}

function writeUInt32(value) {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(value >>> 0);
  return b;
}

function writeUInt16(value) {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(value & 0xffff);
  return b;
}

function makeZip(entries, zipPath, gitFileModes) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const stamp = new Date("2026-01-01T00:00:00Z");

  for (const entry of entries) {
    const name = `${packageName}/${entry.rel}`;
    const nameBuf = Buffer.from(name, "utf8");
    const data = fs.readFileSync(entry.abs);
    const mode = gitFileModes.get(entry.rel) ?? (fs.statSync(entry.abs).mode & 0o777);
    const crc = crc32(data);
    const localHeader = Buffer.concat([
      writeUInt32(0x04034b50),
      writeUInt16(20),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(dosTime(stamp)),
      writeUInt16(dosDate(stamp)),
      writeUInt32(crc),
      writeUInt32(data.length),
      writeUInt32(data.length),
      writeUInt16(nameBuf.length),
      writeUInt16(0),
      nameBuf
    ]);
    localParts.push(localHeader, data);

    const central = Buffer.concat([
      writeUInt32(0x02014b50),
      // Mark the entry as Unix-origin so extractors honor the external mode.
      writeUInt16((3 << 8) | 20),
      writeUInt16(20),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(dosTime(stamp)),
      writeUInt16(dosDate(stamp)),
      writeUInt32(crc),
      writeUInt32(data.length),
      writeUInt32(data.length),
      writeUInt16(nameBuf.length),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      // Upper 16 bits carry the Unix file type and permissions.
      writeUInt32(((0o100000 | mode) & 0xffff) * 0x10000),
      writeUInt32(offset),
      nameBuf
    ]);
    centralParts.push(central);
    offset += localHeader.length + data.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.concat([
    writeUInt32(0x06054b50),
    writeUInt16(0),
    writeUInt16(0),
    writeUInt16(entries.length),
    writeUInt16(entries.length),
    writeUInt32(centralSize),
    writeUInt32(offset),
    writeUInt16(0)
  ]);

  fs.writeFileSync(zipPath, Buffer.concat([...localParts, ...centralParts, end]));
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

fs.mkdirSync(outDir, { recursive: true });
const entries = collectFiles().map((abs) => ({ abs, rel: path.relative(root, abs).split(path.sep).join("/") }));
const zipPath = path.join(outDir, `${packageName}.zip`);
makeZip(entries, zipPath, loadGitFileModes());

const manifestPath = path.join(outDir, "RELEASE_ARTIFACT_MANIFEST.json");
const manifest = {
  package: packageName,
  version: pkg.version,
  generated_utc: new Date().toISOString(),
  artifact: path.basename(zipPath),
  files_included: entries.length,
  excludes: [...excludedDirs].sort(),
  evidence: "Dependency-free stored ZIP generated from current working tree."
};
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const sumsPath = path.join(outDir, "SHA256SUMS.txt");
const artifacts = [zipPath, manifestPath].map((file) => `${sha256(file)}  ${path.basename(file)}`);
fs.writeFileSync(sumsPath, `${artifacts.join("\n")}\n`, "utf8");

console.log(`PASS: built release artifacts in ${outDir}`);
console.log(`Artifact: ${path.basename(zipPath)}`);
console.log(`Files included: ${entries.length}`);
