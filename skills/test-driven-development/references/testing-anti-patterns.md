# Testing Anti-Patterns

Use this reference during APIVR Phase 4 when auditing implementation tests.

## Anti-Patterns

| Anti-pattern | Why it fails APIVR | Correction |
|---|---|---|
| Test added after production code without observing failure | Red evidence is missing. | Reproduce the failing Red state before accepting the change. |
| Snapshot-only assertion | Behavior claim is too broad or opaque. | Add explicit assertions for the business behavior. |
| Mocking the unit being tested | Test proves the mock, not the system. | Mock only external boundaries; exercise real internal logic. |
| Skipped or quarantined test | Evidence is Not Run. | Unskip or record Blocked with owner and follow-up. |
| Assertion-free smoke test | No material claim is verified. | Add assertions for output, state, side effect, or error. |
| Fixture overfitting | Test may pass only for one artificial shape. | Add edge case or property-style coverage where risk warrants. |
| Broad e2e only for simple logic | Slow, fragile evidence. | Add focused unit/integration test and keep e2e for wiring. |
| Manual-only regression | Evidence cannot be repeated. | Automate the repeatable part and document remaining manual evidence. |

## Audit Prompts

- Would this test fail if the bug came back?
- Does the test prove behavior or only implementation details?
- Is the failure message useful?
- Are important adverse states covered?
- Did any production behavior change without a test proving it?
