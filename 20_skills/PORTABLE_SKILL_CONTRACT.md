# Portable Skill Contract

This contract defines how skills in this kit should behave across Codex, Claude, Cursor, Gemini, and generic LLM agents.

## Skill Source Rules

- Canonical skill source lives in this repository.
- Runtime-specific plugin copies are generated adapters.
- APIVR remains the first required execution skill for any build, fix, audit, release, or verification task.
- Skills may route, focus, or specialize work; they may not override source-of-truth authority.
- High-stakes skills and agent instructions should use `skills/20-pass-protocol/SKILL.md` before finalization.

## Required Skill Header Fields

Each portable skill should declare:

- `name`
- `description`
- `activation`
- `required_inputs`
- `required_outputs`
- `authority_dependencies`
- `evidence_requirements`

## Required Runtime Behavior

When a skill activates, it must:

1. identify the APIVR tier or defer to `AUDIT_TIER_ROUTER.md`;
2. load only task-relevant files from `LOAD_ORDER.md`;
3. record applicable Elite Build Goals;
4. require evidence for completion claims;
5. end with a verdict and next action.

## Skill Anti-Patterns

- Loading the whole kit by default.
- Treating a prompt template as a source of truth.
- Skipping verification because implementation appears obvious.
- Using model-specific language that blocks portability.
- Creating duplicate business rules or duplicate guardrails.
- Claiming 20-pass review without actually completing the passes.

