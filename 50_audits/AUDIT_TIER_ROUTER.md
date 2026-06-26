# Audit Tier Router

Every task starts here.

## Router Questions

1. **Reversible?**
   - Easy to undo: lower tier.
   - Hard or impossible to undo: higher tier.
2. **Blast radius if wrong?**
   - One file/page/local behavior: lower tier.
   - Many systems/users/workflows: higher tier.
3. **Touches money, security, privacy, authorization, production data, regulated data, destructive actions, or revenue-critical workflows?**
   - Any yes: Comprehensive or Forensic.

## Tiers

### Rapid / Light

Use when the work is small, low-risk, reversible, and narrow.

Required:

- one-line audit;
- narrow change or finding;
- implementation audit;
- one-line verification;
- final verdict.

### Standard

Default for normal feature work, fixes, and non-trivial audits.

Required:

- current-state assessment;
- implementation blueprint;
- targeted evidence ledger;
- implementation audit;
- verification report;
- completion report.

### Comprehensive

Use for material user, business, architecture, SEO, accessibility, operations, data, brand, or revenue impact.

Required:

- full APIVR record;
- affected systems and preserved behavior;
- rollback plan;
- challenge review;
- release gates;
- evidence ledger;
- explicit remaining risks.

### Forensic

Use for security, privacy, authorization, payments, regulated data, destructive migrations, production availability, legal/financial exposure, or suspected serious defects.

Required:

- chain of evidence;
- sign-offs and owners;
- no guessing under missing evidence;
- independent challenge;
- backup/restoration plan where feasible;
- release blocked on unknown core safety evidence.

## Escalation Rules

- Agents may always tier up for safety.
- Tiering down below Standard requires human confirmation except Rapid, where the agent may proceed after stating the tier unless the human objects.
- A human may declare emergency/break-glass. The agent may not declare it independently.

