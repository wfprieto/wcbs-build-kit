# Long-Horizon Agent Runtime Patterns

Use this module for agent work that spans many stages, tools, files, subagents, loops, or context checkpoints.

## Provenance

Adapted from useful patterns in `bytedance/deer-flow`: long-horizon agent systems benefit from explicit runtime control, subagent isolation, workspace boundaries, context engineering, memory/checkpoints, tool governance, and traceability. The Super Build Kit does not import DeerFlow's runtime, model stack, frontend, messaging integrations, deployment architecture, or sandbox implementation.

## When To Use

Use long-horizon run control when:

- task tier is Comprehensive or Forensic;
- work will span many files or systems;
- subagents or repeated loops are needed;
- evidence must survive context compression;
- multiple checkpoints or handoffs are expected;
- generated artifacts, scratch files, and final deliverables must be separated;
- tool use, MCP access, or sandbox state matters.

## Runtime Controls

| Control | Requirement |
|---|---|
| Stage plan | Break work into named APIVR-compatible stages. |
| Checkpoints | Record state before continuing, handing off, or compressing context. |
| Context preservation | Preserve decisions, evidence, risks, changed files, and next action. |
| Artifact boundaries | Separate user inputs, scratch work, evidence, and final outputs. |
| Tool governance | Record tool purpose, scope, auth, and evidence produced. |
| Stop conditions | Stop on missing evidence, unsafe tools, production risk, or scope drift. |

## Context Compression Rule

Summaries may compress exploration, but must not remove:

- source-of-truth decisions;
- APIVR tier and goals;
- files changed or inspected;
- commands and verification results;
- evidence state;
- unresolved risks;
- human approvals or missing approvals;
- rollback path;
- exact next action.

## Stage Examples

- research and source verification;
- environment/bootstrap;
- architecture and scope plan;
- test-first implementation;
- subagent implementation slices;
- repeated quality or deploy checks;
- final verification and report.
