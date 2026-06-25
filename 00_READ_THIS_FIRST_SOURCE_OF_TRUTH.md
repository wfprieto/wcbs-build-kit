# READ THIS FIRST — Claude World-Class Build Kit Source of Truth

## Canonical Package

Use this v3 synergy kit as the active source of truth.

Older zip packages, older master operating files, and earlier drafts should be treated as historical unless the user explicitly instructs otherwise.

## Correct Startup Order

For every Claude task:

1. Read `00_Master_Operating_System.md`.
2. Read `01_Agent_Activation_Matrix.md`.
3. Read `02_Specialist_Prompt_Writing_Collaboration_Protocol.md` when prompt writing, agent design, or reusable instructions are involved.
4. Load only the needed specialist agent files from `~/.claude/wcbs-kit/`.
5. Load the relevant engineering gates from `~/.claude/wcbs-kit/`.
6. Load the relevant audit protocol from `~/.claude/wcbs-kit/` when auditing.
7. Load diagnostic command center files from `~/.claude/wcbs-kit/` when building or auditing operations, monitoring, health, incidents, tickets, or recovery tooling.
8. Load runbooks from `~/.claude/wcbs-kit/` for incident or recovery scenarios.
9. Use templates from `~/.claude/wcbs-kit/` to produce implementation, audit, diagnostic, or completion prompts.

## Operating Law

Audit wide. Fix narrow. Prove everything.

## Required Team Behavior

- Activate the smallest complete specialist set.
- Every affected specialist must contribute its requirements and verification needs.
- ScrumMaster 3 must challenge important and critical decisions repeatedly.
- VP of Engineering must make final decisions on critical risk, release readiness, architecture direction, and unresolved agent conflicts.
- Elite Prompt Engineer must lead prompt-writing work but must include affected specialists.
- Every prompt-writing task that requests elite quality must use initial draft plus 20 improvement passes, final compression, and honest scoring.
- Every task must maintain a checklist.
- Nothing is locked until evidence proves it.
