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

## Instruction And Enforcement Boundary

The Kernel is an instruction contract for an external agent. A compliant agent must follow its transfer sequence. Repository tests validate the Kernel's size, structure, closed reason vocabulary, and inspectable artifacts; executable delivery adapters may reject invalid paths and files. This prose does not make an external agent's compliance technically unavoidable.

## Five Responsibilities

The following responsibilities are instructed behavior for a compliant delivery agent:

1. Identify the delivery environment sufficiently to locate the Controller.
2. Locate `00_start_here/bootstrap-controller.json` inside the supplied project root.
3. Confirm that the Controller artifact is a regular non-symlinked file contained by the project root, then compute and record its SHA-256 as an observation identifier.
4. Transfer control with the handoff envelope, carrying the activation assertion supplied by Delivery.
5. When any prior responsibility cannot complete, stop and emit the transport failure envelope.

The recorded SHA-256 identifies the Controller bytes observed during the handoff. Because the repository supplies no authoritative expected hash or stronger trust anchor, the computation does not prove file integrity.

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

`controller_integrity_failed` is reserved for a failure detected by an executable structural or artifact-validation mechanism. A bare hash computation neither verifies integrity nor satisfies this reason.

These are transport statuses, not lifecycle verdicts.

## Delivery Adapter Contract

Delivery adapters inject `BOOTSTRAP.md` without modification, declare how delivery occurred, reject symlinks and root escapes, return valid harness output on every path, and do not restate Kernel logic.

The system must successfully become the governing engineering system before governance begins.
