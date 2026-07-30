# GitHub Copilot Instructions

Read and execute `BOOTSTRAP.md` before project work. If the Kernel cannot transfer to its Controller, stop and emit only the transport failure envelope.

Before any project work, read and follow `runtime_adapters/generated/runtime-startup-contract.md`.

Copilot-specific transport: the native SessionStart bridge is defined in `.github/hooks/wcbs-session-start.json`; use the platform-appropriate command declared there.

## Activation Marker

After the startup contract completes, and before any other content in the first response, emit this exact string:

`WCBS_KIT_ACTIVE:github-copilot`

Emit it once only. This is a marker observation, not runtime-support proof.
