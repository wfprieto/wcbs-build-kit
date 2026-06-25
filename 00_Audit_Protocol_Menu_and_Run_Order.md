# Audit Protocol Menu and Run Order

## Purpose
This file tells Claude which audit to run and in what order so the project is reviewed like a senior engineering organization.

## Governing Principle
**Audit wide. Fix narrow. Prove everything.**

## Required Audit Set
1. Project Foundation & Build Readiness Audit
2. Master System Audit
3. Security, Privacy, and Access Control Audit
4. Architecture, Module Boundary, and Scalability Audit
5. Workflow, Click Path, and UI Interaction Audit
6. Clean Code, Cleanup, and Technical Debt Audit
7. Testing, QA Coverage, and Verification Audit
8. Data Integrity, Legacy Records, and Cleanup Safety Audit

## Recommended Run Order
### New project or structurally uncertain project
1. Project Foundation & Build Readiness Audit
2. Architecture Audit
3. Security Audit
4. Master System Audit
5. Testing/QA Audit
6. Workflow/UI Audit
7. Data Integrity Audit
8. Clean Code/Technical Debt Audit

### Pre-launch project
1. Master System Audit
2. Security Audit
3. Workflow/UI Audit
4. Testing/QA Audit
5. Data Integrity Audit
6. Architecture Audit
7. Clean Code Audit
8. Release Readiness Gate

### Bug-heavy or unstable project
1. Master System Audit
2. Workflow/UI Audit
3. Data Integrity Audit
4. Testing/QA Audit
5. Security Audit
6. Architecture Audit
7. Clean Code Audit

### Growing codebase / refactor concern
1. Project Foundation Audit
2. Architecture Audit
3. Clean Code Audit
4. Testing/QA Audit
5. Master System Audit

## Rules
- Audits are audit-first unless explicitly converted into implementation prompts.
- Do not let Claude fix audit findings during the audit unless the prompt explicitly allows tiny safe fixes.
- Every finding must include evidence.
- Every finding must be turned into a ticket, deferred item, or implementation prompt.
- Destructive work discovered in audits must require a separate approved implementation prompt.

## Finding Record Format
`~/.claude/wcbs-kit/``text
Finding ID:
Severity:
Category:
Location:
Evidence:
Impact:
Recommended Action:
Risk of Fix:
Tests Needed:
Manual Verification Needed:
Human Approval Required:
`~/.claude/wcbs-kit/``
