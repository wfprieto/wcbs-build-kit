---
name: apivr
description: A closed-loop execution and verification framework (Audit, Plan, Implement, Audit Implementation, Verify Implementation, Re-Audit) with built-in proportionality, so small fixes stay small and high-risk work gets full rigor. Use whenever the user is about to change, fix, build, deploy, or optimize a system, site, codebase, campaign, account, or process, or wants to check whether finished work was done correctly and actually worked. Covers web/SEO, GTM/GA4, Replit/code, and ad campaigns.
---

# APIVR: Closed-Loop Execution and Verification

A disciplined, evidence-based framework that separates discovery from assumptions, planning from execution, execution from validation, and validation from business outcomes. The core insight: a project can be implemented correctly, audited correctly, and still fail because it doesn't produce the intended result. APIVR prevents that by requiring evidence at every stage.

Most people do `Plan -> Implement -> Hope`. APIVR replaces it with `Audit -> Plan -> Implement -> Audit Implementation -> Verify Implementation -> Re-Audit` - scaled to the size of the task.

## Proportionality Principle (read first)

The process must never cost more than the work it governs. If documentation or gating is about to exceed the size of the actual change, drop a tier. A broken favicon and a security breach do not get the same treatment. Framework worship - process mattering more than outcome - is failure, not diligence.

### Mode Tiers
- **Rapid** - small, low-risk, reversible. One-line audit, do it, one-line verify.
- **Standard** (default) - full six phases, compressed deliverables.
- **Comprehensive** - high blast radius, multiple systems, hard to reverse.
- **Forensic** - security, data integrity, revenue-critical, or regulated work.

### Mode Router (3 questions)
1. **Reversible?** Easily undone -> lower tier. Hard/impossible -> higher.
2. **Blast radius if wrong?** One file/page -> lower. Many systems/users -> higher.
3. **Touches money, security, or data?** Any yes -> Comprehensive or Forensic.

### Who decides the tier
The agent classifies and **states the tier every time** so the human can object. Then:
- **Tier-down (less rigor):** a proposal pending human confirmation. At **Rapid only**, silence is consent - the agent states the tier and proceeds unless the human objects. Standard and above wait for an explicit go.
- **Tier-up (more rigor):** the agent's standing authority. If it discovers the work touches auth, production data, or can't be reversed, it escalates immediately, no permission needed. Erring toward safety is always allowed.
- **Emergency / Break-Glass:** human-declared only (see below). The agent never unilaterally decides something is an outage.

Tier decides *how much process*, never *whether to guess*. The Stop Condition still wins at every tier.

## Core Operating Rules

Never prescribe a fix before understanding the environment. Never call something done because it was deployed. Two failures the framework exists to catch:

1. **Compliance gap** - did we build what we intended to build?
2. **Outcome gap** - did it actually accomplish the objective?

"Correctly installed" does not mean "successfully functioning." Carry evidence forward through every phase.

### Evidence vs Confidence (two different axes)
- **Evidence level - how you know:** L1 observed fact (directly verified), L2 strong secondary (documented/consensus, not personally verified), L3 analysis (reasoned inference), L4 hypothesis (unconfirmed; if unverifiable, say "I cannot confirm this"). Never present L3 or L4 as fact.
- **Confidence - how sure you are:** High / Medium / Low. A finding can be L1 evidence but Low confidence (e.g., verified once, may not be representative). Tag both.

### Risk Rating
- **Critical** - active failure, data loss, security exposure, or revenue impact now.
- **High** - likely to break or block the objective; fix before proceeding.
- **Medium** - degrades quality or performance; schedule it.
- **Low** - minor or cosmetic.

### Stop Condition
If required access, data, or evidence is missing, **stop and report - do not guess.** State what's blocked, what's needed, and who can unblock it. This holds at every tier, including Rapid. A confident answer built on a gap is the failure mode APIVR exists to prevent. (Exception: a declared Emergency may proceed on incomplete data - documented as such, audited after.)

## The Six Phases

Run in order, scaled to tier. Rapid compresses Phases 1-2 and 4-5 to one line each. Never skip Phase 4 or 5 entirely - even Rapid confirms the change worked.

### Phase 1 - Audit (Establish Reality)
Determine current state before recommending anything. Inspect config, code, integrations, performance, data quality. Find root causes, not symptoms. Answer: What exists? What works? What's broken? What's missing? What's causing it? Tag findings with evidence level, confidence, and risk.
- **Deliverable:** current-state assessment (one line in Rapid).

### Phase 2 - Plan (Design the Solution)
Think first, execute second. Prioritize findings by **impact vs effort**, not just risk (see playbook 2x2). For each item, apply the **cost-benefit gate** - is the fix economically justified? - and a **resource check** against available time, budget, and staffing. Map dependencies, define rollback. Set measurable success criteria with a **verification horizon** (see Phase 5). Assign Owner, Approver, Verifier, Notify, Due date.
- **Deliverable:** implementation blueprint (skipped in Rapid).

### Phase 3 - Implement (Execute)
No improvisation. Only build what the plan approved. Complete the pre-flight checklist first (access, backup, permissions, dependencies, production risk - see playbook). Document what changed, when, why. Maintain rollback capability.
- **Deliverable:** implemented solution.

### Phase 4 - Audit the Implementation (Compliance)
Implementation does not equal completion. Compare planned vs. actual: everything implemented? anything missed? anything added unexpectedly? standards followed? Run unexpected-change detection: broken routes, new warnings/errors, dependency drift, unrelated file changes. Methods: view source, crawl, validate schema, read the diff, run the build, review the deployment.
- **Deliverable:** implementation audit report.

### Phase 5 - Verify the Implementation (Outcome)
Where most organizations fail. Confirm the work achieves the intended result, not just that it exists. Separate two questions:
- **Technical - does it work?** Functional, performance, user-experience, data-measurement tests.
- **Business - did it improve the outcome?** Did the targeted metric move, against a **quantified success threshold** set in Phase 2?

**Verification horizons.** Not all outcomes confirm immediately. Tag each criterion **Immediate / 30-day / 60-day / 90-day / Leading-indicator**. When the outcome can't be confirmed yet, verify the leading indicator now and schedule the outcome check. Close the cycle honestly as PARTIAL - pending horizon rather than claiming PASS or stalling.
- **Deliverable:** verification report with evidence and a final verdict.

### Phase 6 - Re-Audit (New Baseline)
Verified results become the new baseline; the loop repeats. Re-auditing without resulting action creates zero value - re-audit to drive the next decision, not as a ritual.

## Emergency / Break-Glass Path

For active outages and production incidents, declared by the human only. Act first, document after:
1. Human declares the emergency.
2. Stabilize - act on best available evidence; forward gates and approvals are waived.
3. Note what was changed, even roughly, as you go.
4. Once stable, run a **mandatory retroactive audit** (Phases 1, 4, 5) to confirm the fix held and find collateral damage.
The framework knows when to get out of the way; this is that door. It is not a shortcut for non-emergencies.

## Final Verdict
End every cycle with one of:
- **PASS** - compliance and outcome both verified.
- **PARTIAL** - built correctly but outcome unproven, partly met, or pending a verification horizon.
- **FAIL** - compliance or outcome not met.
Always include supporting evidence and the single next action.

## How to Apply This

State the tier, then walk the phases at that depth, naming the phase you're in. Don't jump to the fix - open at Phase 1. If handed finished work, start at Phase 4, then verify. If the user says "just fix it," state the tier in one sentence (usually Rapid) and proceed; don't lecture. The goal is a system that makes a 5-minute fix take 5 minutes and a security review take as long as it needs.

For pre-flight and rollback checklists, the impact/effort 2x2, cost-benefit and resource templates, accountability table, domain checklists, and worked examples, see `references/playbook.md`.
