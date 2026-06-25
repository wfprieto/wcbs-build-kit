#!/usr/bin/env node
/*
 * WCBS ScrumMaster-3 challenge - PreToolUse hook (Write|Edit|MultiEdit).
 *
 * When an edit targets a RISKY surface (auth / data / migration / payments),
 * inject the ScrumMaster-3 challenge by DENYING the tool call once, with the
 * challenge as the reason. The model addresses it, retries the same edit, and
 * the retry is allowed (a per-session-per-file marker records that the file was
 * already challenged). This mirrors the ecc GateGuard "block -> address ->
 * retry" pattern; it self-challenges Claude rather than interrupting the user.
 *
 * Design rules:
 *  - Fail OPEN. Any error -> allow (exit 0). A global PreToolUse hook must never
 *    block legitimate work because of its own bug.
 *  - Challenge each risky file at most ONCE per session (marker file).
 *  - Non-risky paths pass through silently.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

// Risky-surface patterns matched against the target file path.
const RISKY = [
  /(?:^|[\\/_.-])(auth|login|signin|signup|session|token|password|passwd|credential|secret|oauth|jwt|saml|sso)(?:[\\/_.-]|$)/i,
  /(?:^|[\\/_.-])(migration|migrations|migrate|schema)(?:[\\/_.-]|$)/i,
  /\.sql$/i,
  /(?:^|[\\/_.-])(payment|payments|billing|stripe|charge|invoice|checkout|refund|paypal|subscription)(?:[\\/_.-]|$)/i,
  /(?:^|[\\/_.-])(webhook|webhooks)(?:[\\/_.-]|$)/i,
];

function isRisky(filePath) {
  if (!filePath || typeof filePath !== 'string') return false;
  return RISKY.some((re) => re.test(filePath));
}

function markerPath(sessionId, filePath) {
  const dir = path.join(os.tmpdir(), 'wcbs-sm3', String(sessionId || 'nosession'));
  const key = crypto.createHash('sha1').update(String(filePath)).digest('hex');
  return { dir, file: path.join(dir, key) };
}

function allow() {
  // No output + exit 0 = no opinion; the normal permission flow proceeds.
  process.exit(0);
}

function main() {
  const input = readStdin();
  let data = {};
  try {
    data = JSON.parse(input || '{}');
  } catch {
    return allow();
  }

  const tool = data.tool_name;
  if (tool !== 'Write' && tool !== 'Edit' && tool !== 'MultiEdit') return allow();

  const filePath = data.tool_input && data.tool_input.file_path;
  if (!isRisky(filePath)) return allow();

  // Already challenged this file this session? Let it through.
  const { dir, file } = markerPath(data.session_id, filePath);
  try {
    if (fs.existsSync(file)) return allow();
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, '1');
  } catch {
    // If we cannot persist the marker, do not risk a permanent block: allow.
    return allow();
  }

  const reason =
    '[WCBS ScrumMaster-3 Challenge] This edit touches a risky surface (' +
    filePath +
    '). Before it proceeds, answer briefly:\n' +
    '  1) Root cause: what exactly changes, and is this the cause or a symptom?\n' +
    '  2) Blast radius: what existing behavior could break, and how is it preserved?\n' +
    '  3) Security/data: server-side authz, input validation, and data integrity - handled?\n' +
    '  4) Proof: what evidence will show it works (not "looks right")?\n' +
    'Address these, then retry the SAME edit - this challenge fires once per file per session.';

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    })
  );
  process.exit(0);
}

try {
  main();
} catch {
  allow();
}
