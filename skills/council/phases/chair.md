# Phase: Chair synthesis + decision card

The Chair reads every seat and produces one structured verdict, then presents the decision card.

Inputs: all `seat__<key>.json` (+ `rebuttal__<key>.json` for Deep). Outputs: `verdict.md`, decision card shown to the user.

UX rules from `SKILL.md` apply — narrate intent before each tool call, don't paste CLI JSON or verdict body into chat.

## 1. Aggregate scores

Narrate *"Aggregating seat scores."* Then run:
```
echo '[{"seat":"adversary","feasibility":N,"differentiation":N,"upside":N}, ...]' \
  | node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" aggregate-scores
```
Returns per-dimension `{mean, variance, highVariance}`. `highVariance` (variance > 1.0) flags dimensions where the council genuinely disagrees — call these out in the verdict.

## 2. Seat selector (Haiku 4.5)

Narrate *"Picking the most load-bearing seats for the synthesis."* Spawn a **Haiku 4.5** sub-agent that reads each seat's `summary` and picks the 3–4 most load-bearing for full-reasoning inclusion. **The Adversary and The Pre-Mortem are always included.** Non-selected seats contribute their headline only.

## 3. Synthesis (primary model)

Give the Chair: the idea, all pre-brief Q&A, the aggregate score grid, every seat's headline, full reasoning for selected seats (+ rebuttals on Deep). Produce a **9-section verdict**:

1. Restatement — the actual decision being made (may differ from what was typed)
2. Key tensions — 1–3 central conflicts
3. Strongest case to proceed
4. Strongest case against
5. Blocking conditions — numbered, each falsifiable
6. Top failure paths — the three most likely
7. Unknowns ledger — 5–7 ranked by leverage, each with a resolution path
8. Recommended next actions — grouped Today / This week / This month
9. Confidence — Low / Medium / High, with what evidence would move it up

Narrate *"Saving the verdict."* Then write:
```
echo '<verdict markdown>' | node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" write-artifact .claude/council/checkpoints/<id> verdict.md
```

## 4. Build + show a compact decision card

Build it:
```
echo '{"confidence":"<Low|Medium|High>","grid":<aggregate grid>,"blockingConditions":[...],"nextActions":{"today":[...],"thisWeek":[...],"thisMonth":[...]},"unknowns":[...]}' \
  | node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" build-decision-card
```
Narrate *"Saving the decision card."* Then checkpoint the card output verbatim — the export and HTML both read it from here:
```
echo '<build-decision-card output>' \
  | node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" write-artifact .claude/council/checkpoints/<id> card.json
```

Print **one compact block** to chat — and nothing more. The full 9-section verdict is already on disk and goes into the exports. Do **not** paste the verdict body, seat reasoning, per-seat grids, "this week" / "this month" actions, or the full unknowns ledger into chat.

Format (use exactly; one decimal on means; append `  ⚠ high variance: <dim>` only if any dimension is flagged):
```
Decision: <one-line restatement>
Confidence: <Low|Medium|High>
Scores: F <N.N>  D <N.N>  U <N.N>
Blocking:
  1. <condition>
  2. <condition>
  ...
Today: <first today action>
Top unknowns:
  - <unknown 1>
  - <unknown 2>
  - <unknown 3>
```

Then hand off to `phases/export.md` (Quick) — Standard/Deep run `phases/resolve.md` first. The HTML link is the headline output of `export.md`.
