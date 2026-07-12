import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  validateManifest,
  validateToolMapping,
  validateManifestMappingConsistency,
  validateActivationMarkerUniqueness,
  loadManifests,
  renderCapabilityMatrix,
  CAPABILITY_TO_ACTION,
  ESSENTIAL_CAPABILITIES,
  REQUIRED_ACTIONS,
  SUPPORT_LEVELS
} from "../lib/adapter-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => fs.existsSync(path.join(root, p));
const REQUIRED_RUNTIMES = ["codex","cursor","github-copilot","claude","gemini","replit","manus","generic-agent"];
const baseManifest = () => ({runtime_id:"fixture",display_name:"Fixture",owner:"wfprieto",support_level:"Full",integration_shape:"in_process_plugin",native_install_mechanism:"plugin marketplace",install_scope:"project",bootstrap_path:"runtime_adapters/README.md",bootstrap_mode:"automatic",activation_marker:"WCBS_KIT_ACTIVE",tool_mapping_path:"runtime_adapters/tool_mappings/codex.json",capabilities:{file_read:"native",file_write:"native",file_edit:"native",execute_command:"native",subagents:"native",task_tracking:"native",web_access:"native",browser_verification:"native",durable_artifact_storage:"native",human_approval_gates:"native"},fallbacks:{},supported_runtime_versions:">=1.0",supported_operating_systems:["macos","linux","windows"],modifies_user_files:false,install:"x",update:"x",uninstall:"x",rollback:"x",limitations:"none known",deprecation:"none"});
const baseMapping=()=>{const actions={};for(const a of REQUIRED_ACTIONS)actions[a]={availability:"native",mechanism:"tool.x",required_parameters:[],fallback:null,limitations:"none",evidence_produced:"tool log"};return{runtime_id:"fixture",actions};};

test("invalid support level fails",()=>{const m=baseManifest();m.support_level="Excellent";assert.throws(()=>validateManifest(m),/support_level/);});
test("Full adapter with manual bootstrap fails",()=>{const m=baseManifest();m.bootstrap_mode="manual";assert.throws(()=>validateManifest(m),/Full.*automatic|bootstrap/i);});
test("Full adapter missing an essential capability fails",()=>{const m=baseManifest();m.capabilities.execute_command="unavailable";m.fallbacks.execute_command="none";assert.throws(()=>validateManifest(m),/essential/i);});
test("Partial adapter missing an essential capability fails",()=>{const m=baseManifest();m.support_level="Partial";m.capabilities.file_edit="unavailable";m.fallbacks.file_edit="rewrite whole file";assert.throws(()=>validateManifest(m),/essential/i);});
test("unsupported essential capability must be labeled Unsupported",()=>{const m=baseManifest();m.support_level="Unsupported";m.capabilities.execute_command="unavailable";m.fallbacks.execute_command="no safe fallback exists";assert.doesNotThrow(()=>validateManifest(m));});
test("manifest referencing a missing bootstrap path fails",()=>{const m=baseManifest();m.bootstrap_path="runtime_adapters/DOES_NOT_EXIST.md";assert.throws(()=>validateManifest(m,{root}),/bootstrap_path/i);});
test("manifest referencing a missing tool mapping fails",()=>{const m=baseManifest();m.tool_mapping_path="runtime_adapters/tool_mappings/nope.json";assert.throws(()=>validateManifest(m,{root}),/tool_mapping_path/i);});
test("degradable or unavailable capability without a fallback fails",()=>{const m=baseManifest();m.support_level="Partial";m.capabilities.subagents="degradable";assert.throws(()=>validateManifest(m),/fallback/i);});
test("missing lifecycle field fails",()=>{const m=baseManifest();delete m.rollback;assert.throws(()=>validateManifest(m),/rollback/);});
test("mapping missing a required action fails",()=>{const mp=baseMapping();delete mp.actions.dispatch_agent;assert.throws(()=>validateToolMapping(mp),/dispatch_agent/);});
test("mapping containing an undeclared action fails",()=>{const mp=baseMapping();mp.actions.launch_missiles={availability:"native",mechanism:"x"};assert.throws(()=>validateToolMapping(mp),/undeclared|launch_missiles/i);});
test("non-native mapping action without a fallback fails",()=>{const mp=baseMapping();mp.actions.subagents=undefined;mp.actions.dispatch_agent.availability="unavailable";mp.actions.dispatch_agent.fallback=null;assert.throws(()=>validateToolMapping(mp),/fallback/i);});
test("every required runtime has a manifest and a tool mapping",()=>{for(const r of REQUIRED_RUNTIMES){assert.ok(exists(`runtime_adapters/manifests/${r}.json`));assert.ok(exists(`runtime_adapters/tool_mappings/${r}.json`));}});
test("every shipped manifest validates against the contract",()=>{for(const r of REQUIRED_RUNTIMES){const m=JSON.parse(read(`runtime_adapters/manifests/${r}.json`));assert.doesNotThrow(()=>validateManifest(m,{root}));assert.equal(m.runtime_id,r);assert.ok(SUPPORT_LEVELS.includes(m.support_level));}});
test("every shipped tool mapping validates against the contract",()=>{for(const r of REQUIRED_RUNTIMES){const mp=JSON.parse(read(`runtime_adapters/tool_mappings/${r}.json`));assert.doesNotThrow(()=>validateToolMapping(mp));assert.equal(mp.runtime_id,r);}});
test("adapter JSON schemas exist and are valid JSON",()=>{for(const s of ["runtime_adapters/schemas/adapter-manifest.schema.json","runtime_adapters/schemas/tool-mapping.schema.json"]){assert.ok(exists(s));assert.doesNotThrow(()=>JSON.parse(read(s)));}});
test("capability matrix is generated from manifests and not hand-edited",()=>{const f="runtime_adapters/CAPABILITY_MATRIX.md";assert.ok(exists(f));const onDisk=read(f);assert.match(onDisk,/GENERATED FILE/i);const expected=renderCapabilityMatrix(loadManifests(root));assert.equal(onDisk.trim(),expected.trim());});
test("portability contract and porting guide exist with binding sections",()=>{const contract="runtime_adapters/PORTABILITY_CONTRACT.md";assert.ok(exists(contract));const body=read(contract);assert.match(body,/native-install-only/i);assert.match(body,/automatic activation/i);assert.match(body,/adapter definition of done/i);assert.match(body,/A file's existence does not imply/i);for(const cap of ESSENTIAL_CAPABILITIES)assert.ok(body.includes(cap));assert.ok(exists("runtime_adapters/PORTING_GUIDE.md"));assert.ok(exists("runtime_adapters/ADAPTER_PULL_REQUEST_CHECKLIST.md"));});
test("runtime adapter README is a router, not a duplicated skill inventory",()=>{const body=read("runtime_adapters/README.md");assert.match(body,/PORTABILITY_CONTRACT\.md/);assert.match(body,/CAPABILITY_MATRIX\.md/);assert.match(body,/PORTING_GUIDE\.md/);const skillLines=body.split("\n").filter((l)=>/^\s*[-*]\s+`skills\//.test(l));assert.ok(skillLines.length<=2);});
test("a manifest capability contradicting its mapped action fails",()=>{const m=baseManifest(),mp=baseMapping();m.capabilities.task_tracking="native";mp.actions.create_task.availability="degradable";mp.actions.create_task.fallback="use a ledger file";assert.throws(()=>validateManifestMappingConsistency(m,mp),/task_tracking|create_task/);});
test("a manifest capability matching its mapped action passes",()=>{assert.doesNotThrow(()=>validateManifestMappingConsistency(baseManifest(),baseMapping()));});
test("every shipped manifest agrees with its shipped tool mapping",()=>{for(const r of REQUIRED_RUNTIMES){const m=JSON.parse(read(`runtime_adapters/manifests/${r}.json`));const mp=JSON.parse(read(`runtime_adapters/tool_mappings/${r}.json`));assert.doesNotThrow(()=>validateManifestMappingConsistency(m,mp));}});
test("capability-to-action mapping covers every equivalent pair",()=>{for(const [cap,action] of Object.entries(CAPABILITY_TO_ACTION))assert.ok(REQUIRED_ACTIONS.includes(action),`${cap} maps to unknown action ${action}`);});
test("duplicate activation markers across runtimes fail",()=>{const a={...baseManifest(),runtime_id:"one",activation_marker:"WCBS_KIT_ACTIVE:one"};const b={...baseManifest(),runtime_id:"one",activation_marker:"WCBS_KIT_ACTIVE:one"};assert.throws(()=>validateActivationMarkerUniqueness([a,b]),/unique/i);});
test("a marker that does not name its runtime fails",()=>{const a={...baseManifest(),runtime_id:"one",activation_marker:"SAME"};assert.throws(()=>validateActivationMarkerUniqueness([a]),/must be exactly/i);});
test("every shipped manifest has a unique, runtime-specific activation marker",()=>{const manifests=loadManifests(root);assert.doesNotThrow(()=>validateActivationMarkerUniqueness(manifests));for(const m of manifests)assert.ok(m.activation_marker.includes(m.runtime_id));});
