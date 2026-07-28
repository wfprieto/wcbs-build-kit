import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const CANONICALIZATION_VERSION = "1";
const TEXT_EXTENSIONS = new Set([".md", ".mjs", ".js", ".json", ".yaml", ".yml", ".py", ".ps1", ".txt"]);
const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");

export function normalizeRepositoryPath(value) {
  const normalized = value.replaceAll("\\", "/").replace(/^\.\//, "");
  if (!normalized || normalized.startsWith("/") || normalized.split("/").includes("..")) throw new Error(`Unsafe repository path: ${value}`);
  return normalized;
}

export function canonicalFileBytes(filePath, buffer) {
  if (!TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase())) return buffer;
  const text = buffer.toString("utf8");
  if (!Buffer.from(text, "utf8").equals(buffer)) return buffer;
  return Buffer.from(text.replace(/\r\n?/g, "\n"), "utf8");
}

export function buildCertificateManifest(root, inputs, optionalInputs = []) {
  const optional = new Set(optionalInputs.map(normalizeRepositoryPath));
  const unique = [...new Set(inputs.map(normalizeRepositoryPath))].sort((a, b) => Buffer.from(a).compare(Buffer.from(b)));
  const entries = [];
  for (const relative of unique) {
    const absolute = path.join(root, ...relative.split("/"));
    if (!fs.existsSync(absolute)) {
      if (!optional.has(relative)) throw new Error(`Required certificate input missing: ${relative}`);
      entries.push({ path: relative, sha256: null, state: "absent" });
      continue;
    }
    const stat = fs.lstatSync(absolute);
    if (stat.isSymbolicLink()) throw new Error(`Symlinked certificate input is forbidden: ${relative}`);
    if (!stat.isFile()) throw new Error(`Certificate input is not a regular file: ${relative}`);
    const digest = sha256(canonicalFileBytes(relative, fs.readFileSync(absolute)));
    entries.push({ path: relative, sha256: digest, state: "present" });
  }
  const aggregate = [`${CANONICALIZATION_VERSION}\n`];
  for (const entry of entries) aggregate.push(`${entry.path}\0${entry.sha256 ?? "absent"}\n`);
  return { canonicalization_version: CANONICALIZATION_VERSION, inputs: entries, content_hash: sha256(Buffer.from(aggregate.join(""), "utf8")) };
}
