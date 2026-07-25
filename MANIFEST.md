# Super Build Kit Manifest

This manifest separates active system files from provenance and local-only material.

## Active System Files

- `00_start_here/`
- `10_governance/`
- `20_skills/`
- `30_agents/`
- `40_knowledge/`
- `50_audits/`
- `60_templates/`
- `skills/`
- `runtime_adapters/`
- `scripts/`
- root adapter files: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `REPLIT.md`, `Manus.md`
- install and release files: `INSTALL.md`, `QUICKSTART.md`, `README.md`, `CHANGELOG.md`, `RELEASE_PROCESS.md`, `VERSIONING.md`, `SECURITY.md`
- short entry point: `GET_STARTED.md`

## Web Application Security System

The active composite web security system consists of:

- `50_audits/WEB_APPLICATION_SECURITY_AUDIT.md`
- `skills/web-application-security/SKILL.md`
- `40_knowledge/WEB_APPLICATION_SECURITY_CONTROL_MATRIX.md`
- `60_templates/WEB_APPLICATION_SECURITY_EVIDENCE_LEDGER_TEMPLATE.md`

These files coordinate existing AI, MCP/tool, external API, provider launch, supply-chain, QA/browser, incident-response, and release-readiness specialists. They are active canonical files, not provenance material.

## Provenance Files

- `90_archive/`

Provenance files explain source history. They are not active source-of-truth instructions unless an active file explicitly routes to them.

Current readiness provenance:

- `90_archive/provenance/SUPERPOWERS_SIDE_BY_SIDE_AUDIT_2026-07-14.md`
- `90_archive/provenance/READINESS_GAP_CLOSURE_PLAN.md`

## Local-Only Files

- `Updates/`
- generated archives;
- dependency folders;
- local environment files.

Local-only files must not affect doctor verification or release readiness.
