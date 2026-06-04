# Phase: Ideas Head-to-Head

Runs the full council pipeline on **two** ideas at once, with one shared bench, and produces a comparative verdict with a declared winner. Reached from main-menu option 4 ("Ideas Head-to-Head").

It reuses every other phase — the differences are: two ideas captured upfront, seats produce per-option output, and the Chair declares a winner.

UX rules from `SKILL.md` apply.

## Entry

Ask for both options as ordinary chat prompts (no shell-style placeholders). For example:
> What's **Option A**?
>
> What's **Option B**?

Capture both, then **recommend effort + model** — run `phases/scope.md` (sections 1–3) on the combined request (`"A: … vs B: …"`); it hands back `effort`, `model`, and a `stakes` signal (`low|medium|high`). If the user cancels there, stop — nothing is committed.

Then narrate *"Creating the head-to-head session and saving its meta file."* and write `meta.json` (carrying the recommended model/effort and the scope signals):
```
echo '{"idea":"A: <option A> vs B: <option B>","optionA":"<option A>","optionB":"<option B>","mode":"compare","model":"<model>","effort":"<quick|standard|deep>","stakes":"<low|medium|high>","createdAt":"<id>","abandoned":false}' \
  | node .claude/skills/council/lib/cli.mjs write-artifact .claude/skills/council/checkpoints/<id> meta.json
```

## Phase sequence (same as a single-idea session)

`prebrief` → `casting` → `research` → (`cross-examination` — Deep) → `chair` → (`resolve` — Standard/Deep) → `export` → `followup`. Each phase runs as documented; the head-to-head overrides below apply.

- **Pre-brief** — questions address both options together (e.g. "What's the shared constraint between A and B?", "What would make you pick one over the other?").
- **Casting** — one bench evaluates both options. No change to seat selection.
- **Research** — every seat receives **both** ideas and produces **comparison output** instead of the single-idea format:
  - 3 key findings for Option A
  - 3 key findings for Option B
  - Scores per option: Feasibility / Differentiation / Upside (out of 5, one set per option)
  - **Stated preference** — `A` or `B`, with a single decisive reason.

  Checkpoint each seat with both score sets and its preference:
  ```
  echo '{"key":"<key>","name":"<name>","format":"<format>","findingsA":["..."],"findingsB":["..."],"scoresA":{"feasibility":N,"differentiation":N,"upside":N},"scoresB":{"feasibility":N,"differentiation":N,"upside":N},"prefers":"<A|B>","reason":"<one line>","summary":"<headline>","reasoning":"<full output>"}' \
    | node .claude/skills/council/lib/cli.mjs write-artifact .claude/skills/council/checkpoints/<id> seat__<key>.json
  ```
- **Cross-examination** (Deep) and **auto-resolve** (Standard/Deep) run as normal, against both options.

## Comparative Chair

After research (and cross-exam on Deep), tally the bench and build the comparative verdict:
```
echo '[{"seat":"<key>","prefers":"<A|B>","reason":"<one line>"}, ...]' \
  | node .claude/skills/council/lib/cli.mjs comparison-verdict
```
Returns `{tally:{a,b}, winner, tie, casesForA, casesForB}`. A `tie` means no seat majority — the Chair must break it on the strength of reasoning, not count.

Checkpoint the verdict:
```
echo '<comparison-verdict output>' \
  | node .claude/skills/council/lib/cli.mjs write-artifact .claude/skills/council/checkpoints/<id> comparison.json
```

The Chair produces:
- **Winner declaration** — Option A or Option B.
- **Seat-preference tally** — e.g. "5 seats favour A, 2 favour B".
- **Strongest case for Option A** and **Strongest case for Option B**.
- **Comparative blocking conditions** — what would need to be true for the *non-winner* to be the right call.
- **Recommended next actions for the winning option** — grouped Today / This week / This month.

Write the prose verdict to `verdict.md`, then build and checkpoint the decision card exactly as `phases/chair.md` does (`build-decision-card` → `card.json`) using the winning option's scores and next actions. Present a comparison decision card (winner badge + tally + both cases) before the full verdict.

## Export

`phases/export.md` runs unchanged. Because `meta.json` carries `"mode":"compare"`, `load-session` sets the session mode and the same `render-html` / `render-session-md` commands emit the head-to-head layout — winner banner plus per-option seat cards. The THREAD.md entry, logbook visibility, follow-up Q&A, and outcome tracking all work exactly as in single-idea mode.
