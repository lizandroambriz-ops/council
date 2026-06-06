import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  estimateEffort,
  estimateAll,
  seatCount,
  effortProfile,
  PERMANENT_SEATS,
} from './estimate.mjs';

test('estimateAll returns all three tiers, monotonically increasing in mid tokens', () => {
  const all = estimateAll();
  assert.ok(all.quick && all.standard && all.deep);
  assert.ok(all.quick.tokens.mid < all.standard.tokens.mid);
  assert.ok(all.standard.tokens.mid < all.deep.tokens.mid);
});

test('only the tiers that run cross-exam / resolve carry those costs', () => {
  const all = estimateAll();
  assert.equal(all.quick.breakdown.crossExam, 0);
  assert.equal(all.quick.breakdown.resolve, 0);
  assert.equal(all.standard.breakdown.crossExam, 0);
  assert.ok(all.standard.breakdown.resolve > 0);
  assert.ok(all.deep.breakdown.crossExam > 0);
  assert.ok(all.deep.breakdown.resolve > 0);
});

test('token band is ordered low < mid < high', () => {
  const e = estimateEffort('standard');
  assert.ok(e.tokens.low < e.tokens.mid);
  assert.ok(e.tokens.mid < e.tokens.high);
});

test('seatCount adds the permanent seats and honours a dynamic override', () => {
  assert.equal(seatCount('standard'), PERMANENT_SEATS + 4);
  assert.equal(seatCount('standard', 7), PERMANENT_SEATS + 7);
});

test('a larger real seat count raises the research term and the total', () => {
  const base = estimateEffort('standard');
  const bigger = estimateEffort('standard', { dynamicSeats: 7 });
  assert.ok(bigger.breakdown.research > base.breakdown.research);
  assert.ok(bigger.tokens.mid > base.tokens.mid);
  assert.equal(bigger.seats, PERMANENT_SEATS + 7);
});

test('labels are human-readable', () => {
  const e = estimateEffort('deep');
  assert.match(e.tokensLabel, /tokens$/);
  assert.match(e.walltimeLabel, /min$/);
});

test('unknown effort throws', () => {
  assert.throws(() => effortProfile('turbo'), /unknown effort/i);
  assert.throws(() => estimateEffort('turbo'), /unknown effort/i);
});
