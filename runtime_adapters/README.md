# Runtime Adapters

Adapters activate the same Super Build Kit spine across agent runtimes. They are **routers, not sources of truth.**

This README does not inventory skills. `00_start_here/LOAD_ORDER.md` owns skill routing; duplicating it here creates a second source of truth that silently rots.

## Start Here

| You want to | Read |
|---|---|
| Understand the adapter architecture and its binding rules | `runtime_adapters/PORTABILITY_CONTRACT.md` |
| Know what your runtime can and cannot do | runtime_adapters/manifests/&lt;runtime&gt;.json |
| Know the real tool names for your runtime | runtime_adapters/tool_mappings/&lt;runtime&gt;.json |
| Compare runtimes, or pick a fallback | `runtime_adapters/CAPABILITY_MATRIX.md` (generated) |
| Add support for a new runtime | `runtime_adapters/PORTING_GUIDE.md` |
| Submit an adapter change | `runtime_adapters/ADAPTER_PULL_REQUEST_CHECKLIST.md` |

## Session Bootstrap Loads The Minimum

At session start, load **only** the active runtime's manifest and tool mapping. Do not load every adapter document, and do not load the portability contract. The contract loads for adapter design, installation, troubleshooting, or porting.

## Support Levels

| Level | Meaning |
|---|---|
| **Full** | Automatic native bootstrap; all essential and optional capabilities native. |
| **Partial** | Automatic bootstrap; all essential capabilities native; at least one optional capability degraded or unavailable, with an exact fallback. |
| **Manual** | Essential capabilities present, but activation requires a user action each session. |
| **Unsupported** | An essential capability is unavailable, or no compliant native install path exists. |

**A file's existence does not imply support.** An instruction file in the repository proves a file exists. It does not prove the runtime reads it at session start. Current levels are in `runtime_adapters/CAPABILITY_MATRIX.md`, derived from the manifests.

## Activation Entry Points

| Runtime | Native mechanism |
|---|---|
| Codex | `.codex-plugin/plugin.json` |
| Cursor | `.cursor/rules/super-build-kit.mdc` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Claude / Claude Code | `CLAUDE.md` |
| Gemini CLI | `GEMINI.md` |
| Replit Agent | `REPLIT.md` |
| Manus Agent | `Manus.md` |
| Generic agent | `AGENTS.md` |

Runtime-specific detail: `runtime_adapters/REPLIT_AGENT.md`, `runtime_adapters/NATIVE_GIT_WORKTREES.md`.

## Lifecycle

Every manifest documents install, update, uninstall, and rollback. Adapters use the runtime's **native** mechanism only; editing a shell profile or unrelated global config to simulate integration is prohibited.

Regenerate the capability matrix after any manifest change:

```bash
npm run generate:matrix
```

Never hand-edit `CAPABILITY_MATRIX.md`. Manifests are canonical, and `npm run verify` enforces it.

## Rule

Adapters are not sources of truth. They point agents back to:

1. `00_start_here/START_HERE.md`
2. `00_start_here/SOURCE_OF_TRUTH.md`
3. `00_start_here/LOAD_ORDER.md`
4. `50_audits/AUDIT_TIER_ROUTER.md`
