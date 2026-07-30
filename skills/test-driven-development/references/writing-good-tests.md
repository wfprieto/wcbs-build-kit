# Writing Good Tests

Use this reference after selecting the behavior to prove and before enlarging a
test suite.

## Select the smallest truthful boundary

| Risk | Preferred test | Avoid |
|---|---|---|
| Pure rule or transformation | Unit test through the exported function | Asserting private helper calls |
| Command, API, or workflow contract | Integration test through the public interface | Mocking the boundary being claimed |
| Regression with unknown internals | Characterization test before refactor | Rewriting behavior and tests together |
| Browser-visible behavior | Focused browser or component test plus accessibility assertion | Screenshot-only proof |

## Runnable red-green shape

```js
test("rejects an expired reset token", () => {
  expect(resetPassword({ token: expiredToken })).toEqual({ ok: false, reason: "expired" });
});
```

Run the exact focused command and confirm that it fails because expiry handling
is absent, not because setup broke. Add the smallest behavior change, rerun the
same test, then run the neighboring authentication suite.

## Test review questions

- Could the old implementation pass this test?
- Does the test observe a user or system contract rather than an implementation detail?
- Would an incorrect mock, skipped assertion, or snapshot still let the risk through?
- Does the failure message identify the behavior that is missing?
