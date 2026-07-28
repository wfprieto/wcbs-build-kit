# Get Started

Use this file for the shortest safe path into the Super Build Kit.

## V2 default: native plugin, not project vendoring

For a new installation, obtain the runtime identity and its dedicated native
plugin directory. Do not write WCBS into the project merely because the
project is the current directory.

```bash
npm run wcbs -- status --json
npm run wcbs -- install --target <runtime> --plugin-dir <runtime-plugin-directory> --json
npm run wcbs -- doctor --plugin-dir <runtime-plugin-directory> --json
```

If the runtime or plugin directory is unknown, ask for that one missing value
and return `Blocked` without writing files. Use `docs/V2_RUNTIME_EVIDENCE.md`
for the separate clean-session proof. The older project-local path below is
V1 compatibility and migration guidance, not the default installation route.

## Coding agent arriving from the GitHub URL

When a user gives you this repository URL and asks you to use the WCBS Build Kit for a project:

1. Obtain or open the repository without modifying the user's project.
2. Read `BOOTSTRAP.md` and follow its transfer to `00_start_here/bootstrap-controller.json`.
3. Identify the active runtime only far enough to select one supported adapter target.

### Runtime identification rule

Use an explicit runtime-provided identity signal when one is available, such as a system-declared runtime identity, native plugin context, or runtime-specific CLI environment. Confirm that identity against the matching `runtime_id` in `runtime_adapters/manifests/<runtime>.json` before selecting the adapter.

Do not infer a runtime from model style, repository contents, or familiarity with a provider.

If no explicit runtime identity signal exists, run:

```bash
node scripts/install-adapter.mjs --list-targets
```

Then ask exactly one bounded question:

> Which supported coding runtime is running this project? Choose one target from the list above.

This is the only permitted runtime-selection question. Do not guess. If the runtime is still unknown, report it as `Blocked` and do not install an adapter.

4. Resolve the destination project before producing an installation command.

### Destination identification rule

A destination is deterministic only when exactly one project root is explicitly identifiable from the current execution context. Qualifying evidence is:

- a project path explicitly supplied by the user;
- one authoritative project root supplied by an invocation contract;
- one authoritative project root exposed by a supported workspace or integration; or
- one unambiguous target repository already established by the user's request and distinct from this Build Kit clone.

The current directory alone is not destination evidence. The Build Kit clone is not a destination candidate. If the user asks to work on the Build Kit itself, no adapter installation into that same repository is needed; the installer rejects the Build Kit source as its own destination.

Enumerate candidate paths from explicit user paths, authoritative workspace or integration roots, and discovered project repository roots. Pass each plausible path as `--candidate <path>`:

```bash
node scripts/resolve-install-context.mjs --target <runtime> --candidate <path> [--candidate <path> ...]
```

If no single destination is established, ask exactly one bounded question:

> Which project should receive the WCBS adapter?

List the actual candidate paths discovered in the current context. If no candidate project exists, include:

> No destination project exists yet.

Do not ask the user to choose WCBS files, adapter internals, manifests, skills, or load order. If the answer remains unresolved, report `Blocked`, name `destination project` as the missing input, and stop. Do not install, write adapter files, or claim initialization or activation.

5. Once both runtime and destination are resolved, produce the install context:

```bash
node scripts/resolve-install-context.mjs --target <runtime> --dest <project>
```

The ready result supplies the exact install, doctor, owned-file verification, and smoke-test commands. Run the installation command only after that result is ready:

```bash
node scripts/install-adapter.mjs --target <runtime> --dest <project> --install
```

Supported targets are returned by:

```bash
node scripts/install-adapter.mjs --list-targets
```

6. Verify the installed files and activation marker:

```bash
node scripts/install-adapter.mjs --target <runtime> --dest <project> --doctor
node scripts/install-adapter.mjs --target <runtime> --dest <project> --verify-owned-files
node scripts/adapter-smoke-test.mjs --target <runtime> --dest <project>
```

7. Continue the user's requested work under the installed WCBS instructions. Do not make the user choose internal files, adapters, skills, or load order when the runtime and project destination can be determined safely.

If the repository cannot be obtained, the runtime cannot be identified, the destination is ambiguous, or a required verification fails, stop with the specific blocker. Do not claim activation.

URL-paste discovery is `REQUESTED`, not `ENFORCED`: this repository can make the correct path obvious after it is opened, but it cannot compel an external model to fetch a URL.

## Human verification of this kit

Run from the repository root:

```bash
npm run verify
npm run check-install
```

Windows PowerShell fallback:

```powershell
npm.cmd run verify
npm.cmd run check-install
```

## Direct paths

| Goal | First file or command |
|---|---|
| Use the kit in this repository | `00_start_here/START_HERE.md` |
| Audit a project | `50_audits/AUDIT_TIER_ROUTER.md` |
| Plan a feature | `skills/writing-plans/SKILL.md` |
| List supported runtime targets | `node scripts/install-adapter.mjs --list-targets` |
| Install into a project | `node scripts/install-adapter.mjs --target <runtime> --dest <project> --install` |
| Check an installed adapter | `node scripts/adapter-smoke-test.mjs --target <runtime> --dest <project>` |
| Prepare a release | `RELEASE_PROCESS.md` |

## Operating law

Every path follows:

**Audit wide. Fix narrow. Prove everything.**

End every material work cycle with APIVR tier, applicable Elite Build Goals, evidence state, verification performed and not performed, release-gate status, final verdict, and the single next required action.
