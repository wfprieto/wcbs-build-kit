# Replit Agent Adapter

Use this adapter when the Super Build Kit is loaded inside Replit Agent or applied to a Replit project.

## Activation

Load in order:

1. `00_start_here/START_HERE.md`
2. `00_start_here/SOURCE_OF_TRUTH.md`
3. `00_start_here/LOAD_ORDER.md`
4. `50_audits/AUDIT_TIER_ROUTER.md`

Then load the task-specific files named by `LOAD_ORDER.md`.

## Replit Audit Focus

When auditing or changing a Replit app, inspect:

- project file tree and entrypoints;
- package manager and dependency files;
- workflows and run commands;
- environment variables and secret usage without exposing values;
- database/storage integrations;
- frontend routes and rendered behavior;
- deployment configuration and public URL behavior;
- logs, console errors, and failed workflow output.

## Replit Implementation Guardrails

- Keep changes narrow and reversible.
- Do not edit deployment, database, auth, payment, or secrets configuration without explicit user authorization.
- Do not claim the app works from code inspection alone.
- Verify the running workflow or browser behavior when the task affects runtime behavior.
- Record `Not Run` or `Blocked` for checks that cannot be performed.

## Required Closeout

End with APIVR tier, applicable Elite Build Goals, verification performed, verification not performed, final verdict, and the single next required action.

