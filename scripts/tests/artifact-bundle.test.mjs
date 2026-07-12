/**
 * Artifact-bundle validation (F-006), exact activation-marker binding (F-010),
 * and clean-checkout independence (F-011).
 *
 * HERMETIC: these tests validate a COMMITTED fixture at
 * scripts/tests/fixtures/run-bundle/, not whatever happens to sit in the
 * developer's gitignored .wcbs/ directory.
 *
 * A live bundle, if present, is validated too. Its ABSENCE must never fail the
 * gate, because it is not part of the repository.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateAgainstSchema } from "../lib/json-schema.mjs";
import { validateActivationMarkerUniqueness, loadManifests } from "../lib/adapter-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const readText = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => fs.existsSync(path.join(root, p));
const TASK_SCHEMA = readJson("skills/subagent-driven-development/schemas/task-artifact.schema.json");
const FINDING_SCHEMA = readJson("skills/subagent-driven-development/schemas/review-finding.schema.json");
const LEDGER_SCHEMA = readJson("skills/subagent-driven-development/schemas/progress-ledger.schema.json");
const FIXTURE = "scripts/tests/fixtures/run-bundle";
function liveBundles() { const base=path.join(root,".wcbs","runs"); if(!fs.existsSync(base))return[]; return fs.readdirSync(base).filter((entry)=>fs.statSync(path.join(base,entry)).isDirectory()).map((entry)=>`.wcbs/runs/${entry}`); }
const allBundles=()=>[FIXTURE,...liveBundles()];
const parseLedger=(dir)=>readText(`${dir}/progress-ledger.jsonl`).split("\n").filter((line)=>line.trim()!=="").map((line)=>JSON.parse(line));
function taskArtifacts(dir){const base=path.join(root,dir,"tasks");if(!fs.existsSync(base))return[];return fs.readdirSync(base,{withFileTypes:true}).filter((entry)=>entry.isDirectory()).map((entry)=>`${dir}/tasks/${entry.name}/task-artifact.json`);}
test("the committed run-bundle fixture exists",()=>{assert.ok(exists(`${FIXTURE}/findings.json`));assert.ok(exists(`${FIXTURE}/progress-ledger.jsonl`));assert.ok(exists(`${FIXTURE}/tasks/T-01/task-artifact.json`));});
test("the test gate does not depend on a gitignored directory",()=>{assert.ok(exists(FIXTURE));assert.doesNotThrow(()=>liveBundles());});
test("every packaged task artifact validates against task-artifact.schema.json",()=>{for(const dir of allBundles()){const paths=taskArtifacts(dir);assert.ok(paths.length>0,`${dir} has no machine-readable task artifact`);for(const artifact of paths)assert.deepEqual(validateAgainstSchema(TASK_SCHEMA,readJson(artifact)),[]);}});
test("every packaged finding validates against review-finding.schema.json",()=>{for(const dir of allBundles()){const findings=readJson(`${dir}/findings.json`);assert.ok(Array.isArray(findings)&&findings.length>0);for(const finding of findings)assert.deepEqual(validateAgainstSchema(FINDING_SCHEMA,finding),[]);}});
test("every packaged progress-ledger entry validates against progress-ledger.schema.json",()=>{for(const dir of allBundles()){const entries=parseLedger(dir);assert.ok(entries.length>0);for(const entry of entries)assert.deepEqual(validateAgainstSchema(LEDGER_SCHEMA,entry),[]);}});
test("a task artifact missing its immutable brief revision is rejected",()=>{const bad={...readJson(`${FIXTURE}/tasks/T-01/task-artifact.json`)};delete bad.brief_revision;assert.ok(validateAgainstSchema(TASK_SCHEMA,bad).length>0);});
test("packaged findings use only canonical reviewer roles",()=>{const allowed=FINDING_SCHEMA.properties.opened_by.enum;for(const dir of allBundles())for(const finding of readJson(`${dir}/findings.json`))assert.ok(allowed.includes(finding.opened_by));});
test("a finding with a non-canonical role is rejected",()=>{const bad={...readJson(`${FIXTURE}/findings.json`)[0],opened_by:"external_reviewer"};assert.ok(validateAgainstSchema(FINDING_SCHEMA,bad).length>0);});
test("a finding with an undeclared top-level property is rejected",()=>{const bad={...readJson(`${FIXTURE}/findings.json`)[0],smuggled_field:"hello"};assert.ok(validateAgainstSchema(FINDING_SCHEMA,bad).length>0);});
test("the declared note field is permitted",()=>{const withNote={...readJson(`${FIXTURE}/findings.json`)[0],note:"rationale belongs in a declared field, not smuggled past the schema"};assert.deepEqual(validateAgainstSchema(FINDING_SCHEMA,withNote),[]);});
test("a ledger entry with an invalid verdict is rejected",()=>{const bad={...parseLedger(FIXTURE)[0],review_verdict:"PROBABLY FINE"};assert.ok(validateAgainstSchema(LEDGER_SCHEMA,bad).length>0);});
test("incomplete test evidence is rejected",()=>{const bad={...parseLedger(FIXTURE)[0],tests_run:[{command:"npm test",exit_status:0}]};assert.ok(validateAgainstSchema(LEDGER_SCHEMA,bad).length>0);});
test("a marker naming a different runtime is rejected",()=>{const claude=loadManifests(root).find((m)=>m.runtime_id==="claude");assert.ok(claude);for(const marker of ["WCBS_KIT_ACTIVE:notclaude","WCBS_KIT_ACTIVE:claude-extra","WCBS_KIT_ACTIVE:xclaude"])assert.throws(()=>validateActivationMarkerUniqueness([{...claude,activation_marker:marker}]),/activation_marker must be exactly/i);});
test("the exact documented markers are accepted",()=>{assert.doesNotThrow(()=>validateActivationMarkerUniqueness(loadManifests(root)));});
test("every shipped marker equals WCBS_KIT_ACTIVE:<runtime_id> exactly",()=>{for(const m of loadManifests(root))assert.equal(m.activation_marker,`WCBS_KIT_ACTIVE:${m.runtime_id}`);});
