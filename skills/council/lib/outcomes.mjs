const VALID_STATUSES = new Set(['taken', 'skipped', 'pending']);

export function recordOutcome(outcomes, { action, status, note, recordedAt }) {
  if (!VALID_STATUSES.has(status)) {
    throw new Error(`invalid outcome status: ${status}`);
  }
  const entry = { action, status, note, recordedAt };
  const rest = outcomes.filter((o) => o.action !== action);
  return [...rest, entry];
}

export function sessionOutcomeStatus(actions, outcomes) {
  const recorded = new Set(
    outcomes.filter((o) => o.status !== 'pending').map((o) => o.action),
  );
  const count = actions.filter((a) => recorded.has(a)).length;
  if (count === 0) return 'pending';
  if (count === actions.length) return 'fully recorded';
  return 'partially recorded';
}
