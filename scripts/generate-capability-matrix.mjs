#!/usr/bin/env node
/**
 * Generate runtime_adapters/CAPABILITY_MATRIX.md from the runtime manifests.
 *
 * Manifests are the source of truth. The matrix is a derived view.
 * Run with --check to fail when the committed matrix is stale or hand-edited.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifests, renderCapabilityMatrix, validateManifest } from "./lib/adapter-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "runtime_adapters", "CAPABILITY_MATRIX.md");
const check = process.argv.includes("--check");

const manifests = loadManifests(root);
if (manifests.length === 0) {
  console.error("No manifests found in runtime_adapters/manifests/.");
  process.exit(1);
}

for (const manifest of manifests) {
  try {
    validateManifest(manifest, { root });
  } catch (error) {
    console.error(`Invalid manifest: ${error.message}`);
    process.exit(1);
  }
}

const rendered = renderCapabilityMatrix(manifests);

if (check) {
  const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
  if (current.trim() !== rendered.trim()) {
    console.error(
      "CAPABILITY_MATRIX.md is stale or hand-edited.\n" +
        "Manifests are canonical. Regenerate with: npm run generate:matrix"
    );
    process.exit(1);
  }
  console.log(`CAPABILITY_MATRIX.md is current (${manifests.length} runtimes).`);
  process.exit(0);
}

fs.writeFileSync(target, rendered, "utf8");
console.log(`Generated runtime_adapters/CAPABILITY_MATRIX.md from ${manifests.length} manifests.`);
