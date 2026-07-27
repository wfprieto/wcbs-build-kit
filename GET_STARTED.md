# Get Started

Use this file for the shortest safe path into the Super Build Kit.

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

4. Install the selected adapter into the user's project with:

```bash
node scripts/install-adapter.mjs --target <runtime> --dest <project> --install
```

Supported targets are returned by:

```bash
node scripts/install-adapter.mjs --list-targets
```

5. Verify the installed files and activation marker:

```bash
node scripts/install-adapter.mjs --target <runtime> --dest <project> --doctor
node scripts/adapter-smoke-test.mjs --target <runtime> --dest <project>
```

6. Continue the user's requested work under the installed WCBS instructions. Do not make the user choose internal files, adapters, skills, or load order when the runtime and project destination can be determined safely.

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
