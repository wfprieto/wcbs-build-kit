# Security, Data, and Privacy Gate

## Purpose
Protect auth, permissions, private data, production data, payment/webhook integrity, AI safety, and secrets during Claude-assisted work.

## Mandatory Activation
Activate Security Engineer before work involving:
- Auth, sessions, roles, permissions, admin access, direct URL access.
- Object ownership, tenant/account scoping, IDOR risk.
- Private user/customer/member data.
- Secrets, tokens, cookies, logs, env vars, API keys, private keys.
- Payment, webhook, subscription, entitlement, or billing logic.
- AI/LLM safety, prompt injection, provider keys, or cost-control.

Activate Database Engineer before work involving:
- Schema, migrations, imports, exports, rollups, cleanup, backfills, seeds, test data, records, status values, or deletion/archive/release behavior.

## Absolute Rules
- Never expose raw secrets.
- Never print env values.
- Never expose private user/customer/member data.
- Never weaken auth, permissions, validation, logging, audit trails, privacy, or data integrity.
- Never run destructive SQL or data mutation without explicit approval.
- Never mark records safe to delete without dependency checks.

## Required Review
`~/.claude/wcbs-kit/``text
Security/Data Gate:
- Does task touch auth/roles/permissions? Yes/No
- Does task touch private data? Yes/No
- Does task touch secrets/env/logs? Yes/No
- Does task touch payment/webhook/subscription? Yes/No
- Does task touch schema/migration/records? Yes/No
- Required approval: None / Security / Database / VP / User
- Safe verification method:
- Rollback plan:
`~/.claude/wcbs-kit/``

## Destructive Work Requirements
Before any destructive or hard-to-reverse work:
- Dry-run plan.
- Backup/export/snapshot plan.
- Before/after counts.
- Dependency checks.
- Orphan checks.
- Rollback plan.
- Explicit user approval.
- VP of Engineering approval.
