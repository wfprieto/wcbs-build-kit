// Local WCBS audit fixtures only. No upstream executable is imported or run.
// Run from the WCBS root: node docs/upstream/reviews/2026-11-25-superpowers-probes.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import crypto from 'node:crypto';
const root = process.cwd();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'wcbs-upstream-review-'));
const results = [];
function brief(name, body, task) {
  const dir = path.join(temporary, name);
  fs.mkdirSync(dir);
  const plan = path.join(dir, 'plan.md');
  const output = path.join(dir, 'briefs');
  fs.writeFileSync(plan, body);
  const command = ['scripts/task-brief.mjs', '--plan', '<fixture>/plan.md', '--task', task, '--out-dir', '<fixture>/briefs'];
  const r = spawnSync(process.execPath, [path.join(root, 'scripts/task-brief.mjs'), '--plan', plan, '--task', task, '--out-dir', output], { cwd: dir, encoding: 'utf8' });
  const file = path.join(output, `task-${task}-brief.md`);
  return { command, exit_code: r.status, stderr: r.stderr, brief: fs.existsSync(file) ? fs.readFileSync(file, 'utf8').replaceAll(plan, '<fixture>/plan.md') : null };
}
try {
  const prefix = brief('prefix', '# Fixture\n\n## Task 6b: Neighbor\nWRONG_TASK\n\n## Task 6: Intended\nINTENDED_TASK\n', '6');
  assert.equal(prefix.exit_code, 0);
  assert.ok(prefix.brief.includes('WRONG_TASK') && !prefix.brief.includes('INTENDED_TASK'));
  results.push({ id: 'task-id-prefix', scope: 'Executed local WCBS CLI fixture; not an upstream or vendor runtime test', observed: 'Task 6 selected Task 6b instead', ...prefix });
  const fence = brief('fence', '# Fixture\n\n## Task A1: Intended\n```text\n## Task A2: Hidden heading\nNOT_AN_ACTUAL_TASK_BOUNDARY\n', 'A1');
  assert.equal(fence.exit_code, 0);
  assert.ok(fence.brief.includes('```text') && !fence.brief.includes('NOT_AN_ACTUAL_TASK_BOUNDARY'));
  results.push({ id: 'unclosed-code-fence', scope: 'Executed local WCBS CLI fixture', observed: 'Accepted malformed plan and cut the selected section at a fenced heading', ...fence });
  const { WCBSPlugin } = await import(pathToFileURL(path.join(root, '.opencode/plugins/wcbs.js')));
  const plugin = await WCBSPlugin();
  const normal = { messages: [{ info: { role: 'user' }, parts: [{ type: 'text', text: 'Inspect this project.' }] }] };
  await plugin['experimental.chat.messages.transform']({}, normal);
  assert.equal(normal.messages[0].parts.length, 2);
  const mentioned = { messages: [{ info: { role: 'user' }, parts: [{ type: 'text', text: 'Explain the literal token WCBS_KIT_ACTIVE:opencode.' }] }] };
  await plugin['experimental.chat.messages.transform']({}, mentioned);
  assert.equal(mentioned.messages[0].parts.length, 1);
  results.push({ id: 'opencode-marker-mention', scope: 'Local adapter callback stub only; OpenCode runtime Not Run', observed: 'Ordinary prompt receives bootstrap; mentioning the marker suppresses it', ordinary_part_count: 2, marker_mention_part_count: 1 });
  const events = new Map();
  const { default: piExtension } = await import(pathToFileURL(path.join(root, '.pi/extensions/wcbs.ts')));
  piExtension({ on(name, callback) { events.set(name, callback); } });
  const input = { messages: [{ role: 'user', content: [{ type: 'text', text: 'Inspect this project.' }] }] };
  assert.ok(await events.get('context')(input));
  await events.get('agent_end')();
  assert.equal(await events.get('context')(input), undefined);
  results.push({ id: 'pi-later-turn', scope: 'Local adapter callback stub only; Pi runtime Not Run', observed: 'Bootstrap context produced before agent_end and omitted afterward on a fresh context input', first_context_returned: true, later_context_returned: false, resources_discover_registered: events.has('resources_discover') });
  const identity = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' });
  assert.equal(identity.status, 0);
  const audited_files = ['scripts/task-brief.mjs', '.opencode/plugins/wcbs.js', '.pi/extensions/wcbs.ts'].map(file => ({ file, sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex') }));
  console.log(JSON.stringify({ wcbs_source_commit: identity.stdout.trim(), audited_files, node_version: process.version, fixture_assertions: 'Passed: observations reproduced; these are gaps, not compatibility passes', results }, null, 2));
} finally {
  const resolved = path.resolve(temporary);
  assert.ok(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep));
  fs.rmSync(resolved, { recursive: true, force: true });
}
