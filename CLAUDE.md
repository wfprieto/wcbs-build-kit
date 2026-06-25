# CLAUDE.md — Claude World-Class Build Kit Entry Point

This project uses the Claude World-Class Build Kit as its standing operating system for planning, auditing, building, fixing, diagnosing, verifying, and locking work.

## Always-follow rules

- Read this file before taking action.
- For non-trivial work, load the kit source router: @00_Master_Operating_System.md
- Load the file index before choosing supporting files: @03_File_Loading_Index.md
- Use only the task-relevant agents, gates, audit protocols, templates, runbooks, and diagnostic files. Do not load the whole kit unless explicitly asked.
- Explore first, then plan, then implement for multi-file, high-risk, unclear, security, data, architecture, or UI workflow work.
- Give yourself a verification loop before calling work complete: tests, build, typecheck, lint, browser workflow proof, API checks, screenshots, or exact command output.
- Use the specialist agent files (e.g. `01_VP_of_Engineering_Agent.md`, `02_Chief_Architect_Agent.md`) for specialist reviews when task scope would clutter the main context.
- Use the `elite_*_SKILL.md` files for reusable workflows and the `elite-*.md` files for explicit manual commands.
- Do not expose secrets or private data. Never print env values, tokens, credentials, cookies, private keys, or sensitive logs.
- Do not run destructive commands, migrations, seed/reset scripts, data cleanup, or file deletion without explicit approval and a rollback plan.
- Do not claim complete, verified, fixed, safe, production-ready, or locked without direct evidence.

## Core operating principle

Audit wide. Fix narrow. Prove everything.

## Required startup for serious work

Before planning, auditing, building, fixing, diagnosing, verifying, or marking work complete, read:

- 00_READ_THIS_FIRST_SOURCE_OF_TRUTH.md
- 00_Master_Operating_System.md
- 03_File_Loading_Index.md

Then load only the additional task-specific files selected by the File Loading Index.

For kit orientation and how the pieces fit together, see `README_Claude_World-Class_Build_Kit_v1.md` (overview and install), `README_Team_Manifest.md` (the 15 specialist agents), and `README_Native_Assets.md` (agents/skills/commands overview).

## Claude Code native capabilities

- Use the specialist agent files (the `*_Agent.md` and role `.md` files) when specialist investigation should run in a separate context.
- Use the `elite_*_SKILL.md` files when a reusable workflow applies.
- Use the `elite-*.md` command files for explicit workflows like elite-build, elite-audit, elite-debug, elite-verify, and elite-prompt.
- Use plan mode for meaningful or risky work before editing.
- Use checkpoints, git status, and diffs to preserve reversibility.

## Completion standard

A task is not locked until the required checklist, source routing, specialist review, ScrumMaster challenge where required, VP escalation where required, verification evidence, and completion report are satisfied.
