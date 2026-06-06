# Phase: Round 1 research (parallel seats)

Every seat researches the idea independently and in parallel, then checkpoints its output.

Inputs: `meta.json`, `prebrief.json`, `seats.json`. Output: one `seat__<key>.json` per seat.

UX rules from `SKILL.md` apply — this phase is the loudest by default and the most important to keep quiet. **One tick line per returning seat. Nothing else from a seat. No keep-alives, no `echo`-pings, no re-reads to "check" on a seat.**

## Resume first

List seats already checkpointed and skip them — `seat__<key>.json` files present in the checkpoint dir are done. Only run seats without a checkpoint.

## Parallel execution

Narrate once before launching: *"Launching <N> seats in parallel — each researches the live web independently. I'll tick them off as they return."*

Launch all remaining seats **in a single message with multiple Agent tool calls** (primary model). Each sub-agent gets: the idea, all pre-brief Q&A, its persona config (name/background/lens/format), **WebSearch access**, and a turn budget from the effort profile (Quick 6 / Standard 10 / Deep 18 max turns). Deep may split into two batches if seat count is large; if so, narrate the batch transition in one short line.

Each seat must ground claims with WebSearch and inline citations, and end with the fixed line:
`Scores: Feasibility N/5 | Differentiation N/5 | Upside N/5`.

## Role-aware output formats

**Permanent seats use fixed formats:**
- **The Adversary** — Steel-man case (2–3 bullets) → the single load-bearing assumption → prior failures & contradicting evidence (cited) → the one blocking flaw.
- **The Pre-Mortem** — three distinct failure paths, each: how it died (2–3 sentences) / early signal (month 1–3) / root-cause category (people·market·execution·capital·timing·regulation) / a concrete failed-venture analogue.
- **The Resource Realist** — capital to first proof / time-to-first-revenue / bottleneck resource / breakeven sensitivity / ongoing sustaining cost / opportunity cost. Concrete numbers with reasoning.

**Dynamic seats use their assigned `format`:**
- **quantitative** — ranked findings with web-researched data + confidence per finding.
- **qualitative** — 4–6 insight bullets, cited evidence, key uncertainties.
- **comparative** — side-by-side assessment of the two dimensions the lens most illuminates, with a stated lean.

## Checkpoint each seat + emit one tick line

As each seat returns:

1. Narrate the write in one short sentence (e.g. *"Saving The Adversary's findings."*), then write the checkpoint:
   ```
   echo '{"key":"<key>","name":"<name>","format":"<format>","summary":"<headline>","reasoning":"<full output>","scores":{"feasibility":N,"differentiation":N,"upside":N}}' \
     | node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" write-artifact .claude/council/checkpoints/<id> seat__<key>.json
   ```
2. Emit **exactly one tick line** — and nothing else from that seat:
   - Single-idea sessions: `✓ <Seat Name> (F<feasibility>/D<differentiation>/U<upside>)`
   - Ideas Head-to-Head sessions: `✓ <Seat Name> (prefers <A|B>)`
3. Do **not** paste the seat's summary, reasoning, citations, or scores grid into chat. They live in the checkpoint and are rendered into the `.md` / `.html` exports.

After the last seat returns, emit a single progress-complete line — e.g. `✓ All seats in (N/N).` — and hand off. When all seats have a checkpoint, go to `phases/chair.md` (Quick/Standard) — Deep runs `phases/cross_exam.md` first.

## Forbidden patterns in this phase (do not do these)

- `echo ping`, `echo READY`, `echo ok`, `echo poll`, `echo r1`/`r2`/…, `echo waiting`, `echo "<channel-test-...>"`, `echo "$(date +%s)"`.
- Re-running `cli.mjs` "to check the help" while waiting.
- Re-reading a phase file you've already loaded.
- Repeating the same tool call back-to-back to break a perceived stall — wait silently instead.
