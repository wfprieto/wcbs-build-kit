# Task Checklist and Lock Protocol

## Purpose
Create one operational checklist for every Claude task and prevent premature completion claims.

## Checklist Status Values
- Not Started
- In Progress
- Blocked
- Failed
- Verified
- Not Applicable
- Locked

## Required Checklist Items
Every task must track:
- [ ] Mode selected.
- [ ] Risk level classified.
- [ ] Active agents selected.
- [ ] Source-of-truth files inspected.
- [ ] Repository discovery completed.
- [ ] Live path identified.
- [ ] Duplicate/legacy paths searched.
- [ ] Canonical implementation confirmed.
- [ ] Data/schema/API implications reviewed.
- [ ] Security/access implications reviewed.
- [ ] Smallest safe plan written.
- [ ] Implementation completed, if applicable.
- [ ] Tests/checks run.
- [ ] Manual browser workflow verified, if applicable.
- [ ] Source-of-truth updated, if durable state changed.
- [ ] Completion report written.
- [ ] Task locked or marked Not Complete.

## Lock Criteria
Only mark Locked when all applicable checklist items are Verified or Not Applicable and supporting evidence exists.

## Not Complete Criteria
Mark Not Complete when:
- Browser verification could not be completed for touched UI.
- Tests failed or timed out without adequate targeted replacement.
- Canonical path was not proven.
- Security/data risk remains unresolved.
- Source-of-truth conflict remains unresolved.
- Work is partially implemented but not verified.

## Required Lock Statement
`~/.claude/wcbs-kit/``text
Lock Decision: Locked / Not Locked
Evidence:
- Commands:
- Browser verification:
- Data/API verification:
- Security verification:
- Source-of-truth update:
Remaining unknowns:
`~/.claude/wcbs-kit/``
