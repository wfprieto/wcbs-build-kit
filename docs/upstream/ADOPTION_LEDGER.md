# Superpowers Adoption Ledger

| Date | Upstream identity | Concept | WCBS disposition | WCBS canonical location | Compatibility evidence | Owner |
|---|---|---|---|---|---|---|
| 2026-11-25 | `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b`; `22f0b463e7a5e579904dd6211a520321035526f7` | D01: context-first brainstorming, fewer questions, options and short approved designs | Defer additional wording changes; retain the existing WCBS adaptation | `skills/brainstorming/SKILL.md`; matrix capabilities 2–5 | Exact skill diff inspected. WCBS already inspects context, offers approaches and records approved designs. Comparative behavior: `Not Run`. Upstream opt-out still removes its design gate; no APIVR bypass accepted. | WCBS maintainers |
| 2026-11-25 | `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b`; `22f0b463e7a5e579904dd6211a520321035526f7` | D02: compaction-aware skill/reference splits and byte-size gate | Defer a measured WCBS-specific size/reference change | `skills/subagent-driven-development/SKILL.md`; `skills/writing-skills/SKILL.md`; `scripts/audit-skill-size.mjs` | Reference split and size test inspected; WCBS already links deep references and has line budgets. Largest checked WCBS skill is 13,592 bytes; compaction survival and proposed byte-budget compatibility: `Not Run`. | WCBS maintainers |
| 2026-11-25 | `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b`; `22f0b463e7a5e579904dd6211a520321035526f7` | D03: extracted SDD fix-loop, final-review and continuation rules | Reject direct policy transplant; retain WCBS review and blocker ownership | `skills/subagent-driven-development/SKILL.md`; `10_governance/RELEASE_GATES.md` | `references/fix-loop.md` retains five-round adjudication/parking; `references/final-review.md` permits residual findings after one fix wave. WCBS requires material fix/test/re-review and blocks on unresolved core evidence. Conflict verified by source inspection; behavior comparison `Not Run`. | WCBS maintainers |
| 2026-11-25 | `22f0b463e7a5e579904dd6211a520321035526f7` | D04: helper repository binding, absolute invocation, Windows paths and linked worktrees | Defer targeted adaptation in the WCBS Node helpers; no Bash import | `scripts/task-brief.mjs`; `scripts/review-package.mjs`; `skills/executing-plans/SKILL.md` | `sdd-repo`, helper and package-script diffs inspected. Current WCBS helpers use ambient cwd/output paths; wrong-cwd/unborn/worktree/PowerShell equivalence remains `Not Run`. Required fixtures and scope are in the dated review. | WCBS maintainers |
| 2026-11-25 | `22f0b463e7a5e579904dd6211a520321035526f7` | D05: exact task IDs and malformed-fence rejection | Defer a separately tested WCBS parser fix; prioritize the reproduced gaps | `scripts/task-brief.mjs`; `scripts/tests/subagent-workflow-contract.test.mjs` | Local CLI fixtures reproduce Task 6 selecting Task 6b and an unclosed fence silently truncating a brief (`Verified` observations). Upstream implementation integration: `Not Run`; no fix imported. | WCBS maintainers |
| 2026-11-25 | `22f0b463e7a5e579904dd6211a520321035526f7` | D06: PowerShell hook form, no-fork startup, shell fallback and EPIPE handling | Reject direct shell-hook transplant; preserve WCBS native envelopes | `.github/hooks/wcbs-session-start.json`; `hooks/run-hook`; `hooks/run-hook.cmd`; `scripts/tests/hook-transport.test.mjs` | Exact hooks and transport diffs inspected. WCBS already supplies a PowerShell route and explicit blocked envelopes; upstream quiet shell fallback is not bootstrap proof. Local contract tests are separate from native runtime and latency evidence, which remain `Not Run` for this delta. | WCBS maintainers |
| 2026-11-25 | `22f0b463e7a5e579904dd6211a520321035526f7` | D07: OpenCode bare IDs, bootstrap detection and context/compaction/generate hooks | Defer adapter-specific design and native proof | `.opencode/plugins/wcbs.js`; `runtime_adapters/tool_mappings/opencode.json` | Local callback fixture reproduces a prompt merely mentioning the WCBS marker suppressing injection (`Verified` stub observation). Upstream uses a bootstrap-prefix guard and adds request hooks; actual OpenCode/V2 compatibility: `Not Run`. | WCBS maintainers |
| 2026-11-25 | `22f0b463e7a5e579904dd6211a520321035526f7` | D08: Pi bootstrap on later prompts and respect for skill filters | Defer lifecycle/filter adaptation until native Pi evidence exists | `.pi/extensions/wcbs.ts`; `runtime_adapters/manifests/pi.json` | Local callback fixture reproduces WCBS dropping bootstrap after `agent_end` and confirms `resources_discover` registration (`Verified` stub observations). Upstream removes both one-shot disabling and resource re-registration; vendor filtering/cache semantics: `Not Run`. | WCBS maintainers |
| 2026-11-25 | `22f0b463e7a5e579904dd6211a520321035526f7` | D09: Hermes worker exclusion and Muse Bash launch | Defer new runtime contracts; no unsupported adapter import | `runtime_adapters/adapter-registry.yaml`; `runtime_adapters/PORTABILITY_CONTRACT.md` | Hermes `platform != subagent` and Muse `sh`→`bash` changes inspected. Neither target has a WCBS registry contract. Child/bootstrap and Debian/Ubuntu native checks: `Not Run`. | WCBS maintainers |
| 2026-11-25 | `22f0b463e7a5e579904dd6211a520321035526f7` | D10: visual companion relative project-directory resolution | Defer only if WCBS introduces a companion server | `skills/throwaway-prototyping/SKILL.md`; `skills/ui-ux-design-quality/SKILL.md` | Upstream resolves `--project-dir` before changing cwd; relative-path regression fixture inspected. WCBS has no corresponding companion-server launcher to patch. Integration: `Not Run`. | WCBS maintainers |
| 2026-11-25 | `22f0b463e7a5e579904dd6211a520321035526f7` | D11: relocate pressure scenarios and creation logs outside installed skills | Reject a redundant file transplant; retain the existing fixture boundary | `skills/writing-skills/SKILL.md`; `scripts/tests/`; `evals/` | Changed upstream layout test and moved scenarios inspected. WCBS skill scan found no `CREATION-LOG.md` or `test-*.md` files (`Verified` inventory observation). Agent behavior when encountering hostile fixture text: `Not Run`. | WCBS maintainers |
| 2026-11-25 | `b739a8af570e10a95898f2bdf6cec97467fa6c12`; `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b` | D12: mandatory human-written summaries and unsolicited-agent-PR policy | Reject transplant into WCBS; respect these rules when contributing upstream | `docs/upstream/SUPERPOWERS_COMPATIBILITY.md`; WCBS contribution governance | Exact issue/PR templates and upstream `AGENTS.md` diff inspected. Upstream contributor policy does not authorize changing WCBS governance or contacting upstream. No issue/PR submitted to obra/superpowers; contribution-flow testing `Not Run`. | WCBS maintainers |
| 2026-11-25 | `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b` | D13: diagnostic reporter provenance and without-plugin reproduction fields | Defer a WCBS-specific diagnostic schema and privacy review | `skills/agent-observability-and-run-tracing/SKILL.md`; `60_templates/AGENT_RUN_TRACE_TEMPLATE.md` | Diagnostic skill/template diff inspected: distinguish filing agent from diagnosed session and honest untested causality. Existing trace vocabulary is retained; transcript export, human-summary collection and privacy/resource impact: `Not Run`. | WCBS maintainers |
| 2026-11-25 | `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b`; `22f0b463e7a5e579904dd6211a520321035526f7` | D14: release metadata and upstream historical-plan removal | Reject automatic version synchronization or deletion of WCBS history | `docs/upstream/SUPERPOWERS_COMPATIBILITY.md`; `90_archive/provenance/` | Full 104-path name/status inventory reviewed, including metadata, tests and historical plan deletions. These are not new WCBS capabilities; release-note measurements were not rerun. WCBS version, governed pin, evaluation identities and support claims unchanged. | WCBS maintainers |
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

## 2026-11-25 review of the newly observed delta

Reviewed `bb92a77741419a4ab5f06e711a283343f1ada0c3` through
`22f0b463e7a5e579904dd6211a520321035526f7`: **3 commits, 104 files,
2,430 insertions and 14,584 deletions**. This completes the design/disposition
review for that observed SHA; a later SHA requires a new review. The dated
[review and replay evidence](reviews/2026-11-25-superpowers-22f0b463.md) links
the complete path inventory and local probe results. Source inspection and
local stubs do not prove native runtime compatibility or upstream benchmark
claims.

The fourteen rows above record nine deferred implementation candidates and
five rejected direct transplants. No existing capability disposition changes:
the 29-capability matrix and its governed upstream pin remain byte-for-byte
unchanged. Deferred work is not an adopted capability, a completed fix or a
runtime-support upgrade. **No upstream import** was made. Older dated rows and
their evidence states remain historical records; their October monitoring
language does not describe the disposition of this November review.
