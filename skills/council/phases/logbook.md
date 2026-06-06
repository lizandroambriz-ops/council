# Phase: Logbook + outcome tracking

Browse completed sessions and record what actually happened against their recommended actions. Reached from main-menu option 5 ("Past sessions").

UX rules from `SKILL.md` apply — pickers and status prompts use `AskUserQuestion`, not free-text input.

## 1. Render the logbook

Narrate *"Loading your past sessions."*

Scan completed sessions and build one row each. A session belongs in the logbook only if it has a `DONE` marker and is **not** abandoned:
```
node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" scan-sessions .claude/council/checkpoints
```
For each completed, non-abandoned session, load it:
```
node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" load-session .claude/council/checkpoints/<id>
```
Take confidence and per-dimension means from `card`, the first action from `card.nextActions.today`, and compute its outcome status:
```
echo '{"actions":["<all recommended actions>"],"outcomes":<outcomes.json or []>}' \
  | node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" session-outcome-status
```
Returns `pending` / `partially recorded` / `fully recorded`. Then render the list (newest first):
```
echo '[{"date":"<YYYY-MM-DD HH:MM>","idea":"<idea>","confidence":"<level>","scores":{...},"firstAction":"<first Today action>","outcomeStatus":"<status>"}, ...]' \
  | node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" render-logbook
```
Show the rendered list, then use **`AskUserQuestion`** to pick a session (one option per session, labelled by date + idea excerpt).

## 2. Session actions

After a session is picked, use **`AskUserQuestion`** to offer:
- `Open for follow-up Q&A`
- `Record outcomes`

### Open for follow-up Q&A

If the session's outcome status is `pending` or `partially recorded`, ask **once** before opening:
> Before we dive in — did you act on any of the recommended actions?

Use `AskUserQuestion` with options `Yes — record them now`, `Skip`. If they pick Yes, run the outcome flow (below) first. If Skip, go straight to `phases/followup.md`.

If outcomes are already fully recorded, open `phases/followup.md` directly.

### Record outcomes

List the session's recommended actions grouped Today / This week / This month. For each, use `AskUserQuestion` with options `taken`, `skipped`, `pending`, then a short free-text prompt for an optional note. Users may record some and leave others.

## 3. Persist outcomes

Apply each recorded outcome to `outcomes.json`:
```
echo '{"outcomes":<current outcomes.json or []>,"entry":{"action":"<action text>","status":"<taken|skipped|pending>","note":"<note or null>","recordedAt":"<ISO timestamp>"}}' \
  | node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" record-outcome
```
`record-outcome` replaces any prior entry for the same action. Write the returned array back:
```
echo '<updated outcomes array>' \
  | node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" write-artifact .claude/council/checkpoints/<id> outcomes.json
```

## 4. Update the thread

After saving, recompute the session's outcome status and update its entry in `sessions/THREAD.md` so cross-session memory reflects what happened.
