import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aggregateScores } from './scores.mjs';

test('aggregates the mean of each dimension across seats', () => {
  const seats = [
    { seat: 'adversary', feasibility: 2, differentiation: 4, upside: 5 },
    { seat: 'pre-mortem', feasibility: 4, differentiation: 4, upside: 3 },
  ];

  const grid = aggregateScores(seats);

  assert.equal(grid.feasibility.mean, 3);
  assert.equal(grid.differentiation.mean, 4);
  assert.equal(grid.upside.mean, 4);
});

test('reports population variance and flags dimensions with variance > 1.0', () => {
  const seats = [
    { seat: 'a', feasibility: 1, differentiation: 4, upside: 3 },
    { seat: 'b', feasibility: 5, differentiation: 4, upside: 3 },
  ];

  const grid = aggregateScores(seats);

  // feasibility [1,5]: mean 3, deviations ±2 → variance 4.0
  assert.equal(grid.feasibility.variance, 4);
  assert.equal(grid.feasibility.highVariance, true);

  // differentiation/upside are unanimous → variance 0, not flagged
  assert.equal(grid.differentiation.variance, 0);
  assert.equal(grid.differentiation.highVariance, false);
});

test('does not flag a dimension whose variance is exactly 1.0', () => {
  const seats = [
    { seat: 'a', feasibility: 2, differentiation: 3, upside: 3 },
    { seat: 'b', feasibility: 4, differentiation: 3, upside: 3 },
  ];

  const grid = aggregateScores(seats);

  // feasibility [2,4]: variance exactly 1.0 → strict > means not flagged
  assert.equal(grid.feasibility.variance, 1);
  assert.equal(grid.feasibility.highVariance, false);
});

test('a single-seat bench has zero variance and no flags', () => {
  const grid = aggregateScores([
    { seat: 'adversary', feasibility: 3, differentiation: 5, upside: 2 },
  ]);

  assert.deepEqual(grid.feasibility, { mean: 3, variance: 0, highVariance: false });
  assert.deepEqual(grid.differentiation, { mean: 5, variance: 0, highVariance: false });
  assert.deepEqual(grid.upside, { mean: 2, variance: 0, highVariance: false });
});

test('rejects an empty bench instead of producing NaN means', () => {
  assert.throws(() => aggregateScores([]), /at least one seat/i);
});
