import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import {
  writeArtifact,
  readArtifact,
  presentArtifacts,
  listSeatOutputs,
  writeDone,
  isDone,
  markSessionAbandoned,
  scanSessions,
} from './checkpoint.mjs';
import { selectResume, lastCompletedPhase } from './resume.mjs';

function withTmp(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'council-ckpt-'));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('writeArtifact then readArtifact round-trips a JSON artifact', () => {
  withTmp((dir) => {
    const session = join(dir, '20260524T143022');
    writeArtifact(session, 'meta.json', { idea: 'hot sauce box', abandoned: false });
    const meta = readArtifact(session, 'meta.json');
    assert.equal(meta.idea, 'hot sauce box');
    assert.equal(meta.abandoned, false);
  });
});

test('writes and reads a non-JSON (markdown) artifact verbatim', () => {
  withTmp((dir) => {
    const session = join(dir, 's1');
    writeArtifact(session, 'verdict.md', '## 1. Restatement\nShould we launch?');
    assert.equal(readArtifact(session, 'verdict.md'), '## 1. Restatement\nShould we launch?');
  });
});

test('listSeatOutputs returns the keys of checkpointed seats', () => {
  withTmp((dir) => {
    const session = join(dir, 's1');
    writeArtifact(session, 'seat__adversary.json', { key: 'adversary' });
    writeArtifact(session, 'seat__b2b-sales.json', { key: 'b2b-sales' });
    writeArtifact(session, 'meta.json', { idea: 'x' });
    assert.deepEqual(listSeatOutputs(session).sort(), ['adversary', 'b2b-sales']);
  });
});

test('writeDone / isDone mark a session complete', () => {
  withTmp((dir) => {
    const session = join(dir, 's1');
    writeArtifact(session, 'meta.json', { idea: 'x' });
    assert.equal(isDone(session), false);
    writeDone(session);
    assert.equal(isDone(session), true);
  });
});

test('markSessionAbandoned flips the flag in meta.json', () => {
  withTmp((dir) => {
    const session = join(dir, 's1');
    writeArtifact(session, 'meta.json', { idea: 'x', abandoned: false });
    markSessionAbandoned(session);
    assert.equal(readArtifact(session, 'meta.json').abandoned, true);
  });
});

test('presentArtifacts returns [] for a missing session and scanSessions [] for a missing root', () => {
  withTmp((dir) => {
    assert.deepEqual(presentArtifacts(join(dir, 'nope')), []);
    assert.deepEqual(scanSessions(join(dir, 'no-root')), []);
  });
});

test('scanSessions output drives selectResume and lastCompletedPhase end-to-end', () => {
  withTmp((dir) => {
    const root = join(dir, 'checkpoints');

    // a completed session
    const done = join(root, '20260101T000000');
    writeArtifact(done, 'meta.json', { idea: 'done one', abandoned: false });
    writeDone(done);

    // an abandoned session
    const quit = join(root, '20260201T000000');
    writeArtifact(quit, 'meta.json', { idea: 'quit one', abandoned: true });

    // a live, mid-research session
    const live = join(root, '20260301T000000');
    writeArtifact(live, 'meta.json', { idea: 'live one', abandoned: false });
    writeArtifact(live, 'prebrief.json', [['q', 'a']]);
    writeArtifact(live, 'seats.json', { permanent: [], dynamic: [] });
    writeArtifact(live, 'seat__adversary.json', { key: 'adversary' });

    const sessions = scanSessions(root);
    const decision = selectResume(sessions);
    assert.equal(decision.action, 'resume');
    assert.equal(decision.session.id, '20260301T000000');
    assert.equal(lastCompletedPhase(decision.session.files), 'research');
  });
});
