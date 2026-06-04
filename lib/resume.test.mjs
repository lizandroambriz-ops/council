import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectResume, lastCompletedPhase } from './resume.mjs';

test('auto-resumes when exactly one session is neither done nor abandoned', () => {
  const result = selectResume([
    { id: '20260524T143022', done: false, abandoned: false },
  ]);

  assert.equal(result.action, 'resume');
  assert.equal(result.session.id, '20260524T143022');
});

test('falls through to the menu when no session is resumable', () => {
  assert.equal(selectResume([]).action, 'menu');

  const allClosed = selectResume([
    { id: 'a', done: true, abandoned: false },
    { id: 'b', done: false, abandoned: true },
  ]);
  assert.equal(allClosed.action, 'menu');
});

test('shows a picker of only the resumable sessions when several exist', () => {
  const result = selectResume([
    { id: 'a', done: false, abandoned: false },
    { id: 'b', done: true, abandoned: false },
    { id: 'c', done: false, abandoned: false },
  ]);

  assert.equal(result.action, 'picker');
  assert.deepEqual(result.sessions.map((s) => s.id), ['a', 'c']);
});

test('auto-resumes the lone live session even amid done and abandoned ones', () => {
  const result = selectResume([
    { id: 'done', done: true, abandoned: false },
    { id: 'quit', done: false, abandoned: true },
    { id: 'live', done: false, abandoned: false },
  ]);

  assert.equal(result.action, 'resume');
  assert.equal(result.session.id, 'live');
});

test('reports the furthest-along phase from the present artifacts', () => {
  assert.equal(lastCompletedPhase([]), null);

  // mid-research: prebrief + casting done, one seat checkpointed
  assert.equal(
    lastCompletedPhase(['meta.json', 'prebrief.json', 'seats.json', 'seat__adversary.json']),
    'research',
  );

  // verdict written but resolve not yet → chair is furthest
  assert.equal(
    lastCompletedPhase(['prebrief.json', 'seats.json', 'seat__adversary.json', 'verdict.md']),
    'chair',
  );
});
