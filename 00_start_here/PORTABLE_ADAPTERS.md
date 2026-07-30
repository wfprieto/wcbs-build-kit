# Portable Adapter Notes

This kit is source-first and LLM-agnostic. Runtime adapters are convenience wrappers, not sources of truth.

## Codex

- Use native skills when installed.
- Put portable instructions in repository files or plugin skill files.
- Prefer `20_skills/apivr/SKILL.md` as the active APIVR skill body.
- For coding tasks, run APIVR before implementation and use evidence-led completion reports.

## Claude

- Use `CLAUDE.md` or project instructions to point Claude at `00_start_here/START_HERE.md`.
- Install skills under the Claude skill directory only as generated runtime copies.
- Keep canonical source edits in this repository first.

## Cursor

- Put the startup spine in Cursor rules or project instructions.
- Keep rules short: load `START_HERE`, classify APIVR tier, then follow `LOAD_ORDER`.

## Gemini

- Use `GEMINI.md` or extension instructions to point at this kit.
- Activate task-specific skill files only after APIVR tiering.

## Generic LLM Agents

- Paste or attach `START_HERE.md`, `SOURCE_OF_TRUTH.md`, and `AUDIT_TIER_ROUTER.md` first.
- Attach task-specific files from `LOAD_ORDER.md`.
- Require final answers to include APIVR verdict and evidence status.

## Adapter Rule

Adapters may automate activation. They may not alter the authority order, remove release gates, or weaken evidence requirements.

