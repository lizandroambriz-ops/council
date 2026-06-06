# Phase: Model selection

Lets the user view and change the primary model preference. Saved to `~/.claude/quorum_config.json` and reused across sessions.

UX rules from `SKILL.md` apply — especially: use `AskUserQuestion` for the choice; narrate intent in plain English; no echo / poll chatter.

## Steps

1. Narrate: *"Checking your current model preference."* Then run:
   ```
   node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" config-get ~/.claude/quorum_config.json
   ```
   Tell the user which model is currently saved.

2. **Offer the choice via `AskUserQuestion`** (do not ask them to type a number). Header: *"Saved default primary model — the starting point for the per-query recommendation. Runs research, Chair synthesis, and follow-up; Haiku 4.5 always handles utility calls."* Options:
   - `Opus 4.7 — deepest reasoning`
   - `Sonnet 4.6 — balanced (default)`
   - `Haiku 4.5 — fastest / cheapest`

3. Map the selection to `opus-4-7`, `sonnet-4-6`, or `haiku-4-5`, narrate *"Saving your selection."* and run:
   ```
   node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" config-set ~/.claude/quorum_config.json <model>
   ```
   The command prints the saved config and rejects unknown models (exit 1) — surface any error rather than claiming success.

4. Confirm in one short line (e.g. *"Saved — using Opus 4.7"*) and return to the main menu.
