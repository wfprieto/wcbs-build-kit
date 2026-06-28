---
name: security-incident-response
description: Use when triaging, investigating, containing, documenting, or recovering from suspected security incidents, compromises, alerts, malware, ransomware, data leakage, credential abuse, unauthorized access, suspicious logs, forensic evidence, incident severity, escalation, containment, eradication, recovery, or post-incident review.
---

# Security Incident Response

Use this skill for suspected or confirmed security incidents. Incidents default to Forensic unless clearly proven lower risk.

<HARD-GATE>
Preserve evidence before changing state. Do not delete logs, rotate systems, wipe hosts, revoke access, or remediate in a way that destroys the investigation record unless containment requires it and the decision is recorded.
</HARD-GATE>

## Required Files

- `60_templates/SECURITY_EVIDENCE_LEDGER_TEMPLATE.md`
- `60_templates/AGENT_RUN_TRACE_TEMPLATE.md`
- `60_templates/ROLLBACK_RECORD_TEMPLATE.md`
- `40_knowledge/SECURITY_FRAMEWORK_MAPPING.md`

## APIVR Incident Routing

- Phase 1 Audit: collect initial alert, timeline, assets, users, data sensitivity, blast radius, and evidence sources.
- Phase 2 Plan: define severity, containment, evidence preservation, owners, communication, and recovery path.
- Phase 3 Implement: execute approved containment or investigation steps one at a time.
- Phase 4 Audit Implementation: check whether containment changed evidence, scope, or availability.
- Phase 5 Verify Implementation: verify containment, recovery, and remaining indicators.
- Phase 6 Re-Audit: document root cause, residual risk, lessons, and release/reopen decision.

## Severity Routing

| Severity | Indicators | Required Response |
|---|---|---|
| P1 Critical | active exfiltration, ransomware, privileged compromise, regulated data, production impact | Forensic, incident owner, containment, evidence chain |
| P2 High | confirmed malware, production auth abuse, high-value system compromise | Forensic or Comprehensive, escalation, containment plan |
| P3 Medium | suspicious activity with limited scope or non-production impact | Comprehensive unless proven Standard |
| P4 Low | benign true positive, recon noise, isolated blocked attempt | Standard or Rapid with evidence |

## Evidence Rules

- Preserve original logs or exports when possible.
- Record source, timestamp, actor, command/tool, and hash when available.
- Separate facts from hypotheses.
- Mark missing evidence as `Unknown`, `Not Run`, or `Blocked`.
- Keep sensitive indicators redacted in broad reports but preserve full values in approved evidence stores.

## Worked Example

Scenario: EDR alert shows encoded PowerShell spawned by email client on a finance workstation.

1. Select Forensic because potential malware, finance data, and credential access are in scope.
2. Preserve EDR event, process tree, host/user identifiers, and timestamps.
3. Check related authentication, email, network, and endpoint events.
4. Contain host only after evidence capture or with recorded emergency rationale.
5. Verify no lateral movement, credential abuse, or data exfiltration.
6. Verdict remains `BLOCKED` if authentication logs or host telemetry are unavailable.

## Final Output

Report severity, incident type, evidence chain, affected assets/users, containment status, verification, remaining unknowns, owner, next action, and APIVR verdict.
