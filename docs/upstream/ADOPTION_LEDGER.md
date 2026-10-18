# Superpowers Adoption Ledger

| Date | Upstream identity | Concept | WCBS disposition | WCBS canonical location | Compatibility evidence | Owner |
|---|---|---|---|---|---|---|
| 2026-10-18 | `b36e0829c6d0140e93cfef2ca599b1b07d4a7797`; `5bf4e78011075bcfc0dc295f0724994cd123ee71`; `bb92a77741419a4ab5f06e711a283343f1ada0c3` | Devin, Hermes, Muse, and Antigravity plugin routes | Defer; no upstream import without a WCBS runtime contract and demand | `runtime_adapters/adapter-registry.yaml` | New upstream manifests inspected; these targets are absent from WCBS registry. Native activation and support compatibility: `Not Run`. | WCBS maintainers |
| 2026-10-18 | `5bf4e78011075bcfc0dc295f0724994cd123ee71` | OpenCode V2 dual loader, native skill registration, and tool mapping | Defer targeted adapter work; no upstream import | `.opencode/plugins/wcbs.js`; `runtime_adapters/adapter-registry.yaml` | Upstream `.opencode/plugins/superpowers.js` diff inspected. WCBS has a V1-style transform; OpenCode remains Experimental with runtime evidence `Not Run`. | WCBS maintainers |
| 2026-10-18 | `b36e0829c6d0140e93cfef2ca599b1b07d4a7797`; `bb92a77741419a4ab5f06e711a283343f1ada0c3` | Three-path and rebuilt brainstorming, visual/spike flow | Defer selective design review; do not copy the upstream bypass | `skills/brainstorming/SKILL.md`; `skills/throwaway-prototyping/SKILL.md` | New skill inspected. Its spike route skips plan, test, and review; direct adoption conflicts with APIVR. WCBS behavior comparison: `Not Run`. | WCBS maintainers |
| 2026-10-18 | `5bf4e78011075bcfc0dc295f0724994cd123ee71`; `bb92a77741419a4ab5f06e711a283343f1ada0c3` | Native inline execution, plan-scoped SDD workspace, and ruling-based continuation | Defer; keep WCBS stop, evidence, and controller ownership | `skills/executing-plans/SKILL.md`; `skills/subagent-driven-development/SKILL.md`; `skills/execution-graph/SKILL.md` | Upstream workflow and SDD diff inspected. WCBS already has task briefs, exact review packages, and evidence gates; upstream's four-stop rule is not compatible without a separate safety review. Integration: `Not Run`. | WCBS maintainers |
| 2026-10-18 | `8ca22dba9a94f28898bbce59f2537ff4d87c747d`; `bb92a77741419a4ab5f06e711a283343f1ada0c3` | Leaner plan steps and whole-project test-suite reminder | Defer compression; reject duplicate release-gate text | `skills/writing-plans/SKILL.md`; `skills/test-driven-development/SKILL.md`; `package.json` | Exact upstream skill diff inspected. WCBS already requires test code in plans and a full release test command; proportion and adverse-input review may merit a separate measured change. No plan-skill behavior comparison run. | WCBS maintainers |
| 2026-10-18 | `5bf4e78011075bcfc0dc295f0724994cd123ee71` | Transcript-based diagnosing-superpowers and redacted case bundles | Defer a WCBS-specific diagnostic design; no transcript export added | `skills/agent-observability-and-run-tracing/SKILL.md`; `60_templates/AGENT_RUN_TRACE_TEMPLATE.md` | Upstream skill inspected: cited `path:line` findings and scrub gates are useful, but its session paths, seven analysts, and issue flow are Superpowers-specific. Privacy and resource impact: `Not Run`. | WCBS maintainers |
| 2026-10-18 | `bb92a77741419a4ab5f06e711a283343f1ada0c3` | Windows hook shell/PATH and quoting corrections | Reject direct hook transplant; defer only relevant adverse-path fixtures | `hooks/session-start`; `hooks/run-hook.cmd`; `scripts/tests/hook-transport.test.mjs` | Upstream hook diff inspected. WCBS uses a different bootstrap payload and transport; current Windows/macOS/Linux CI passes. Empty PATH and unusual profile-path equivalence: `Not Run`. | WCBS maintainers |
| 2026-10-18 | `bb92a77741419a4ab5f06e711a283343f1ada0c3` | Upstream HEAD drift monitoring, not a reviewed capability | Defer import pending a material-diff review | `docs/upstream/ADOPTION_LEDGER.md`; durable issue #23 | `git ls-remote` confirms HEAD; compatibility of the unreviewed delta is `Unknown` | WCBS maintainers |
| 2026-07-30 | `44c9b2d6e889982ac18c27d05a19fefe335194e1` | Complete 29-capability integration review, including current runtime-bootstrap and evaluation constraints | Replace summary-only review record with decision-complete matrix | `docs/upstream/SUPERPOWERS_INTEGRATION_MATRIX.json` | `scripts/tests/upstream-compatibility.test.mjs`; full release gate | WCBS maintainers |
| 2026-07-29 | `3dcbd5c4b48e02263fbf4a3c01e3fe4f81d584d9` | Minimal task router and skill-first workflow | Adapt | `skills/using-wcbs/SKILL.md` | `scripts/tests/v2-registry.test.mjs`, `scripts/tests/v2-bootstrap-renderer.test.mjs` | WCBS maintainers |
| 2026-07-29 | `3dcbd5c4b48e02263fbf4a3c01e3fe4f81d584d9` | Brainstorming, TDD, debugging, review, and completion loop | Adapt | `skills/brainstorming/`, `skills/test-driven-development/`, `skills/systematic-debugging/`, `skills/verification-before-completion/` | `evals/v2-core-skill-cases.json`; live behavioral result remains `Blocked` | WCBS maintainers |
| 2026-07-29 | `3dcbd5c4b48e02263fbf4a3c01e3fe4f81d584d9` | Vendor-specific automatic support claim without clean-session evidence | Reject | `runtime_adapters/VERIFIED_SUPPORT_LEVELS.md` | Generated support matrix labels every V2 runtime `Not Run` until clean-session evidence exists | WCBS maintainers |

Reviewed delta: 4 commits, 119 files, 10,594 insertions, 772 deletions from
`44c9b2d6e889982ac18c27d05a19fefe335194e1` through
`bb92a77741419a4ab5f06e711a283343f1ada0c3`. The review used the exact
Git name-status/stat inventory and inspected material skill, adapter, and hook
diffs. Version metadata, tests, assets, and release prose are not separate
WCBS capability imports. The pinned 29-capability integration matrix is
unchanged because no reviewed capability decision changed. There is no upstream
import in this audit-record update.

This ledger records design and compatibility decisions, not behavioral proof.
The older monitoring row above remains as a dated observation, not the final
decision for this SHA. Add a new row before adopting or adapting any new
material upstream change; do not edit prior decision rows after an evaluation
begins.

## Drift alert consolidation

Issues #20, #21, #22, and #23 observed upstream HEADs
`b36e0829c6d0140e93cfef2ca599b1b07d4a7797`,
`5bf4e78011075bcfc0dc295f0724994cd123ee71`,
`8ca22dba9a94f28898bbce59f2537ff4d87c747d`, and
`bb92a77741419a4ab5f06e711a283343f1ada0c3`, respectively. They are
monitoring observations, not four independently reviewed adoption candidates.
The latest observed HEAD has the candidate dispositions above. Issue #23 is
the durable review issue; earlier alert issues are superseded, not resolved as
adoption decisions. A new upstream SHA requires a new review.

For each material candidate found in that review, add a separate dated row with
its upstream SHA, concept, adopt/adapt/defer/reject disposition, canonical WCBS
location, compatibility evidence state, and owner. Do not treat an issue comment,
automated alert, or changed HEAD alone as a verified adoption decision.
