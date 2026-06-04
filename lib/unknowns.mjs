const TOP_N = 3;

export function topResolvable(unknowns, n = TOP_N) {
  return unknowns
    .filter((u) => u.webResolvable)
    .sort((a, b) => b.leverage - a.leverage)
    .slice(0, n);
}
