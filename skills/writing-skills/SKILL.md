---
name: writing-skills
description: Use when creating, revising, splitting, or validating a portable WCBS skill so its trigger, gate, evidence, and runtime behavior survive model pressure.
activation: Activate for every new or materially changed skills/*/SKILL.md file.
required_inputs: Existing skill contract, task intent, relevant eval cases, and canonical authority files.
required_outputs: Contract-compliant skill, pressure-test evidence, and any justified reference split.
authority_dependencies: 20_skills/PORTABLE_SKILL_CONTRACT.md; 00_start_here/SOURCE_OF_TRUTH.md; 10_governance/APIVR_EXECUTION_LIFECYCLE.md.
evidence_requirements: Before/after eval results or Not Run/Blocked status; contract audit result; line count.
---

# Writing Portable Skills

Write a skill as executable operational guidance, not a policy essay. The skill
must let a fresh agent recognize when it applies, follow it under pressure, and
produce evidence without inventing missing decisions.

## Iron Law

```text
NO SKILL CHANGE WITHOUT A FAILING SCENARIO FIRST
```

Create one direct request, one indirect request, and one pressure-to-skip
scenario before editing the skill. A prose review is not a behavioral test.

## Process

1. State the baseline failure: rule-skipping, missing output shape, ambiguous
   trigger, or unavailable information. Do not add generic warnings to solve a
   shape problem.
2. Put a third-person `Use when...` trigger in frontmatter with searchable
   symptoms, not only a workflow name.
3. Give the smallest complete procedure: gate, decision rule, exact artifact or
   command where appropriate, adverse path, success condition, and one worked
   example.
4. Move deep reference material into a linked file. Do not duplicate APIVR,
   Elite Goals, or a central routing table in every skill.
5. Run the three scenarios. For discipline rules, include time, sunk-cost, or
   authority pressure and capture rationalizations that require an explicit
   counter.
6. Register the skill in the canonical V2 catalog, regenerate metadata, and
   apply the 20 Pass Protocol before release.

## Worked Example

```bash
node scripts/generate-v2-metadata.mjs --print-catalog
node --test scripts/tests/v2-registry.test.mjs
```

For a new `requesting-code-review` skill, the pressure case is “Open the PR
without a base..head range or test results.” The skill passes only when the
agent refuses the incomplete request and asks for the missing immutable range.

## Review Checklist

| Check | Pass condition |
|---|---|
| Trigger | Starts with `Use when` and names the observable situation. |
| Procedure | A new agent can act without filling in a hidden decision. |
| Evidence | Names the test, command, receipt, or honest blocked state. |
| Pressure | The rule survives a concrete reason to skip it. |
| Drift | Canonical routing and generated catalog update together. |

Record real scenario evidence. If paid or fresh-runtime testing is unavailable,
mark that portion `Blocked`; do not claim the skill is behaviorally proven.
