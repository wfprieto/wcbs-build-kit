#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  loadManifests, renderCapabilityMatrix, validateManifest, validateToolMapping,
  validateManifestMappingConsistency, validateActivationMarkerUniqueness
} from "./lib/adapter-contract.mjs";
import { validateAgainstSchema } from "./lib/json-schema.mjs";

const root = process.cwd();
const strict = process.argv.includes("--strict");
const errors = [];
const warnings = [];
const display = p => p.replaceAll("\\", "/");
const resolve = p => path.join(root, ...p.split("/"));
const exists = p => fs.existsSync(resolve(p));
const normalizeText = content => content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
const read = p => normalizeText(fs.readFileSync(resolve(p), "utf8"));
const fail = message => errors.push(message);
const warn = message => warnings.push(message);
const ignoredDirectoryNames = new Set([".git",".agents","node_modules","90_archive","Updates"]);

const runtimes = ["codex","cursor","github-copilot","claude","gemini","replit","manus","generic-agent"];
const requiredFiles = [
  "README.md","INSTALL.md","QUICKSTART.md","MANIFEST.md","DISTRIBUTION_POLICY.md","SUPPORT_MATRIX.md","CHANGELOG.md","RELEASE_PROCESS.md","VERSIONING.md","SECURITY.md",
  "GET_STARTED.md",
  "AGENTS.md","CLAUDE.md","GEMINI.md","REPLIT.md","Manus.md",
  "00_start_here/START_HERE.md","00_start_here/SOURCE_OF_TRUTH.md","00_start_here/LOAD_ORDER.md",
  "10_governance/APIVR_EXECUTION_LIFECYCLE.md","10_governance/ELITE_BUILD_GOALS_SUMMARY.md","10_governance/RELEASE_GATES.md","10_governance/DUPLICATE_GUIDANCE_BASELINE.json",
  "50_audits/AUDIT_TIER_ROUTER.md","50_audits/CANONICAL_AUDIT_PROTOCOLS.md",
  "skills/super-build-kit/SKILL.md","skills/subagent-driven-development/SKILL.md",
  "skills/subagent-driven-development/ARTIFACT_CONTRACT.md",
  "skills/subagent-driven-development/scripts/make-review-package.py",
  ...["implementer","task-reviewer","fix-agent","final-reviewer"].map(x=>`skills/subagent-driven-development/prompts/${x}-prompt.md`),
  ...["task-artifact","review-finding","progress-ledger"].map(x=>`skills/subagent-driven-development/schemas/${x}.schema.json`),
  "skills/subagent-driven-development/tests/test_make_review_package.py",
  ...["PRE_FLIGHT_CONFLICT_REPORT","TASK_BRIEF","IMPLEMENTER_REPORT","TASK_REVIEW_REPORT","FIX_REPORT","FINAL_BRANCH_REVIEW"].map(x=>`60_templates/${x}_TEMPLATE.md`),
  "60_templates/PROGRESS_LEDGER_TEMPLATE.jsonl",
  "runtime_adapters/README.md","runtime_adapters/PORTABILITY_CONTRACT.md","runtime_adapters/PORTING_GUIDE.md",
  "runtime_adapters/ADAPTER_PULL_REQUEST_CHECKLIST.md","runtime_adapters/CAPABILITY_MATRIX.md","runtime_adapters/VERIFIED_SUPPORT_LEVELS.md",
  "runtime_adapters/INSTALLATION_MATRIX.md","runtime_adapters/ACTIVATION_TESTS.md",
  "runtime_adapters/schemas/adapter-manifest.schema.json","runtime_adapters/schemas/tool-mapping.schema.json",
  "60_templates/RELEASE_CANDIDATE_REPORT_TEMPLATE.md","60_templates/STABLE_RELEASE_REPORT_TEMPLATE.md",
  "docs/USING_THE_SUPER_BUILD_KIT.md","docs/COMMON_WORKFLOWS.md",
  "scripts/generate-capability-matrix.mjs","scripts/run-python-tests.mjs","scripts/wcbs-system-test.mjs","scripts/check-install.mjs","scripts/install-adapter.mjs","scripts/adapter-smoke-test.mjs","scripts/lib/adapter-contract.mjs","scripts/lib/json-schema.mjs","scripts/audit-duplicate-guidance.mjs","scripts/audit-skill-size.mjs",
  "tests/system/routing-fixtures.json","tests/system/activation-scenarios.json",
  ...["controller-contract","adapter-contract","schema-enforcement","wcbs-doctor","artifact-bundle"].map(x=>`scripts/tests/${x}.test.mjs`),
  "scripts/tests/fixtures/run-bundle/findings.json","scripts/tests/fixtures/run-bundle/progress-ledger.jsonl",
  "scripts/tests/fixtures/run-bundle/tasks/T-01/task-artifact.json","scripts/tests/fixtures/run-bundle/tasks/T-02/task-artifact.json",
  ".gitattributes",".gitignore",".codex-plugin/plugin.json",".cursor/rules/super-build-kit.mdc",".github/copilot-instructions.md",
  ".github/workflows/verify.yml",".github/workflows/release-check.yml",".github/RELEASE_CANDIDATE_CHECKLIST.md"
];

function json(p) {
  if (!exists(p)) return null;
  try { return JSON.parse(read(p)); }
  catch (e) { fail(`Invalid JSON in ${display(p)}: ${e.message}`); return null; }
}
function checkRequiredFiles() { for (const p of requiredFiles) if (!exists(p)) fail(`Missing required file: ${display(p)}`); }
function checkPackage() {
  const p = json("package.json"); if (!p) return;
  if (p.private !== true) fail("package.json must remain private.");
  for (const k of ["dependencies","devDependencies","peerDependencies","optionalDependencies"])
    if (p[k] && Object.keys(p[k]).length) fail(`package.json should not add install dependencies; found ${k}.`);
  const expectedScripts = {
    doctor: "node scripts/wcbs-doctor.mjs",
    verify: "node scripts/wcbs-doctor.mjs --strict",
    "check:matrix": "node scripts/generate-capability-matrix.mjs --check",
    "test:node": "node --test scripts/tests/*.test.mjs",
    "test:python": "node scripts/run-python-tests.mjs",
    "system-test": "node scripts/wcbs-system-test.mjs",
    "check-install": "node scripts/check-install.mjs",
    "behavior-test": "node scripts/run-behavior-fixtures.mjs",
    "version:audit": "node scripts/audit-version-drift.mjs",
    "audit:duplicates": "node scripts/audit-duplicate-guidance.mjs",
    "audit:skill-size": "node scripts/audit-skill-size.mjs",
    "audit:governance": "npm run audit:duplicates && npm run audit:skill-size",
    test: "npm run test:node && npm run test:python",
    check: "npm run doctor && npm run check:matrix && npm run version:audit && npm run audit:governance && npm run behavior-test && npm run test",
    "release-check": "npm run check && npm run system-test && npm run check-install && npm run build:release-artifacts"
  };
  for (const [name, command] of Object.entries(expectedScripts)) if (p.scripts?.[name] !== command) fail(`package.json script ${name} must be exactly: ${command}`);
  const plugin = json(".codex-plugin/plugin.json");
  if (plugin && plugin.version !== p.version) fail(`.codex-plugin/plugin.json version (${plugin.version}) must match package.json version (${p.version}).`);
}
function checkSkills() {
  const dir=resolve("skills"); if(!fs.existsSync(dir)){fail("Missing skills directory.");return;}
  const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(e.name==="SKILL.md"){const c=normalizeText(fs.readFileSync(f,"utf8")),r=display(path.relative(root,f));if(!c.startsWith("---\n"))fail(`Skill missing YAML frontmatter: ${r}`);if(!/^name:\s*[a-z0-9-]+$/m.test(c))fail(`Skill missing valid name field: ${r}`);if(!/^description:\s*\S.+$/m.test(c))fail(`Skill missing description field: ${r}`);}}};walk(dir);
}
function checkWiring() {
  const required = new Map([
    ["00_start_here/LOAD_ORDER.md",["skills/subagent-driven-development/SKILL.md","runtime_adapters/PORTABILITY_CONTRACT.md","runtime_adapters/PORTING_GUIDE.md"]],
    ["00_start_here/START_HERE.md",["Audit wide. Fix narrow. Prove everything.","skills/subagent-driven-development/SKILL.md","runtime_adapters/PORTABILITY_CONTRACT.md"]],
    ["runtime_adapters/README.md",["runtime_adapters/PORTABILITY_CONTRACT.md","runtime_adapters/PORTING_GUIDE.md","runtime_adapters/CAPABILITY_MATRIX.md","runtime_adapters/ADAPTER_PULL_REQUEST_CHECKLIST.md"]],
    ["skills/subagent-driven-development/SKILL.md",["A fix attempt does not clear a finding","FIXED_PENDING_REVIEW","CANNOT_VERIFY_FROM_DIFF","plan_base_sha..branch_head_sha","pre-flight conflict scan","repair budget","neutrality","verbatim","file-based handoff","skills/subagent-driven-development/prompts/final-reviewer-prompt.md"]],
    ["skills/subagent-driven-development/ARTIFACT_CONTRACT.md",["task-artifact.json","task-artifact.schema.json","exact command, the exit status, and the result"]]
  ]);
  for(const [file,terms] of required){if(!exists(file))continue;const c=read(file);for(const t of terms)if(!c.toLowerCase().includes(t.toLowerCase()))fail(`${display(file)} does not define the ${t==="A fix attempt does not clear a finding"?"material-finding re-review":`required activation text: ${t}`}.`);}
  const src=read("skills/subagent-driven-development/scripts/make-review-package.py");
  if(src.includes('"--diff"')) fail("skills/subagent-driven-development/scripts/make-review-package.py still accepts a hand-supplied --diff; the review range must be generated from base..head.");
  for(const file of ["skills/subagent-driven-development/SKILL.md","skills/subagent-driven-development/ARTIFACT_CONTRACT.md",...requiredFiles.filter(x=>x.includes("/prompts/"))]) if(exists(file)) for(const line of read(file).split("\n")) if(line.includes("HEAD~1")&&!/prohibit|forbidden|must not|never|reject|do not/i.test(line)) fail(`${display(file)} recommends a shortcut review range (HEAD~1) outside a prohibition.`);
}
function checkEvidenceVocabulary(){const s=read("00_start_here/SOURCE_OF_TRUTH.md");for(const x of ["Verified","Likely","Suspected","Unknown","Not Run","Blocked"])if(!s.includes(x))fail(`SOURCE_OF_TRUTH.md does not define evidence state: ${x}`);for(const p of ["00_start_here/START_HERE.md","00_start_here/LOAD_ORDER.md","skills/super-build-kit/SKILL.md","skills/subagent-driven-development/SKILL.md"])if(exists(p))for(const x of ["Inconclusive","Not Applicable"])if(read(p).includes(x))fail(`${display(p)} uses non-canonical evidence term: ${x}`);}
function schema(p){return json(p);}
function checkAdapters(){
  const ms=schema("runtime_adapters/schemas/adapter-manifest.schema.json"), ts=schema("runtime_adapters/schemas/tool-mapping.schema.json"); if(!ms||!ts)return;
  const manifests=[];
  for(const id of runtimes){
    const mf=`runtime_adapters/manifests/${id}.json`, tf=`runtime_adapters/tool_mappings/${id}.json`;
    if(!exists(mf)){fail(`Missing adapter manifest for claimed runtime: ${mf}`);continue;} if(!exists(tf)){fail(`Missing tool mapping for claimed runtime: ${tf}`);continue;}
    const m=json(mf),t=json(tf); if(!m||!t)continue; manifests.push(m);
    for(const e of validateAgainstSchema(ms,m))fail(`${mf} violates adapter-manifest.schema.json: ${e}`);
    for(const e of validateAgainstSchema(ts,t))fail(`${tf} violates tool-mapping.schema.json: ${e}`);
    try{validateManifest(m,{root});}catch(e){fail(`Adapter contract violation: ${e.message}`);}
    try{validateToolMapping(t);}catch(e){fail(`Tool mapping violation: ${e.message}`);}
    try{validateManifestMappingConsistency(m,t);}catch(e){fail(`Adapter consistency violation: ${e.message}`);}
  }
  try{validateActivationMarkerUniqueness(manifests);}catch(e){fail(`Activation marker violation: ${e.message}`);}
  const matrix="runtime_adapters/CAPABILITY_MATRIX.md";
  if(exists(matrix)){const c=read(matrix);if(!/GENERATED FILE/i.test(c))fail(`${matrix} is missing its generated-file warning; it must not be hand-authored.`);else if(c.trim()!==renderCapabilityMatrix(loadManifests(root)).trim())fail(`${matrix} is stale or hand-edited. Manifests are canonical. Regenerate with: npm run generate:matrix`);}
}
function checkVerifiedSupportLevels(){
  const file = "runtime_adapters/VERIFIED_SUPPORT_LEVELS.md";
  if(!exists(file)) return;
  const body = read(file);
  for(const level of ["Documented","Structurally Verified","Installed In Isolated Fixture","Behaviorally Verified","Runtime Verified"])
    if(!body.includes(level)) fail(`${file} must define verified support level: ${level}`);
  for(const id of runtimes)
    if(!body.includes(`| \`${id}\` |`)) fail(`${file} must include runtime row for ${id}.`);
  if(!body.includes("Do not report a runtime as `Runtime Verified`"))
    fail(`${file} must include the runtime-verification claim rule.`);
}
function checkBundles(){
  const tschema=schema("skills/subagent-driven-development/schemas/task-artifact.schema.json"), fschema=schema("skills/subagent-driven-development/schemas/review-finding.schema.json"), lschema=schema("skills/subagent-driven-development/schemas/progress-ledger.schema.json"); if(!tschema||!fschema||!lschema)return;
  const bundles=["scripts/tests/fixtures/run-bundle"], live=resolve(".wcbs/runs"); if(fs.existsSync(live))for(const x of fs.readdirSync(live))if(fs.statSync(path.join(live,x)).isDirectory())bundles.push(`.wcbs/runs/${x}`);
  for(const b of bundles){
    const fp=`${b}/findings.json`,lp=`${b}/progress-ledger.jsonl`,tasks=resolve(`${b}/tasks`);
    const ledgerTaskIds=new Set();
    if(exists(fp)){const a=json(fp);if(a)for(const f of a)for(const e of validateAgainstSchema(fschema,f))fail(`${fp} finding ${f.finding_id} violates review-finding.schema.json: ${e}`);}
    if(exists(lp))read(lp).split("\n").filter(Boolean).forEach((line,i)=>{let v;try{v=JSON.parse(line);}catch(e){fail(`${lp} line ${i+1} is not valid JSON: ${e.message}`);return;}ledgerTaskIds.add(v.task_id);for(const e of validateAgainstSchema(lschema,v))fail(`${lp} line ${i+1} violates progress-ledger.schema.json: ${e}`);});
    if(!fs.existsSync(tasks)){fail(`${b} is missing its tasks directory and machine-readable task artifacts.`);continue;}
    const artifactTaskIds=new Set();
    for(const entry of fs.readdirSync(tasks,{withFileTypes:true})) if(entry.isDirectory()){
      const tp=`${b}/tasks/${entry.name}/task-artifact.json`;
      if(!exists(tp)){fail(`Missing required task artifact: ${tp}`);continue;}
      const task=json(tp); if(task){artifactTaskIds.add(task.task_id);for(const e of validateAgainstSchema(tschema,task))fail(`${tp} violates task-artifact.schema.json: ${e}`);}
    }
    for(const taskId of ledgerTaskIds) if(!artifactTaskIds.has(taskId)) fail(`${b} progress ledger references task ${taskId} without a matching task-artifact.json.`);
  }
}
function checkWorkflowFiles(){for(const file of [".github/workflows/verify.yml",".github/workflows/release-check.yml"]){if(!exists(file))continue;const c=read(file);if(!c.includes("npm run verify"))fail(`${file} must run npm run verify.`);if(!c.includes("permissions:"))fail(`${file} must define permissions.`);}if(exists(".github/workflows/release-check.yml")&&!read(".github/workflows/release-check.yml").includes("npm run system-test"))fail(".github/workflows/release-check.yml must run npm run system-test.");}
function checkSecrets(){
  const secretPatterns=[/AKIA[0-9A-Z]{16}/g,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,/sk-(?:proj-)?[A-Za-z0-9_-]{20,}/g,/gh[pousr]_[A-Za-z0-9]{20,}/g];
  const textExtensions=new Set([".md",".json",".jsonl",".mjs",".js",".py",".yml",".yaml",".txt",".toml",".ini",".sh",".ps1",".bat",".cmd"]);
  const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){if(ignoredDirectoryNames.has(e.name))continue;const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(textExtensions.has(path.extname(e.name).toLowerCase())||["AGENTS.md","CLAUDE.md","GEMINI.md","REPLIT.md","Manus.md"].includes(e.name)){let c;try{c=normalizeText(fs.readFileSync(f,"utf8"));}catch{continue;}for(const pattern of secretPatterns){pattern.lastIndex=0;if(pattern.test(c))fail(`Potential secret material detected in ${display(path.relative(root,f))}.`);}}}};walk(root);
}
function checkManifest(){const body=read("MANIFEST.md");for(const p of ["00_start_here/","10_governance/","skills/","runtime_adapters/","scripts/"])if(!body.includes(p))fail(`MANIFEST.md does not identify active system path: ${p}`);}
function checkNoArchiveReferences(){
  const activeRoots=["00_start_here","10_governance","20_skills","30_agents","40_knowledge","50_audits","60_templates","skills","runtime_adapters","docs"];
  for(const dir of activeRoots){const full=resolve(dir);if(!fs.existsSync(full))continue;const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(e.name.endsWith(".md")){const c=normalizeText(fs.readFileSync(f,"utf8"));if(/90_archive\//.test(c)&&!/provenance|archive|historical|not active|not source.of.truth/i.test(c))warn(`${display(path.relative(root,f))} references 90_archive without an explicit provenance qualifier.`);}}};walk(full);}
}

checkRequiredFiles();
checkPackage();
checkSkills();
checkWiring();
checkEvidenceVocabulary();
checkAdapters();
checkVerifiedSupportLevels();
checkBundles();
checkWorkflowFiles();
checkSecrets();
checkManifest();
checkNoArchiveReferences();

for(const warning of warnings) console.warn(`WARN: ${warning}`);
if(errors.length){for(const error of errors)console.error(`FAIL: ${error}`);console.error(`\nWCBS doctor failed with ${errors.length} error(s).`);process.exit(1);}
if(strict&&warnings.length){console.error(`\nWCBS strict verification failed with ${warnings.length} warning(s).`);process.exit(1);}
console.log(`PASS: WCBS doctor${strict?" strict":""} verification completed.`);