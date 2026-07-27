import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildCertificateManifest, CANONICALIZATION_VERSION } from "../lib/certificate-canonicalization.mjs";

function fixture(lineEnding = "\n") {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wcbs-cert-"));
  fs.writeFileSync(path.join(root, "a.md"), `alpha${lineEnding}beta${lineEnding}`);
  fs.writeFileSync(path.join(root, "b.json"), `{${lineEnding}  \"x\": 1${lineEnding}}${lineEnding}`);
  return root;
}

test("CRLF and LF fixtures produce identical content hashes", () => {
  const lf = fixture("\n"), crlf = fixture("\r\n");
  try {
    const a = buildCertificateManifest(lf, ["a.md", "b.json"]);
    const b = buildCertificateManifest(crlf, ["a.md", "b.json"]);
    assert.equal(a.content_hash, b.content_hash);
    assert.equal(a.canonicalization_version, CANONICALIZATION_VERSION);
  } finally { fs.rmSync(lf, { recursive: true, force: true }); fs.rmSync(crlf, { recursive: true, force: true }); }
});

test("symlinked input is rejected", { skip: process.platform === "win32" }, () => {
  const root = fixture();
  try {
    fs.symlinkSync(path.join(root, "a.md"), path.join(root, "link.md"));
    assert.throws(() => buildCertificateManifest(root, ["link.md"]), /Symlinked certificate input/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("absent optional differs from present empty", () => {
  const root = fixture();
  try {
    const absent = buildCertificateManifest(root, ["optional.txt"], ["optional.txt"]);
    fs.writeFileSync(path.join(root, "optional.txt"), "");
    const present = buildCertificateManifest(root, ["optional.txt"], ["optional.txt"]);
    assert.notEqual(absent.content_hash, present.content_hash);
    assert.equal(absent.inputs[0].state, "absent");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("certificate bytes do not affect the manifest unless explicitly included", () => {
  const root = fixture();
  try {
    const before = buildCertificateManifest(root, ["a.md", "b.json"]);
    fs.writeFileSync(path.join(root, "bootstrap-certificate.json"), JSON.stringify(before));
    const after = buildCertificateManifest(root, ["a.md", "b.json"]);
    assert.equal(before.content_hash, after.content_hash);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
