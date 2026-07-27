#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const valueOf = flag => { const i=args.indexOf(flag); return i>=0 ? args[i+1] : null; };
const apply = args.includes("--apply");
const destArg = valueOf("--dest");
if (apply && !destArg) {
  console.error("FAIL: --apply requires an explicit --dest <repository-root>.");
  process.exit(2);
}
const root = path.resolve(destArg ?? process.cwd());
const marker = ".wcbs/migrations/eos-v5.done";
const p = relative => path.join(root, ...relative.split("/"));
const exists = relative => fs.existsSync(p(relative));
const actions = [];
const record = (kind, relative) => actions.push({kind, path:relative});
const readRaw = relative => fs.readFileSync(p(relative), "utf8");
const write = (relative, content, { preserveEol = true } = {}) => {
  let output = content.endsWith("\n") ? content : `${content}\n`;
  if (preserveEol && exists(relative) && /\r\n/.test(readRaw(relative))) output = output.replace(/\n/g, "\r\n");
  record(exists(relative) ? "update" : "create", relative);
  if (!apply) return;
  fs.mkdirSync(path.dirname(p(relative)), { recursive: true });
  fs.writeFileSync(p(relative), output);
};
const replaceFile = (relative, transform) => {
  if (!exists(relative)) return;
  const beforeRaw = readRaw(relative);
  const before = beforeRaw.replace(/\r\n?/g, "\n");
  const after = transform(before);
  if (after !== before) write(relative, after);
};
const move = (source, target) => {
  if (!exists(source) || exists(target)) return;
  record("move", `${source} -> ${target}`);
  if (!apply) return;
  fs.mkdirSync(path.dirname(p(target)), { recursive: true });
  fs.renameSync(p(source), p(target));
};

function amendMetaGoalZero() {
  const file = "10_governance/source_of_truth/Elite_Build_Goals_v3.md";
  replaceFile(file, body => {
    let next = body.replace("**Version:** 3.0 Tightened", "**Version:** 3.1 Meta-Initialized");
    if (/^# 3\.0 Meta Goal 0 — Deterministic Autonomous Initialization$/m.test(next)) return next;
    const markerText = "# 3. Absolute Guardrails";
    const section = `# 3.0 Meta Goal 0 — Deterministic Autonomous Initialization\n\nWhen a user provides the WCBS Engineering Operating System to a supported LLM before beginning a project, the LLM must discover, load, validate, and activate the system before producing architecture, implementation, deployment, or launch work.\n\nThe system must:\n\n1. not depend on the user knowing which internal file to name;\n2. not depend on the model voluntarily exploring the repository correctly when a native delivery mechanism exists;\n3. not silently continue when a required file cannot be loaded;\n4. report delivery environment, substantiated activation tier, Kernel and Controller version, capability resolution, degraded modes, and initialized controls;\n5. confirm that the 16 Elite Build Goals are active and name any goal with no execution or verification path;\n6. block production implementation until required pre-build gates pass;\n7. state its activation tier honestly and never report a best-effort tier as enforced; and\n8. distinguish activation from initialization and never report one as the other.\n\nThe 16 goals define product quality. Meta Goal 0 ensures the system reaches the model and governs its behavior. A build satisfying all 16 goals while Meta Goal 0 was never satisfied is unverified, because the controls were never demonstrably active.\n\n---\n\n`;
    if (!next.includes(markerText)) throw new Error(`Missing insertion marker in ${file}`);
    return next.replace(markerText, `${section}${markerText}`);
  });
}

function collapseOnboarding() {
  move("QUICKSTART.md", "90_archive/superseded/QUICKSTART.md");
  move("docs/FIRST_10_MINUTES.md", "90_archive/superseded/FIRST_10_MINUTES.md");
  write("90_archive/superseded/README.md", "# Superseded Onboarding\n\nThe former quick-start documents were consolidated into `GET_STARTED.md`. They remain here for provenance only and carry no active authority.\n", {preserveEol:false});
  const consumers = ["README.md","INSTALL.md","MANIFEST.md","GET_STARTED.md","scripts/wcbs-doctor.mjs","scripts/check-install.mjs","scripts/install-adapter.mjs","scripts/wcbs-system-test.mjs","scripts/tests/product-readiness-contract.test.mjs"];
  for (const file of consumers) replaceFile(file, body => body.replaceAll("docs/FIRST_10_MINUTES.md", "GET_STARTED.md").replaceAll("QUICKSTART.md", "GET_STARTED.md"));
}

function routeAdaptersToKernel() {
  const files = ["AGENTS.md","CLAUDE.md","GEMINI.md","REPLIT.md","Manus.md",".github/copilot-instructions.md",".cursor/rules/super-build-kit.mdc"];
  for (const file of files) replaceFile(file, body => {
    if (body.includes("WCBS EOS Kernel route:")) return body;
    const preamble = "WCBS EOS Kernel route: read and execute `BOOTSTRAP.md` before any project work. Do not restate Kernel or governance logic here. If the Kernel or Controller cannot be loaded, stop and report the transport failure.\n\n";
    if (body.startsWith("---\n")) { const end=body.indexOf("\n---\n",4); if(end>=0) return `${body.slice(0,end+5)}\n${preamble}${body.slice(end+5).replace(/^\n+/,"")}`; }
    return `${preamble}${body}`;
  });
}

function backfillSkillContracts() {
  const skillsRoot=p("skills");
  for (const entry of fs.readdirSync(skillsRoot,{withFileTypes:true})) {
    if(!entry.isDirectory()) continue;
    const relative=`skills/${entry.name}/SKILL.md`;
    if(!exists(relative)) continue;
    const body=readRaw(relative).replace(/\r\n?/g,"\n");
    if(!body.startsWith("---\n")) continue;
    const end=body.indexOf("\n---\n",4); if(end<0) continue;
    const fields=new Map();
    for(const line of body.slice(4,end).split("\n")){const m=line.match(/^([a-z_]+):\s*(.*)$/);if(m)fields.set(m[1],m[2]);}
    let description=(fields.get("description")??`Use when ${entry.name.replaceAll("-"," ")} work is required.`).trim();
    if(!/use when|activate when|trigger/i.test(description))description=`Use when ${description.charAt(0).toLowerCase()}${description.slice(1)}`;
    if(description.length<40)description=`${description} Apply the canonical WCBS workflow and evidence gates.`;
    fields.set("name",entry.name);fields.set("description",description.slice(0,500));
    if(!fields.has("activation"))fields.set("activation","Activate when the description trigger applies to the current task.");
    if(!fields.has("required_inputs"))fields.set("required_inputs","Task request, relevant repository context, constraints, and authority dependencies.");
    if(!fields.has("required_outputs"))fields.set("required_outputs","Skill-specific artifact, verification evidence, canonical verdict, and next action.");
    if(!fields.has("authority_dependencies"))fields.set("authority_dependencies","00_start_here/SOURCE_OF_TRUTH.md; 10_governance/APIVR_EXECUTION_LIFECYCLE.md; 10_governance/source_of_truth/Elite_Build_Goals_v3.md.");
    if(!fields.has("evidence_requirements"))fields.set("evidence_requirements","Executed checks or an honest Unknown, Not Run, or Blocked state for every material claim.");
    const order=["name","description","activation","required_inputs","required_outputs","authority_dependencies","evidence_requirements"];
    const header=order.map(k=>`${k}: ${fields.get(k)}`).join("\n");
    const rest=body.slice(end+5).replace(/^\n+/,"");
    write(relative,`---\n${header}\n---\n\n${rest}`);
  }
}

function createRequiredDocs() {
  write("docs/specs/README.md", "# Design Specifications\n\nBefore implementation, write and approve `YYYY-MM-DD-<topic>-design.md` using `60_templates/DESIGN_SPEC_TEMPLATE.md`. Read-only analysis and execution of an already approved plan are exempt.\n", {preserveEol:false});
  write("60_templates/DESIGN_SPEC_TEMPLATE.md", "# Design Specification: <Topic>\n\n- Date:\n- Owner:\n- Approver:\n- Status: Draft | Approved | Superseded\n\n## Objective\n\n## Users And Outcomes\n\n## Scope And Non-Goals\n\n## Existing System And Source Of Truth\n\n## Proposed Design\n\n## Data, Security, Privacy, Accessibility, And Operations\n\n## Preserved Behavior\n\n## Acceptance Criteria\n\n## Verification Plan\n\n## Rollback Or Restoration\n\n## Explicit Approval\n", {preserveEol:false});
}

function generateSafeDerived() {
  if (!apply) { record("generate", "BOOTSTRAP_CONTROLLER.md and CAPABILITY_MATRIX.md"); return; }
  for(const script of ["scripts/generate-bootstrap-controller.mjs","scripts/generate-capability-matrix.mjs"]){const r=spawnSync(process.execPath,[script],{cwd:root,stdio:"inherit"});if(r.status!==0)throw new Error(`${script} failed with status ${r.status}`);}
}

if (exists(marker)) {
  console.log(`EOS v5 migration already applied at ${root}; marker ${marker} exists.`);
  process.exit(0);
}
amendMetaGoalZero();
collapseOnboarding();
routeAdaptersToKernel();
backfillSkillContracts();
createRequiredDocs();
generateSafeDerived();
if (apply) write(marker, JSON.stringify({migration:"eos-v5",completed_at:new Date().toISOString()},null,2), {preserveEol:false});
console.log(`${apply?"APPLY":"DRY RUN"}: EOS remediation plan for ${root}`);
for(const action of actions)console.log(`- ${action.kind}: ${action.path}`);
if(!apply)console.log("No files changed. Re-run with --apply --dest <repository-root> after reviewing this plan.");
