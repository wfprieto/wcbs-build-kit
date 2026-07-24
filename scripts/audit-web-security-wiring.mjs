#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const requiredFiles = [
  "50_audits/WEB_APPLICATION_SECURITY_AUDIT.md",
  "skills/web-application-security/SKILL.md",
  "40_knowledge/WEB_APPLICATION_SECURITY_CONTROL_MATRIX.md",
  "60_templates/WEB_APPLICATION_SECURITY_EVIDENCE_LEDGER_TEMPLATE.md"
];

const requiredReferences = new Map([
  ["50_audits/AUDIT_TIER_ROUTER.md", ["WEB_APPLICATION_SECURITY_AUDIT.md", "web-application-security"]],
  ["skills/cybersecurity-risk-routing/SKILL.md", ["skills/web-application-security/SKILL.md", "WEB_APPLICATION_SECURITY_AUDIT.md"]],
  ["10_governance/RELEASE_GATES.md", ["Web Application Security Audit", "percentage"]],
  ["README.md", ["Web Application Security", "50_audits/WEB_APPLICATION_SECURITY_AUDIT.md"]],
  ["MANIFEST.md", ["WEB_APPLICATION_SECURITY_AUDIT.md", "WEB_APPLICATION_SECURITY_CONTROL_MATRIX.md", "WEB_APPLICATION_SECURITY_EVIDENCE_LEDGER_TEMPLATE.md"]]
]);

const failures = [];
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) failures.push(`Missing canonical web security file: ${relativePath}`);
}

for (const [relativePath, terms] of requiredReferences) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    failures.push(`Missing wiring document: ${relativePath}`);
    continue;
  }
  const body = read(relativePath).toLowerCase();
  for (const term of terms) {
    if (!body.includes(term.toLowerCase())) failures.push(`${relativePath} is missing required web security reference: ${term}`);
  }
}

const audit = fs.existsSync(path.join(root, requiredFiles[0])) ? read(requiredFiles[0]) : "";
for (const gate of [
  "authentication",
  "authorization",
  "tenant isolation",
  "file uploads",
  "negative tests",
  "PASS",
  "BLOCKED",
  "percentage"
]) {
  if (!audit.toLowerCase().includes(gate.toLowerCase())) failures.push(`Web Application Security Audit is missing required control or verdict language: ${gate}`);
}

const skill = fs.existsSync(path.join(root, requiredFiles[1])) ? read(requiredFiles[1]) : "";
if (!skill.startsWith("---\n")) failures.push("Web application security skill is missing YAML frontmatter.");
if (!/^name:\s*web-application-security$/m.test(skill)) failures.push("Web application security skill has an invalid name field.");

if (failures.length) {
  console.error("Web application security wiring verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Web application security audit, skill, evidence, routing, release, and public documentation wiring are connected.");
