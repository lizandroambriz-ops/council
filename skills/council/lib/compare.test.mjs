import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tallyPreferences, buildComparisonVerdict } from './compare.mjs';

test('counts seat preferences and declares the majority winner', () => {
  const result = tallyPreferences([
    { seat: 'The Adversary', prefers: 'A' },
    { seat: 'The Pre-Mortem', prefers: 'B' },
    { seat: 'The Resource Realist', prefers: 'A' },
  ]);

  assert.equal(result.a, 2);
  assert.equal(result.b, 1);
  assert.equal(result.winner, 'A');
  assert.equal(result.tie, false);
});

test('declares a tie with no winner when preferences are even', () => {
  const result = tallyPreferences([
    { seat: 's1', prefers: 'A' },
    { seat: 's2', prefers: 'B' },
  ]);
  assert.equal(result.winner, null);
  assert.equal(result.tie, true);

  const empty = tallyPreferences([]);
  assert.equal(empty.winner, null);
  assert.equal(empty.tie, true);
});

test('ignores seats with no A/B preference in the tally', () => {
  const result = tallyPreferences([
    { seat: 's1', prefers: 'A' },
    { seat: 's2', prefers: 'none' },
    { seat: 's3' },
  ]);
  assert.equal(result.a, 1);
  assert.equal(result.b, 0);
  assert.equal(result.winner, 'A');
});

test('buildComparisonVerdict bundles tally, winner and per-option cases', () => {
  const verdict = buildComparisonVerdict([
    { seat: 'The Adversary', prefers: 'A', reason: 'A has a clearer wedge' },
    { seat: 'The Pre-Mortem', prefers: 'B', reason: 'B fails less catastrophically' },
    { seat: 'The Resource Realist', prefers: 'A', reason: 'A is cheaper to first proof' },
  ]);

  assert.deepEqual(verdict.tally, { a: 2, b: 1 });
  assert.equal(verdict.winner, 'A');
  assert.equal(verdict.tie, false);
  assert.deepEqual(verdict.casesForA, [
    { seat: 'The Adversary', reason: 'A has a clearer wedge' },
    { seat: 'The Resource Realist', reason: 'A is cheaper to first proof' },
  ]);
  assert.deepEqual(verdict.casesForB, [
    { seat: 'The Pre-Mortem', reason: 'B fails less catastrophically' },
  ]);
});
