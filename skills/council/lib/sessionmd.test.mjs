import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderSessionMarkdown } from './sessionmd.mjs';

const session = (over = {}) => ({
  idea: 'Subscription box for artisanal hot sauce',
  effort: 'standard',
  prebrief: [['What is at stake?', 'My savings and a year of time']],
  bench: {
    permanent: [{ name: 'The Adversary', format: 'adversary' }],
    dynamic: [{ name: 'B2B Sales Operator', format: 'qualitative', lens: 'go-to-market' }],
  },
  seats: [
    {
      name: 'The Adversary',
      format: 'adversary',
      summary: 'Load-bearing assumption: subscribers tolerate $40/mo.',
      reasoning: 'Full steel-man and prior failures here.',
      scores: { feasibility: 2, differentiation: 4, upside: 2 },
    },
  ],
  resolvedUnknowns: [{ question: 'Typical churn?', answer: '~8%/mo' }],
  verdict: '## 1. Restatement\nShould we launch the box?\n## 9. Confidence\nMedium',
  ...over,
});

test('assembles a transcript with idea, effort, pre-brief, a seat, and the verdict', () => {
  const md = renderSessionMarkdown(session());
  assert.match(md, /# The Council — Subscription box for artisanal hot sauce/);
  assert.match(md, /standard/);
  assert.match(md, /What is at stake\?/);
  assert.match(md, /My savings and a year of time/);
  assert.match(md, /The Adversary/);
  assert.match(md, /Full steel-man and prior failures/);
  assert.match(md, /## 1\. Restatement/);
});

test('includes the pre-resolved unknowns section when present, omits it otherwise', () => {
  assert.match(renderSessionMarkdown(session()), /## Pre-resolved unknowns[\s\S]*~8%\/mo/);
  const none = renderSessionMarkdown(session({ resolvedUnknowns: [] }));
  assert.ok(!/Pre-resolved unknowns/.test(none));
});

test('compare mode renders both options, the winner, and per-option findings', () => {
  const md = renderSessionMarkdown(
    session({
      mode: 'compare',
      optionA: 'Subscription box',
      optionB: 'One-off marketplace',
      comparison: { tally: { a: 2, b: 1 }, winner: 'A', tie: false },
      seats: [
        {
          name: 'The Adversary',
          format: 'adversary',
          findingsA: ['A has a clearer wedge'],
          findingsB: ['B is more crowded'],
          prefers: 'A',
          reason: 'wedge is defensible',
        },
      ],
    }),
  );
  assert.match(md, /\*\*Option A:\*\* Subscription box/);
  assert.match(md, /\*\*Option B:\*\* One-off marketplace/);
  assert.match(md, /Winner: Option A \(2–1\)/);
  assert.match(md, /A has a clearer wedge/);
  assert.match(md, /B is more crowded/);
  assert.match(md, /Prefers A:.*wedge is defensible/);
});

test('renders a rebuttal only when the seat carries one (Deep)', () => {
  const noRebuttal = renderSessionMarkdown(session());
  assert.ok(!/Cross-examination rebuttal/.test(noRebuttal));

  const deep = renderSessionMarkdown(
    session({
      seats: [{ ...session().seats[0], rebuttal: 'The Pre-Mortem overstates capital risk.' }],
    }),
  );
  assert.match(deep, /Cross-examination rebuttal:.*overstates capital risk/);
});
