const VALID_CONFIDENCE = new Set(['Low', 'Medium', 'High']);
const TOP_UNKNOWNS = 3;

export function buildDecisionCard({ confidence, grid, blockingConditions, nextActions, unknowns }) {
  if (!VALID_CONFIDENCE.has(confidence)) {
    throw new Error(`invalid confidence: ${confidence}`);
  }
  return {
    confidence,
    scores: grid,
    blockingConditions,
    nextActions: {
      today: nextActions.today ?? [],
      thisWeek: nextActions.thisWeek ?? [],
      thisMonth: nextActions.thisMonth ?? [],
    },
    topUnknowns: unknowns.slice(0, TOP_UNKNOWNS),
    highVarianceDimensions: Object.entries(grid)
      .filter(([, v]) => v.highVariance)
      .map(([dim]) => dim),
  };
}
