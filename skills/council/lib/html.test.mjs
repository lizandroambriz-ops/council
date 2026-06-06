import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderHtml } from './html.mjs';

const session = () => ({
  idea: 'Subscription box for artisanal hot sauce',
  mode: 'single',
  card: {
    confidence: 'Medium',
    scores: {
      feasibility: { mean: 3, variance: 0.2, highVariance: false },
      differentiation: { mean: 4, variance: 4, highVariance: true },
      upside: { mean: 2, variance: 0.1, highVariance: false },
    },
    blockingConditions: ['No repeatable acquisition channel under $30 CAC', 'Supply cannot scale past 500 units/mo'],
    nextActions: {
      today: ['Interview 5 subscribers'],
      thisWeek: ['Price-test two tiers'],
      thisMonth: ['Run a 50-box pilot'],
    },
    topUnknowns: ['CAC', 'churn', 'supply reliability'],
  },
  seats: [
    {
      name: 'The Adversary',
      format: 'adversary',
      summary: 'Load-bearing assumption: subscribers will tolerate $40/mo.',
      reasoning: 'Full steel-man and prior failures here. <script>alert(1)</script>',
      scores: { feasibility: 2, differentiation: 4, upside: 2 },
    },
  ],
  resolvedUnknowns: [{ question: 'Typical hot-sauce subscription churn?', answer: '~8%/mo per industry data' }],
  verdict: '## 1. Restatement\nShould we launch...\n## 9. Confidence\nMedium',
});

test('produces an HTML document naming the idea and confidence', () => {
  const html = renderHtml(session());
  assert.match(html, /^<!DOCTYPE html>/);
  assert.match(html, /artisanal hot sauce/);
  assert.match(html, /Medium/);
  // styles are inline; scripts must not be loaded externally
  assert.ok(!/<script\b/i.test(html), 'should have no <script> tags');
  assert.ok(!/src="https?:/.test(html), 'should have no external script/img src');
});

test('renders scores as visual bars (width %) and flags high-variance dimensions', () => {
  const html = renderHtml(session());
  // feasibility mean 3/5 → 60% bar
  assert.match(html, /width:\s*60%/);
  // differentiation is high-variance → flagged in the aggregate block
  assert.match(html, /high variance/i);
});

test('renders blocking conditions in a numbered conditions block', () => {
  const html = renderHtml(session());
  assert.match(html, /class="cond"/);
  assert.match(html, /No repeatable acquisition channel/);
  assert.match(html, /Supply cannot scale past 500 units\/mo/);
});

test('groups next actions into Today / This week / This month', () => {
  const html = renderHtml(session());
  assert.match(html, /Today/);
  assert.match(html, /This week/);
  assert.match(html, /This month/);
  assert.match(html, /Interview 5 subscribers/);
  assert.match(html, /Run a 50-box pilot/);
});

test('renders each seat as a card with a collapsible full opinion', () => {
  const html = renderHtml(session());
  assert.match(html, /The Adversary/);
  assert.match(html, /<details/);
  assert.match(html, /Read the full opinion/);
});

test('escapes seat content so embedded markup cannot inject', () => {
  const html = renderHtml(session());
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.match(html, /&lt;script&gt;/);
});

test('renders a visually distinct pre-resolved unknowns section', () => {
  const html = renderHtml(session());
  assert.match(html, /class="resolved"/);
  assert.match(html, /pre-resolved/i);
  assert.match(html, /~8%\/mo/);
});

test('compare-mode renderHtml shows both options, a winner banner and both cases', () => {
  const html = renderHtml({
    mode: 'compare',
    optionA: 'Launch the subscription box',
    optionB: 'Launch a one-off marketplace',
    comparison: {
      tally: { a: 2, b: 1 },
      winner: 'A',
      tie: false,
      casesForA: [{ seat: 'The Adversary', reason: 'clearer wedge' }],
      casesForB: [{ seat: 'The Pre-Mortem', reason: 'fails less hard' }],
    },
    seats: [
      {
        name: 'The Adversary',
        format: 'adversary',
        findingsA: ['A has a wedge'],
        findingsB: ['B is crowded'],
        prefers: 'A',
        reason: 'clearer wedge',
      },
    ],
    verdict: '## Winner\nOption A',
  });

  assert.match(html, /^<!DOCTYPE html>/);
  assert.ok(!/<script\b/i.test(html));
  assert.match(html, /Launch the subscription box/);
  assert.match(html, /Launch a one-off marketplace/);
  assert.match(html, /winner/i);
  assert.match(html, /clearer wedge/);
  assert.match(html, /fails less hard/);
  assert.match(html, /A has a wedge/);
  assert.match(html, /B is crowded/);
});
