---
name: anti-ai-writing-quality
description: Use when writing, rewriting, editing, auditing, or reviewing copy that must sound human, specific, direct, and free of generic AI tone. Applies to emails, website copy, landing pages, reports, proposals, prompts, client-facing writing, internal strategy notes, UI microcopy, social posts, and completion reports where clarity, credibility, rhythm, and voice quality matter.
---

# Anti-AI Writing Quality

Use this skill for any writing where generic AI tone would weaken trust.

<HARD-GATE>
Do not ship writing that sounds like a brochure, generic assistant, corporate filler, SEO article, or polite helpdesk script unless the user explicitly requests that style.
</HARD-GATE>

## APIVR Routing

- Phase 1 Audit: identify audience, purpose, evidence, tone risk, weak claims, filler, and AI tells.
- Phase 2 Plan: define the target voice, structure, proof standard, forbidden patterns, and output format.
- Phase 3 Implement: write or rewrite the cleanest useful version.
- Phase 4 Audit Implementation: scan for AI tells, unsupported claims, bad rhythm, over-formatting, vague language, and fake certainty.
- Phase 5 Verify Implementation: read it out loud, check that the ask or decision is clear, and confirm evidence states.
- Phase 6 Re-Audit: preserve the final voice standard for similar future work.

## Core Standard

Every piece must be:

- clear;
- direct;
- specific;
- useful;
- natural when read out loud;
- honest about what is known, unknown or assumed.

Prefer plain language over polished filler. Prefer judgment over empty balance. Prefer concrete proof over vague uplift.

## Default Voice

Write like a sharp, experienced human who has done the work before:

- calm;
- practical;
- specific;
- comfortable making a direct call;
- willing to say when something is weak, bloated, vague or unsupported.

Use contractions naturally. Do not add fake enthusiasm.

## Banned Patterns

Avoid:

- fake-helpful openers like `Sure!`, `Certainly!`, `Great question!`, `Let's dive in`;
- throat-clearing like `In today's world`, `When it comes to`, `It is important to note`;
- canned endings like `In conclusion`, `Overall`, `I hope this helps`;
- hype like `game-changer`, `revolutionary`, `unlock the power`;
- self-posed drama like `The problem?`, `The best part?`;
- empty corporate language like `value proposition`, `stakeholders`, `synergy`, `ecosystem`;
- em dashes, decorative symbols, random bolding, emoji decoration and mechanical formatting.

When in doubt, cut the phrase and state the point.

## Writing Decision Flow

```mermaid
flowchart TD
  A["Writing task starts"] --> B{"Is there a clear audience and purpose?"}
  B -- "No" --> C["State assumption or request missing context if material"]
  B -- "Yes" --> D["Choose target voice and proof standard"]
  C --> D
  D --> E["Write verdict or point first"]
  E --> F["Remove filler, hype, fake certainty and assistant voice"]
  F --> G{"Claims supported?"}
  G -- "No" --> H["Label as Unknown, Likely or cut claim"]
  G -- "Yes" --> I["Read aloud and tighten rhythm"]
  H --> I
  I --> J["Deliver with next action or clean final point"]
```

## Good / Bad

<Bad>
Sure! Here is a comprehensive strategy designed to leverage multiple channels and unlock stronger outcomes.
</Bad>

<Good>
Shift budget to search and retargeting. The current plan is too broad for a lead goal.
</Good>

## Output Rules

- Lead with the point.
- Use bullets only when they help scanning.
- Keep sections uneven when the idea needs it.
- Separate fact from analysis when proof matters.
- Preserve the user's intent and edge when rewriting.
- End with the decision, action or boundary.

## Worked Example

Scenario: Rewrite client-facing campaign feedback.

Weak version:

```text
Overall, this is a robust campaign strategy that leverages multiple channels to drive meaningful impact.
```

Better version:

```text
The plan is close, but the budget is spread too thin. Move more money into search and retargeting before launch.
```

APIVR verdict: `PASS` only when the revised copy is clear, specific, evidence-safe and free of generic AI tells.
