import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { validateAgainstSchema } from "../lib/json-schema.mjs";

const root = process.cwd();
const json = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const expected = ["DISCOVER", "VALIDATE", "VALIDATE_RUNTIME", "LOAD_AUTHORITY", "LOAD_GOVERNANCE", "INITIALIZE_STATE", "CLASSIFY_PROJECT", "RESOLVE_CAPABILITIES", "ASSEMBLE_TEAM", "RUN_PREFLIGHT", "CERTIFY", "HAND_OFF_TO_LIFECYCLE"];

// Structural drift control, not behavioral evidence.
test("Controller schema and state graph remain complete", () => {
  const controller = json("00_start_here/bootstrap-controller.json");
  const schema = json("runtime_adapters/schemas/bootstrap-controller.schema.json");
  assert.deepEqual(validateAgainstSchema(schema, controller), []);
  assert.deepEqual(controller.states.map(x => x.id), expected);
  assert.equal(controller.states.length, 12);
  const ids = new Set(expected);
  for (const state of controller.states) {
    for (const key of ["entry_conditions", "required_inputs", "produced_artifacts", "failure_conditions", "recovery_behavior", "evidence_produced", "allowed_transitions"])
      assert.ok(Array.isArray(state[key]), `${state.id}.${key} must be an array`);
    assert.equal(typeof state.blocking, "boolean");
    for (const next of state.allowed_transitions) assert.ok(ids.has(next), `${state.id} has unknown transition ${next}`);
  }
});

test("Controller graph is acyclic and reaches lifecycle handoff", () => {
  const controller = json("00_start_here/bootstrap-controller.json");
  const byId = new Map(controller.states.map(x => [x.id, x]));
  const visited = new Set();
  const stack = new Set();
  const walk = id => {
    if (stack.has(id)) assert.fail(`cycle detected at ${id}`);
    if (visited.has(id)) return;
    stack.add(id);
    for (const next of byId.get(id).allowed_transitions) walk(next);
    stack.delete(id);
    visited.add(id);
  };
  walk("DISCOVER");
  assert.ok(visited.has("HAND_OFF_TO_LIFECYCLE"));
});
