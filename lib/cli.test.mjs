import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const CLI = fileURLToPath(new URL('./cli.mjs', import.meta.url));

function run(args, input) {
  return spawnSync('node', [CLI, ...args], { input, encoding: 'utf8' });
}

test('aggregate-scores reads seats on stdin and prints the grid as JSON', () => {
  const seats = JSON.stringify([
    { seat: 'a', feasibility: 1, differentiation: 4, upside: 3 },
    { seat: 'b', feasibility: 5, differentiation: 4, upside: 3 },
  ]);
  const { status, stdout } = run(['aggregate-scores'], seats);
  assert.equal(status, 0);
  const grid = JSON.parse(stdout);
  assert.equal(grid.feasibility.mean, 3);
  assert.equal(grid.feasibility.highVariance, true);
});

test('render-html emits a self-contained document to stdout as text', () => {
  const session = JSON.stringify({
    idea: 'hot sauce box',
    mode: 'single',
    card: {
      confidence: 'Medium',
      scores: {
        feasibility: { mean: 3, highVariance: false },
        differentiation: { mean: 4, highVariance: false },
        upside: { mean: 2, highVariance: false },
      },
      blockingConditions: ['x'],
      nextActions: { today: ['a'], thisWeek: [], thisMonth: [] },
      topUnknowns: ['u'],
    },
    seats: [],
    resolvedUnknowns: [],
    verdict: 'v',
  });
  const { status, stdout } = run(['render-html'], session);
  assert.equal(status, 0);
  assert.match(stdout, /^<!DOCTYPE html>/);
});

test('select-resume reads a checkpoints dir and reports the resume decision', () => {
  const dir = mkdtempSync(join(tmpdir(), 'council-cli-'));
  try {
    const root = join(dir, 'checkpoints');
    const live = join(root, '20260301T000000');
    run(['write-artifact', live, 'meta.json'], JSON.stringify({ idea: 'live', abandoned: false }));
    run(['write-artifact', live, 'prebrief.json'], JSON.stringify([['q', 'a']]));

    const { status, stdout } = run(['select-resume', root]);
    assert.equal(status, 0);
    const decision = JSON.parse(stdout);
    assert.equal(decision.action, 'resume');
    assert.equal(decision.session.id, '20260301T000000');
    assert.equal(decision.session.lastPhase, 'prebrief');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('config-set persists and config-get reads it back', () => {
  const dir = mkdtempSync(join(tmpdir(), 'council-cli-'));
  try {
    const path = join(dir, 'quorum_config.json');
    const setRes = run(['config-set', path, 'opus-4-7']);
    assert.equal(setRes.status, 0);
    assert.equal(JSON.parse(setRes.stdout).model, 'opus-4-7');

    const getRes = run(['config-get', path]);
    assert.equal(JSON.parse(getRes.stdout).model, 'opus-4-7');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('estimate-cost returns all three tiers, or one tier when effort is given', () => {
  const all = run(['estimate-cost'], '{}');
  assert.equal(all.status, 0);
  const tiers = JSON.parse(all.stdout);
  assert.ok(tiers.quick && tiers.standard && tiers.deep);

  const one = run(['estimate-cost'], JSON.stringify({ effort: 'standard', dynamicSeats: 7 }));
  assert.equal(one.status, 0);
  const est = JSON.parse(one.stdout);
  assert.equal(est.effort, 'standard');
  assert.equal(est.seats, 10); // 3 permanent + 7 dynamic
});

test('exits 1 with a message on an unknown command', () => {
  const { status, stderr } = run(['frobnicate']);
  assert.equal(status, 1);
  assert.match(stderr, /unknown command/i);
});

test('exits 1 when the underlying library rejects input', () => {
  const { status, stderr } = run(['config-set', '/tmp/whatever.json', 'gpt-9']);
  assert.equal(status, 1);
  assert.match(stderr, /invalid model/i);
});
