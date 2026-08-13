---
name: execution-graph
description: Use when a WCBS plan, remediation backlog, migration, release, or multi-slice engineering objective has dependent work that requires requirement-to-node traceability, topology validation, READY-frontier scheduling, or evidence-backed node locking. Also activate when the user explicitly requests /graph execution.
activation: Activate for a WCBS-governed agent after initialization and APIVR tier selection when approved work has two or more dependency-bearing execution or verification slices; do not activate for one narrow independent task.
required_inputs: Current WCBS authority and authorization context, APIVR tier, applicable Elite Build Goals, approved objective or plan revision and source baseline, requirement sources, acceptance criteria, dependencies, preserved behavior, verification methods, and existing evidence or progress records.
required_outputs: A dependency-aware execution graph, requirement-to-node traceability, topology receipt and verdict, current READY frontier, evidence-backed lock decisions, graph status summary, WCBS verdict, and one next action.
authority_dependencies: 00_start_here/SOURCE_OF_TRUTH.md; 00_start_here/LOAD_ORDER.md; 00_start_here/capability-routing.json; 10_governance/APIVR_EXECUTION_LIFECYCLE.md; 10_governance/RELEASE_GATES.md; 20_skills/PORTABLE_SKILL_CONTRACT.md; skills/writing-plans/SKILL.md; skills/executing-plans/SKILL.md.
evidence_requirements: Use only WCBS evidence states and records; every topology, readiness, and lock claim must cite current source, dependency, verification, or ledger evidence, and stale evidence invalidates affected locks; otherwise mark the claim Unknown, Not Run, or Blocked.
---

# Execution Graph

Derive a deterministic scheduling view from an approved WCBS plan: every requirement is mapped, topology is valid, and only proven-ready work advances.

<HARD-GATE>
This is a capability inside WCBS, not a second operating system. It does not own initialization, goals, APIVR, Elite Build Goals, evidence vocabulary,
specialist roles, delegation, retries, release gates, or final verdicts. Load their canonical WCBS owners instead of copying their rules here.
It never expands user authorization, approved scope, or write permissions.
</HARD-GATE>

## Scope

This skill owns only:

- conversion of approved requirements or plan slices into execution nodes;
- requirement-to-node traceability;
- dependency-edge and topology validation;
- computation and ranking of the READY frontier;
- evidence-backed node lock decisions; and
- recalculation of downstream readiness after each material state change.

This skill creates no new `.wcbs` authority file or parallel ledger. Place the graph in the current implementation plan or run-control artifact.
Record execution and evidence in artifacts selected by `LOAD_ORDER.md`. A new project-scoped graph file is non-authoritative until the Controller contract declares it.

## Activation Decision

Activate for prerequisites, requirements spanning slices, fan-out, or partial blockers that must not freeze independent work. An explicit `/graph` applies
only when delivered as text with an approved objective; it proves neither native slash-command support nor implementation authority. Use `executing-plans`
when graph computation would change nothing.

## WCBS Ownership And Input Gate

| Concern | Canonical owner |
|---|---|
| Authority, tier, lifecycle, verdict | source of truth, tier router, APIVR |
| Plan and requirement slices | `writing-plans`, `product-requirements-and-issue-slicing` |
| Sequential or delegated execution | `executing-plans`; dispatch and subagent skills |
| Repeated work and checkpoints | loop, long-horizon, and run-tracing skills |
| Verification and release | verification and release-readiness skills |

Confirm initialization, tier, applicable Elite Build Goals, scope, authorization, rollback boundary, baseline, requirements, criteria, and evidence locations. Missing inputs route to
canonical discovery or planning; never fabricate them. The graph inherits the tier and may trigger canonical escalation, but cannot lower it.
Before declaring VALID or READY, require SOURCE BASELINE, PLAN REVISION, APIVR TIER, and AUTHORIZED SCOPE; if any is missing, set BLOCKED and leave the
frontier empty. A provisional topology may diagnose the gap but cannot authorize execution.

## Graph Contract

Record one graph header:

```text
GRAPH ID:
SOURCE OBJECTIVE / PLAN:
SOURCE BASELINE:
PLAN REVISION:
APIVR TIER:
AUTHORIZED SCOPE:
GRAPH STATUS: VALID / INVALID / BLOCKED
CURRENT READY FRONTIER:
TOPOLOGY RECEIPT:
```

Record every node with:

```text
NODE ID:
OUTCOME:
REQUIREMENT IDS:
DEPENDENCIES:
DEPENDENTS:
CONFLICTS / EXCLUSIVE OWNERSHIP:
AUTHORIZED SURFACES:
PRESERVED BEHAVIOR:
ACCEPTANCE CRITERIA REFERENCES:
VERIFICATION REFERENCES:
EVIDENCE LOCATION:
STATUS: PENDING / READY / ACTIVE / BLOCKED / LOCKED / SUPERSEDED
BLOCKER:
NEXT ACTION:
```

Graph status is only a scheduling view; APIVR status, receipts, findings, evidence, and verdicts stay in existing WCBS records. Use the strongest stable
baseline available: plan path plus content hash or revision, and repository SHA when repository state is part of the plan.

## State Invariants

- PENDING becomes READY only by a full readiness recomputation.
- READY becomes ACTIVE only when selected by the frontier scheduler.
- ACTIVE becomes LOCKED only through the lock gate; failure leaves it unlocked.
- Any unlocked node that is not SUPERSEDED may become BLOCKED with an
  evidenced blocker.
- Resolving a blocker returns the node to PENDING and triggers recomputation;
  it does not imply READY.
- SUPERSEDED is terminal and must name replacement IDs or final disposition.
- A stale LOCKED node and all transitive dependents that are not SUPERSEDED return to PENDING.

## Requirement Traceability

Assign stable source-native requirement IDs when available; otherwise assign
`REQ-001`, `REQ-002`, and so on in source order. Maintain:

| Requirement ID | Source | Required outcome | Node IDs | Acceptance evidence | Coverage |
|---|---|---|---|---|---|

Rules:

- every in-scope requirement maps to at least one node;
- every node maps to at least one requirement or an explicit enabling need;
- an enabling node states the downstream requirement it unlocks;
- duplicate or conflicting requirements return to `writing-plans` for
  disposition before affected nodes become READY; and
- a requirement cannot disappear because a node was blocked or superseded.

## Node Formation

A node is the smallest independently verifiable outcome schedulable without an invented decision. Prefer vertical behavior slices over activity labels.

Create a bounded discovery node only when it produces evidence needed downstream; do not disguise vague planning as discovery.

Dependencies represent required artifacts, contracts, state, authorization, migration order, or verified behavior; not preference or convenient sequencing.

## Topology Validation

Before any node becomes READY:

The active graph contains every node not marked SUPERSEDED.

1. verify node IDs are unique and every referenced dependency exists;
2. reject self-dependencies;
3. verify every in-scope requirement is mapped;
4. verify every required terminal outcome is reachable;
5. run Kahn's algorithm over active nodes, breaking equal choices by ascending
   node ID; the processed count must equal the active-node count;
6. reject accidental cycles;
7. verify blocked or superseded nodes are not silently treated as satisfied;
8. reject orphan nodes that neither satisfy nor enable an in-scope requirement;
9. require every SUPERSEDED node to name its replacement or disposition;
10. verify exclusive file, migration, environment, or data ownership conflicts
   are resolved before concurrent scheduling; and
11. record counts, ordering, cycle result, and unmapped IDs in the receipt.

An intentional iteration belongs to `repeatable-agent-loops`; represent it as one bounded node with entry and exit evidence, not a graph cycle.

If invalid, set `GRAPH STATUS: INVALID`, name exact nodes and edges, and return to the plan; never schedule around an unknown cycle.

## READY Frontier

A node is READY only when:

- the graph is VALID;
- all dependencies are LOCKED;
- its plan, scope, acceptance criteria, and verification are explicit;
- required authority, inputs, and safe execution conditions are present;
- no unresolved ownership conflict makes execution unsafe; and
- it is neither BLOCKED, LOCKED, nor SUPERSEDED.

Recompute the full frontier after every lock, block, supersession, dependency
change, or plan revision. First demote every unlocked node that no longer meets
READY conditions to PENDING unless it has an evidenced blocker. A blocked node
blocks only its dependents.

Rank READY nodes using current evidence in this order:

1. safety, security, data-integrity, or release-blocker severity;
2. dependency criticality and number of downstream nodes unlocked;
3. contribution to the approved user or system outcome;
4. reversibility and rollback safety;
5. evidence and test readiness; and
6. effort or cost when higher-priority factors are equal; and
7. ascending NODE ID as the final tie-break.

Execute one highest-ranked node at a time unless WCBS delegation routing proves
parallel work is safe. Parallel-ready nodes need no dependency path between
them and no shared ownership conflict. This skill never authorizes subagents.

## Evidence-Backed Node Locking

LOCKED means the node's required outcome is directly proven. Before locking:

1. confirm every mapped requirement and acceptance criterion is satisfied;
2. complete the node's applicable APIVR implementation audit and verification;
3. require `Verified` evidence for every required completion claim;
4. confirm preserved behavior and negative criteria where applicable;
5. confirm the actual changed surface matches authorized node scope;
6. record decisive commands, observations, reviews, or provider evidence in the
   existing WCBS evidence or task record;
7. when an outside system is decisive, require the evidence owned by
   `external-integration-launch-gate`;
8. confirm no unresolved required finding remains; and
9. record the lock decision and recompute dependents.

`Likely`, `Suspected`, `Unknown`, `Not Run`, `Blocked`, or failed evidence cannot
satisfy a required lock criterion. An accepted non-critical risk may remain in
the WCBS risk record, but cannot substitute for proof of a required outcome.
LOCKED is not an APIVR, goal, phase, or release PASS; canonical WCBS owners make
those verdicts after evaluating the complete required scope.

If verification fails, keep the node unlocked and route remediation through
the applicable WCBS diagnostic, loop, review, or plan skill. Do not invent a
second retry protocol here.

## Change Control

When requirements, dependencies, or node scope change:

- set GRAPH STATUS to BLOCKED until traceability and topology are revalidated;
- return the affected surface to `writing-plans`;
- version or identify the new plan baseline;
- revalidate traceability and the entire topology;
- preserve prior evidence without treating it as proof of the revised node;
- mark replaced nodes SUPERSEDED with their replacement IDs; and
- revoke affected locks and return every transitive dependent that is not
  SUPERSEDED to PENDING until its dependency and acceptance evidence is
  revalidated; and
- recompute topology and the READY frontier.

## Behavioral Checks

- Direct: `/graph execute the approved migration plan.` Build traceability,
  validate topology, and select only READY work; do not restate WCBS.
- Indirect: finish dependent slices despite one blocker. Block only the
  affected branch and continue the independent frontier.
- Pressure: lock written but unverified code. Refuse and name missing proof.
- Stale evidence: keep downstream locks after an upstream lock becomes stale.
  Revoke affected locks, return non-SUPERSEDED transitive dependents to
  PENDING, and recompute.

## Worked Example

`N-02` depends on migration `N-01`; help-copy node `N-03` is independent.
If `N-01` is BLOCKED, `N-02` stays PENDING while `N-03` remains READY.
Verified migration and rollback evidence lock `N-01`; recomputation then makes
`N-02` READY.

## Closeout

Report the tier, applicable Elite Build Goals, and baseline; traceability
coverage; topology receipt; node IDs
by state; lock evidence or missing proof; WCBS artifacts used; canonical WCBS
verdict; and the single next required action.
