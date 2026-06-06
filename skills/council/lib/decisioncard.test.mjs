import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDecisionCard } from './decisioncard.mjs';

const input = (over = {}) => ({
  confidence: 'Medium',
  grid: {
    feasibility: { mean: 3, variance: 0.2, highVariance: false },
    differentiation: { mean: 4, variance: 4, highVariance: true },
    upside: { mean: 2, variance: 0.1, highVariance: false },
  },
  blockingConditions: ['No channel under $30 CAC'],
  nextActions: { today: ['Interview 5'], thisWeek: ['Price test'], thisMonth: ['Pilot'] },
  unknowns: ['CAC', 'churn', 'supply', 'regulatory', 'seasonality'],
  ...over,
});

test('assembles a card with confidence, scores, blocking conditions and actions', () => {
  const card = buildDecisionCard(input());
  assert.equal(card.confidence, 'Medium');
  assert.equal(card.scores.feasibility.mean, 3);
  assert.deepEqual(card.blockingConditions, ['No channel under $30 CAC']);
  assert.deepEqual(card.nextActions.today, ['Interview 5']);
});

test('caps the unknowns ledger at the top 3', () => {
  const card = buildDecisionCard(input());
  assert.deepEqual(card.topUnknowns, ['CAC', 'churn', 'supply']);
});

test('rejects a confidence outside Low/Medium/High', () => {
  assert.throws(() => buildDecisionCard(input({ confidence: 'Unsure' })), /invalid confidence/i);
});

test('surfaces which dimensions are high-variance', () => {
  const card = buildDecisionCard(input());
  assert.deepEqual(card.highVarianceDimensions, ['differentiation']);
});
