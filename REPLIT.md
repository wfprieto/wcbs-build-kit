# Replit Agent Runtime Adapter

Read and execute `BOOTSTRAP.md` before project work. If the Kernel cannot transfer to its Controller, stop and emit only the transport failure envelope.

Before any project work, read and follow `runtime_adapters/generated/runtime-startup-contract.md`.

Replit-specific transport: inspect the actual project and deployment state before proposing changes. Do not change secrets, production data, deployment settings, databases, or irreversible state without explicit authorization and rollback planning.

## Activation Marker

After the startup contract completes, and before any other content in the first response, emit this exact string:

`WCBS_KIT_ACTIVE:replit`

Emit it once only. This is a marker observation, not runtime-support proof.
