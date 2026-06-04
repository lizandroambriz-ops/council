# Phase: Auto-resolve unknowns

Researches the most answerable unknowns from the verdict before the session is written to disk. **Standard and Deep only** — Quick skips this phase entirely (go straight to `phases/export.md`).

Inputs: `verdict.md` (section 7, the unknowns ledger). Output: `resolved.json`.

UX rules from `SKILL.md` apply.

## Resume first

If `resolved.json` already exists, this phase is done — go to `phases/export.md`.

## 1. Classify (Haiku 4.5)

Narrate *"Classifying which unknowns the web can actually answer."* Spawn a **Haiku 4.5** sub-agent. Give it the unknowns ledger. For each unknown it assigns:
- `webResolvable` — `true` if live web search could meaningfully answer it (`partial` counts as `true`); `false` for unknowns that need internal data, a prototype, or a private conversation.
- `leverage` — integer 1–10: how much resolving it would move the confidence rating.

Rank the answerable ones:
```
echo '{"unknowns":[{"text":"<unknown>","webResolvable":true,"leverage":N}, ...],"n":3}' \
  | node .claude/skills/council/lib/cli.mjs top-unknowns
```
Returns up to top 3 web-resolvable unknowns by leverage.

## 2. Auto-research (WebSearch)

Narrate once: *"Researching the top <N> unknowns."* For each returned unknown, run **WebSearch** and write a brief resolved entry:
- the original unknown statement,
- what was found,
- a source citation,
- a one-sentence implication for the verdict.

Emit one tick line per unknown — e.g. `✓ Unknown 1 of 3` — and nothing more from the research itself.

## 3. Checkpoint

After all entries are complete, narrate *"Saving resolved unknowns."* Then:
```
echo '[{"question":"<original unknown>","answer":"<finding> (<source>) — <one-sentence implication>"}, ...]' \
  | node .claude/skills/council/lib/cli.mjs write-artifact .claude/skills/council/checkpoints/<id> resolved.json
```

Hand off to `phases/export.md`. The session loader folds `resolved.json` into the session's pre-resolved unknowns block automatically.
