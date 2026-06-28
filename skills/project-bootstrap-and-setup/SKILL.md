---
name: project-bootstrap-and-setup
description: Use when setting up, installing, bootstrapping, configuring, or preparing a project, repo, environment, dependencies, local services, build tools, package managers, containers, dev servers, credentials placeholders, or first-run commands. Applies when an agent needs to prepare a project safely without overwriting configs, reading secrets, modifying production state, or exceeding setup boundaries.
---

# Project Bootstrap And Setup

Use this skill before installing, configuring, or starting a project.

<HARD-GATE>
Setup work must stop at the setup boundary. Do not inspect secrets, overwrite user config, mutate production resources, or claim the app works beyond verified setup evidence.
</HARD-GATE>

## APIVR Routing

- Phase 1 Audit: inspect project type, package manager, config files, lockfiles, environment examples, scripts, services, and setup risk.
- Phase 2 Plan: choose the smallest setup path and define what will not be touched.
- Phase 3 Implement: run only approved setup steps and preserve existing configs.
- Phase 4 Audit Implementation: check files changed, dependency impact, generated artifacts, and config drift.
- Phase 5 Verify Implementation: run setup/build/doctor command that proves readiness.
- Phase 6 Re-Audit: report exact next command and any unresolved setup requirement.

## Setup Rules

- Prefer existing lockfiles, scripts, tool versions, and repo docs.
- Read `.env.example` or documented placeholders; do not read secret-bearing `.env` files unless explicitly authorized.
- Never commit or echo secrets.
- Do not overwrite config files without backup or clear diff.
- Do not start paid, production, destructive, or public network resources without authorization.
- Do not treat install success as app success.
- Report exact commands run, commands not run, and the next required command.

## Stop Conditions

Stop when:

- credentials, paid service access, or production permissions are needed;
- setup would overwrite user config;
- dependency installation requires a package manager choice not proven by the repo;
- a command would mutate remote state;
- the repo lacks enough evidence to identify the setup path.

## Worked Example

Scenario: New repo with `pnpm-lock.yaml`, `.env.example`, and `dev` script.

1. Select Standard tier because setup changes local dependencies and runtime state.
2. Confirm `pnpm` from lockfile.
3. Read `.env.example`, not `.env`.
4. Run install and a non-mutating build or doctor command.
5. Report that setup is ready, dev server is not yet verified unless it was actually started and checked.

## Final Output

End with APIVR tier, setup steps run, files changed, verification result, blocked setup items, exact next command, and final verdict.
