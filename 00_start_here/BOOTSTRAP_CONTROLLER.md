# EOS Bootstrap Controller

> GENERATED FILE. Do not edit by hand. Source: `00_start_here/bootstrap-controller.json`.

Controller version: `2.0.0`

## State Sequence

### 1. DISCOVER

- Blocking: `true`
- Entry: valid handoff envelope received
- Inputs: project_root; controller_sha256
- Outputs: validated project-root context
- Failures: project root missing or outside allowed boundary
- Recovery: return BLOCKED with the missing or invalid input
- Evidence: Verified, Blocked
- Next: VALIDATE

### 2. VALIDATE

- Blocking: `true`
- Entry: DISCOVER completed
- Inputs: Kernel handoff envelope; Controller schema
- Outputs: validated handoff record
- Failures: envelope or Controller integrity invalid
- Recovery: return BLOCKED and name the integrity failure
- Evidence: Verified, Blocked
- Next: VALIDATE_RUNTIME

### 3. VALIDATE_RUNTIME

- Blocking: `true`
- Entry: VALIDATE completed
- Inputs: delivery_environment; asserted_activation_tier; runtime manifests
- Outputs: .wcbs/capability-resolution.json
- Failures: delivery environment has no manifest or required fallback
- Recovery: degrade to the highest substantiated tier or return BLOCKED
- Evidence: Verified, Likely, Blocked
- Next: LOAD_AUTHORITY

### 4. LOAD_AUTHORITY

- Blocking: `true`
- Entry: VALIDATE_RUNTIME completed
- Inputs: 00_start_here/SOURCE_OF_TRUTH.md
- Outputs: authority load evidence
- Failures: authority source missing or unreadable
- Recovery: return BLOCKED and stop initialization
- Evidence: Verified, Blocked
- Next: LOAD_GOVERNANCE

### 5. LOAD_GOVERNANCE

- Blocking: `true`
- Entry: LOAD_AUTHORITY completed
- Inputs: APIVR lifecycle; Elite Build Goals; release gates
- Outputs: governance load evidence
- Failures: mandatory governance input missing
- Recovery: return BLOCKED and identify the missing input
- Evidence: Verified, Blocked
- Next: INITIALIZE_STATE

### 6. INITIALIZE_STATE

- Blocking: `true`
- Entry: LOAD_GOVERNANCE completed
- Inputs: .wcbs state if present; rehydration_set
- Outputs: .wcbs/bootstrap-report.json; .wcbs/evidence-ledger.jsonl
- Failures: state exists without a valid certificate; rehydration hash mismatch
- Recovery: force complete re-initialization before continuation
- Evidence: Verified, Unknown, Blocked
- Next: CLASSIFY_PROJECT

### 7. CLASSIFY_PROJECT

- Blocking: `true`
- Entry: INITIALIZE_STATE completed
- Inputs: project request; project files and constraints
- Outputs: .wcbs/project-profile.json
- Failures: project intent or material constraints unresolved
- Recovery: record PARTIAL or BLOCKED and request only the missing material input
- Evidence: Verified, Likely, Unknown, Blocked
- Next: RESOLVE_CAPABILITIES

### 8. RESOLVE_CAPABILITIES

- Blocking: `true`
- Entry: CLASSIFY_PROJECT completed
- Inputs: project profile; capability-routing.json
- Outputs: .wcbs/capability-resolution.json
- Failures: required capability has no routing path
- Recovery: return BLOCKED and name the unrouted capability
- Evidence: Verified, Blocked
- Next: ASSEMBLE_TEAM

### 9. ASSEMBLE_TEAM

- Blocking: `true`
- Entry: RESOLVE_CAPABILITIES completed
- Inputs: capability resolution
- Outputs: .wcbs/engineering-team.json; .wcbs/elite-goals-ledger.json
- Failures: required capability lacks a role, skill, audit, template, or gate
- Recovery: return BLOCKED and name the missing execution path
- Evidence: Verified, Blocked
- Next: RUN_PREFLIGHT

### 10. RUN_PREFLIGHT

- Blocking: `true`
- Entry: ASSEMBLE_TEAM completed
- Inputs: design approval; required pre-build gates
- Outputs: preflight evidence
- Failures: design not approved; mandatory gate failed or Not Run
- Recovery: stop implementation and return the canonical verdict supported by evidence
- Evidence: Verified, Not Run, Blocked
- Next: CERTIFY

### 11. CERTIFY

- Blocking: `true`
- Entry: RUN_PREFLIGHT completed
- Inputs: all initialization artifacts; certificate canonicalization v1
- Outputs: .wcbs/bootstrap-certificate.json
- Failures: mandatory input Unknown or Not Run; unresolved blocker for PASS
- Recovery: issue PARTIAL, FAIL, or BLOCKED; never issue PASS
- Evidence: Verified, Unknown, Not Run, Blocked
- Next: HAND_OFF_TO_LIFECYCLE

### 12. HAND_OFF_TO_LIFECYCLE

- Blocking: `true`
- Entry: certificate issued without FAIL or BLOCKED
- Inputs: bootstrap certificate; APIVR lifecycle
- Outputs: lifecycle handoff evidence
- Failures: certificate invalid or capability ceiling exceeded
- Recovery: return BLOCKED and stop project execution
- Evidence: Verified, Blocked
- Next: APIVR lifecycle

## Rehydration Set

- `.wcbs/project-profile.json`
- `.wcbs/capability-resolution.json`
- `.wcbs/engineering-team.json`
- `.wcbs/elite-goals-ledger.json`
- `.wcbs/risk-register.json`
- `.wcbs/release-state.json`
- `.wcbs/evidence-ledger.jsonl`
