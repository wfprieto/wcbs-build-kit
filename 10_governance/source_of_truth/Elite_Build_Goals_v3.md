# Elite Software Build Goals
## LLM-Neutral Execution Standard for Production-Ready Software

**Version:** 3.0 Tightened  
**Operating law:** **Audit wide. Fix narrow. Prove everything.**

---

# 1. Purpose and Authority

This is the governing standard for AI-assisted software planning, auditing, implementation, debugging, optimization, testing, and release.

It is platform-neutral and applies regardless of model, agent, development environment, repository host, cloud provider, or deployment platform.

This standard defines:

- the 16 Critical Build Goals;
- the mandatory execution lifecycle;
- the evidence required to claim completion;
- the approval and exception rules;
- the minimum release gates.

Project instructions may make this standard stricter. They may not silently weaken it.

When requirements conflict, use this priority order:

1. Safety, law, privacy, and explicit user authorization
2. Data integrity and irreversible-risk prevention
3. Required user and business outcome
4. Security and operational reliability
5. Accessibility and primary-task usability
6. Approved brand and aesthetic intent
7. Performance, SEO, maintainability, cost, and delivery speed according to the selected experience class

No priority in this list authorizes avoidable harm. Material tradeoffs must be documented and approved.

---

# 2. Mission

Do not merely make software work.

Ship software that is:

- correct;
- secure;
- reliable;
- maintainable;
- scalable for its actual requirements;
- accessible;
- observable;
- visually and commercially appropriate;
- supportable after launch;
- proven by evidence.

The standard is satisfied only when the applicable outcome is achieved or honestly classified as pending, partial, blocked, or failed.

---

# 3. Absolute Guardrails

These rules are non-negotiable.

1. **Inspect before changing.** Do not edit a system whose relevant structure, source of truth, and affected surface have not been inspected.
2. **Do not invent.** Never invent files, APIs, schemas, routes, permissions, tests, results, screenshots, metrics, or system behavior.
3. **Do not broaden scope silently.** Unplanned changes require explicit justification and must appear in the completion report.
4. **Do not bypass controls to obtain a pass.** Never disable validation, tests, authorization, type safety, monitoring, accessibility, or security controls merely to make work appear complete.
5. **Do not claim unrun verification.** A check not executed is `Not Run`, never `Passed`.
6. **Do not treat absence of evidence as success.**
7. **Do not perform irreversible or destructive work without authorization, backup or recovery planning, and a verified rollback or restoration path when technically possible.**
8. **Do not expose secrets or private data.** Redact sensitive evidence and use least-privilege access.
9. **Do not create a second source of truth without an approved architectural reason and migration plan.**
10. **Do not mark work Done while any applicable release-blocking condition remains unmet.**

If a requested action violates these guardrails, stop that action, preserve the system, and report the blocker.

---

# 4. Evidence and Claim Standard

Every material claim must include an evidence state:

- **Verified:** Directly proven by executed checks, inspected system state, rendered output, authoritative documentation, logs, analytics, or observed behavior.
- **Likely:** Strong evidence supports the claim, but direct proof is incomplete.
- **Suspected:** Plausible hypothesis requiring verification.
- **Unknown:** Evidence is insufficient.
- **Not Run:** The relevant verification was available or expected but was not performed.
- **Blocked:** Verification could not be performed because of a stated dependency, access limit, failure, or authorization boundary.

Confidence is separate:

- **High**
- **Medium**
- **Low**

## Claim Rules

- Only `Verified` may be reported as confirmed.
- `Likely`, `Suspected`, `Unknown`, `Not Run`, and `Blocked` must include the remaining risk and next verification action.
- Test quantity is not proof of coverage.
- Tool output must be interpreted, not merely repeated.
- Screenshots prove rendered appearance only for the captured state and viewport.
- A successful build does not prove runtime correctness.
- Technical completion does not prove business outcome.
- One environment does not prove all supported environments.

---

# 5. Requirement Applicability

Before planning, classify each relevant requirement:

- **Universal:** Always applies.
- **Conditional:** Applies when the feature, system, audience, or dependency exists.
- **Risk-Triggered:** Becomes mandatory at a defined risk threshold.
- **Not Applicable:** Does not apply, with a reason.

`Not Applicable` is not a shortcut. It requires a concise rationale.

No requirement may be silently ignored.

---

# 6. Risk and Execution Tiers

## Routine

Use when the change is narrow, reversible, low-impact, and does not touch sensitive systems.

Minimum controls:

- inspect;
- define acceptance criteria;
- implement narrowly;
- run targeted checks;
- report evidence.

## Important

Use when the change materially affects users, revenue, data, architecture, SEO, accessibility, operations, or brand presentation.

Additional controls:

- written plan;
- explicit preserved behavior;
- rollback method;
- challenge review;
- regression checks;
- evidence ledger.

## Critical

Use when the change affects authentication, authorization, payments, private or regulated data, destructive migrations, production availability, irreversible actions, high-volume workflows, or material legal or financial exposure.

Additional controls:

- explicit authorization before irreversible execution;
- independent challenge;
- verified backup or recovery plan where applicable;
- staged implementation when feasible;
- security, permission, and data-integrity testing;
- rollback or restoration test where feasible;
- named decision owner;
- no release on `Unknown`, `Suspected`, or unaccepted `Blocked` evidence for a core safety decision.

Risk classification must be based on blast radius and consequence, not implementation effort.

---

# 7. The 16 Critical Build Goals

## Goal 1: Reliability Above Cleverness

The system must behave predictably in normal and adverse conditions.

Required when applicable:

- loading, empty, success, error, timeout, retry, and partial-data states;
- dependency-failure handling;
- bounded retries and timeouts;
- prevention of silent failure;
- deterministic behavior under realistic concurrency;
- graceful degradation for non-critical features.

**Release blocker:** The primary workflow fails, hangs, corrupts state, or fails silently under a realistic supported condition.

## Goal 2: Security and Privacy by Design

Security and privacy must be enforced at trusted boundaries.

Required when applicable:

- server-side authentication and authorization;
- input validation and output encoding;
- least privilege;
- secret protection;
- secure defaults;
- sensitive-data minimization;
- safe logging;
- webhook and integration verification;
- abuse, rate, and replay protections;
- retention and deletion controls.

Client-side restrictions are never sufficient authorization.

**Release blocker:** Known critical exposure, authorization bypass, secret leakage, unsafe sensitive-data handling, or unaccepted high-risk vulnerability.

## Goal 3: Clear Ownership and Accountability

Every change must have an identifiable scope and accountable owner.

Record:

- objective;
- affected systems and files;
- source of truth;
- preserved behavior;
- decision owner;
- verifier;
- acceptance criteria;
- rollback owner when applicable;
- unresolved risks.

**Release blocker:** No responsible owner exists for a material production risk or operational dependency.

## Goal 4: Architecture That Supports Required Scale

Architecture must be appropriate for demonstrated or stated requirements, not hypothetical scale.

Required:

- clear boundaries;
- controlled dependencies;
- centralized business rules;
- predictable data flow;
- no unjustified duplicate systems;
- measurable non-functional targets when scale matters;
- explicit migration path for material architectural changes.

Do not add complexity without a verified requirement.

**Release blocker:** The design cannot meet the approved workload, recovery, or availability target, or creates immediate source-of-truth conflict.

## Goal 5: Fast, Safe Delivery

Delivery must be incremental, reviewable, and reversible where practical.

Required:

- smallest safe change;
- runnable state after meaningful steps;
- no unrelated refactors;
- feature flags, guards, or staged rollout when risk warrants;
- verification immediately after affected behavior changes.

Speed never overrides safety or evidence.

**Release blocker:** The change cannot be isolated, reviewed, or recovered within the accepted risk envelope.

## Goal 6: Customer and Business Outcomes Over Output

Success is measured by the intended outcome, not activity.

Define before implementation:

- intended user;
- user task;
- business objective;
- primary success metric;
- guardrail metrics;
- verification horizon.

For commercial sites, valid outcomes may include trust, perceived quality, differentiation, engagement, qualified leads, conversion, and sales enablement.

**Release blocker:** The implementation contradicts the approved user or business objective.

## Goal 7: Data Integrity and Trust

Data must remain accurate, complete, consistent, and recoverable.

Required when applicable:

- validation before writes;
- referential integrity;
- transaction boundaries;
- idempotency;
- concurrency controls;
- duplicate prevention;
- migration safety;
- null and legacy-data handling;
- backup and restore planning;
- reconciliation for critical records.

**Release blocker:** A realistic path exists to corrupt, duplicate, lose, misattribute, or irreversibly alter critical data.

## Goal 8: Operational Excellence and Observability

Production behavior must be diagnosable.

Required according to risk:

- structured logs;
- error tracking;
- metrics;
- health checks;
- alerting;
- job and queue visibility;
- safe administrative recovery;
- incident and rollback instructions.

Monitoring must identify actionable failure, not merely produce noise.

**Release blocker:** A material failure can occur without detection or a reasonable recovery path.

## Goal 9: Consistent Engineering Standards

New work must follow the project's established, approved patterns.

Consistency applies to:

- naming;
- structure;
- APIs;
- validation;
- errors;
- data access;
- state;
- styling;
- testing;
- configuration;
- documentation.

Deviation requires a documented benefit and migration impact.

**Release blocker:** The change introduces conflicting patterns that materially increase defects, drift, or support risk.

## Goal 10: Developer Productivity at Scale

The next qualified engineer must be able to understand, run, test, and safely modify the system.

Required:

- reproducible setup;
- discoverable commands;
- explicit configuration;
- maintainable abstractions;
- current operational documentation;
- removal of obsolete paths when safe;
- no critical hidden behavior.

**Release blocker:** The affected system cannot be reproduced, operated, or safely changed without undocumented tribal knowledge.

## Goal 11: Product and Experience Consistency

The product must behave and communicate as one coherent system.

Required when user-facing:

- consistent navigation and interaction patterns;
- clear labels and calls to action;
- useful feedback;
- complete loading, empty, success, and error states;
- responsive behavior;
- primary-task accessibility;
- consistent permissions and account behavior.

**Release blocker:** A target user cannot understand or complete the primary workflow.

## Goal 12: Financial and Infrastructure Discipline

Cost must be proportional to verified value and risk.

Required:

- avoid unnecessary services and dependencies;
- bound background work, retries, storage, and API use;
- review expensive queries and media delivery;
- document material recurring costs;
- define cost controls for scale-sensitive systems.

Cost cutting may not create unacceptable reliability, security, accessibility, or business harm.

**Release blocker:** The implementation creates unbounded or materially unjustified cost exposure.

## Goal 13: Maintainability Over Heroics

Prefer clear, testable, focused solutions over clever shortcuts.

Required:

- focused modules;
- explicit behavior;
- controlled complexity;
- no casual error suppression;
- no undocumented critical exceptions;
- comments explain why, not obvious syntax;
- debt introduced by necessity is recorded with an owner.

**Release blocker:** Safe maintenance depends on one person, hidden behavior, or unexplained production-critical hacks.

## Goal 14: Compliance and Governance Readiness

Systems involving regulated or rights-sensitive activity must produce reviewable evidence.

Conditional areas include:

- privacy;
- consent;
- payments;
- messaging;
- minors;
- regulated data;
- user content;
- retention;
- export;
- deletion;
- audit logs;
- administrative actions;
- content rights.

Do not claim legal compliance without qualified review.

**Release blocker:** The system cannot demonstrate or enforce a material required control, or falsely claims compliance.

## Goal 15: Aligned Roadmap Execution

Work must support the approved direction and avoid unauthorized product drift.

Required:

- confirmed objective;
- intended audience;
- business priority;
- non-goals;
- preserved behavior;
- dependencies;
- success measure.

Technical elegance does not justify solving the wrong problem.

**Release blocker:** The change conflicts with the approved roadmap, requirement, or product positioning.

## Goal 16: Visual Excellence, Brand Expression, and Commercial Presence

When visual quality is part of the requirement, it is a functional and commercial obligation.

Required when applicable:

- approved visual direction;
- deliberate hierarchy, typography, spacing, imagery, motion, and composition;
- responsive art direction;
- real rendered review;
- accessible interaction and reduced-motion behavior;
- asset-delivery strategy;
- fallback when cinematic or decorative assets fail;
- measurable commercial or experience objective.

For brand-led sites, the site may be the storefront, billboard, sales presentation, proof of quality, and primary trust signal.

Aesthetic quality may justify a controlled performance or SEO tradeoff only under the Tradeoff Standard below.

**Release blocker:** The delivered experience materially misses the approved brand standard or primary commercial presentation requirement.

---

# 8. Experience Class and Tradeoff Standard

Every public-facing website must select one class during planning:

- **Performance-Led:** Utility, transaction speed, broad device support, or efficiency is primary.
- **Balanced:** Performance, search visibility, usability, and visual impact carry similar weight.
- **Brand-Led:** Prestige, immersion, emotion, differentiation, or perceived quality is a primary commercial outcome.
- **Campaign or Showcase:** A defined experience is intentionally cinematic, temporary, or presentation-led.

## Material Tradeoff Rule

A performance, SEO, accessibility, maintainability, or cost compromise is allowed only when:

1. the benefit supports a documented user or business objective;
2. the compromise is measurable;
3. safer or lighter alternatives were evaluated;
4. reasonable optimization was applied first;
5. the primary task remains usable;
6. essential content remains accessible and crawlable when search matters;
7. constrained-device, reduced-motion, and failure fallbacks exist where relevant;
8. the decision owner accepts the residual risk;
9. the tradeoff is recorded in the evidence ledger;
10. a reversal trigger and review date are defined.

## Non-Negotiable Floors

No aesthetic decision may knowingly create:

- a critical accessibility barrier;
- failure of the primary conversion;
- severe mobile unusability;
- unbounded data use;
- auto-playing audio without user control;
- security or privacy exposure;
- hidden essential content with no accessible or crawlable equivalent;
- a single asset failure that destroys the primary experience;
- unacceptable performance on the actual target audience's realistic devices.

Performance scores are evidence, not the product objective. Artistic preference is intent, not proof of value.

---

# 9. Mandatory APIVR Lifecycle

The 16 goals define the standard. APIVR is the required execution loop.

## Phase 1: Audit

Produce a current-state record containing:

- objective and scope;
- real architecture and source of truth;
- observed defects and risks;
- evidence state and confidence;
- applicable goals;
- risk tier;
- experience class when applicable;
- baseline metrics;
- unknowns.

No implementation begins until the relevant surface is sufficiently understood.

## Phase 2: Plan

The plan must define:

- root cause;
- smallest safe change;
- in-scope and out-of-scope work;
- preserved behavior;
- acceptance criteria;
- tests and evidence required;
- rollback or restoration method;
- owners and approval gates;
- tradeoffs;
- verification horizon.

Plans for Important and Critical work require challenge review before execution.

## Phase 3: Implement

During implementation:

- change only the approved surface;
- preserve build health;
- verify after meaningful steps;
- record material deviations immediately;
- stop on new Critical risk;
- do not suppress failures to continue;
- preserve rollback capability.

## Phase 4: Audit the Implementation

Compare plan versus actual.

Check:

- missed requirements;
- unplanned changes;
- duplicated logic;
- source-of-truth drift;
- broken dependencies;
- regressions;
- performance, SEO, accessibility, security, data, and visual impact;
- documentation drift.

## Phase 5: Verify

Verification has three separate verdicts:

- **Technical:** Does it work as specified?
- **Experience:** Does it render, communicate, and behave as required?
- **Outcome:** Did it achieve or credibly advance the intended user or business result?

Outcome verification may use:

- immediate observation;
- leading indicators;
- 30-day;
- 60-day;
- 90-day;
- another explicitly justified horizon.

## Phase 6: Re-Audit

Use verified results as the new baseline.

Re-audit only when it informs a decision, detects drift, validates durability, or closes an outcome horizon.

## Final Verdict

Every cycle ends with exactly one:

- **PASS:** All applicable release gates pass and the claimed outcome is verified.
- **CONDITIONAL PASS:** Technical release gates pass, but an approved non-critical risk or future outcome horizon remains.
- **PARTIAL:** Some required behavior or evidence remains incomplete.
- **FAIL:** A release gate, critical requirement, or intended outcome is not met.
- **BLOCKED:** Work or verification cannot proceed because of a stated external constraint.

The verdict must include the evidence and single next required action.

---

# 10. Acceptance Thresholds

Project-specific thresholds must be written before implementation. Defaults below apply only when no stricter project standard exists.

## Marketing or Lead-Generation Website

- Primary conversion works on supported desktop and mobile browsers.
- Critical text, headings, metadata, and indexation controls are crawlable when organic search matters.
- Primary flows target WCAG 2.2 AA.
- Analytics and conversion events are verified.
- Approved visual direction is verified on representative rendered screens.
- No severe mobile failure remains.
- Performance envelope matches the selected experience class.
- Material visual-performance tradeoffs are approved and recorded.

## Brand-Led or Experiential Website

- Approved visual direction is verified on representative desktop, tablet, and mobile screens.
- Reduced-motion and media-failure behavior are reviewed.
- Primary message and conversion survive cinematic-asset failure.
- Essential search content remains crawlable when SEO is an objective.
- Media uses responsive delivery, compression, caching, and conditional loading where applicable.
- The approved performance envelope is measured on realistic target devices and connections.
- Commercial or experience indicators are defined.

## SaaS or Web Application

- Primary workflows are functionally verified.
- Authorization is tested at trusted boundaries.
- Error, loading, empty, and success states exist.
- Critical writes are protected from duplication and partial failure.
- Monitoring and rollback exist for touched production surfaces.
- Critical latency and availability targets are stated where relevant.

## E-Commerce or Transactional System

- Payment and order flows are verified in supported scenarios.
- Duplicate charge and duplicate order protections exist.
- Inventory and transaction integrity are protected.
- Failed-payment and recovery paths are tested.
- Revenue and attribution events are verified.
- No unaccepted critical security, privacy, or data-integrity risk remains.

## Internal Administrative Tool

- Permissions match roles.
- Destructive actions require appropriate safeguards.
- Material actions are auditable.
- Recovery from user error is defined.
- Primary workflows work with realistic data.

## Public API or Integration

- Contract and schema are documented.
- Authentication, authorization, validation, rate, retry, timeout, and idempotency behavior are defined.
- Errors are consistent and observable.
- Compatibility or versioning is addressed.
- Dependency-failure behavior is tested.

## Data Pipeline or Scheduled Process

- Input, output, and freshness contracts are defined.
- Retry, idempotency, duplicate prevention, and backfill behavior are addressed.
- Failure and stale data are observable.
- Data-quality thresholds and recovery steps are defined.

---

# 11. Exception and Waiver Control

A requirement may be marked:

- `Applicable`
- `Not Applicable`
- `Deferred`
- `Accepted Risk`
- `Blocked`

Every `Deferred`, `Accepted Risk`, or `Blocked` item must contain:

- requirement;
- reason;
- evidence;
- user and business impact;
- security, privacy, accessibility, SEO, performance, data, and operational impact as applicable;
- owner;
- approver;
- compensating control;
- expiration or review date;
- remediation or reversal trigger.

## Limits

- Critical security, privacy, authorization, or data-integrity failures require explicit accountable acceptance and may still remain release blockers.
- No agent may self-approve a material exception it introduced.
- A waiver changes authorization, not truth. An unmet requirement remains unmet.
- Expired waivers automatically return to `Blocked` until reviewed.

---

# 12. Evidence Ledger

Every material completion claim must map to proof.

| Claim | Goal | Applicability | State | Confidence | Evidence | Threshold | Result | Remaining Risk | Owner |
|---|---:|---|---|---|---|---|---|---|---|
| Example: Build completes | 5 | Universal | Verified | High | Production build output | Zero build errors | Pass | None known | Engineering |

Rules:

- One row per material claim.
- Link or identify the exact evidence.
- Separate observed result from interpretation.
- Record failed and blocked checks, not only successful ones.
- Do not use one artifact as proof for unrelated claims.
- Update the ledger when later evidence changes the verdict.

---

# 13. Release Gates and Definition of Done

A release is `Done` only when all applicable gates pass.

## Gate A: Objective and Scope

- Objective, audience, outcome, scope, non-goals, and acceptance criteria are explicit.
- Actual implementation matches approved scope.

## Gate B: Architecture and Source of Truth

- Canonical sources are used.
- No unjustified parallel system or conflicting business rule exists.
- Dependencies and migration effects are understood.

## Gate C: Security, Privacy, and Permissions

- Inputs and permissions are enforced at trusted boundaries.
- Secrets and private data are protected.
- No unaccepted release-blocking exposure remains.

## Gate D: Data Integrity

- Writes, migrations, concurrency, duplication, and recovery are safely handled.
- Critical data is reconciled or verifiably preserved.

## Gate E: Reliability and Operations

- Primary and adverse states are handled.
- Material failures are observable.
- Recovery and rollback are available according to risk.

## Gate F: Product, Accessibility, Visual, and Commercial Quality

- Primary users can complete the task.
- The rendered experience matches the approved standard.
- Accessibility obligations are met or explicitly governed.
- Commercial and brand requirements are preserved.

## Gate G: Performance, SEO, and Cost

- The approved experience class and thresholds are met.
- Material compromises are optimized, measured, approved, and reversible where possible.
- No unbounded cost or delivery risk exists.

## Gate H: Verification and Handoff

- Required checks were run.
- Evidence ledger is complete.
- Documentation reflects durable behavior.
- Owners, known risks, and next actions are clear.
- No unrelated change remains hidden.

If any applicable gate fails, the release verdict cannot be `PASS`.

---

# 14. Required Completion Report

Every completed cycle must report:

1. objective;
2. risk tier and experience class;
3. what changed;
4. affected files, systems, data, and users;
5. preserved behavior;
6. verification performed and not performed;
7. evidence verdicts;
8. release-gate status;
9. deviations from plan;
10. remaining risks and approved exceptions;
11. rollback or recovery method;
12. outcome status and verification horizon;
13. final APIVR verdict;
14. single next required action.

The report must be concise enough to use and complete enough to audit.

---

# 15. Ten Execution Tightenings in Version 3.0

This version strengthens the prior document without adding Critical Build Goals:

1. Added a binding conflict-priority order so aesthetics, SEO, speed, accessibility, safety, and business objectives cannot be resolved arbitrarily.
2. Converted broad principles into ten absolute guardrails with explicit stop conditions.
3. Added `Not Run` and `Blocked` evidence states to prevent missing verification from being disguised as uncertainty.
4. Added Routine, Important, and Critical minimum-control requirements based on blast radius.
5. Added one explicit release blocker to each of the 16 goals.
6. Replaced repeated workflow, quality, and Definition-of-Done language with eight enforceable release gates.
7. Tightened aesthetic-performance tradeoffs with ten approval conditions, non-negotiable floors, reversal triggers, and target-device evidence.
8. Made APIVR mandatory and defined distinct Technical, Experience, and Outcome verdicts.
9. Prevented self-approved exceptions, added waiver expiration, and clarified that waivers do not change factual compliance.
10. Reduced duplication by consolidating proof requirements into one evidence ledger and one required completion report.

---

# 16. Elite Completion Standard

Software meets this standard only when:

- the intended user can use it;
- the required business outcome is supported;
- security, privacy, and data integrity are protected;
- the experience is clear, accessible, and visually appropriate;
- performance, SEO, aesthetics, cost, and maintainability are balanced according to the approved experience class;
- operations can detect and recover from material failure;
- the team can understand and maintain it;
- all completion claims are supported by evidence;
- unresolved risk is explicit and owned;
- the final verdict accurately reflects reality.

**Build to that standard every time.**
