import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topResolvable } from './unknowns.mjs';

test('selects the web-resolvable unknowns ranked by leverage, capped at 3', () => {
  const picked = topResolvable([
    { text: 'CAC by channel', leverage: 5, webResolvable: true },
    { text: 'Founder grit', leverage: 9, webResolvable: false },
    { text: 'Market size', leverage: 8, webResolvable: true },
    { text: 'Churn benchmark', leverage: 6, webResolvable: true },
    { text: 'Regulatory regime', leverage: 7, webResolvable: true },
  ]);

  assert.deepEqual(
    picked.map((u) => u.text),
    ['Market size', 'Regulatory regime', 'Churn benchmark'],
  );
});

test('returns fewer than n when not enough are web-resolvable, excluding the rest', () => {
  const picked = topResolvable([
    { text: 'Market size', leverage: 8, webResolvable: true },
    { text: 'Founder grit', leverage: 9, webResolvable: false },
  ]);
  assert.deepEqual(picked.map((u) => u.text), ['Market size']);
});
