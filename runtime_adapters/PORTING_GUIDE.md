# Porting Guide

How to add a new runtime adapter. Binding rules live in `runtime_adapters/PORTABILITY_CONTRACT.md`; this file is the procedure.

## Before You Start

Do not begin by copying an existing manifest and editing the names. That is how a runtime acquires a support level it did not earn.

Begin from the runtime's **documented mechanics**. A support level is assigned only after every required manifest field can be completed without guessing.

## Steps

### 1. Identify the runtime's native extension and instruction mechanisms

What does this platform officially support? A plugin system, an extension API, a marketplace, a session hook, or an instruction file it reads automatically. If none exist, the adapter is `Manual` at best.

### 2. Identify session-start context behavior

Does the runtime place anything in model context at the start of a clean session **without** the user pasting or remembering anything? This single question determines whether `bootstrap_mode` is `automatic` or `manual`, and therefore whether Full or Partial is even reachable.

Do not assume. If you cannot establish it from documentation, record it as unestablished and set `manual`.

### 3. Inventory actual tool names and parameters

Write down the real tool names. Not what you expect them to be. A mapping that names a tool the runtime does not have is worse than no mapping, because an agent will try to call it.

### 4. Classify essential and optional capabilities

Essential: `file_read`, `file_write`, `file_edit`, `execute_command`. If any is unavailable, stop: the runtime is `Unsupported`.

Optional: `subagents`, `task_tracking`, `web_access`, `browser_verification`, `durable_artifact_storage`, `human_approval_gates`.

### 5. Select an integration shape

`session_start_hook`, `in_process_plugin`, `always_on_instruction_file`, or `hybrid`.

### 6. Create the manifest and tool mapping

- runtime_adapters/manifests/&lt;runtime-id&gt;.json
- runtime_adapters/tool_mappings/&lt;runtime-id&gt;.json

Every non-native capability needs an exact, executable fallback. "Use a workaround" is not a fallback.

### 7. Define install, update, uninstall, and rollback

All four. An adapter with no uninstall is a trap.

Disclose every file modified outside the project via `modifies_user_files` and `install`.

### 8. Add a unique activation marker

The string a clean-session scenario greps for to prove the kit actually loaded.

The marker must be **exactly** `WCBS_KIT_ACTIVE:<runtime-id>`, matching your `runtime_id` character for character. Not merely containing it: `WCBS_KIT_ACTIVE:notclaude` contains `claude`, and a near-match marker would prove the *wrong* adapter loaded while reporting success. A marker shared across adapters proves that *some* kit instruction loaded, but not *which* adapter loaded, which is the only thing the clean-session scenario is trying to establish. `npm run doctor` enforces uniqueness.

### 9. Define a clean-session activation scenario

Per `PORTABILITY_CONTRACT.md` section 4. Define it honestly. Do not claim it has been executed if it has not.

### 10. Generate the capability matrix

```bash
npm run generate:matrix
```

Never hand-edit `CAPABILITY_MATRIX.md`. Manifests are canonical.

### 11. Run doctor and schema checks

```bash
npm run verify
```

### 12. Complete the adapter PR checklist

`runtime_adapters/ADAPTER_PULL_REQUEST_CHECKLIST.md`.

## Assigning A Support Level Honestly

| If | Then |
|---|---|
| An essential capability is unavailable | `Unsupported`. No exceptions. |
| Activation needs a per-session user action | `Manual`. Not Partial, however good the rest looks. |
| Automatic bootstrap, all essentials native, some optional degraded with fallbacks | `Partial` |
| Automatic bootstrap, everything native | `Full` |

If you are unsure whether the runtime auto-loads its instruction file, the answer is `Manual` until a clean-session scenario proves otherwise. Uncertainty resolves **downward**, never upward.

`Manual` is not a failure. An honest `Manual` is more useful than an unearned `Full`, because an operator can plan around a limitation they were told about.
