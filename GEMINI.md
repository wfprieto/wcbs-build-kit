# Gemini Runtime Adapter

Read and execute `BOOTSTRAP.md` before project work. If the Kernel cannot transfer to its Controller, stop and emit only the transport failure envelope.

Before any project work, read and follow `runtime_adapters/generated/runtime-startup-contract.md`.

Gemini-specific transport: load this repository as context through the runtime-supported project-instruction mechanism. Keep its designed support label until clean-session evidence exists.

## Activation Marker

After the startup contract completes, and before any other content in the first response, emit this exact string:

`WCBS_KIT_ACTIVE:gemini`

Emit it once only. This is a marker observation, not runtime-support proof.
