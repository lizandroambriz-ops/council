import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBench, seatKey, PERMANENT_SEATS } from './bench.mjs';

test('the bench always includes the three permanent seats', () => {
  const bench = buildBench([]);
  assert.deepEqual(
    bench.permanent.map((s) => s.name),
    ['The Adversary', 'The Pre-Mortem', 'The Resource Realist'],
  );
  assert.equal(PERMANENT_SEATS.length, 3);
});

test('dynamic seats get a derived key, dynamic role, and carry lens/format', () => {
  const bench = buildBench([
    { name: 'B2B Sales Operator', background: '15y enterprise sales', lens: 'go-to-market', format: 'qualitative' },
  ]);
  assert.equal(bench.dynamic.length, 1);
  assert.deepEqual(bench.dynamic[0], {
    key: 'b2b-sales-operator',
    name: 'B2B Sales Operator',
    role: 'dynamic',
    background: '15y enterprise sales',
    lens: 'go-to-market',
    format: 'qualitative',
  });
});

test('rejects a dynamic seat with an unknown format type', () => {
  assert.throws(
    () => buildBench([{ name: 'X', lens: 'y', format: 'vibes' }]),
    /invalid dynamic seat format/i,
  );
});

test('seatKey slugifies names with punctuation and spacing', () => {
  assert.equal(seatKey('  Dr. Jane — Health/Policy!  '), 'dr-jane-health-policy');
});
