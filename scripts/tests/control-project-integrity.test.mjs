import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'evals/control-project-manifest.json'), 'utf8'));
const projectRoot = path.join(root, manifest.root);

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function walk(relative = '') {
  const directory = path.join(projectRoot, relative);
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const child = path.posix.join(relative.replaceAll('\\', '/'), entry.name);
    return entry.isDirectory() ? walk(child) : [child];
  });
}

test('control project exactly matches its preregistered manifest', () => {
  const declared = manifest.files.map((entry) => entry.path).sort();
  const actual = walk().sort();
  assert.deepEqual(actual, declared, 'control project file set drifted');
  for (const entry of manifest.files) assert.equal(sha256(path.join(projectRoot, entry.path)), entry.sha256, `${entry.path} content drifted`);
});

test('generated control-project manifest is current', () => {
  const result = spawnSync(process.execPath, ['scripts/generate-control-manifest.mjs', '--check'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
});

test('baseline control project contains no EOS contamination entry', () => {
  for (const entry of manifest.forbidden_baseline_entries) assert.equal(fs.existsSync(path.join(projectRoot, entry)), false, `baseline contamination found: ${entry}`);
});

test('control project tests pass in isolation', () => {
  const result = spawnSync(process.execPath, ['--test', 'test/task-store.test.mjs'], { cwd: projectRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
});
