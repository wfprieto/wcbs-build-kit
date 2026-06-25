# Integrating WCBS with the Superpowers plugin (optional)

WCBS is self-contained. But if you **also** run the [Superpowers](https://github.com/anthropics) plugin (`superpowers@claude-plugins-official`) — a set of *process* skills (brainstorming, writing/executing plans, test-driven-development, systematic-debugging, verification-before-completion, requesting/receiving code-review, using-git-worktrees, finishing-a-development-branch) — the two compose cleanly into one workflow.

## Mental model
- **Superpowers = the PROCESS spine** (HOW to work).
- **WCBS = the QUALITY standard + specialist org + gates** (how good, and who signs off).
- They are ~90% complementary. The rules below resolve the few overlaps so no step runs twice.

## Trigger threshold
The composed lifecycle applies to **non-trivial / serious work only**. Trivial edits (1–2 lines, config, docs, questions) skip brainstorming / worktrees / VP — WCBS's "non-trivial" scoping overrides the Superpowers brainstorming hard-gate.

## Precedence
User's instruction > project `CLAUDE.md` > WCBS kit > Superpowers defaults. At session start the Superpowers skill-first reflex runs first and picks the process; WCBS tooling is pulled on demand within it, not as a competing first action.

## Composed lifecycle
1. **Engage** — Superpowers skill-first reflex picks the process.
2. **Brainstorm** (Superpowers) + WCBS Senior-PM lens for acceptance criteria.
3. **Plan** (Superpowers writing-plans); WCBS activation matrix selects specialists; ScrumMaster-3 challenges the plan.
4. **Isolate** (Superpowers using-git-worktrees).
5. **Build** (Superpowers TDD + executing-plans) under the WCBS Elite Build Goals quality bar; the ScrumMaster-3 hook challenges edits on risky paths (auth/data/migration/payments).
6. **Debug when stuck** (Superpowers systematic-debugging) + WCBS Principal-Eng lens.
7. **Review** (Superpowers code-review workflow) run BY the relevant WCBS specialist (security / principal / QA).
8. **Verify (nested gate)** — Superpowers verification-before-completion supplies the fresh command evidence; the WCBS completion-lock additionally requires specialist review + ScrumMaster-3 + VP (where required) + evidence labels (Verified / Likely / Suspected / Unknown). **Verification is a required input to the lock, not the whole lock.**
9. **Finish** (Superpowers finishing-a-development-branch) + WCBS release-readiness gate; VP sign-off for Critical.

## Ownership when steps overlap (compose, don't duplicate)
| Step | Superpowers owns | WCBS owns |
|------|------------------|-----------|
| Entry/routing | skill-first reflex | `wcbs-build-kit` quality/org layer (run a process skill first — convention) |
| Planning | format / workflow | specialist selection + ScrumMaster challenge |
| Verification | the discipline | evidence labels + completion-lock + hook enforcement |
| Testing | per-change TDD loop | QA-Director regression review |
| Subagents | dispatch mechanics | specialist identities |
| Code review | the workflow | reviewer identity (the right specialist) |
| Worktrees / finish-branch | wholesale | — (no WCBS equivalent) |

## Enforcement hooks
See [`hooks/`](hooks/) — the completion-lock and ScrumMaster-3 challenge hooks enforce the shared "done means proven" bar regardless of which layer is driving.

*(Reflects the Superpowers plugin as of v5.1.0.)*
