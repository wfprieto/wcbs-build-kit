---
name: verification-before-completion
description: Use when claiming a task, fix, install, migration, review response, release candidate, or branch is complete. Maps every claim to direct evidence and blocks completion on unverified critical conditions.
activation: completion claim, done statement, release handoff, merge decision, or final report.
required_inputs: Requested outcome, change scope, material claims, verification results, and release requirements.
required_outputs: Claim-to-proof receipt, evidence states, verdict, and one next action.
authority_dependencies: 00_start_here/SOURCE_OF_TRUTH.md; 10_governance/RELEASE_GATES.md; 10_governance/APIVR_EXECUTION_LIFECYCLE.md.
evidence_requirements: Direct evidence for every material claim or an explicit Unknown, Not Run, or Blocked state.
---

# Verification Before Completion

“Tests pass” is evidence about the tests. It is not automatically evidence that
the requested outcome, installation path, runtime activation, or release claim
is true.

## Claim-to-Proof Gate

For each material claim, record:

| Claim | Direct evidence | State if absent | Next action |
|---|---|---|---|
| Requested behavior works | Targeted public-interface test or observed workflow | Not Run / Blocked | Run the exact test or workflow |
| No regression | Relevant suite and implementation-diff review | Not Run | Run suite and inspect diff |
| Runtime activates | Authenticated fresh-session transcript | Blocked | Launch the named runtime cleanly |
| Install is safe | Byte-preservation, collision, rollback, uninstall tests | Not Run | Run installer matrix |
| Ready to release | Required CI, provenance, and release gates | Blocked | Complete named hosted gate |

## Process

1. Read the user’s requested outcome, not only the code diff.
2. List every completion claim you would make.
3. Attach direct evidence and its command, transcript, or artifact.
4. Mark unsupported claims `Unknown`, `Not Run`, or `Blocked`; do not soften
   them into success language.
5. Run the smallest missing release-critical check. If unavailable, stop at a
   conditional verdict with the exact human or runtime action required.

## Worked Example

```bash
npm run release-check
node scripts/wcbs-verify-activation.mjs --target codex --fresh-profile
```

The first command can verify deterministic checks. It cannot prove that Codex
loaded a plugin in a clean authenticated session. If the second command cannot
launch due to sandbox access, the technical implementation may pass locally,
but runtime activation remains `Blocked` and the support label cannot advance.

## Final Receipt

```text
APIVR tier:
Verified claims:
Not Run / Blocked claims:
Release-gate status:
Rollback trigger:
Verdict: PASS / CONDITIONAL PASS / PARTIAL / FAIL / BLOCKED
Single next action:
```
