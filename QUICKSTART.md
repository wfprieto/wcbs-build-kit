# Super Build Kit Quickstart

Use this when you need the shortest safe path.

## 1. Verify The Kit

```bash
npm run verify
npm run check-install
```

Windows PowerShell fallback:

```powershell
npm.cmd run verify
npm.cmd run check-install
```

## 2. Load The Startup Files

Every agent starts with:

1. `00_start_here/START_HERE.md`
2. `00_start_here/SOURCE_OF_TRUTH.md`
3. `00_start_here/LOAD_ORDER.md`
4. `50_audits/AUDIT_TIER_ROUTER.md`
5. `skills/super-build-kit/SKILL.md`

## 3. Pick The Work Type

- Audit: load `50_audits/CANONICAL_AUDIT_PROTOCOLS.md`.
- Plan: load `skills/writing-plans/SKILL.md`.
- Code: load `skills/test-driven-development/SKILL.md`.
- Release: load `skills/release-readiness-and-ship-gates/SKILL.md`.
- Security: load `skills/cybersecurity-risk-routing/SKILL.md`.
- High-stakes artifact: load `skills/20-pass-protocol/SKILL.md`.

## 4. End With Evidence

Every completed work cycle reports:

- APIVR tier;
- applicable Elite Build Goals;
- evidence state;
- verification performed and not performed;
- release-gate status;
- final verdict;
- single next required action.
