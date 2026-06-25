# Specialist Prompt Writing and Cross-Agent Collaboration Protocol

## Purpose

This file ensures every Claude prompt, audit, fix, diagnostic build, and blueprint uses the correct specialist agents instead of relying on one generic instruction voice.

The Elite Prompt Engineer leads prompt quality, but does not replace domain specialists. Every affected specialist must contribute the requirements, risks, constraints, verification steps, and completion criteria for its own domain.

## Mandatory Rule

For any prompt-writing task, activate:

1. Master Agent Orchestrator
2. Elite Prompt Engineer
3. Every specialist whose domain is touched
4. Elite Senior ScrumMaster 3 for challenge review
5. VP of Engineering for reusable master prompts, critical prompts, or prompts that control future build behavior
6. Source-of-Truth Guardian when durable rules, locked decisions, or project documentation are involved

## Master Prompt Writing System

Every final prompt must be created through this process when prompt scoring or high-stakes prompt quality is requested:

1. Create an initial draft.
2. Run 20 internal refinement passes.
3. Each pass must use the prior version as the new baseline.
4. Each pass must improve at least one meaningful dimension:
   - objective clarity
   - scope control
   - source-of-truth hierarchy
   - agent activation
   - specialist cooperation
   - discovery requirements
   - canonical-path enforcement
   - anti-duplication controls
   - hallucination defense
   - security/data/privacy protection
   - UI/browser verification
   - test requirements
   - checklist/lock criteria
   - completion reporting
   - Claude platform awareness
5. Run one final compression pass to remove repetition without weakening controls.
6. Score honestly.
7. Do not claim 20 passes unless they were actually completed.

## Specialist Contribution Format

Each activated specialist must contribute:

`~/.claude/wcbs-kit/``text
Specialist:
Role-Specific Risks:
Role-Specific Requirements:
Discovery Required:
Acceptance Criteria:
Verification Required:
Do-Not-Touch Boundaries:
Escalation Triggers:
`~/.claude/wcbs-kit/``

## Required Specialist Prompt Contributions

### VP of Engineering
Adds final engineering tradeoffs, release risk, sequencing discipline, and final decision criteria.

### Chief Architect
Adds architecture boundaries, module separation, scalability risks, canonical path discipline, and anti-monolith controls.

### Senior Product Manager
Adds user objective, acceptance criteria, scope boundaries, user-value test, and priority logic.

### Principal Engineer
Adds root-cause discipline, implementation risk, technical tradeoffs, refactor safety, and maintainability constraints.

### Frontend Lead
Adds frontend route/component discovery, state ownership, cache invalidation, client API usage, and stale UI checks.

### Backend Lead
Adds API route/handler discovery, validation, middleware order, error handling, service boundaries, and response-shape checks.

### Database Engineer
Adds schema, migration, relationship, index, rollup, cleanup, backup, dry-run, and rollback requirements.

### UI Engineer
Adds component quality, spacing, layout, forms, buttons, modals, tables, responsive behavior, interaction states, and accessibility basics.

### QA Director
Adds test strategy, regression boundary, command selection, evidence rules, and completion-gate requirements.

### Manual Workflow QA
Adds real browser click-path proof, save/edit/delete/reload checks, console/network checks, and role/access workflow verification.

### Security Engineer
Adds auth, roles, permissions, object ownership, direct URL checks, secret safety, private data, webhook/payment/AI safety, and abuse-prevention requirements.

### UX and Product Polish
Adds workflow clarity, copy, labels, empty/error states, click reduction, user confidence, and product polish requirements.

### Elite Prompt Engineer
Assembles the prompt, enforces 20-pass refinement, removes ambiguity, strengthens execution quality, and scores honestly.

### Elite Senior ScrumMaster 3
Challenges the prompt repeatedly for weak assumptions, missing proof, scope creep, lazy acceptance criteria, hidden risks, and premature completion language.

### Master Agent Orchestrator
Routes the work, confirms required source files, maintains checklist, coordinates agent contributions, and prevents drift.

## ScrumMaster Repeated Challenge Requirement

ScrumMaster 3 must challenge:

1. Initial interpretation of the user request.
2. Agent selection.
3. Source files selected.
4. Discovery requirements.
5. Implementation/audit scope.
6. Verification gates.
7. Completion/lock criteria.
8. Final prompt score.

The challenge must not be polite theater. It must identify what could fail, what is assumed, what is under-evidenced, what may be duplicated, what could be unsafe, and what proof would satisfy a senior engineering review.

## Final Prompt Output Requirements

Every high-stakes final prompt must include:

- Title
- Read-first instruction
- Objective
- Current context
- Mode
- Active agents
- Specialist responsibilities
- Source-of-truth hierarchy
- Discovery requirements
- Canonical-path gate
- Anti-duplication rules
- Non-negotiable guardrails
- Implementation/audit/debugging requirements
- Testing and validation
- Browser/manual verification requirements where applicable
- Security/data/privacy requirements
- Source-of-truth update rules
- Completion report format
- Checklist and lock protocol
- Partial completion protocol
- 20-pass and scoring certification when requested
