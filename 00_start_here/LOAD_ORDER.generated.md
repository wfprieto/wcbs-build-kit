# Load Order

> GENERATED FILE. Do not edit by hand. Source: `00_start_here/capability-routing.json`.

Load the EOS Kernel first, then the Controller, then select only the capabilities required by the project.

## Universal Control Flow

1. `BOOTSTRAP.md`
2. `00_start_here/bootstrap-controller.json`
3. `00_start_here/SOURCE_OF_TRUTH.md`
4. `10_governance/APIVR_EXECUTION_LIFECYCLE.md`
5. `10_governance/source_of_truth/Elite_Build_Goals_v3.md`
6. Capability-specific skills, audits, templates, and gates below

The complete generated routing document is produced with `npm run generate:load-order`. The machine-readable source is canonical and is validated by `scripts/tests/capability-routing.test.mjs`.

## Portability

Runtime delivery must follow `runtime_adapters/PORTABILITY_CONTRACT.md` and `runtime_adapters/PORTING_GUIDE.md`.

Complex work may use `skills/subagent-driven-development/SKILL.md` after preflight gates pass.
