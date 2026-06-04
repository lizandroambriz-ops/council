# Phase: Cross-examination (Deep only)

Each seat reads what the others found and revises or defends its position. **Deep sessions only** — Quick and Standard skip straight from research to `phases/chair.md`.

Inputs: every `seat__<key>.json`. Output: one `rebuttal__<key>.json` per seat.

Same UX rules as `phases/research.md` — one tick line per returning seat, no keep-alives, no chatter.

## Resume first

Rebuttals already checkpointed are reused — only seats without a `rebuttal__<key>.json` re-run.

## Build the digest

Read every `seat__<key>.json` and assemble a **headline digest**: each seat's name plus a 3-bullet summary of its key findings (use `summary` — **not** the full `reasoning`). The same digest goes to every seat.

## Parallel rebuttals

Narrate once: *"Cross-examination — each seat reads the others and revises or defends."*

Launch all remaining seats **in a single message with multiple Agent tool calls** (primary model). Each sub-agent receives:
- its own round-1 output (`reasoning` + `scores` from its `seat__<key>.json`),
- the headline digest of **all other** seats (exclude its own line),
- its original persona config.

Each produces exactly two sections:
- **Where I update** — 2–3 bullets: findings from other seats that changed this seat's position, each with reasoning.
- **Where I press back** — 2–3 bullets: points this seat disputes, each with counter-evidence.

## Checkpoint each rebuttal + emit one tick line

As each seat returns:

1. Write the checkpoint:
   ```
   echo '{"key":"<key>","name":"<name>","update":["<bullet>", ...],"pressBack":["<bullet>", ...]}' \
     | node .claude/skills/council/lib/cli.mjs write-artifact .claude/skills/council/checkpoints/<id> rebuttal__<key>.json
   ```
2. Emit **exactly one tick line**: `✓ <Seat Name> revised`.
3. Do **not** paste the update / press-back bullets into chat.

When every seat has a `rebuttal__<key>.json`, emit `✓ Cross-exam complete (N/N).` and hand off to `phases/chair.md`.
