# Work Queue and Ticketing Governance

## Purpose
Turn audits, diagnostics, incidents, ideas, bugs, technical debt, data issues, and follow-ups into tracked work so nothing important is lost.

## Ticket Types
- Incident
- Confirmed Bug
- Follow-Up Investigation
- Technical Debt
- Feature / Improvement Idea
- UX / Workflow Issue
- Security Review
- Performance Issue
- Data Integrity Issue
- Deferred Work
- Won't Fix Decision
- Documentation Task

## Required Ticket Fields
- Title
- Type
- Severity: P0 / P1 / P2 / P3 / P4 / Info / Future
- Status: New / Triaged / In Progress / Blocked / Ready for Review / Verified / Closed / Deferred / Won't Fix
- Source: audit / diagnostic / user report / incident / test / browser QA / code review / monitoring
- Affected area
- Evidence summary
- Reproduction steps if bug
- Expected behavior
- Actual behavior
- Recommended action
- Owner
- Created timestamp
- Updated timestamp
- Related deploy
- Related incident
- Related audit finding
- Verification required
- Final verification evidence

## Ticket Creation Rules
Create a ticket when:
- An audit finding requires future work.
- A diagnostic tool detects degraded/failing status.
- A browser QA test fails.
- A security/data risk is found.
- A workflow is confusing or inefficient.
- A cleanup item is valid but not safe to do now.

Do not create duplicate tickets. Attach related findings to an existing ticket when they share root cause or affected area.

## Won't Fix Rules
Use Won't Fix only when:
- Issue is invalid.
- Expected behavior.
- Too low value.
- Fix risk outweighs benefit.
- Intentionally out of scope.

Won't Fix requires a reason and evidence.

## Deferred Rules
Use Deferred when the work is valid but not urgent. Deferred work must remain findable and revisitable during roadmap planning.

## Completion Rule
A ticket cannot be closed until verification evidence is attached.
