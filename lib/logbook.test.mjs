import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderLogbook } from './logbook.mjs';

const row = (over = {}) => ({
  id: '20260525T100000',
  date: '2026-05-25',
  idea: 'Subscription box for artisanal hot sauce',
  confidence: 'Medium',
  scores: { feasibility: 3, differentiation: 4, upside: 3.5 },
  firstAction: 'Interview 5 subscribers',
  outcomeStatus: 'pending',
  ...over,
});

test('renders a session row with its key fields', () => {
  const out = renderLogbook([row()]);
  assert.match(out, /2026-05-25/);
  assert.match(out, /artisanal hot sauce/);
  assert.match(out, /Medium/);
  assert.match(out, /Interview 5 subscribers/);
  assert.match(out, /pending/);
});

test('orders sessions reverse-chronologically', () => {
  const out = renderLogbook([
    row({ date: '2026-01-01', idea: 'oldest' }),
    row({ date: '2026-06-01', idea: 'newest' }),
    row({ date: '2026-03-01', idea: 'middle' }),
  ]);
  const order = ['newest', 'middle', 'oldest'].map((s) => out.indexOf(s));
  assert.ok(order[0] < order[1] && order[1] < order[2], `order was ${order}`);
});

test('truncates the idea excerpt to 80 characters with an ellipsis', () => {
  const long = 'x'.repeat(200);
  const out = renderLogbook([row({ idea: long })]);
  assert.match(out, new RegExp('x{80}…'));
  assert.ok(!out.includes('x'.repeat(81)));
});

test('shows a friendly message when there are no sessions', () => {
  assert.match(renderLogbook([]), /no completed sessions/i);
});
