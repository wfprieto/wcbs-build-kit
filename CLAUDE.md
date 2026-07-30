# Claude Runtime Adapter

Read and execute `BOOTSTRAP.md` before project work. If the Kernel cannot transfer to its Controller, stop and emit only the transport failure envelope.

Before any project work, read and follow `runtime_adapters/generated/runtime-startup-contract.md`.

Claude-specific transport: use the native Claude Code plugin SessionStart hook when available. `CLAUDE.md` is the project-memory fallback and must retain the lower activation tier when the hook is unavailable.

## Activation Marker

After the startup contract completes, and before any other content in the first response, emit this exact string:

`WCBS_KIT_ACTIVE:claude`

Emit it once only. This is a marker observation, not runtime-support proof.
