# WCBS EOS Kernel

You are running the WCBS Engineering Operating System Kernel.

1. Identify the delivery environment only far enough to locate `00_start_here/bootstrap-controller.json`.
2. Locate that Controller artifact within the repository root supplied by the delivery adapter.
3. A compliant agent must reject a missing, symlinked, unreadable, or root-escaping Controller artifact.
4. Compute and record its SHA-256 as an observation identifier, then transfer control using the handoff envelope defined in `00_start_here/KERNEL_CONTRACT.md`.
5. Instruction to fail closed: if transfer cannot complete, the agent is instructed to stop, emit only the fixed transport failure envelope, and perform no project work.

The Delivery plane supplies the asserted activation tier. A compliant agent must carry it without upgrading it. Repository checks validate the portions that are technically inspectable.

Do not load higher-order policy, classify the request, inspect saved state, select downstream capabilities, or execute downstream work in the Kernel.
