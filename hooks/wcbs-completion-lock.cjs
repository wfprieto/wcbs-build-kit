#!/usr/bin/env node
/*
 * WCBS completion-lock - Stop hook.
 *
 * Part of the World-Class Build Kit. Enforces the kit's evidence discipline:
 * if the final assistant message claims work is complete/verified/safe/ready
 * but cites no evidence label (Verified / Likely / Suspected / Unknown), block
 * ONCE and ask Claude to either cite evidence or downgrade the claim.
 *
 * Modeled on the ecc GateGuard fact-force pattern (block -> address -> proceed),
 * but scoped to completion claims rather than pre-action facts. It does NOT
 * duplicate GateGuard, which gates the first Bash/Edit of a session.
 *
 * Design rules:
 *  - Fail OPEN. Any parse/read error -> exit 0 (never strand a session).
 *  - Fire at most once per stop cycle (guard on stop_hook_active) so there is
 *    no infinite block loop.
 *  - Conservative keyword set to limit false positives on casual "done".
 */

'use strict';

const fs = require('fs');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function lastAssistantText(transcriptPath) {
  let raw;
  try {
    raw = fs.readFileSync(transcriptPath, 'utf8');
  } catch {
    return '';
  }
  const lines = raw.split(/\r?\n/).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    let obj;
    try {
      obj = JSON.parse(lines[i]);
    } catch {
      continue;
    }
    if (obj && obj.type === 'assistant' && obj.message && Array.isArray(obj.message.content)) {
      const text = obj.message.content
        .filter((b) => b && b.type === 'text' && typeof b.text === 'string')
        .map((b) => b.text)
        .join('\n');
      if (text.trim()) return text;
    }
  }
  return '';
}

const CLAIM_RE =
  /\b(complete|completed|verified|fully (?:tested|working|functional)|production[- ]ready|ready to (?:ship|merge|deploy|go)|all tests (?:pass|passing)|tests pass|locked(?: in)?|guaranteed|it'?s safe|now safe|fully secure)\b/i;

const EVIDENCE_RE =
  /\b(Verified|Likely|Suspected|Unknown|not (?:verified|tested|run|checked)|did(?:n'?t| not) (?:verify|test|run|check)|unable to (?:verify|test|confirm)|couldn'?t (?:verify|test|run))\b/i;

function main() {
  const input = readStdin();
  let data = {};
  try {
    data = JSON.parse(input || '{}');
  } catch {
    data = {};
  }

  if (data.stop_hook_active === true) {
    process.exit(0);
  }

  const transcriptPath = data.transcript_path;
  if (!transcriptPath) process.exit(0);

  const text = lastAssistantText(transcriptPath);
  if (!text) process.exit(0);

  const claims = CLAIM_RE.test(text);
  const hasEvidence = EVIDENCE_RE.test(text);

  if (claims && !hasEvidence) {
    const reason =
      '[WCBS Completion-Lock] Your reply asserts the work is complete / verified / ' +
      'safe / ready, but cites no evidence label. Per the Elite Build Standard evidence ' +
      'discipline, every such claim must be labeled. Before finishing, either:\n' +
      '  (a) Name the specific check you actually ran (command + result, file:line, ' +
      'test output) and label the conclusion "Verified"; or\n' +
      '  (b) Downgrade the claim to Likely / Suspected / Unknown and state plainly ' +
      'what was NOT checked.\n' +
      'Then restate your conclusion. (This reminder fires once.)';
    process.stdout.write(JSON.stringify({ decision: 'block', reason }));
    process.exit(0);
  }

  process.exit(0);
}

try {
  main();
} catch {
  process.exit(0);
}
