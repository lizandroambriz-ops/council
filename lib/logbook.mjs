const EXCERPT_LEN = 80;

function excerpt(idea) {
  if (idea.length <= EXCERPT_LEN) return idea;
  return idea.slice(0, EXCERPT_LEN) + '…';
}

function one(n) {
  return Number(n).toFixed(1);
}

function renderRow(s, index) {
  const scores = `F ${one(s.scores.feasibility)} / D ${one(s.scores.differentiation)} / U ${one(s.scores.upside)}`;
  return [
    `${index}. ${s.date} — ${excerpt(s.idea)}`,
    `   Confidence: ${s.confidence} | ${scores}`,
    `   First action: ${s.firstAction}`,
    `   Outcomes: ${s.outcomeStatus}`,
  ].join('\n');
}

export function renderLogbook(sessions) {
  if (!sessions || sessions.length === 0) {
    return 'No completed sessions yet.';
  }
  const ordered = [...sessions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return ordered.map((s, i) => renderRow(s, i + 1)).join('\n\n');
}
