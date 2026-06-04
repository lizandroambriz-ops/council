import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sessionId, buildMeta, markAbandoned } from './session.mjs';

test('formats a Date into a zero-padded YYYYMMDDTHHMMSS id (UTC)', () => {
  const d = new Date(Date.UTC(2026, 4, 24, 14, 30, 22)); // 2026-05-24 14:30:22Z
  assert.equal(sessionId(d), '20260524T143022');

  const early = new Date(Date.UTC(2026, 0, 3, 4, 5, 6)); // single-digit fields
  assert.equal(sessionId(early), '20260103T040506');
});

test('buildMeta carries the session fields and defaults abandoned to false', () => {
  const meta = buildMeta({
    idea: 'hot sauce box',
    model: 'opus-4-7',
    effort: 'standard',
    createdAt: '20260524T143022',
    stakes: 'quitting my job over this',
  });
  assert.equal(meta.idea, 'hot sauce box');
  assert.equal(meta.effort, 'standard');
  assert.equal(meta.abandoned, false);
});

test('markAbandoned sets the flag and is idempotent', () => {
  const meta = buildMeta({ idea: 'x', model: 'm', effort: 'quick', createdAt: 't', stakes: 's' });
  const once = markAbandoned(meta);
  assert.equal(once.abandoned, true);
  assert.equal(markAbandoned(once).abandoned, true);
  assert.equal(meta.abandoned, false); // original not mutated
});
