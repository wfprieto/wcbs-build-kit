import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateAgainstSchema } from "../lib/json-schema.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function findSchemas(directory) {
  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", "dist", "release-artifacts"].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...findSchemas(absolute));
    else if (entry.isFile() && entry.name.endsWith(".schema.json")) found.push(absolute);
  }
  return found.sort();
}

test("every published JSON schema uses only validator-supported keywords", () => {
  const schemas = findSchemas(root);
  assert.ok(schemas.length > 0, "expected at least one published schema");
  for (const absolute of schemas) {
    const relative = path.relative(root, absolute).split(path.sep).join("/");
    const schema = JSON.parse(fs.readFileSync(absolute, "utf8"));
    assert.doesNotThrow(
      () => validateAgainstSchema(schema, {}),
      `schema preflight failed for ${relative}`
    );
  }
});
