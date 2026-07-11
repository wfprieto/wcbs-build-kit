---
name: 20-pass-protocol
description: Use when creating, reviewing, improving, merging, compressing, or finalizing high-stakes prompts, agents, skills, source files, implementation plans, audit prompts, code changes, release instructions, runbooks, templates, or any artifact where accuracy, attention to detail, source-of-truth discipline, safety, or verification quality is critical.
---

# 20 Pass Protocol

Use this skill when the cost of a sloppy artifact is high. It applies to prompts, agents, skills, source files, plans, audits, release instructions, runbooks, templates, and critical documentation.

<HARD-GATE>
Do not claim `20 passes completed` unless the artifact was actually reviewed and improved through all 20 passes.
Each pass must make at least one concrete improvement to the artifact itself. A passive review, agreement, score-only note, or "no change needed" does not count as a pass.
</HARD-GATE>

This protocol does not replace APIVR, TDD, code review, security review, release gates, or provider smoke tests. It strengthens them.

## Required Inputs

- Artifact type: prompt, agent, skill, source file, plan, audit, runbook, template, report, or other.
- Objective and intended user/operator.
- Canonical source files, paths, repos, or systems.
- Risk level, APIVR tier, and release impact.
- Required evidence or verification standard.
- Non-goals and actions that are not allowed.

## When To Use

Use the full 20 passes for:

- production-impacting source files;
- auth, payments, privacy, security, data integrity, migrations, deployment, or external integrations;
- reusable prompts, agents, skills, templates, or runbooks;
- forensic audits and remediation plans;
- launch, release, rollback, or incident instructions;
- anything the user marks as critical, forensic, exact, final, or no-assumptions.

Use a compressed version only when APIVR tier is Rapid and the artifact is low-risk.

## 20 Passes

Run these passes after the first draft or first implementation.

A pass counts only when it changes the artifact in a useful way: clarifies language, removes ambiguity, tightens scope, adds missing evidence, corrects a source path, improves verification, adds a stop condition, removes duplication, strengthens safety, improves executability, or compresses without losing control.

Do not make fake or cosmetic edits just to count a pass. If no safe, useful improvement remains before pass 20, stop and report the completed pass count instead of claiming all 20.

| Pass | Focus | Required improvement question |
|---:|---|---|
| 1 | Objective | Is the outcome explicit, measurable, and free of hidden assumptions? |
| 2 | Audience / operator | Does the artifact fit the person or agent who must use it? |
| 3 | Scope | Are in-scope, out-of-scope, preserved behavior, and stop points clear? |
| 4 | Source of truth | Are canonical files, paths, repos, dashboards, and data sources named exactly? |
| 5 | Input completeness | Are missing inputs handled by discovery steps instead of guesses? |
| 6 | Risk / APIVR tier | Does the artifact match the risk tier and release impact? |
| 7 | Domain and architecture | Are terms, states, routes, boundaries, and ownership correct? |
| 8 | Security / privacy / integrity | Are auth, permissions, secrets, sensitive data, and data integrity protected? |
| 9 | External systems | Are provider callbacks, env splits, deployment protection, and sandbox/live modes handled? |
| 10 | Source-file precision | Are exact files, functions, migrations, tests, and affected surfaces named? |
| 11 | Verification | Is there a concrete test, browser check, provider smoke test, or evidence substitute? |
| 12 | Edge and adverse states | Are failure, empty, duplicate, stale, denied, expired, and race paths covered? |
| 13 | Rollback / blocker handling | Are rollback, recovery, blocked states, and human-only actions explicit? |
| 14 | Agent cooperation | Are roles, handoffs, review agents, and final authority clear? |
| 15 | APIVR alignment | Does the artifact walk Assess, Plan, Implement, Verify, Release, and Re-Audit as needed? |
| 16 | Executability | Can a competent agent follow it without inventing decisions? |
| 17 | Anti-duplication / drift | Does it avoid duplicate rules and update the canonical place instead? |
| 18 | Human clarity | Is the language plain, direct, and free of vague or generic filler? |
| 19 | Challenger pressure | What would a skeptical senior reviewer block, question, or tighten? |
| 20 | Compression and score | Can it be shorter without losing control, and what is the honest score? |

## Output Standard

After the passes, provide a short visible summary. Do not expose private hidden reasoning.

```text
20 Pass Protocol:
- Passes completed: 20 / 20
- Improvement proof: one useful artifact improvement was made in each counted pass
- Main improvements made:
- Remaining limitations:
- Initial score: X / 10
- Final score: X / 10
- Final verdict: PASS / CONDITIONAL PASS / PARTIAL / FAIL / BLOCKED
```

If fewer than 20 passes were completed, say exactly how many were completed and why.

## Source File Rules

When applying this protocol to source files:

- Use TDD or an evidence-first substitute first; this protocol is not a replacement for tests.
- Keep edits narrow and local to the intended behavior.
- Check exact file paths, imports, call sites, route/middleware effects, env behavior, and generated artifacts.
- Re-run relevant tests or verification after improvements.
- Use APIVR Phase 4 review or `skills/code-review-and-review-army/SKILL.md` before release claims for Standard and above.

## Prompt / Agent / Skill Rules

When applying this protocol to prompts, agents, and skills:

- Define trigger conditions in the metadata or first lines, not only in body text.
- Name source-of-truth files and when to load them.
- Prevent vague instructions, duplicated rules, hidden assumptions, and fake completion claims.
- Include verification and failure handling.
- Keep the final artifact concise enough to be used under pressure.

## Good / Bad

<Bad>
Make this better and be careful.
</Bad>

<Good>
Run the 20 Pass Protocol on this Stripe webhook plan. Verify route contract, deployed callback URL, sandbox/live env split, no human-login dependency, signature validation, duplicate event handling, database proof, user-visible proof, and final release verdict.
</Good>

## Closeout

Report what changed, where the artifact now lives, validation performed, remaining limitations, honest score, and final APIVR verdict.
