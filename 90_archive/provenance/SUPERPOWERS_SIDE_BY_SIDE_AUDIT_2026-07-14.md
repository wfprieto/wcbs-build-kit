# Superpowers Side-By-Side Audit - July 14, 2026

This provenance record preserves the readiness comparison between `wfprieto/wcbs-build-kit` at commit `151e96b` and `obra/Superpowers` at commit `d884ae0`.

## Verdict

`wcbs-build-kit` has the stronger governance system and broader APIVR/Elite Build Goals control plane. `Superpowers` remains the stronger implemented product because it has lower-friction installation, stronger native harness integration, and more behavioral proof.

## Scores From The Audit

| Dimension | wcbs-build-kit | Superpowers | Winner |
|---|---:|---:|---|
| Overall, 72% design / 28% readiness | 92.51 | 88.86 | wcbs-build-kit |
| Design and content only | 95.67 | 86.65 | wcbs-build-kit |
| Operational readiness | 84.39 | 94.54 | Superpowers |
| Equal 50% design / 50% readiness | 90.03 | 90.59 | Superpowers |

## Binding Interpretation

The next material upgrade must close operational readiness gaps, not add more broad guidance.

Highest-value gaps:

1. The adapter installer still needs real idempotent install, update, uninstall, doctor, and smoke-test behavior.
2. Runtime adapter support claims need verified-support evidence separate from documented compatibility.
3. System tests need isolated adapter installation and representative activation scenarios, not only structural file checks.
4. Release artifacts need checksums and tag-driven evidence.
5. Day-one entry should be simpler without weakening APIVR.

## Source-Of-Truth Rule

This file is provenance, not an active instruction layer. Active routing remains owned by:

- `00_start_here/SOURCE_OF_TRUTH.md`
- `00_start_here/LOAD_ORDER.md`
- `runtime_adapters/PORTABILITY_CONTRACT.md`
- `10_governance/RELEASE_GATES.md`

