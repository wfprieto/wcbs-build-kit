# APIVR Playbook

Reference templates, checklists, and worked examples. Load when running a real APIVR cycle or when the user wants structured deliverables. Scale everything to the tier set by the Mode Router.

## Contents
- Documentation-by-tier guide
- Pre-flight checklist (before Phase 3)
- Rollback standards
- Accountability fields
- Impact vs Effort prioritization
- Cost-benefit gate + resource check
- Verification horizons
- Unexpected-change detection
- Phase deliverable templates
- Domain checklists (Web/SEO, GTM/GA4, Code/Replit, Ad Campaigns)
- Worked examples (incl. a Rapid-tier example)

---

## Documentation-by-Tier Guide
Keep paperwork proportional. If the report is bigger than the change, drop a tier.
| Tier | Audit | Plan | Verify | Total footprint |
|---|---|---|---|---|
| Rapid | one line | none | one line | a few sentences |
| Standard | short assessment | bulleted blueprint | short report | ~1 page |
| Comprehensive | full assessment | full blueprint | full report | multi-page |
| Forensic | full + chain of evidence | full + sign-offs | full + audit trail | formal record |

## Pre-Flight Checklist (before any implementation)
Confirm all five. If any is unmet, invoke the Stop Condition and report (unless a declared Emergency).
- [ ] **Access** - credentials/permissions to every system being touched.
- [ ] **Backup** - current state captured and restorable.
- [ ] **Permissions** - authorization for these specific changes (owner/admin sign-off).
- [ ] **Dependencies** - upstream/downstream systems identified; change won't break them.
- [ ] **Production risk** - blast radius understood and rated Low/Medium/High/Critical.

## Rollback Standards
Every production-touching change defines all four before it ships:
- **Backup** - what was saved and where.
- **Restore point** - the exact state to revert to.
- **Rollback owner** - who executes the revert.
- **Rollback trigger** - the condition that forces a revert (error rate, broken route, failed verification).

## Accountability Fields
| Field | Meaning |
|---|---|
| Owner | Who does the work |
| Approver | Who authorizes it |
| Verifier | Who confirms it worked |
| Notify | Who gets status updates (no action required) |
| Due date | When |
| Status | Not started / In progress / Done / Verified / Blocked |

## Impact vs Effort Prioritization (Phase 2)
Rank findings on a 2x2 instead of treating them equally:
```
            LOW EFFORT        HIGH EFFORT
HIGH IMPACT  Do first          Plan / schedule
LOW IMPACT   Quick wins (fill) Deprioritize / skip
```
Risk rating tells you what's dangerous; impact/effort tells you what's worth doing. Use both.

## Cost-Benefit Gate + Resource Check (Phase 2)
Per item, before it enters the plan:
- **Economically justified?** Expected value of the fix vs. cost to make it. If cost > benefit, drop or defer.
- **Resource reality?** Do the time, budget, and staffing exist given competing priorities? If not, it's not "planned," it's "wished."

## Verification Horizons (Phase 5)
Tag each success criterion with when it can truly be confirmed:
| Horizon | Use when | Verify now via |
|---|---|---|
| Immediate | result is observable on completion | direct test |
| 30 / 60 / 90-day | outcome accrues over time | schedule a check; track interim |
| Leading-indicator | true outcome is months out | confirm the early proxy now |
Cycles that depend on a future horizon close as **PARTIAL - pending horizon**, with the check date recorded. Never claim PASS on an unconfirmed outcome; never stall waiting for one.

## Unexpected-Change Detection (Phase 4)
Scan for collateral damage beyond planned-vs-actual:
- Broken routes / 404s / failed redirects.
- New warnings or errors in console, logs, or build output.
- Dependency drift (versions changed, packages added/removed).
- Unrelated file changes in the diff.
- Performance regressions on untouched paths.

---

## Phase Deliverable Templates

### Phase 1 - Current-State Assessment
```
# Current-State Assessment: [system]
## What exists / works / is broken / is missing
## Findings  [each: Evidence L1-L4 | Confidence H/M/L | Risk Low/Med/High/Critical]
## Root cause(s)
## Evidence gathered
```

### Phase 2 - Implementation Blueprint
```
# Blueprint: [objective]
## Strategic (why)
## Prioritized changes (impact/effort ranked; each with cost-benefit + Owner/Approver/Verifier/Notify/Due)
## Dependencies
## Risks + rollback (backup, restore point, rollback owner, rollback trigger)
## Success criteria (quantified threshold + verification horizon)
```

### Phase 4 - Implementation Audit
| Planned | Actual | Match? | Risk | Notes |
|---|---|---|---|---|
| ... | ... | check/x | L/M/H/C | ... |
Plus: unplanned additions, missed items, standards Y/N, unexpected-change scan result.

### Phase 5 - Verification Report
```
# Verification: [objective]
## Technical - does it work?
  Functional / Performance / User exp. / Data  | evidence each
## Business - did it improve the outcome?
  Target metric | threshold | before -> after | horizon | evidence
## Final Verdict: PASS / PARTIAL (pending horizon) / FAIL
## Evidence summary:
## Next action:
```

---

## Domain Checklists

### Web / SEO
- Audit: crawl, view source, canonicals, meta, schema, redirects, indexation, Core Web Vitals, SSR.
- Audit implementation: canonical/schema/meta present, redirects in place; scan broken routes.
- Verify technical: schema validates, sitemap accepted, URLs indexed. Business: organic traffic/rankings move (30-90 day horizon).

### GTM / GA4
- Audit: container config, tags/triggers/variables, dataLayer, GA4 property, data quality.
- Audit implementation: planned tags exist, named to standard, fire on intended triggers.
- Verify technical: tags fire (DebugView), events reach GA4, attribution correct (Immediate). Business: data informs a real decision.

### Code / Replit
- Audit (read-only first): code, dependencies, integrations, behavior, data state. Discovery before changes; dry-run before apply; backup before mutation.
- Audit implementation: read the diff, run the build, confirm only planned changes shipped, check dependency drift.
- Verify technical: functional, performance, browser verification for any touched UI control/workflow. A passing typecheck/build is not sufficient for UI. Business: the workflow's intended result improved.

### Ad Campaign
- Audit: account structure, targeting, budgets, tracking, history.
- Audit implementation: launched as specced, conversions wired, budgets set.
- Verify technical: impressions serving, clicks, conversions tracking (Immediate). Business: revenue attributed, ROAS/CPA on target (30-day horizon).

---

## Worked Example - Rapid Tier (favicon)
- **Router:** reversible yes, blast radius one file, no money/security/data -> **Rapid.** Agent states tier, proceeds.
- **Audit (1 line):** favicon 404s; wrong path in head. (L1, High confidence, Low risk)
- **Implement:** correct the path.
- **Verify (1 line):** reload, icon renders, no 404. **PASS.**
- Total footprint: three sentences. This is proportionality working.

## Worked Example - Contact Form (Standard)
- Router: reversible, single page, no sensitive data -> Standard.
- Audit: no capture mechanism (L1, High, High risk to lead flow).
- Plan: form -> email + CRM; impact High / effort Low -> do first; cost-benefit clear; Owner/Verifier/Notify set; rollback = disable form.
- Pre-flight passes. Implement. Audit implementation: form + fields + integration present, no broken routes.
- Verify technical: test entry -> email + CRM record + notification fire (Immediate). Business: qualified leads captured (30-day). **PASS** technical, **PARTIAL - pending 30-day** business.

## Worked Example - GA4 Event (false-success trap)
- Audit implementation: event installed (L1). Verify technical: firing? reaching GA4? attributed? An installed-but-not-firing event is **PARTIAL**, never PASS, regardless of how clean Phase 4 looked.
