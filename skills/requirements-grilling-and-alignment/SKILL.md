---
name: requirements-grilling-and-alignment
description: Use before planning when requirements are ambiguous, underspecified, internally inconsistent, too broad, or based on assumptions. Runs one-question-at-a-time alignment, decision-tree clarification, doc-backed grilling, scope narrowing, and APIVR evidence classification before implementation.
---

# Requirements Grilling And Alignment

Use this skill during APIVR Phase 1 when the request needs sharper requirements before a plan can be trusted.

<HARD-GATE>
Ask one decision-making question at a time. Do not ask a survey of questions unless the user explicitly requests a questionnaire.
</HARD-GATE>

## Protocol

1. Restate the request in one sentence.
2. Identify the single most consequential unknown.
3. Ask or resolve that unknown using available docs.
4. Repeat until scope, non-goals, acceptance criteria, and evidence are clear enough for APIVR tier.
5. Convert answers into a zero-placeholder plan or mark `BLOCKED`.

## Decision Flow

```mermaid
flowchart TD
  A["Ambiguous request"] --> B["Restate objective"]
  B --> C["Find highest-impact unknown"]
  C --> D{"Can docs answer it?"}
  D -- "Yes" --> E["Cite doc and classify evidence"]
  D -- "No" --> F["Ask one question"]
  E --> G{"Enough to plan?"}
  F --> G
  G -- "No" --> C
  G -- "Yes" --> H["Route to writing-plans"]
```

## Worked Example

Scenario: "Add notifications."

- Highest-impact unknown: what event should notify whom.
- One question: "Which single event should trigger the first notification, and who must receive it?"
- Result: password reset failure alerts go to admins.
- APIVR plan now has exact event, recipient, channel, evidence, and non-goals.

