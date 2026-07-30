import test from 'node:test';
import assert from 'node:assert/strict';
import { TaskStore } from '../src/task-store.mjs';

 test('adds, lists, and completes tasks', () => {
  const store = new TaskStore();
  const first = store.add({ title: 'Write release notes', priority: 'high' });
  const second = store.add({ title: 'Run smoke tests' });
  assert.equal(first.id, 1);
  assert.equal(second.priority, 'normal');
  assert.deepEqual(store.list({ completed: false }).map((task) => task.id), [1, 2]);
  assert.equal(store.complete(1), true);
  assert.deepEqual(store.list({ completed: true }).map((task) => task.id), [1]);
});

test('rejects invalid task input', () => {
  const store = new TaskStore();
  assert.throws(() => store.add({ title: '' }), /title is required/);
  assert.throws(() => store.add({ title: 'Ship', priority: 'urgent' }), /invalid priority/);
});

test('returns defensive copies', () => {
  const store = new TaskStore([{ id: 1, title: 'Original', priority: 'normal', completed: false }]);
  const listed = store.list();
  listed[0].title = 'Mutated';
  assert.equal(store.list()[0].title, 'Original');
});
