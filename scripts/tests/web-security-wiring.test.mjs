import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");

const canonicalFiles = [
  "50_audits/WEB_APPLICATION_SECURITY_AUDIT.md",
  "skills/web-application-security/SKILL.md",
  "40_knowledge/WEB_APPLICATION_SECURITY_CONTROL_MATRIX.md",
  "60_templates/WEB_APPLICATION_SECURITY_EVIDENCE_LEDGER_TEMPLATE.md"
];

test("canonical web application security files exist", () => {
  for (const relativePath of canonicalFiles) {
    assert.equal(fs.existsSync(path.join(root, relativePath)), true, `missing ${relativePath}`);
  }
});

test("web application security is connected to routing and public documentation", () => {
  const expected = new Map([
    ["50_audits/AUDIT_TIER_ROUTER.md", ["WEB_APPLICATION_SECURITY_AUDIT.md", "web-application-security"]],
    ["skills/cybersecurity-risk-routing/SKILL.md", ["skills/web-application-security/SKILL.md", "WEB_APPLICATION_SECURITY_AUDIT.md"]],
    ["10_governance/RELEASE_GATES.md", ["Web Application Security Audit", "percentage"]],
    ["README.md", ["Web Application Security", "50_audits/WEB_APPLICATION_SECURITY_AUDIT.md"]],
    ["MANIFEST.md", ["WEB_APPLICATION_SECURITY_AUDIT.md", "WEB_APPLICATION_SECURITY_CONTROL_MATRIX.md", "WEB_APPLICATION_SECURITY_EVIDENCE_LEDGER_TEMPLATE.md"]]
  ]);

  for (const [relativePath, terms] of expected) {
    const body = read(relativePath).toLowerCase();
    for (const term of terms) assert.ok(body.includes(term.toLowerCase()), `${relativePath} missing ${term}`);
  }
});

test("web application security audit contains the critical control and verdict language", () => {
  const audit = read(canonicalFiles[0]).toLowerCase();
  for (const required of [
    "authentication",
    "authorization",
    "tenant isolation",
    "file uploads",
    "negative tests",
    "pass",
    "blocked",
    "percentage"
  ]) assert.ok(audit.includes(required), `audit missing ${required}`);
});

test("web application security skill follows the runtime skill contract", () => {
  const skill = read(canonicalFiles[1]);
  assert.ok(skill.startsWith("---\n"), "skill missing YAML frontmatter");
  assert.match(skill, /^name:\s*web-application-security$/m);
  assert.match(skill, /^description:\s*\S.+$/m);
});
