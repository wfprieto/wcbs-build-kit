# WCBS Remediation Pre-Flight Conflict Report

## Result

**Resolved before implementation.**

| Check | Result | Resolution |
|---|---|---|
| “Complete every phase” vs external evidence stop conditions | Conflict | Internal hardening proceeds; live runtime and behavioral claims remain `Blocked` until independent evidence exists. |
| Four-arm requested evaluation vs locked two-/three-arm protocols | Conflict | Preserve existing protocols; any four-arm study requires a new preregistration before measurement. |
| Adoption goal vs neutral source-only score | Conflict | Exclude adoption, popularity, community input, and use from audit and release claims. |
| Existing remediation branch vs current remote `main` | Conflict | Use `origin/main` `3d9f22e` as the baseline and retain the old branch untouched. |
| “No shortcuts” vs test-runner interruption | No shortcut permitted | Record the interrupted suite as `Blocked`; isolate and repair only with a red-capable reproduction. |
| Generated entry instructions vs runtime-native details | Scoped | Generate common non-Kernel policy only. Keep the mandatory direct Kernel fail-closed transport invariant and runtime-specific directions explicit in the entry file. |

## Approval To Implement Slice 1

The slice has one canonical registry, explicit files, a red test, rollback through one commit, and no support-label change. It may proceed under Comprehensive APIVR.
