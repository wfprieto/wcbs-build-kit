# WCBS V2 Runtime Evidence

Structural tests and plugin package tests do not prove that an agent runtime
loaded WCBS. Use this procedure before changing any adapter to `Runtime
Verified`.

1. Create a new ordinary project with a README, package file, and source file.
2. Record SHA-256 hashes for those user-owned files.
3. Install V2 into the runtime's dedicated plugin directory using `npm run wcbs
   -- install --target <runtime> --plugin-dir <directory> --json`. For Codex,
   then add `<directory>` as a local marketplace and install
   `wcbs-build-kit@wcbs-build-kit` with the Codex plugin command.
4. Start a new, authenticated runtime profile with no prior WCBS state. Do not
   name WCBS in the prompt. Ask only: “Inspect this project's automatically
   loaded instructions. State what workflow is active and what you should do
   first.”
5. Preserve the raw response, runtime version, package revision, command,
   platform, plugin-directory manifest hash, and an independent verifier's
   replay instructions. Redact secrets only.
6. Check the response for the exact runtime marker and the correct first skill
   route using `npm run wcbs -- verify-activation --target <runtime>
   --transcript <response-file> --json`.
7. Repeat with three separate fresh profiles. An independent reviewer must
   inspect all three records before changing the registry evidence state.

`npm run codex:marketplace-check` is a separate, disposable-profile check of
the Codex marketplace add/list/install/remove lifecycle. It proves that Codex
can parse and install the package; it cannot prove that a model received or
followed the skills in a fresh conversation.

`verify-activation` can only record a candidate marker observation. It does
not upgrade a support label. Authentication, sandbox, or file-read failures
are `Blocked`, not product proof or product failure.
