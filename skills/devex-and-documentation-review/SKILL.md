---
name: devex-and-documentation-review
description: Use when changes affect developer experience, setup, commands, documentation, README files, examples, onboarding, API docs, release notes, handoffs, or maintainability of instructions. Reviews docs for accuracy, discoverability, task fit, redaction, and APIVR evidence alignment.
---

# DevEx And Documentation Review

Use this skill for developer-facing workflows and durable docs.

## Review Protocol

1. Identify the reader and job: installer, maintainer, reviewer, operator, integrator, or future agent.
2. Verify commands are current and runnable or clearly marked unverified.
3. Check that docs reference canonical files instead of duplicating stale instructions.
4. Confirm secrets, tokens, and private data are redacted.
5. Ensure handoffs reference artifacts and evidence instead of replaying chat memory.
6. For provider-facing routes, confirm docs name the route contract, deployed callback URL, provider account/environment, sandbox/live values, deployment-protection expectation, replay/idempotency behavior, and exact verification evidence.
7. Classify evidence state for every claim that affects setup, release, or operation.

## Documentation Types

- Tutorial: teach first successful path.
- How-to: solve a concrete task.
- Reference: list exact contracts, commands, config, schemas, or APIs.
- Explanation: document decisions, tradeoffs, and architecture.

## Worked Example

Scenario: A new webhook integration changes env vars and retry behavior.

- DevEx review requires `.env.example` update, provider setup notes, route contract, deployed callback URL, local replay command, safe logging note, and rollback section.
- Claims about provider behavior are `Likely` until sandbox replay is run.
- Completion report links docs changed and evidence state.

