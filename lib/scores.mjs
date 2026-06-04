const DIMENSIONS = ['feasibility', 'differentiation', 'upside'];

export function aggregateScores(seats) {
  if (!Array.isArray(seats) || seats.length === 0) {
    throw new Error('aggregateScores requires at least one seat');
  }
  const grid = {};
  for (const dim of DIMENSIONS) {
    const values = seats.map((s) => s[dim]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
    grid[dim] = { mean, variance, highVariance: variance > 1.0 };
  }
  return grid;
}
