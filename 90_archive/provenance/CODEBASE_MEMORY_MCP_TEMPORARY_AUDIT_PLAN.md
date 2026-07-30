# Codebase Memory MCP Temporary Audit Plan

Date: 2026-06-28

Source tool under consideration: `DeusData/codebase-memory-mcp`

Purpose: use codebase-memory-mcp temporarily as an audit aid to improve the Super Build Kit's internal connectivity, activation graph, discoverability, and symbiotic efficiency without adding it as a dependency, adapter, or required runtime component.

## APIVR Tier

Comprehensive.

Reason: this work may temporarily install or run a local binary, use MCP-style tooling, create generated graph artifacts, and influence multiple source-of-truth, skill, audit, template, adapter, and doctor-check files. It does not touch production systems, money, private customer data, or live third-party targets, so Forensic is not required unless the tool unexpectedly requests secrets, agent config writes, or broad filesystem access.

## Applicable Elite Build Goals

| Goal | Applicability | Reason |
|---:|---|---|
| 1 | High | Preserve APIVR and Elite Build Goals as permanent authority. |
| 2 | High | Improve activation, load order, routing, and evidence flow. |
| 3 | High | Detect duplicated, orphaned, or weakly connected files. |
| 4 | High | Keep changes narrow and reversible. |
| 5 | High | Protect safety, privacy, permissions, and local agent configs. |
| 6 | Medium | Improve maintainability and discoverability. |
| 7 | Medium | Improve audit and release-readiness evidence. |
| 8 | Medium | Strengthen documentation and handoff quality. |
| 9 | Medium | Improve agent/runtime portability without adding hidden dependencies. |
| 10 | High | Verify all claims through doctor checks and explicit audit outputs. |

## Current-State Summary

- The Super Build Kit currently contains 107 tracked/discoverable files from `rg --files`.
- The active root contains no root-level repo publishing scripts after the SkillSpector safety pass.
- Verification command `node scripts/wcbs-doctor.mjs --strict` currently passes.
- The kit is mostly Markdown, skill files, templates, runtime adapter files, JSON, and a small Node doctor script.
- codebase-memory-mcp is strongest for source-code graphs, call graphs, route graphs, impact analysis, graph queries, dead-code detection, and architecture overview.
- Therefore, its value for this kit must be tested instead of assumed. If it does not index Markdown-heavy skill documentation well enough, use its output only as a secondary signal.

## Source Tool Facts

Observed from the upstream README:

- It builds a local persistent knowledge graph of a codebase.
- It exposes CLI and MCP tools including `index_repository`, `get_graph_schema`, `get_architecture`, `search_graph`, `search_code`, `detect_changes`, `query_graph`, and `manage_adr`.
- It reads the codebase and can write agent configuration files during normal install.
- It supports a binary-only path through `--skip-config`.
- It stores persistent databases by default under `~/.cache/codebase-memory-mcp`.
- It can write `.codebase-memory/graph.db.zst` into the repo as a shared artifact.
- It has an `auto_index` mode and watcher behavior that must remain disabled for this temporary audit.

## Objective

Use codebase-memory-mcp as a temporary structural audit aid to identify:

- disconnected or under-connected skills;
- orphaned templates and knowledge docs;
- missing load-order references;
- missing doctor-check coverage;
- duplicate or overlapping workflow lanes;
- weak provenance links;
- mismatches between `START_HERE`, `LOAD_ORDER`, `AGENT_ACTIVATION_MATRIX`, audits, templates, adapters, and `scripts/wcbs-doctor.mjs`;
- opportunities to simplify or strengthen activation paths.

## In Scope

- Temporary download or extraction of the codebase-memory-mcp binary into a workspace scratch folder.
- Binary-only usage; no agent auto-configuration.
- Local cache directory inside the workspace scratch area through `CBM_CACHE_DIR`.
- CLI-only calls where possible.
- A generated audit report under `90_archive/provenance/`.
- Small, targeted kit improvements if the audit exposes clear gaps.
- Final verification with `node scripts/wcbs-doctor.mjs --strict`.

## Out Of Scope

- Adding codebase-memory-mcp to `package.json`.
- Adding it as a Super Build Kit dependency.
- Adding it to `START_HERE` as required tooling.
- Installing MCP entries into Claude, Codex, Gemini, Cursor, VS Code, or any user agent config.
- Running one-line install scripts such as `curl | bash` or `irm | iex`.
- Enabling `auto_index`.
- Starting the optional graph UI unless explicitly needed and approved later.
- Committing `.codebase-memory/graph.db.zst`.
- Keeping generated graph databases after the audit unless a report explicitly justifies retention.

## Preserved Behavior

- APIVR remains the highest operational lifecycle.
- `apivr.skill` and Elite Build Goals remain the highest authority.
- The kit remains portable, Markdown-first, dependency-light, and LLM-agnostic.
- `package.json` remains private and dependency-free.
- Doctor/verify commands remain the supported local verification surface.

## Smallest Safe Change

Use codebase-memory-mcp as a temporary read-only analyzer first. Do not edit kit files until:

1. the tool runs from a temporary location;
2. cache/artifact paths are bounded to the workspace;
3. no agent config files are modified;
4. index quality is measured;
5. candidate findings are confirmed with direct file reads or local grep.

## Setup And Tooling Plan

### Scratch Boundary

Use only these temporary locations:

- `.tmp-codebase-memory-mcp/`
- `.tmp-cbm-cache/`
- `.tmp-cbm-output/`

Forbidden locations:

- user home agent config directories;
- `.claude/`, `.codex/`, `.gemini/`, VS Code user config, global MCP config;
- `~/.cache/codebase-memory-mcp`;
- `.codebase-memory/` as a committed repo artifact.

### Safe Acquisition Path

1. Request temporary network permission.
2. Download the latest Windows amd64 release ZIP and `checksums.txt` from GitHub releases.
3. Verify SHA-256 checksum before extracting.
4. Extract into `.tmp-codebase-memory-mcp/`.
5. Do not run `install.ps1`.
6. Do not run `codebase-memory-mcp install`.
7. If the binary cannot be verified, stop and mark the tool-run evidence `Blocked`.

### Environment

Set for the command only:

```powershell
$env:CBM_CACHE_DIR = "<workspace>\\.tmp-cbm-cache"
$env:CBM_LOG_LEVEL = "warn"
```

Do not set `CBM_DIAGNOSTICS` unless debugging the tool itself.

## Codebase-Memory Query Plan

Run these in order if the binary verifies:

1. Index the repository:

```powershell
.\.tmp-codebase-memory-mcp\codebase-memory-mcp.exe cli index_repository '{"repo_path":"<absolute workspace path>"}'
```

2. Check indexing status:

```powershell
.\.tmp-codebase-memory-mcp\codebase-memory-mcp.exe cli index_status '{"repo_path":"<absolute workspace path>"}'
```

3. Get graph schema:

```powershell
.\.tmp-codebase-memory-mcp\codebase-memory-mcp.exe cli get_graph_schema '{}'
```

4. Get architecture overview:

```powershell
.\.tmp-codebase-memory-mcp\codebase-memory-mcp.exe cli get_architecture '{"repo_path":"<absolute workspace path>"}'
```

5. Search for key kit surfaces:

```powershell
.\.tmp-codebase-memory-mcp\codebase-memory-mcp.exe cli search_code '{"query":"START_HERE"}'
.\.tmp-codebase-memory-mcp\codebase-memory-mcp.exe cli search_code '{"query":"LOAD_ORDER"}'
.\.tmp-codebase-memory-mcp\codebase-memory-mcp.exe cli search_code '{"query":"AGENT_ACTIVATION_MATRIX"}'
.\.tmp-codebase-memory-mcp\codebase-memory-mcp.exe cli search_code '{"query":"IMPLEMENTATION_BLUEPRINT_TEMPLATE"}'
.\.tmp-codebase-memory-mcp\codebase-memory-mcp.exe cli search_code '{"query":"wcbs-doctor"}'
```

6. Query graph for files and labels if supported by the indexed result:

```powershell
.\.tmp-codebase-memory-mcp\codebase-memory-mcp.exe cli query_graph '{"query":"MATCH (f:File) RETURN f.path LIMIT 200"}'
.\.tmp-codebase-memory-mcp\codebase-memory-mcp.exe cli query_graph '{"query":"MATCH (n) RETURN labels(n), count(n) ORDER BY count(n) DESC LIMIT 20"}'
```

7. Run change impact after any proposed edits:

```powershell
.\.tmp-codebase-memory-mcp\codebase-memory-mcp.exe cli detect_changes '{"repo_path":"<absolute workspace path>"}'
```

## Value Gate

Continue using codebase-memory-mcp only if at least one of these is true:

- it indexes at least 40 active kit files;
- it can search or report relationships across key Markdown/skill/template files;
- it provides useful architecture or graph schema data for the kit's file system;
- it detects changed-file impact after local edits.

If none are true, mark codebase-memory-mcp evidence `Likely low utility for Markdown-heavy kit`, remove its scratch artifacts, and run the fallback local activation graph audit.

## Fallback Local Activation Graph Audit

If the codebase-memory graph is thin, run a local deterministic audit that:

1. Reads `rg --files`.
2. Builds a reference graph from Markdown/code references to paths.
3. Identifies:
   - files not referenced by `START_HERE`, `LOAD_ORDER`, README, adapters, doctor, templates, or provenance;
   - skills missing from `LOAD_ORDER`;
   - skills missing from `scripts/wcbs-doctor.mjs`;
   - templates missing from relevant skills or load order;
   - provenance files not referenced by `PROVENANCE_MAP` or inventory;
   - stale references to missing paths.
4. Writes results to `90_archive/provenance/CODEBASE_MEMORY_MCP_TEMPORARY_AUDIT_REPORT.md`.

This fallback is acceptable because the target system is documentation-heavy and the audit need is activation/connectivity, not function call tracing.

## Issue Slices

| Slice | User/System Outcome | Files Likely Affected | Evidence | Dependencies |
|---|---|---|---|---|
| 1 Safe tool acquisition | Tool available without modifying agent configs | Scratch only | checksum verification, no config changes | network access |
| 2 Index/value test | Know whether the graph helps this kit | scratch output, audit report | index status, schema, architecture output | verified binary |
| 3 Activation graph audit | Find disconnected or weakly connected kit pieces | report only at first | graph/fallback report | slice 2 |
| 4 Targeted improvements | Improve synergy only where evidence shows gaps | `00_start_here`, `30_agents`, `40_knowledge`, `50_audits`, `60_templates`, `skills`, `scripts/wcbs-doctor.mjs` | direct file diffs and doctor pass | slice 3 |
| 5 Cleanup and verification | Leave no tool dependency behind | scratch deleted, provenance report kept | root scan, doctor pass | all prior slices |

## Test-First / Evidence Plan

This is documentation/tooling work, not production code implementation. TDD is non-applicable unless `scripts/wcbs-doctor.mjs` is changed.

If `scripts/wcbs-doctor.mjs` is changed:

- Red Phase: add a required mention or required file check that fails before the corresponding kit reference exists.
- Green Phase: add the missing kit reference or required file.
- Refactor Phase: run `node scripts/wcbs-doctor.mjs --strict` after cleanup.

Evidence-first substitute for non-code edits:

- before/after reference graph counts;
- exact files changed;
- doctor pass;
- no temporary codebase-memory artifacts remaining in root;
- report showing findings and dispositions.

## MCP / Tool Governance

Tool purpose: temporary local structural audit aid.

Allowed actions:

- run local binary from workspace scratch;
- read/index current workspace;
- write cache under `.tmp-cbm-cache/`;
- emit JSON/text outputs under `.tmp-cbm-output/` or provenance report.

Forbidden actions:

- modify user agent configs;
- install MCP server globally;
- install hooks;
- enable auto-index;
- write to home cache;
- write `.codebase-memory/graph.db.zst` as a committed artifact;
- send repository contents to external services.

Harmless verification command:

```powershell
.\.tmp-codebase-memory-mcp\codebase-memory-mcp.exe --help
```

## Rollback Or Restoration

Before edits:

- rely on current workspace files as source;
- no destructive changes;
- use `apply_patch` for manual file edits;
- ignore unrelated OneDrive/Git reparse state.

Rollback trigger:

- tool writes outside scratch boundary;
- binary checksum cannot be verified;
- tool attempts agent config changes;
- generated graph artifacts enter active root;
- doctor fails and cannot be corrected narrowly;
- audit suggests changes that weaken APIVR or Elite Build Goals.

Restoration:

- remove `.tmp-codebase-memory-mcp/`, `.tmp-cbm-cache/`, `.tmp-cbm-output/`;
- remove any accidental `.codebase-memory/` unless explicitly retained;
- revert only files changed during this task by applying inverse patches;
- rerun `node scripts/wcbs-doctor.mjs --strict`.

## Acceptance Criteria

| Criterion | Evidence Required | Horizon |
|---|---|---|
| Tool use is bounded | No install script run, no agent configs changed, scratch-only cache/output | Immediate |
| Binary trust is checked | Release checksum verification or `Blocked` record | Immediate |
| Graph value is measured | Index status/schema/architecture output or fallback low-utility decision | Immediate |
| Kit connectivity is audited | Activation graph report with findings and dispositions | Immediate |
| Improvements are narrow | Only evidence-backed file edits, no dependency addition | Immediate |
| Verification passes | `node scripts/wcbs-doctor.mjs --strict` passes | Immediate |
| Cleanup complete | No `.tmp-codebase-memory-mcp`, `.tmp-cbm-cache`, `.tmp-cbm-output`, or active `.codebase-memory` remains | Immediate |

## Evidence Ledger Entries

| Claim | Evidence Source | State | Owner | Notes |
|---|---|---|---|---|
| APIVR tier is Comprehensive | Tooling, MCP, artifact, and multi-file impact review | Verified | Codex | Forensic only if secrets/live systems appear |
| codebase-memory-mcp should not be installed into agents | Upstream README states install writes agent configs | Verified | Codex | Use CLI-only scratch path |
| codebase-memory-mcp may have limited utility for Markdown-heavy kit | Current kit file inventory and tool's code-graph focus | Likely | Codex | Value gate decides |
| Finished kit remains dependency-light | `package.json` and doctor output | To verify | Codex | Must remain dependency-free |

## Challenge Review Questions

1. Are we accidentally turning a temporary audit aid into a hidden runtime dependency?
2. Are any generated graph files or caches entering the public kit?
3. Did the graph output actually improve the kit, or did it merely create noise?
4. Are all proposed edits confirmed by direct file reads rather than tool output alone?
5. Did any change weaken APIVR, Elite Build Goals, safety, portability, or doctor enforcement?

## Final Verification Sequence

1. Confirm no active codebase-memory scratch remains:

```powershell
Get-ChildItem -Force | Where-Object { $_.Name -like ".tmp-codebase-memory-mcp*" -or $_.Name -like ".tmp-cbm*" -or $_.Name -eq ".codebase-memory" }
```

2. Confirm package remains dependency-free:

```powershell
node -e "const p=require('./package.json'); if(p.dependencies||p.devDependencies) process.exit(1)"
```

3. Run kit doctor:

```powershell
node scripts/wcbs-doctor.mjs --strict
```

4. Confirm final report exists:

```powershell
Test-Path "90_archive/provenance/CODEBASE_MEMORY_MCP_TEMPORARY_AUDIT_REPORT.md"
```

## Final Output Contract

End with:

- APIVR tier;
- whether codebase-memory-mcp ran or was blocked;
- whether graph output was useful;
- files changed;
- temporary artifacts removed;
- doctor result;
- final verdict;
- single next action.

