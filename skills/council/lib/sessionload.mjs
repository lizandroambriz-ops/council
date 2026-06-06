import { basename } from 'node:path';
import { presentArtifacts, readArtifact } from './checkpoint.mjs';

const SEAT_RE = /^seat__(.+)\.json$/;
const REBUTTAL_RE = /^rebuttal__(.+)\.json$/;

function formatRebuttal(reb) {
  const lines = [];
  if (reb.update?.length) lines.push(`Updates: ${reb.update.join(' ')}`);
  if (reb.pressBack?.length) lines.push(`Presses back: ${reb.pressBack.join(' ')}`);
  return lines.join(' ');
}

// Deep: takes a checkpoint dir, returns the one session object every
// renderer, the decision card, and the thread entry consume. All artifact
// names and field mapping live here — callers never re-assemble.
export function loadSession(sessionDir) {
  const files = presentArtifacts(sessionDir);
  const has = (n) => files.includes(n);
  const read = (n) => readArtifact(sessionDir, n);

  const meta = has('meta.json') ? read('meta.json') : {};

  const rebuttals = {};
  for (const f of files) {
    const m = f.match(REBUTTAL_RE);
    if (m) rebuttals[m[1]] = read(f);
  }

  const seats = files
    .map((f) => f.match(SEAT_RE))
    .filter(Boolean)
    .map((m) => {
      const seat = read(`seat__${m[1]}.json`);
      const reb = rebuttals[m[1]];
      return reb ? { ...seat, rebuttal: formatRebuttal(reb) } : seat;
    });

  return {
    id: meta.createdAt ?? basename(sessionDir),
    idea: meta.idea ?? '',
    effort: meta.effort ?? '',
    mode: meta.mode === 'compare' ? 'compare' : 'single',
    optionA: meta.optionA,
    optionB: meta.optionB,
    prebrief: has('prebrief.json') ? read('prebrief.json') : [],
    bench: has('seats.json') ? read('seats.json') : { permanent: [], dynamic: [] },
    seats,
    card: has('card.json') ? read('card.json') : null,
    comparison: has('comparison.json') ? read('comparison.json') : null,
    resolvedUnknowns: has('resolved.json') ? read('resolved.json') : [],
    outcomes: has('outcomes.json') ? read('outcomes.json') : [],
    verdict: has('verdict.md') ? read('verdict.md') : '',
  };
}
