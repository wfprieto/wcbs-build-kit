# Superpowers Adoption Ledger

| Date | Upstream identity | Concept | WCBS disposition | WCBS canonical location | Compatibility evidence | Owner |
|---|---|---|---|---|---|---|
| 2026-10-18 | `bb92a77741419a4ab5f06e711a283343f1ada0c3` | Upstream HEAD drift monitoring, not a reviewed capability | Defer import pending a material-diff review | `docs/upstream/ADOPTION_LEDGER.md`; durable issue #23 | `git ls-remote` confirms HEAD; compatibility of the unreviewed delta is `Unknown` | WCBS maintainers |
| 2026-07-30 | `44c9b2d6e889982ac18c27d05a19fefe335194e1` | Complete 29-capability integration review, including current runtime-bootstrap and evaluation constraints | Replace summary-only review record with decision-complete matrix | `docs/upstream/SUPERPOWERS_INTEGRATION_MATRIX.json` | `scripts/tests/upstream-compatibility.test.mjs`; full release gate | WCBS maintainers |
| 2026-07-29 | `3dcbd5c4b48e02263fbf4a3c01e3fe4f81d584d9` | Minimal task router and skill-first workflow | Adapt | `skills/using-wcbs/SKILL.md` | `scripts/tests/v2-registry.test.mjs`, `scripts/tests/v2-bootstrap-renderer.test.mjs` | WCBS maintainers |
| 2026-07-29 | `3dcbd5c4b48e02263fbf4a3c01e3fe4f81d584d9` | Brainstorming, TDD, debugging, review, and completion loop | Adapt | `skills/brainstorming/`, `skills/test-driven-development/`, `skills/systematic-debugging/`, `skills/verification-before-completion/` | `evals/v2-core-skill-cases.json`; live behavioral result remains `Blocked` | WCBS maintainers |
| 2026-07-29 | `3dcbd5c4b48e02263fbf4a3c01e3fe4f81d584d9` | Vendor-specific automatic support claim without clean-session evidence | Reject | `runtime_adapters/VERIFIED_SUPPORT_LEVELS.md` | Generated support matrix labels every V2 runtime `Not Run` until clean-session evidence exists | WCBS maintainers |

This ledger records design and compatibility decisions. It is not behavioral
proof. Add a new row before adopting or adapting any new material upstream
change; do not edit prior decision rows after an evaluation begins.

## Drift alert consolidation

Issues #20, #21, #22, and #23 observed upstream HEADs
`b36e0829c6d0140e93cfef2ca599b1b07d4a7797`,
`5bf4e78011075bcfc0dc295f0724994cd123ee71`,
`8ca22dba9a94f28898bbce59f2537ff4d87c747d`, and
`bb92a77741419a4ab5f06e711a283343f1ada0c3`, respectively. They are
monitoring observations, not four independently reviewed adoption candidates.
The latest observed HEAD remains deferred until a maintainer reviews the diff
from the pinned baseline. Issue #23 is the durable review issue; earlier alert
issues are superseded, not resolved as adoption decisions.

For each material candidate found in that review, add a separate dated row with
its upstream SHA, concept, adopt/adapt/defer/reject disposition, canonical WCBS
location, compatibility evidence state, and owner. Do not treat an issue comment,
automated alert, or changed HEAD alone as a verified adoption decision.
