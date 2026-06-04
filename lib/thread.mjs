const ENTRY_DELIM = /^## /m;

function one(n) {
  return Number(n).toFixed(1);
}

export function formatThreadEntry({ date, idea, confidence, scores, firstAction, topUnknowns, outcomes }) {
  const scoreLine = `Feasibility ${one(scores.feasibility)} / Differentiation ${one(scores.differentiation)} / Upside ${one(scores.upside)}`;
  const unknowns = topUnknowns.slice(0, 3).join('; ');
  const outcomeLine =
    outcomes && outcomes.length
      ? outcomes.map((o) => `${o.action} — ${o.status}`).join('; ')
      : 'none recorded';

  return [
    `## ${date} — ${idea}`,
    `Confidence: ${confidence} | ${scoreLine}`,
    `First action: ${firstAction}`,
    `Top unknowns: ${unknowns}`,
    `Outcomes: ${outcomeLine}`,
  ].join('\n');
}

export function recentEntries(threadText, n = 5) {
  const blocks = threadText
    .split(ENTRY_DELIM)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => `## ${b}`);
  return blocks.slice(-n).reverse();
}
