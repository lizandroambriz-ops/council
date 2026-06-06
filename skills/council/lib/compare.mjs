export function tallyPreferences(seats) {
  const a = seats.filter((s) => s.prefers === 'A').length;
  const b = seats.filter((s) => s.prefers === 'B').length;
  const tie = a === b;
  const winner = tie ? null : a > b ? 'A' : 'B';
  return { a, b, winner, tie };
}

export function buildComparisonVerdict(seats) {
  const { a, b, winner, tie } = tallyPreferences(seats);
  const casesFor = (opt) =>
    seats.filter((s) => s.prefers === opt).map((s) => ({ seat: s.seat, reason: s.reason }));
  return { tally: { a, b }, winner, tie, casesForA: casesFor('A'), casesForB: casesFor('B') };
}
