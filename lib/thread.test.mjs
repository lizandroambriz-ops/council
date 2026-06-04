import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatThreadEntry, recentEntries } from './thread.mjs';

const sample = {
  date: '2026-05-25',
  idea: 'A subscription box for artisanal hot sauce',
  confidence: 'Medium',
  scores: { feasibility: 3, differentiation: 4, upside: 3.5 },
  firstAction: 'Interview 5 hot-sauce subscribers',
  topUnknowns: ['CAC unknown', 'churn unknown', 'supply reliability'],
  outcomes: [],
};

test('formats an entry carrying date, idea, confidence, scores and first action', () => {
  const entry = formatThreadEntry(sample);

  assert.match(entry, /2026-05-25/);
  assert.match(entry, /artisanal hot sauce/);
  assert.match(entry, /Medium/);
  assert.match(entry, /3\.0/); // feasibility rendered to one decimal
  assert.match(entry, /4\.0/);
  assert.match(entry, /Interview 5 hot-sauce subscribers/);
});

test('lists top unknowns and stays within 5-7 lines', () => {
  const entry = formatThreadEntry(sample);
  assert.match(entry, /CAC unknown/);
  const lines = entry.split('\n').filter((l) => l.trim());
  assert.ok(lines.length >= 5 && lines.length <= 7, `got ${lines.length} lines`);
});

test('says "none recorded" with no outcomes and lists them when present', () => {
  assert.match(formatThreadEntry(sample), /Outcomes: none recorded/);

  const withOutcomes = formatThreadEntry({
    ...sample,
    outcomes: [{ action: 'Interview 5 hot-sauce subscribers', status: 'taken' }],
  });
  assert.match(withOutcomes, /Interview 5 hot-sauce subscribers — taken/);
});

test('recentEntries returns up to n entries, newest first', () => {
  const thread = [
    formatThreadEntry({ ...sample, date: '2026-01-01', idea: 'first' }),
    formatThreadEntry({ ...sample, date: '2026-02-01', idea: 'second' }),
    formatThreadEntry({ ...sample, date: '2026-03-01', idea: 'third' }),
  ].join('\n\n');

  const recent = recentEntries(thread, 2);
  assert.equal(recent.length, 2);
  assert.match(recent[0], /third/);
  assert.match(recent[1], /second/);

  assert.equal(recentEntries(thread, 5).length, 3); // fewer than n → all
});
