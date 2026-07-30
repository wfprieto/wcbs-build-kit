# DeerFlow Source Notes

These notes record the selective integration decision for `bytedance/deer-flow`.

## Adapted Source

- External source: `bytedance/deer-flow`

## Integrated Concepts

- long-horizon agent run control;
- staged checkpoints and context preservation;
- subagent and loop runtime boundaries;
- workspace, scratch, evidence, and output separation;
- bootstrap/setup stop boundaries;
- MCP/tool governance;
- run tracing and observability metadata;
- evidence survival through summarization and handoff.

## Not Integrated

- DeerFlow runtime;
- LangGraph/LangChain dependency;
- frontend, gateway, IM, or deployment architecture;
- provider model configs;
- Docker/Kubernetes sandbox implementation;
- full skill catalog.

APIVR and the 16 Elite Build Goals remain the authority. DeerFlow-derived patterns are execution controls inside the Super Build Kit, not a replacement runtime.
