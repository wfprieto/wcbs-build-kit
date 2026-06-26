# Systematic Workflows

Merged from APIVR, WCBS, and Superpowers workflow mechanics.

## Planning Discipline

- Explore the project context before proposing a solution.
- Ask only questions that materially affect scope, success criteria, risk, or implementation.
- Present alternatives when the choice changes architecture, risk, cost, or user outcome.
- Write plans that an implementer can execute without inventing missing decisions.

## Implementation Discipline

- Prefer the smallest safe change.
- Preserve existing behavior unless a change is explicitly approved.
- Use test-first or evidence-first development where practical.
- Verify after meaningful steps.
- Stop on new Critical risk.

## Review Discipline

Review in this order:

1. Spec compliance
2. Source-of-truth consistency
3. Security, privacy, and data integrity
4. Reliability and adverse states
5. User outcome and accessibility
6. Maintainability and local patterns
7. Performance, SEO, and cost
8. Evidence completeness

## Debugging Discipline

- Reproduce or directly observe the failure when possible.
- Trace root cause before changing code.
- Distinguish symptom, cause, contributing factor, and unrelated issue.
- Add defense-in-depth only when it addresses a real failure mode.
- Verify the fix and scan for collateral damage.

## Subagent Discipline

Use subagents only when they reduce risk or context load. Each subagent must receive:

- objective;
- exact scope;
- relevant source files;
- applicable goals;
- expected evidence;
- stop conditions;
- output format.

