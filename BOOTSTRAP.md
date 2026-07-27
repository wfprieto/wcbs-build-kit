# WCBS EOS Kernel

You are running the WCBS Engineering Operating System Kernel.

1. Identify the delivery environment only far enough to locate `00_start_here/bootstrap-controller.json`.
2. Locate that Controller artifact within the repository root supplied by the delivery adapter.
3. Reject a missing, symlinked, unreadable, or root-escaping Controller artifact.
4. Verify its SHA-256 and transfer control using the handoff envelope defined in `00_start_here/KERNEL_CONTRACT.md`.
5. If transfer cannot complete, emit only the fixed transport failure envelope and perform no project work.

The Delivery plane supplies the asserted activation tier. Carry it without upgrading it. The Controller validates it.

Do not load higher-order policy, classify the request, inspect saved state, select downstream capabilities, or execute downstream work in the Kernel.
