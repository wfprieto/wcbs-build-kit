import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const registryPath = path.join(root, "runtime_adapters", "adapter-registry.yaml");

function runGenerator(...args) {
  return spawnSync(process.execPath, ["scripts/generate-v2-metadata.mjs", ...args], {
    cwd: root,
    encoding: "utf8"
  });
}

test("V2 registry is canonical, complete, and generates every derived adapter artifact", () => {
  assert.ok(fs.existsSync(registryPath), "missing runtime_adapters/adapter-registry.yaml");
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  assert.equal(registry.schema_version, 1);
  assert.ok(Array.isArray(registry.adapters));
  assert.ok(Array.isArray(registry.core_skills));

  const ids = registry.adapters.map((adapter) => adapter.runtime_id).sort();
  assert.deepEqual(ids, ["claude", "codex", "cursor", "gemini", "generic-agent", "github-copilot", "kimi", "manus", "opencode", "pi", "replit"]);
  for (const adapter of registry.adapters) {
    assert.match(adapter.manifest.activation_marker, new RegExp(`^WCBS_KIT_ACTIVE:${adapter.runtime_id}$`));
    assert.ok(adapter.bootstrap?.source_skill === "using-wcbs");
    assert.ok(adapter.support?.designed);
    assert.ok(adapter.support?.verified);
  }

  const coreNames = registry.core_skills.map((skill) => skill.name).sort();
  assert.deepEqual(coreNames, [
    "brainstorming", "dispatching-parallel-agents", "executing-plans", "finishing-a-development-branch",
    "receiving-code-review", "requesting-code-review", "subagent-driven-development", "systematic-debugging",
    "test-driven-development", "using-git-worktrees", "using-wcbs", "verification-before-completion",
    "writing-plans", "writing-skills"
  ]);
  for (const skill of registry.core_skills) {
    assert.match(skill.trigger, /\b(use|when|for)\b/i);
    assert.equal(skill.scenarios.length, 3, `${skill.name} requires direct, indirect, and pressure scenarios`);
    assert.deepEqual(skill.scenarios.map((scenario) => scenario.kind).sort(), ["direct", "indirect", "pressure"]);
  }
});

test("V2 derived metadata is reproducible and cannot be hand-edited", () => {
  const result = runGenerator("--check");
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  for (const file of [
    "runtime_adapters/CAPABILITY_MATRIX.md",
    "runtime_adapters/INSTALLATION_MATRIX.md",
    "runtime_adapters/VERIFIED_SUPPORT_LEVELS.md",
    "runtime_adapters/generated/using-wcbs-bootstrap.md",
    "runtime_adapters/generated/skill-catalog.json",
    "runtime_adapters/generated/specialist-skill-catalog.json"
  ]) {
    const body = fs.readFileSync(path.join(root, file), "utf8");
    assert.match(body, /GENERATED FILE/i, `${file} must identify its generated status`);
  }
});

test("every shipped skill is cataloged exactly once as core or specialist", () => {
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const cataloged = [...registry.core_skills, ...registry.specialist_skills].map((skill) => skill.name);
  assert.equal(new Set(cataloged).size, cataloged.length, "a skill may have only one catalog role");
  const shipped = fs.readdirSync(path.join(root, "skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, "skills", entry.name, "SKILL.md")))
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual([...cataloged].sort(), shipped);
  for (const skill of registry.specialist_skills) {
    assert.match(skill.classification, /^(core-governance|domain-procedure|routing-only|reference-only|deprecated)$/);
    if (skill.classification === "deprecated") assert.ok(skill.successor);
  }
});

test("every generated core-skill catalog path is shipped and uses a WCBS-owned procedure", () => {
  const result = runGenerator("--print-catalog");
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  const catalog = JSON.parse(result.stdout);
  for (const skill of catalog.core_skills) {
    const absolute = path.join(root, ...skill.path.split("/"));
    assert.ok(fs.existsSync(absolute), `${skill.name} has no shipped skill file`);
    const body = fs.readFileSync(absolute, "utf8");
    assert.match(body, /APIVR|Evidence|Verification/i, `${skill.name} must retain WCBS verification discipline`);
    assert.match(body, /Example|Worked Example|Red-Green-Refactor/i, `${skill.name} must be executable rather than descriptive`);
  }
});
