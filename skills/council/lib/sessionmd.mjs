function scoreLine(s) {
  return `Scores: Feasibility ${s.feasibility}/5 | Differentiation ${s.differentiation}/5 | Upside ${s.upside}/5`;
}

function seatBlock(seat) {
  const parts = [
    `### ${seat.name} (${seat.format})`,
    scoreLine(seat.scores),
    '',
    seat.summary,
    '',
    seat.reasoning,
  ];
  if (seat.rebuttal) {
    parts.push('', `**Cross-examination rebuttal:** ${seat.rebuttal}`);
  }
  return parts.join('\n');
}

function comparisonSeatBlock(seat) {
  const findings = (items) => (items ?? []).map((f) => `- ${f}`).join('\n');
  const parts = [
    `### ${seat.name} (${seat.format})`,
    '',
    '**Option A**',
    findings(seat.findingsA),
    '',
    '**Option B**',
    findings(seat.findingsB),
  ];
  if (seat.prefers) parts.push('', `**Prefers ${seat.prefers}:** ${seat.reason ?? ''}`);
  if (seat.rebuttal) parts.push('', `**Cross-examination rebuttal:** ${seat.rebuttal}`);
  return parts.join('\n');
}

export function renderSessionMarkdown(session) {
  const compare = session.mode === 'compare';
  const lines = [`# The Council — ${session.idea}`, '', `**Effort:** ${session.effort}`, ''];

  if (compare) {
    lines.push(`**Option A:** ${session.optionA}`, '', `**Option B:** ${session.optionB}`, '');
    if (session.comparison) {
      const v = session.comparison;
      const label = v.tie ? 'Tie — no clear winner' : `Winner: Option ${v.winner} (${v.tally.a}–${v.tally.b})`;
      lines.push(`**${label}**`, '');
    }
  }

  lines.push('## Pre-brief', '');
  for (const [q, a] of session.prebrief) {
    lines.push(`- **Q:** ${q}`, `  **A:** ${a}`);
  }
  lines.push('');

  lines.push('## Bench', '');
  for (const seat of session.bench.permanent) lines.push(`- ${seat.name} (${seat.format})`);
  for (const seat of session.bench.dynamic) lines.push(`- ${seat.name} (${seat.format}) — ${seat.lens}`);
  lines.push('');

  lines.push('## Seat outputs', '');
  const block = compare ? comparisonSeatBlock : seatBlock;
  for (const seat of session.seats) lines.push(block(seat), '');

  if (session.resolvedUnknowns && session.resolvedUnknowns.length) {
    lines.push('## Pre-resolved unknowns', '');
    for (const r of session.resolvedUnknowns) lines.push(`- **${r.question}** ${r.answer}`);
    lines.push('');
  }

  lines.push('## Verdict', '', session.verdict);

  return lines.join('\n');
}
