# Codebase Memory MCP Temporary Audit Report

Date: 2026-06-28

Source tool: `DeusData/codebase-memory-mcp` v0.8.1

## APIVR Tier

Comprehensive.

Reason: the task used a temporary MCP-style local binary, generated graph/cache artifacts, and audited the whole Super Build Kit wiring. It did not add a dependency, modify agent configs, touch production systems, or process private customer data.

## Tool Boundary

Allowed:

- Download latest Windows amd64 release ZIP.
- Download `checksums.txt`.
- Verify SHA-256.
- Extract to `.tmp-codebase-memory-mcp/`.
- Run `codebase-memory-mcp.exe` directly.
- Force cache into `.tmp-cbm-cache/`.
- Store temporary outputs in `.tmp-cbm-output/`.

Forbidden and not performed:

- no `install.ps1`;
- no `codebase-memory-mcp install`;
- no agent config writes;
- no auto-index/watch setup;
- no package dependency added;
- no `.codebase-memory/graph.db.zst` committed;
- no persistent binary/cache retained.

## Acquisition Evidence

- Release: `v0.8.1`
- Asset: `codebase-memory-mcp-windows-amd64.zip`
- Expected SHA-256: `a602ad090ed3f49d86c55472f73f27ad7055222806a82358f2e08513e027f00f`
- Actual SHA-256: `a602ad090ed3f49d86c55472f73f27ad7055222806a82358f2e08513e027f00f`
- Evidence state: `Verified`

## Codebase-Memory Results

The tool successfully indexed the workspace.

| Metric | Result |
|---|---:|
| Project status | `indexed` / `ready` |
| Nodes | 1352 |
| Edges | 1391 |
| Files discovered | 107 |
| Node labels | Section, File, Module, Folder, Variable, Function, Project |
| Edge types | DEFINES, CONTAINS_FILE, CONTAINS_FOLDER, CALLS, USAGE, SEMANTICALLY_RELATED |
| ADR present | false |

Value gate result: `PASS`.

The tool did index the kit and produced useful high-level evidence. However, because the Super Build Kit is Markdown-heavy, graph relationships were mostly sections/modules rather than rich code call paths. The graph was useful as a secondary audit signal, not as a sole authority.

## Limitation Found

The tool indexed the temporary extraction folder because the CLI excludes `.git` by default but did not exclude the scratch folder used for the binary. This did not affect active kit files, but it reduced graph purity.

Disposition: use the tool output as secondary evidence and cross-check with a deterministic activation graph audit that excludes scratch folders.

## Deterministic Activation Graph Audit

Fallback audit scope excluded:

- `.git/`
- `.tmp-codebase-memory-mcp/`
- `.tmp-cbm-cache/`
- `.tmp-cbm-output/`
- `node_modules/`

Results:

| Metric | Result |
|---|---:|
| Files scanned | 111 |
| Active files scanned | 96 |
| Skills detected | 35 |
| Templates detected | 16 |
| Knowledge docs detected | 13 |
| Active skill missing from `LOAD_ORDER` | 0 |
| Active skill missing from `scripts/wcbs-doctor.mjs` | 0 |
| Active templates weakly wired | 0 |
| Active knowledge docs missing from `LOAD_ORDER` | 0 |
| Active unreferenced files | 0 |

Findings:

1. `90_archive/provenance/CODEBASE_MEMORY_MCP_TEMPORARY_AUDIT_PLAN.md` was not referenced by provenance.
2. `90_archive/provenance/SKILLSPECTOR_STATIC_AUDIT_REPORT.md` was not referenced by provenance.

Remediation:

- Updated `90_archive/provenance/PROVENANCE_MAP.md` with a `Temporary Audit Tools` section referencing both audit artifacts.

## Changes Made

- Updated `90_archive/provenance/PROVENANCE_MAP.md`.
- Added this report: `90_archive/provenance/CODEBASE_MEMORY_MCP_TEMPORARY_AUDIT_REPORT.md`.

No active source-of-truth, skill, adapter, template, or doctor logic was changed because the audit found no active wiring defects.

## Verification

Verification performed:

- `node scripts/wcbs-doctor.mjs --strict` passed.
- No `.tmp-codebase-memory-mcp/`, `.tmp-cbm-cache/`, `.tmp-cbm-output/`, or active `.codebase-memory/` remained after cleanup.
- `package.json` remained dependency-free.

Evidence state: `Verified`.

## Verdict

`PASS`

codebase-memory-mcp was useful as a temporary secondary audit aid. The Super Build Kit's active wiring is already cohesive: all skills, templates, and knowledge docs checked by the activation audit are connected through load order, doctor checks, or relevant references.

Next action: keep codebase-memory-mcp out of the kit unless a future large-codebase audit proves the optional adapter would add recurring value.
