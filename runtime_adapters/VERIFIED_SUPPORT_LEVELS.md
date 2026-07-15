# Verified Support Levels

This file separates documented adapter capability from proven runtime evidence.

`runtime_adapters/CAPABILITY_MATRIX.md` is generated from manifests and describes designed support. This file records what has actually been verified by repository tests or runtime evidence.

## Evidence Levels

| Level | Meaning |
|---|---|
| Documented | The adapter has instructions, manifest, mapping, and activation scenario text. |
| Structurally Verified | Repository checks prove required files, schema validity, markers, and routing references. |
| Installed In Isolated Fixture | Automated tests installed the adapter into a temporary project or home fixture. |
| Behaviorally Verified | A representative governed workflow proved APIVR routing, evidence states, and honest capability limits. |
| Runtime Verified | The runtime itself was exercised in a clean session and produced the expected activation evidence. |

## Current Verified Status

| Runtime | Designed support | Current verified level | Evidence | Next upgrade |
|---|---|---|---|---|
| `claude` | Full | Structurally Verified | Manifest, mapping, bootstrap file, and activation prompt are checked by doctor. | Add isolated fixture install and clean-session runtime evidence. |
| `codex` | Full | Behaviorally Verified | Manifest, mapping, real isolated install/update/uninstall test, installer doctor, and adapter smoke test are checked by the Node suite. | Add clean-session Codex runtime evidence. |
| `cursor` | Full | Behaviorally Verified | Manifest, mapping, real isolated install test, installer doctor, and adapter smoke test are checked by the Node suite. | Add clean-session Cursor runtime evidence. |
| `gemini` | Partial | Structurally Verified | Manifest, mapping, `GEMINI.md`, and degraded fallback language are checked by doctor. | Add isolated fixture install and clean-session activation evidence. |
| `generic-agent` | Manual | Structurally Verified | Manual activation files and evidence-state language are checked by doctor. | Add manual-load smoke fixture. |
| `github-copilot` | Partial | Structurally Verified | Manifest, mapping, `.github/copilot-instructions.md`, and degraded review language are checked by doctor. | Add isolated fixture install and Copilot instruction evidence. |
| `manus` | Manual | Structurally Verified | Manifest, mapping, `Manus.md`, and manual activation limitation are checked by doctor. | Add manual-load smoke fixture. |
| `replit` | Partial | Structurally Verified | Manifest, mapping, `REPLIT.md`, and Replit adapter file are checked by doctor. | Add isolated fixture install and Replit activation evidence. |

## Claim Rule

Do not report a runtime as `Runtime Verified` unless a clean-session runtime test produced evidence. File existence, manifest validity, and generated matrices are `Structurally Verified`, not runtime proof.
