# WCBS EOS Kernel Contract

> **Kernel Design Law**
>
> Every responsibility removed from the Kernel is a permanent architectural improvement.
> Every responsibility added to the Kernel must justify, in an ADR, why it cannot belong to Delivery, the Controller, or the Lifecycle.

## Contract Version

- Kernel ABI: `2.0.0`
- Maximum Kernel size: **45 lines and 2,700 characters**
- Any responsibility or interface addition requires an ADR and a major EOS version bump.
- The budget may ratchet downward. It may not increase.

## Five Responsibilities

1. Identify the delivery environment sufficiently to locate the Controller.
2. Locate `00_start_here/bootstrap-controller.json` inside the supplied project root.
3. Verify that Controller artifact is a regular non-symlinked file contained by the project root and verify its SHA-256.
4. Transfer control with the handoff envelope, carrying the activation assertion supplied by Delivery.
5. Fail closed with the transport failure envelope when any prior responsibility cannot complete.

The Kernel must not load authority, governance, project state, certificates, capabilities, skills, audits, templates, gates, or lifecycle instructions.

## Success Envelope

Required fields:

- `kernel_version`
- `delivery_environment`
- `asserted_activation_tier`
- `tier_asserted_by`
- `controller_path`
- `controller_sha256`
- `project_root`
- `transfer_status`, fixed to `ready`

## Failure Envelope

```json
{"kernel_status":"unable_to_transfer","reason":"controller_unavailable"}
```

Allowed reason codes:

- `controller_unavailable`
- `controller_integrity_failed`
- `delivery_environment_unresolved`
- `project_root_unresolved`
- `kernel_artifact_unreadable`

These are transport statuses, not lifecycle verdicts.

## Delivery Adapter Contract

Delivery adapters inject `BOOTSTRAP.md` without modification, declare how delivery occurred, reject symlinks and root escapes, return valid harness output on every path, and do not restate Kernel logic.

The system must successfully become the governing engineering system before governance begins.
