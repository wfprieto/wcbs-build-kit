# Portability Contract

Canonical owner of the runtime adapter architecture. Manifests in `runtime_adapters/manifests/` are the source of truth for individual runtimes. `runtime_adapters/CAPABILITY_MATRIX.md` is generated from them and must never be hand-edited.

Load this file for adapter design, installation, troubleshooting, or porting. Do **not** load it during ordinary session bootstrap: bootstrap loads only the active runtime manifest and its tool mapping. Minimal loading is a rule, not a preference.

## 1. Three-Layer Portability Architecture

Every supported runtime implements three layers.

| Layer | Rule |
|---|---|
| **1. Harness-neutral canonical skills** | Canonical skill bodies stay platform-neutral. An adapter may **not** modify canonical skill behavior merely to fit one runtime. If a runtime cannot do something, that belongs in the tool mapping as a fallback, not in a forked skill. |
| **2. Per-harness tool and action mapping** | Each Kit action maps to a real runtime capability, tool name, required parameters, and fallback. **Agents may not invent a tool that is absent from the mapping.** |
| **3. Session-start bootstrap** | Activation instructions enter model context through the runtime's native mechanism. A runtime that requires a user paste or a remembered command cannot be labeled Full. |

## 2. Canonical Ownership Rules

| Concern | Canonical file |
|---|---|
| Portability architecture | this file |
| One runtime's capabilities and lifecycle | the manifest in `runtime_adapters/manifests/` |
| One runtime's real tool names | the mapping in `runtime_adapters/tool_mappings/` |
| Cross-runtime comparison | `runtime_adapters/CAPABILITY_MATRIX.md` (generated) |
| Skill routing | `00_start_here/LOAD_ORDER.md` |
| Adding a runtime | `runtime_adapters/PORTING_GUIDE.md` |

No adapter document may become a second source of truth for skill routing. `LOAD_ORDER.md` owns that.

## 3. Native-Install-Only Rule

Adapters must use the runtime's declared plugin, extension, marketplace, hook, or instruction-file mechanism.

Adapters may **not** edit a user's shell profile, PATH, or unrelated global configuration to simulate integration. An integration that works by mutating a user's machine outside the platform's own mechanism is not an integration; it is a side effect.

A native **global** installation is allowed only when all four hold:

1. the platform officially supports that scope;
2. the user explicitly selects it;
3. install, update, uninstall, and rollback are documented;
4. every modified file is disclosed in the manifest (`modifies_user_files`).

## 4. Automatic Activation Requirement

A fully supported adapter places activation instructions in model context at the start of **every clean session**, with no pasted prompt and no remembered command.

Each manifest declares an `activation_marker` that **exactly equals** `WCBS_KIT_ACTIVE:<runtime-id>`. Exact equality, not substring containment: `WCBS_KIT_ACTIVE:notclaude` contains `claude`, so a substring check would let a near-match marker prove the wrong adapter loaded while reporting success. Markers must also be unique across adapters, since a shared marker proves some kit instruction loaded, not which adapter loaded. A clean-session scenario verifies that:

- the unique activation marker is present in context;
- the runtime can identify `00_start_here/START_HERE.md`, `00_start_here/SOURCE_OF_TRUTH.md`, and `00_start_here/LOAD_ORDER.md` in the correct authority order;
- the active runtime manifest and tool mapping are discoverable;
- one skill can be selected through the load order;
- no unsupported tool is claimed;
- the runtime reports its limitations accurately.

This contract **defines** the scenario. It does not claim the scenario has been executed in any vendor runtime.

## 5. Essential And Optional Capabilities

### Essential

- `file_read`
- `file_write`
- `file_edit`
- `execute_command`

If any essential capability is unavailable, the runtime is `Unsupported`. There is no partial credit here: the Kit's verification discipline collapses without the ability to run a command and read the result.

### Optional

- `subagents`
- `task_tracking`
- `web_access`
- `browser_verification`
- `durable_artifact_storage`
- `human_approval_gates`

Every `degradable` or `unavailable` capability must name an **exact** fallback, or state that no safe fallback exists. A missing fallback is how an agent ends up inventing a tool.

## 6. Support-Level Definitions

| Level | Binding definition |
|---|---|
| **Full** | Automatic session bootstrap through a native mechanism; all essential capabilities native; all optional capabilities native; complete tool mapping; skills invocable; lifecycle documented; clean-session activation scenario defined; limitations documented. |
| **Partial** | Automatic bootstrap and all essential capabilities native, but at least one optional capability is `degradable` or `unavailable` with an exact fallback. |
| **Manual** | Essential capabilities available, but activation requires a user action each session, or the runtime lacks a dependable automatic bootstrap. |
| **Unsupported** | An essential capability is unavailable, no safe fallback exists, or no compliant native installation path exists. |

**A file's existence does not imply Full or Partial support.** The presence of an instruction file proves a file exists. It does not prove the runtime reads it at session start, and it does not prove any capability works.

Downgrading a support level when evidence is incomplete is the correct action. Preserving a Full label by weakening the schema is prohibited.

Designed support and verified support are separate facts:

- `runtime_adapters/CAPABILITY_MATRIX.md` reports designed support from manifests.
- `runtime_adapters/VERIFIED_SUPPORT_LEVELS.md` reports evidence that has actually been run.
- `runtime_adapters/RUNTIME_PROOF_PACKS.json` is the generated, runtime-specific proof requirement catalog. It defines the five evidence tiers, clean-install checks, evidence manifest, uninstall boundary, and blocked-state handling; it does not itself prove any runtime result.

Do not claim `Runtime Verified` from manifest validity, file presence, dry-run instructions, or structural tests. Follow `docs/V2_RUNTIME_EVIDENCE.md` and the selected runtime proof pack. Any equivalent evidence artifact must retain the same authenticated runtime provenance, acceptance criteria, and independent replay; a fixture or marker alone is not equivalent.

### Verification claim boundaries

This is the canonical command-to-evidence map. The existing support labels,
APIVR evidence states, and proof-pack stages answer different questions:
`Verified` describes a named observation; it does not mean `Runtime Verified`.
The legacy `Behaviorally Verified` label means fixture conformance, not
observed agent behavior. The map describes what a result can substantiate;
commands do not update support labels. These are not new support levels.

| Command or retained evidence | Existing support vocabulary | Proof-pack boundary and limit |
|---|---|---|
| Written instructions or an unexecuted scenario | Documented | A requirement or route is described; no proof-pack result is established. |
| `npm run doctor`, `npm run verify` | Structurally Verified | Source contracts, references, and metadata only; these commands do not execute every package check they inspect. |
| `npm run system-test`, `npm run behavior-test` | Behaviorally Verified (legacy fixture conformance) | File/phrase routing fixtures and JSON fixture validation; no agent follows a workflow during these checks. |
| `node scripts/adapter-smoke-test.mjs --target codex --dest <project>` | Structurally Verified, with executable component evidence | Validates the installed package and executes its renderer. This supports `package_integrity` and the smoke step of `structural_lifecycle`, not native hook loading. |
| The same smoke command for other supported targets | Structurally Verified | Validates installed files and scenario text; it does not execute those runtimes or their hooks. |
| `npm run check-install` | Installed In Isolated Fixture; Structurally Verified | Executes isolated V1/V2 package lifecycles and component assertions. Supports `package_integrity` and the tested parts of `structural_lifecycle`, not native registration. |
| `npm run test`, `npm run release-check` | The labels earned by their individual checks | Real executable tests prove their asserted component outcomes; static checks and fixtures retain their narrower scope. Aggregation does not establish runtime activation or agent behavior. |
| `npm run eval` without `--execute` | Preflight only; no behavioral support label earned | Checks preregistration/readiness and reports blockers. No model execution, score, comparison result, or runtime-support advancement occurs. |
| Recorded native marketplace install | Registration evidence; not Runtime Verified | The `registration` stage requires the exact vendor version and package identity. Historical receipts apply only to their recorded source. |
| Independently reviewed clean-session record | Runtime Verified only when the required evidence passes | Requires `registration`, `clean_session_activation`, and `clean_session_invocation`, plus the selected pack's package/lifecycle requirements. A first-line marker is only one observation. |

Report each stage against its own acceptance criteria. For example, successful
owned-file uninstall does not establish the full `structural_lifecycle`
no-residue criterion when empty directories remain. A command's `Not Run`
runtime result applies to that invocation; it neither invalidates nor replaces
a separately retained runtime record.

Observed agent behavior requires a genuine agent trace showing the named
skill/workflow and its observable result. Native loading, prompted naming of
startup files, and a candidate marker are distinct evidence. Even a verified
invocation does not establish better software outcomes, broad reliability, or
superiority over another framework; those claims require their own results.

## 7. Tool-Mapping Contract

Every mapping defines all nine canonical actions: `read_skill`, `read_file`, `write_file`, `edit_file`, `execute_command`, `dispatch_agent`, `create_task`, `record_artifact`, `request_human_approval`.

Each action records:

- `availability`: `native`, `degradable`, or `unavailable`;
- `mechanism`: the actual runtime tool or mechanism;
- `required_parameters`;
- `fallback`: mandatory whenever availability is not `native`;
- `limitations`;
- `evidence_produced`.

Schema: `runtime_adapters/schemas/tool-mapping.schema.json`. Enforced by `scripts/lib/adapter-contract.mjs`.

### Manifest and mapping must agree

A manifest capability and the tool-mapping action that implements it are **two views of the same fact**. They must declare the same availability.

| Manifest capability | Tool-mapping action |
|---|---|
| `file_read` | `read_file` |
| `file_write` | `write_file` |
| `file_edit` | `edit_file` |
| `execute_command` | `execute_command` |
| `subagents` | `dispatch_agent` |
| `task_tracking` | `create_task` |
| `durable_artifact_storage` | `record_artifact` |
| `human_approval_gates` | `request_human_approval` |

A manifest claiming `native` while its mapping says `degradable` overstates support, and the generated capability matrix inherits the overstatement. `npm run doctor` cross-checks every pair. When the two disagree, **resolve downward**: the weaker claim is the safe one.

## 8. Capability Fallback Contract

A fallback must be **exact enough to execute**. "Use a workaround" is not a fallback.

The most consequential fallback is `dispatch_agent`. When a runtime has no independent subagent, review degrades to a fresh-context sequential pass: re-read the task brief and the exact `base..head` diff package with no implementation context carried over.

That substitute **must be reported as degraded independence**. It may not be presented as equivalent to an independent reviewer. Silently claiming independence you do not have is worse than admitting the limitation.

## 9. Integration-Shape Selection

| Shape | Use when |
|---|---|
| `session_start_hook` | The runtime fires a hook that can inject context at session start. |
| `in_process_plugin` | The runtime has a plugin or extension system that registers skills. |
| `always_on_instruction_file` | The runtime reads a repository instruction file automatically at session start. |
| `hybrid` | Two or more native shapes combine (for example a plugin plus an instruction file). |

Selection is documented in `runtime_adapters/PORTING_GUIDE.md`.

## 10. Install, Update, Uninstall, And Rollback

Every manifest documents all four. An adapter with no documented uninstall is not finished; it is a trap.

Rollback order when an upgrade causes an activation, validation, or installation regression:

1. revert the adapter manifest or mapping change first;
2. regenerate the capability matrix;
3. rerun doctor and tests;
4. retain the failed run artifacts;
5. restore the prior support level if the runtime no longer meets the new definition;
6. **do not weaken the schema merely to preserve a Full label**;
7. record the rollback in the completion report.

## 11. Project Versus Global Scope

`install_scope` is `project` or `global`. Project scope is the default and the safe choice: it is versioned, reviewable, and removable with the repository.

Global scope requires the four conditions in section 3.

## 12. User-File Modification Policy

`modifies_user_files` is a required boolean in every manifest. If an adapter creates or modifies any file outside the project, it must be `true`, and every such file must be listed in `install`.

Undisclosed modification of a user's machine is a `BLOCKING` finding.

## 13. Cross-Platform Path, Quoting, Shell, And Executable Behavior

The contract and each applicable manifest must state:

- path separator behavior;
- quoting rules;
- shell class or command runner;
- Windows support;
- executable-bit behavior;
- line-ending behavior;
- project-relative versus absolute paths;
- behavior when hooks require POSIX shell features;
- whether a platform-neutral Node wrapper is provided;
- the exact unsupported-environment statement when no safe wrapper exists.

**Adapters may not silently assume Bash on Windows.** `supported_operating_systems` is a required manifest field precisely so this assumption cannot hide.

## 14. Compatibility, Ownership, Deprecation, And Retirement

Each adapter documents: supported runtime versions; breaking-change policy; adapter owner; deprecation notice period; replacement or retirement path; and conflict prevention with obsolete mappings.

`supported_runtime_versions`, `owner`, and `deprecation` are required manifest fields. An unowned adapter rots.

## 15. Adapter Definition Of Done

An adapter design is complete only when **all** of the following hold:

- [ ] its manifest validates against `schemas/adapter-manifest.schema.json`;
- [ ] its tool mapping validates against `schemas/tool-mapping.schema.json`;
- [ ] `bootstrap_mode` and `bootstrap_path` are documented, and the path exists;
- [ ] its support level matches the formal definition in section 6;
- [ ] essential capabilities are available, or the adapter is `Unsupported`;
- [ ] every `degradable` or `unavailable` optional capability has an exact fallback;
- [ ] native install, update, uninstall, and rollback are documented;
- [ ] cross-platform limitations are explicit;
- [ ] a clean-session activation scenario is defined;
- [ ] the generated capability matrix is current (`node scripts/generate-capability-matrix.mjs --check`);
- [ ] `npm run doctor` passes.

Run `runtime_adapters/ADAPTER_PULL_REQUEST_CHECKLIST.md` before submitting.
