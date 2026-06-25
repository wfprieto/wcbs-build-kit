# Claude World-Class Build Kit

The standing operating system for planning, auditing, building, fixing, diagnosing, verifying, and locking software work. **Core principle: Audit wide. Fix narrow. Prove everything.**

> This README merges the former `README_Claude_World-Class_Build_Kit_v1`, `README_Native_Assets`, `README_Team_Manifest`, and `INSTALL_AND_USE_WITH_CLAUDE` into one accurate overview. The authoritative load-order/ranking is `00_INDEX_AND_RANKING.md`.

## Where it's installed (user level — active in every session)
- `~/.claude/skills/wcbs-*` — 25 skills: the entry skill `wcbs-build-kit`, 15 specialist personas, 9 `wcbs-elite-*` workflows.
- `~/.claude/agents/` — 15 specialist **subagents** for delegated, out-of-context investigation.
- `~/.claude/commands/` — 8 `/elite-*` slash commands (build, audit, debug, diagnose, incident, release, verify, prompt).
- `~/.claude/wcbs-kit/` — this **reference library** (operating docs, gates, audit protocols, runbooks, templates), loaded on demand.
- Global `~/.claude/CLAUDE.md` carries the always-on **Elite Build Goals** standard + kit initiation order.

Backups: `_native_source/` (install-source copies), `_archive_duplicates/` (removed dupes), `_pre_strip_backup/` (pre-boilerplate-strip copies). All reversible.

## Startup spine (serious work — same every time)
1. Global `CLAUDE.md` (already loaded — Elite Build Goals + evidence discipline).
2. Invoke `wcbs-build-kit` (entry/router).
3. `00_READ_THIS_FIRST_SOURCE_OF_TRUTH.md` → `00_Master_Operating_System.md` → `03_File_Loading_Index.md` → `01_Agent_Activation_Matrix.md`.
4. Activate the smallest specialist set; pull only the task-specific files the File Loading Index names.
5. Gates: ScrumMaster-3 challenge (Important/Critical) → VP decision (Critical) → verification evidence → completion lock.

## The 15-specialist team
VP of Engineering · Chief Architect · Senior Product Manager · Principal Engineer · Frontend Lead · Backend Lead · Database Engineer · UI Engineer · QA Director · Manual Workflow QA · Security Engineer · UX & Product Polish · Elite Prompt Engineer · Elite Senior ScrumMaster 3 · Master Agent Orchestrator. Available both as `wcbs-*` skills (main loop) and as subagents (delegation).

## Provenance
Claude-native adaptation of a Replit "World-Class Build Kit v3." Reorganized and de-duplicated 2026-06-25: library trimmed 101→~52 files, exact/near duplicates archived, native install-source relocated, and the repeated per-file integration-contract boilerplate extracted once to `_INTEGRATION_CONTRACT.md`. Earlier per-file "21-pass / score" certification stamps are historical, not live guarantees (per the Elite Build Goals' no-invented-scores rule). The Replit-origin prompt templates remain as fill-in scaffolds; the Claude-native skills/commands are the active interface.

## Cowork / Projects
For Claude Cowork or Projects, paste `CLAUDE_COWORK_PROJECT_INSTRUCTIONS.md` into project instructions and upload the library files; same startup spine applies.
