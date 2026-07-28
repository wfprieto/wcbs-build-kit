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

## <HARD-GATE>

Do not ship a new or materially changed skill until its trigger is explicit, its non-negotiable behavior is expressed as a gate or decision flow, and the relevant pressure test has been run or honestly recorded as `Not Run` or `Blocked`.

## Workflow

1. Identify the user language that should activate the skill.
2. Write a trigger-first description using “Use when…” or an equally explicit trigger phrase.
3. Declare all seven portable frontmatter fields.
4. Put authority dependencies in frontmatter rather than copying their rules.
5. Express required behavior as a short decision flow, hard gate, or rationalization table.
6. Move explanation and examples to `references/` before the runtime skill exceeds 260 lines.
7. Add or update an LLM-in-the-loop eval case that pressures the model to skip the behavior.
8. Run the contract audit and the relevant eval before and after the change.
9. Keep the change only when measured adherence does not regress.

## Excuse / Reality

| Excuse | Reality |
|---|---|
| “The prose is obvious.” | Agents rationalize around prose under pressure; gates and tests survive better. |
| “The skill is too small for an eval.” | Small high-authority instructions can cause the largest behavioral regressions. |
| “A string check proves it works.” | It proves text is present, not that a model follows it. |
| “I can copy the guardrail here for clarity.” | Copying creates a second source of truth and future drift. |
| “The benchmark skill is longer.” | Length is not authority; split reference material instead of bypassing the budget. |

## Evidence Rules

- Structural assertions are drift controls, not behavioral evidence.
- A model response is behavioral evidence only when the response span is isolated from the prompt.
- Name the production or skill change that would make a test fail. If none exists, the test is not evidence.
- Record run count, model/runtime version, date, baseline, treatment, and remaining uncertainty.
