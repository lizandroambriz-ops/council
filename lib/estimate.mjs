// Rough planning estimate of token spend + wall time for a Council run.
// NOT billing-accurate: real usage depends on the chosen model, the idea, and
// how much the live web returns. The constants are deliberate approximations,
// tuned for *relative* comparison (quick vs standard vs deep) and an
// order-of-magnitude figure so the user can abort before the expensive
// research phase. Tune the constants here; everything downstream is derived.

export const PERMANENT_SEATS = 3;

// Effort profile — mirrors the routing + turn budgets in SKILL.md / research.md.
export const EFFORT_PROFILE = {
  quick: { dynamicSeats: 3, turnsPerSeat: 6, prebriefCeiling: 4, crossExam: false, resolve: false, walltimeMin: [1, 2] },
  standard: { dynamicSeats: 4, turnsPerSeat: 10, prebriefCeiling: 5, crossExam: false, resolve: true, walltimeMin: [3, 5] },
  deep: { dynamicSeats: 5, turnsPerSeat: 18, prebriefCeiling: 6, crossExam: true, resolve: true, walltimeMin: [6, 10] },
};

// Per-unit token approximations (input + output combined).
const SEAT_BASE_TOKENS = 1500; // idea + pre-brief + persona loaded into each seat
const AVG_TOKENS_PER_TURN = 3000; // a WebSearch research turn, averaged over accumulating context
const PREBRIEF_TOKENS_PER_Q = 1000; // generate a question + process the answer
const CASTING_TOKENS = 3000; // Haiku casting director
const CHAIR_TOKENS = 8000; // synthesis over every seat's findings
const CROSSEXAM_TOKENS_PER_SEAT = 4000; // read others' findings, produce a revision (Deep only)
const RESOLVE_TOKENS = 5000; // classify unknowns + auto-research the top 3 (Standard/Deep)
const RANGE_SPREAD = 0.4; // ±40% band around the midpoint

export function effortProfile(effort) {
  const p = EFFORT_PROFILE[effort];
  if (!p) throw new Error(`unknown effort: ${effort}`);
  return p;
}

export function seatCount(effort, dynamicSeatsOverride) {
  const { dynamicSeats } = effortProfile(effort);
  const dynamic = Number.isFinite(dynamicSeatsOverride) ? dynamicSeatsOverride : dynamicSeats;
  return PERMANENT_SEATS + dynamic;
}

const k = (n) => `${Math.round(n / 1000)}k`;

// Estimate one effort tier. `opts.dynamicSeats` overrides the tier default with
// the real seat count once casting is done (where the number actually matters).
export function estimateEffort(effort, opts = {}) {
  const p = effortProfile(effort);
  const seats = seatCount(effort, opts.dynamicSeats);
  const breakdown = {
    prebrief: p.prebriefCeiling * PREBRIEF_TOKENS_PER_Q,
    casting: CASTING_TOKENS,
    research: seats * (SEAT_BASE_TOKENS + p.turnsPerSeat * AVG_TOKENS_PER_TURN),
    crossExam: p.crossExam ? seats * CROSSEXAM_TOKENS_PER_SEAT : 0,
    chair: CHAIR_TOKENS,
    resolve: p.resolve ? RESOLVE_TOKENS : 0,
  };
  const mid = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const low = Math.round(mid * (1 - RANGE_SPREAD));
  const high = Math.round(mid * (1 + RANGE_SPREAD));
  const [wLow, wHigh] = p.walltimeMin;
  return {
    effort,
    seats,
    tokens: { low, mid, high },
    tokensLabel: `~${k(low)}–${k(high)} tokens`,
    walltimeMin: { low: wLow, high: wHigh },
    walltimeLabel: `~${wLow}–${wHigh} min`,
    breakdown,
  };
}

// All three tiers in one call — for showing the trade-off side by side.
export function estimateAll(opts = {}) {
  return {
    quick: estimateEffort('quick', opts),
    standard: estimateEffort('standard', opts),
    deep: estimateEffort('deep', opts),
  };
}
