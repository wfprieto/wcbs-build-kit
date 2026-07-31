# Get Started

Use this file for the shortest safe path into the Super Build Kit.

## Current default: project-scoped installation

All current runtime manifests declare `install_scope: project`. Use the
transactional project-local installer only after the destination is resolved.
The installer protects unrelated files, records ownership, and refuses unsafe
uninstall. Native V2 bundles are package-integrity artifacts, not a universal
runtime-registration route.

```bash
node scripts/resolve-install-context.mjs --target <runtime> --candidate <path> [--candidate <path> ...]
node scripts/resolve-install-context.mjs --target <runtime> --dest <project>
```

If the runtime or destination is unknown, ask for that one missing value and
return `Blocked` without writing files. Use `docs/V2_RUNTIME_EVIDENCE.md` for
the separate clean-session proof.

## Coding agent arriving from the GitHub URL

When a user gives you this repository URL and asks you to use WCBS:

1. Obtain or open the repository without modifying the user's project.
2. Read `BOOTSTRAP.md` and follow its transfer to `00_start_here/bootstrap-controller.json`.
3. Identify the active runtime and resolve the destination project.
4. Run the project-scoped lifecycle only after the resolver returns `State:
   Ready`:

```bash
node scripts/resolve-install-context.mjs --target <runtime> --dest <project>
node scripts/install-adapter.mjs --target <runtime> --dest <project> --install
node scripts/install-adapter.mjs --target <runtime> --dest <project> --doctor
node scripts/adapter-smoke-test.mjs --target <runtime> --dest <project>
```

5. Read `docs/V2_RUNTIME_EVIDENCE.md` before calling an external runtime
activated. Installation, a smoke test, and a marker observation are not
clean-session activation proof.
6. Continue the requested work only after the applicable installed adapter
passes doctor and smoke verification.

### Runtime identification rule

Use an explicit runtime-provided identity signal when one is available, such as a system-declared runtime identity, native plugin context, or runtime-specific CLI environment. Confirm that identity against the matching `runtime_id` in `runtime_adapters/manifests/<runtime>.json` before selecting the adapter.

Do not infer a runtime from model style, repository contents, or familiarity with a provider.

If no explicit runtime identity signal exists, run:

```bash
node scripts/install-adapter.mjs --list-targets
```

Then ask exactly one bounded question:

> Which supported coding runtime is running this project? Choose one target from the list above.

This is the only permitted runtime-selection question. Do not guess. If the
runtime is still unknown, report it as `Blocked` and do not install an adapter.

If the repository cannot be obtained, the runtime cannot be identified, the
destination project is unknown, or doctor fails, stop with the specific blocker.
Do not claim activation.

## V1 Project-Local Compatibility Route (Current Default)

This is the current default until a target-specific V2 registration command is
independently verified. It intentionally writes only WCBS-owned files into the
resolved destination:

```bash
node scripts/resolve-install-context.mjs --target <runtime> --candidate <path> [--candidate <path> ...]
node scripts/resolve-install-context.mjs --target <runtime> --dest <project>
```

Once the resolver returns `State: Ready`, it supplies the exact V1 install,
doctor, ownership verification, smoke test, and uninstall commands. If no
single destination is established, it asks once, returns `Blocked`, and writes
nothing.

## V2 package integrity route

V2 installs a bounded package into an explicit plugin directory:

```bash
npm run wcbs -- install --target <runtime> --plugin-dir <runtime-plugin-directory> --json
npm run wcbs -- doctor --plugin-dir <runtime-plugin-directory> --json
```

A V2 package integrity result is not a runtime registration result. Do not
continue under V2 instructions unless the selected runtime has a documented,
executed native registration step and then passes the clean-session procedure
in `docs/V2_RUNTIME_EVIDENCE.md`.

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
| List runtime targets | `node scripts/install-adapter.mjs --list-targets` |
| Install the current default | `node scripts/resolve-install-context.mjs --target <runtime> --dest <project>` |
| Verify V2 package integrity only | `npm run wcbs -- doctor --plugin-dir <runtime-plugin-directory> --json` |
| Prepare a release | `RELEASE_PROCESS.md` |

## Operating law

Every path follows:

**Audit wide. Fix narrow. Prove everything.**

End every material work cycle with APIVR tier, applicable Elite Build Goals, evidence state, verification performed and not performed, release-gate status, final verdict, and the single next required action.
