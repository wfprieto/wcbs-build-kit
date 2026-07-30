# Super Build Kit Agent Instructions

Read and execute `BOOTSTRAP.md` before project work. If the Kernel cannot transfer to its Controller, stop and emit only the transport failure envelope.

Before any project work, read and follow `runtime_adapters/generated/runtime-startup-contract.md`.

Codex-specific transport: this project uses the local `.codex-plugin/plugin.json` plugin package. The root hook remains disabled for Codex.

## Activation Marker

After the startup contract completes, and before any other content in the first response, emit this exact string:

`WCBS_KIT_ACTIVE:codex`

Emit it once only. This is a marker observation, not runtime-support proof.
