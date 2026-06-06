import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordOutcome, sessionOutcomeStatus } from './outcomes.mjs';

test('records a new outcome with action, status, note and timestamp', () => {
  const next = recordOutcome([], {
    action: 'Validate demand with 5 customer interviews',
    status: 'taken',
    note: 'Did 6, strong interest',
    recordedAt: '20260525T100000',
  });

  assert.equal(next.length, 1);
  assert.deepEqual(next[0], {
    action: 'Validate demand with 5 customer interviews',
    status: 'taken',
    note: 'Did 6, strong interest',
    recordedAt: '20260525T100000',
  });
});

test('rejects a status outside taken/skipped/pending', () => {
  assert.throws(
    () => recordOutcome([], { action: 'x', status: 'maybe', recordedAt: 't' }),
    /invalid outcome status/i,
  );
});

test('re-recording the same action updates instead of duplicating', () => {
  const first = recordOutcome([], { action: 'Ship MVP', status: 'pending', recordedAt: 't1' });
  const second = recordOutcome(first, { action: 'Ship MVP', status: 'taken', note: 'done', recordedAt: 't2' });

  assert.equal(second.length, 1);
  assert.equal(second[0].status, 'taken');
  assert.equal(second[0].recordedAt, 't2');
});

test('session status rolls up across all recommended actions', () => {
  const actions = ['A', 'B', 'C'];

  assert.equal(sessionOutcomeStatus(actions, []), 'pending');

  const some = recordOutcome([], { action: 'A', status: 'taken', recordedAt: 't' });
  assert.equal(sessionOutcomeStatus(actions, some), 'partially recorded');

  // a pending-status entry does not count as recorded
  const withPending = recordOutcome(some, { action: 'B', status: 'pending', recordedAt: 't' });
  assert.equal(sessionOutcomeStatus(actions, withPending), 'partially recorded');

  let all = recordOutcome(withPending, { action: 'B', status: 'skipped', recordedAt: 't' });
  all = recordOutcome(all, { action: 'C', status: 'taken', recordedAt: 't' });
  assert.equal(sessionOutcomeStatus(actions, all), 'fully recorded');
});
