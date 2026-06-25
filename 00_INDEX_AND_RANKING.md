# World-Class Build Kit — Master Index & Importance Ranking

Single source of truth for **what to load, in what order**. Higher tier = load earlier / more often. Do NOT load the whole kit — load Tier 0 for serious work, then pull the smallest task-specific set from lower tiers.

Locations: active skills `~/.claude/skills/wcbs-*`, subagents `~/.claude/agents/`, commands `~/.claude/commands/`, reference library `~/.claude/wcbs-kit/` (this folder). Install-source backups live in `_native_source/`; removed duplicates in `_archive_duplicates/`.

---

## SKILLS — ranked (active interface, `~/.claude/skills/`)

**Tier 0 — Entry (always first):**
1. `wcbs-build-kit` — entry point; loads the OS and routes everything below.

**Tier 1 — Governance & core workflow:**
2. `wcbs-master-orchestrator` — routing, sequencing, handoffs.
3. `wcbs-vp-of-engineering` — final decisions, risk acceptance, release calls.
4. `wcbs-scrummaster-3` — repeated challenge, anti-shortcut, completion lock.
5. `wcbs-elite-master-operating-system` — apply the OS, source router, gates.
6. `wcbs-elite-implementation` — controlled build workflow.
7. `wcbs-elite-audit` — evidence-based audit.
8. `wcbs-elite-verify` — completion verification / Locked-or-Not.

**Tier 2 — Specialists (activate the smallest set the task needs):**
9. `wcbs-chief-architect` · 10. `wcbs-principal-engineer` · 11. `wcbs-senior-product-manager` · 12. `wcbs-security-engineer` · 13. `wcbs-backend-lead` · 14. `wcbs-frontend-lead` · 15. `wcbs-database-engineer` · 16. `wcbs-qa-director` · 17. `wcbs-manual-workflow-qa` · 18. `wcbs-ui-engineer` · 19. `wcbs-ux-product-polish` · 20. `wcbs-elite-prompt-engineer`

**Tier 3 — Situational workflows:**
21. `wcbs-elite-debug` · 22. `wcbs-elite-diagnostics` · 23. `wcbs-elite-release-readiness` · 24. `wcbs-elite-response` · 25. `wcbs-elite-prompt-writing`

Subagents (`~/.claude/agents/`) mirror the 15 specialists for delegated, out-of-context investigation. Commands (`/elite-build`, `/elite-audit`, `/elite-debug`, `/elite-diagnose`, `/elite-incident`, `/elite-release`, `/elite-verify`, `/elite-prompt`) are explicit manual triggers for the same workflows.

---

## LIBRARY FILES — ranked (reference docs, this folder)

**Tier 0 — Always-on / read first for serious work:**
- `00_Elite_Build_Goals_Claude.md` — THE standard (15 Critical Build Goals; mirrored into global CLAUDE.md).
- `00_READ_THIS_FIRST_SOURCE_OF_TRUTH.md` — source-of-truth hierarchy.
- `00_Master_Operating_System.md` — authoritative router/OS.
- `03_File_Loading_Index.md` — which files to load per task.
- `01_Agent_Activation_Matrix.md` — which agents to activate per work type.

**Tier 1 — Engineering gates & control protocols:**
- `01_Canonical_Path_Anti_Duplication_Gate.md`
- `02_Task_Checklist_and_Lock_Protocol.md`
- `03_QA_Browser_Workflow_Proof_Gate.md`
- `04_Security_Data_Privacy_Gate.md`
- `05_Release_Readiness_Launch_Gate.md`
- `03_Completion_Report_Template.md`
- `00_Inner_Dialogue_Decision_Challenge_Protocol.md`
- `02_Specialist_Prompt_Writing_Collaboration_Protocol.md`

**Tier 2 — Specialist persona references (verbose source for the skills/subagents):**
- `01_VP_of_Engineering_Agent.md` … `15_Master_Agent_Orchestrator.md` (the 15 numbered `*_Agent.md` files).

**Tier 3 — Audit protocols (select via the Audit Menu):**
- `00_Audit_Protocol_Menu_and_Run_Order.md` (start here)
- `00_Project_Foundation_Build_Readiness_Audit.md`
- `01_Master_System_Audit.md`
- `02_Security_Privacy_Access_Control_Audit.md`
- `03_Architecture_Module_Boundary_Scalability_Audit.md`
- `04_Workflow_ClickPath_UI_Interaction_Audit.md`
- `05_Clean_Code_Cleanup_Technical_Debt_Audit.md`
- `06_Testing_QA_Coverage_Verification_Audit.md`
- `07_Data_Integrity_Legacy_Records_Cleanup_Safety_Audit.md`

**Tier 4 — Diagnostics / operations / incident runbooks:**
- `00_Source_System_Operations_Command_Center_List.md`
- `01_Admin_Diagnostic_Center_Blueprint.md`
- `02_Operations_Command_Center_Build_Order.md`
- `03_Observability_Monitoring_Requirements.md`
- `04_Work_Queue_Ticketing_Governance.md`
- `01_Incident_Response_Runbook.md`
- `02_Safe_Recovery_Actions_Runbook.md`

**Tier 5 — Templates & prompt scaffolds (Replit-origin; lower priority on Claude):**
- `01_Replit_Implementation_Prompt_Template.md`
- `02_Replit_Audit_Prompt_Template.md`
- `04_Replit_Diagnostic_Center_Build_Prompt_Template.md`
- `00_Prompt_Comparison_and_Merge_Prompt.md`
- `00_AGENT_BUILD_INSTRUCTIONS.md`

**Tier 6 — Meta / install (orientation only):**
- `README.md` — single merged overview + install + team + provenance (replaces the old README/install/scorecard docs).
- `_INTEGRATION_CONTRACT.md` — the canonical integration contract, extracted once (was repeated in every file).
- `CLAUDE.md` (project-entry template) · `CLAUDE_COWORK_PROJECT_INSTRUCTIONS.md`
- (Archived → `_archive_duplicates/`: the 3 `README_*` variants, `INSTALL_AND_USE_WITH_CLAUDE.md`, and both scorecards — content merged into `README.md`.)

---

## Standard initiation order (serious work)
1. Global CLAUDE.md is already loaded (carries the Elite Build Goals + evidence discipline).
2. Invoke `wcbs-build-kit` (or it auto-activates).
3. Read Tier 0 library files (Read First → Master OS → File Loading Index → Activation Matrix).
4. Activate the smallest specialist set (Tier 2 skills/subagents) per the Activation Matrix.
5. Pull only the task-specific Tier 1/3/4/5 files the File Loading Index names.
6. Enforce gates: ScrumMaster-3 challenge (Important/Critical) → VP decision (Critical) → verification evidence → completion lock. Nothing is "done" without proof.

## Cleanup log (2026-06-25)
- **Dedup/reorg:** library root 101 → 54. Archived 16 exact/near-duplicate + merged-away files (`_archive_duplicates/`). Relocated 34 native install-source files (`_native_source/`) — active in `skills/`/`commands/`/`agents/`.
- **Boilerplate strip:** removed the repeated "Integration Contract" boilerplate from 45 docs (~155 KB) → extracted once to `_INTEGRATION_CONTRACT.md`. Pre-strip copies in `_pre_strip_backup/`. 3 Replit templates auto-skipped (interleaved unique content, preserved).
- **Merges:** 2 scorecards + 3 READMEs + install guide → one `README.md`.
- No unique content deleted; all removals are moves to archive/backup folders. Desktop source remains the ultimate rollback.

## Canonical source & structure decisions (2026-06-25)
- **One source of truth per specialist (item 7):** the numbered `*_Agent.md` files in this library are the **verbose persona SOURCE**. The `wcbs-*` skills (main-loop interface) and the `~/.claude/agents/` subagents (delegation interface) are the **active runtime copies** derived from them. When a persona's intent changes, update the `*_Agent.md` source first, then propagate to its skill + subagent. Treat the skill/subagent as generated, not independently authored.
- **File numbering (item 8):** numeric prefixes (`00_/01_/02_`) are **per-category, not a global order** — multiple categories reuse the same numbers. The authoritative order is this file's tier ranking, not the filename number. A real folder structure (`00_operating_system/`, `10_agents/`, `20_gates/`, `30_audits/`, `40_diagnostics/`, `50_templates/`) will be restored during the GitHub export (backlog EX3), which fully resolves the ambiguity.
- **Enforcement (item 6 — pending):** the kit's gates are still advisory; converting them to Claude Code hooks is the open high-leverage item in `00_IMPROVEMENT_BACKLOG.md`.
