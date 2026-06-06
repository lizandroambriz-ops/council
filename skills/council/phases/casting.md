# Phase: Casting + bench review

Produce the full bench (3 permanent + dynamic specialists) and get the user's sign-off before research.

Inputs: `meta.json`, `prebrief.json`. Output: `seats.json`.

UX rules from `SKILL.md` apply.

## 1. Casting Director (Haiku 4.5)

Narrate: *"Casting specialist seats based on your pre-brief — about 10 seconds."*

Spawn a **Haiku 4.5** sub-agent (via the Agent tool) that reads the idea + all pre-brief Q&A and proposes dynamic specialist seats. Count by effort: **Quick 2–3, Standard 3–4, Deep 4–5**. For each, it returns:
`name`, `background`, `lens` (the angle they uniquely cover), `why seated`, and `format` ∈ `quantitative | qualitative | comparative`.

Pick the format to fit the lens: a market-sizer is `quantitative`, a brand/positioning voice is `qualitative`, a build-vs-buy analyst is `comparative`.

## 2. Assemble the bench

Pass the dynamic seats through the CLI, which prepends the three permanent seats and validates formats:
```
echo '[{"name":"...","background":"...","lens":"...","format":"qualitative"}, ...]' \
  | node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" build-bench
```
The result has `permanent` (The Adversary, The Pre-Mortem, The Resource Realist) and `dynamic` (each with a derived `key`). An invalid format exits 1 — fix and retry.

## 3. Review + launch

Display the bench compactly — permanent first, then each dynamic seat with its lens and format.

Then show the **cost estimate for this run** — the abort-before-spend gate, since research launches right after and is the dominant cost. Count the dynamic seats from `build-bench` (the length of `dynamic`, not counting the 3 permanent) and run the estimator with the chosen effort and that real count:
```
echo '{"effort":"<quick|standard|deep>","dynamicSeats":<N>}' \
  | node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" estimate-cost
```
Show the returned `tokensLabel` and `walltimeLabel` on one line, flagged as approximate — e.g. *"Estimated cost: ~145k–338k tokens · ~3–5 min (rough — actual depends on the idea and how much the live web returns)."*

Then use **`AskUserQuestion`** with these options (do not ask the user to type a reply):
- `Proceed — launch research`
- `Edit the bench (drop / add / re-cast)`
- `Cancel — don't run the council`

If they pick **Edit**, follow up with a free-text prompt: *"What change? (e.g. 'drop the legal one', 'add someone who knows B2B sales', 're-cast')"* and act on the answer:
- **Drop X** → remove that seat, re-run `build-bench`, re-display, ask again.
- **Add Y** → compose one seat config, append, re-run `build-bench`, re-display, ask again.
- **Re-cast** → re-run the Haiku Casting Director (step 1) with any steering.

If they pick **Cancel**, stop. Do **not** write an `abandoned` marker — no research has been committed.

If they pick **Proceed**, narrate *"Saving the bench."* and write it (only on approval):
```
echo '<bench JSON>' | node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" write-artifact .claude/council/checkpoints/<id> seats.json
```
Then hand off to `phases/research.md`.
