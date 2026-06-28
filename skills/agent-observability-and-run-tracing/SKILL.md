---
name: agent-observability-and-run-tracing
description: Use when recording, auditing, debugging, or designing traceability for agent work, long-running tasks, subagents, tool calls, MCP use, evidence ledgers, run ids, checkpoints, model/runtime metadata, failure reasons, artifacts, or handoff records. Applies to Comprehensive and Forensic work, incidents, production-impacting changes, multi-agent execution, and any task requiring a durable audit trail.
---

# Agent Observability And Run Tracing

Use this skill when the work needs a durable trail of what the agent did and why.

<HARD-GATE>
Do not rely on chat memory as the audit trail for serious work. Record run metadata, tool use, evidence, artifacts, decisions, and stop reasons in a traceable form.
</HARD-GATE>

## Required Template

Use `60_templates/AGENT_RUN_TRACE_TEMPLATE.md` for Comprehensive, Forensic, multi-agent, production-impacting, or long-horizon work.

## APIVR Routing

- Phase 1 Audit: define trace need, sensitivity, retention, runtime, tools, and evidence sources.
- Phase 2 Plan: define run id, checkpoints, trace fields, artifact locations, and redaction rules.
- Phase 3 Implement: record trace entries as work proceeds.
- Phase 4 Audit Implementation: check trace completeness and evidence survival.
- Phase 5 Verify Implementation: compare final claims against trace entries.
- Phase 6 Re-Audit: preserve final trace and remove sensitive scratch data when appropriate.

## Required Trace Fields

- run id or stable task id;
- APIVR tier;
- runtime/platform and model if known;
- start/end time or checkpoint time;
- files, systems, data, tools, and subagents touched;
- decisions and rationale;
- evidence sources and states;
- commands/checks run and not run;
- artifacts produced;
- stop reason or next action.

## Redaction Rules

- Never record raw secrets, tokens, private keys, or full credentials.
- Mask sensitive identifiers unless they are required for authorized verification.
- Keep enough context to verify the claim without exposing private data.
- Prefer references to secure locations over copied sensitive content.

## Worked Example

Scenario: Forensic audit involving API keys, deployment, and reporting outputs.

1. Select Forensic tier.
2. Create a run trace before tool use.
3. Record provider docs checked, config files inspected, commands run, subagents dispatched, and evidence states.
4. Redact secrets and record only the secret location and scope.
5. Final verdict cites trace entries instead of relying on memory.

## Final Output

End with APIVR tier, run id, trace completeness, evidence gaps, redactions, artifact locations, stop reason, and final verdict.
