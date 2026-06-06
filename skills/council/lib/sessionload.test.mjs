import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { writeArtifact } from './checkpoint.mjs';
import { loadSession } from './sessionload.mjs';

function withSession(fn) {
  const root = mkdtempSync(join(tmpdir(), 'council-load-'));
  const dir = join(root, '20260524T143022');
  try {
    return fn(dir);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('assembles meta, pre-brief, bench, seats, card and verdict into one object', () => {
  withSession((dir) => {
    writeArtifact(dir, 'meta.json', { idea: 'hot sauce box', effort: 'standard', createdAt: '20260524T143022' });
    writeArtifact(dir, 'prebrief.json', [['stakes?', 'a year']]);
    writeArtifact(dir, 'seats.json', { permanent: [{ name: 'The Adversary' }], dynamic: [] });
    writeArtifact(dir, 'seat__adversary.json', { key: 'adversary', name: 'The Adversary', scores: { feasibility: 2 } });
    writeArtifact(dir, 'card.json', { confidence: 'Medium', blockingConditions: ['x'] });
    writeArtifact(dir, 'verdict.md', '## 1. Restatement\nLaunch?');

    const s = loadSession(dir);
    assert.equal(s.id, '20260524T143022');
    assert.equal(s.idea, 'hot sauce box');
    assert.equal(s.effort, 'standard');
    assert.equal(s.mode, 'single');
    assert.deepEqual(s.prebrief, [['stakes?', 'a year']]);
    assert.equal(s.bench.permanent[0].name, 'The Adversary');
    assert.equal(s.seats.length, 1);
    assert.equal(s.seats[0].name, 'The Adversary');
    assert.equal(s.card.confidence, 'Medium');
    assert.match(s.verdict, /Restatement/);
  });
});

test('merges a seat rebuttal into its seat when one is checkpointed', () => {
  withSession((dir) => {
    writeArtifact(dir, 'meta.json', { idea: 'x', createdAt: 's' });
    writeArtifact(dir, 'seat__adversary.json', { key: 'adversary', name: 'The Adversary' });
    writeArtifact(dir, 'rebuttal__adversary.json', {
      key: 'adversary',
      update: ['Pre-Mortem is right about capital.'],
      pressBack: ['Realist understates upside.'],
    });

    const s = loadSession(dir);
    assert.match(s.seats[0].rebuttal, /capital/);
    assert.match(s.seats[0].rebuttal, /understates upside/);
  });
});

test('tolerates missing optional artifacts — card, resolved, outcomes default empty/null', () => {
  withSession((dir) => {
    writeArtifact(dir, 'meta.json', { idea: 'bare', createdAt: 's' });

    const s = loadSession(dir);
    assert.equal(s.card, null);
    assert.deepEqual(s.resolvedUnknowns, []);
    assert.deepEqual(s.outcomes, []);
    assert.deepEqual(s.seats, []);
    assert.equal(s.comparison, null);
  });
});

test('reads comparison mode, both options and the comparison verdict', () => {
  withSession((dir) => {
    writeArtifact(dir, 'meta.json', {
      idea: 'A vs B',
      mode: 'compare',
      optionA: 'box',
      optionB: 'marketplace',
      createdAt: 's',
    });
    writeArtifact(dir, 'comparison.json', { winner: 'A', tally: { a: 2, b: 1 }, tie: false });

    const s = loadSession(dir);
    assert.equal(s.mode, 'compare');
    assert.equal(s.optionA, 'box');
    assert.equal(s.optionB, 'marketplace');
    assert.equal(s.comparison.winner, 'A');
  });
});
