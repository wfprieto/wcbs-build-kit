# Adapter Pull Request Checklist

Complete before submitting a new or modified runtime adapter. Binding rules: `runtime_adapters/PORTABILITY_CONTRACT.md`.

## Manifest

- [ ] The manifest at runtime_adapters/manifests/&lt;runtime-id&gt;.json exists and validates
- [ ] `runtime_id` matches the file name
- [ ] `owner` names a real maintainer
- [ ] Every required field is present, and none is a placeholder
- [ ] `bootstrap_path` exists on disk
- [ ] `tool_mapping_path` exists on disk
- [ ] `activation_marker` is unique, greppable, and **exactly equals** `WCBS_KIT_ACTIVE:<runtime-id>` (not merely contains the runtime id)
- [ ] Manifest capabilities agree with the equivalent tool-mapping actions (a `native` capability may not map to a `degradable` action)

## Tool Mapping

- [ ] All nine canonical actions are defined
- [ ] Every `mechanism` is a **real** tool name from the runtime's documentation, not an expected one
- [ ] Every non-`native` action declares an exact, executable fallback
- [ ] No invented tools

## Support Level

- [ ] Support level matches the formal definition in the contract, section 6
- [ ] I did not assign Full or Partial from the mere existence of a file
- [ ] `bootstrap_mode` is `automatic` **only** if the runtime loads the kit at clean-session start with no paste and no remembered command
- [ ] If any essential capability is unavailable, the level is `Unsupported`
- [ ] Uncertainty resolved **downward**

## Capabilities And Fallbacks

- [ ] All four essential capabilities are classified
- [ ] All six optional capabilities are classified
- [ ] Every `degradable` or `unavailable` capability names an exact fallback, or states that no safe fallback exists
- [ ] If `subagents` is not native, the fallback states that review independence is **degraded** and must be reported as such

## Lifecycle

- [ ] Install, update, uninstall, and rollback are all documented
- [ ] `modifies_user_files` is accurate
- [ ] Every file modified outside the project is disclosed
- [ ] No shell profile, PATH, or unrelated global config is edited to simulate integration
- [ ] `supported_runtime_versions` and `deprecation` are stated

## Cross-Platform

- [ ] `supported_operating_systems` is accurate
- [ ] Bash on Windows is not silently assumed
- [ ] Path, quoting, shell, and executable-bit behavior is stated where it matters

## Verification

- [ ] `npm run generate:matrix` was run, and the matrix is committed
- [ ] `node scripts/generate-capability-matrix.mjs --check` passes
- [ ] `npm run verify` passes
- [ ] `CAPABILITY_MATRIX.md` was **not** hand-edited

## Honesty Gate

- [ ] I did not weaken a schema, a definition, or a test to preserve a support label
- [ ] Every limitation I know about is written in `limitations`
- [ ] Any clean-session scenario I have **not** executed is described as defined, not as verified
