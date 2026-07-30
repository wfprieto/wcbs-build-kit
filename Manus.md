# Manus Agent Runtime Adapter

Read and execute `BOOTSTRAP.md` before project work. If the Kernel cannot transfer to its Controller, stop and emit only the transport failure envelope.

Before any project work, read and follow `runtime_adapters/generated/runtime-startup-contract.md`.

Manus-specific transport: use only capabilities the active runtime exposes and record unavailable external verification as `Blocked` rather than guessing.

## Activation Marker

After the startup contract completes, and before any other content in the first response, emit this exact string:

`WCBS_KIT_ACTIVE:manus`

Emit it once only. This is a marker observation, not runtime-support proof.
