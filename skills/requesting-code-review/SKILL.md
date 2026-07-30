---
name: requesting-code-review
description: Use when asking another agent or person to review a change, branch, pull request, migration, or release candidate. Produces a bounded review package with exact scope, evidence, risks, and questions.
activation: review request, PR handoff, independent implementation audit, or release-candidate review.
required_inputs: Objective, immutable base and head, changed files, verification evidence, known risks, and reviewer questions.
required_outputs: Bounded review package and an explicit independence classification.
authority_dependencies: 00_start_here/SOURCE_OF_TRUTH.md; skills/subagent-driven-development/SKILL.md; skills/verification-before-completion/SKILL.md.
evidence_requirements: Exact review range and recorded commands, or an honest Blocked state if a required artifact is unavailable.
---

# Requesting Code Review

A reviewer needs the exact change and the decision context, not a vague request
to “take a look.” Never ask the implementer to self-approve material work.

## Required Package

```text
Objective and preserved behavior:
Exact base..head range or immutable commit:
Changed files and public interfaces:
Commands run with result:
Known limitations and intentionally unrun checks:
Risk areas to challenge:
Specific questions for reviewer:
```

## Process

1. Confirm a clean worktree or include uncommitted changes in an explicit
   review bundle. Never review `HEAD~1` by habit when the task spans commits.
2. Create the package with the repository’s review-package tool when present.
3. Ask the reviewer to classify findings as Blocking, Important, or Advisory,
   with evidence and a required correction.
4. Require re-review for every fixed Blocking or Important finding. A passing
   test does not close a finding that challenged scope, security, or evidence.

## Example Review Request

```text
Review range: 9cac90d..feature/v2-registry
Goal: make adapter metadata registry-generated without changing legacy installs.
Evidence: node --test scripts/tests/v2-registry.test.mjs; npm run verify.
Challenge: path containment, generated-file drift, support-label overclaiming.
Question: Can any hand edit to a manifest, mapping, or matrix escape detection?
```

## Failure Handling

If the exact base, head, evidence, or review target is unknown, do not open a
review request. First produce the missing immutable artifact. Record degraded
independence whenever the runtime can only perform a fresh-context self-review.
