# Phase: Follow-up conversation

A Chair-led Q&A over a finished session. Opens automatically after the HTML link at the end of every session, and is reachable for any completed session from `phases/logbook.md`. Never re-runs the pipeline — reads already-checkpointed data.

Inputs: the whole session, read in one call. Output: appended `qa_log.md`.

UX rules from `SKILL.md` apply.

## Open

Narrate *"Loading the full session so you can ask anything about it."* Then load:
```
node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" load-session .claude/council/checkpoints/<id>
```
Then ask:
> What questions do you have?

## Chair answers (default path)

The **Chair** (primary model) answers from the loaded session context. **Most questions are answered directly, without spawning any sub-agent.**

## On-demand seat escalation

Escalate to a single seat sub-agent only when:
- the user explicitly names a seat ("what would The Adversary say about X?"),
- the question needs fresh **WebSearch** research not in the session,
- the Chair judges the question outside its synthesis role.

Escalation spawns **one** seat sub-agent with that seat's persona config + the follow-up question, plus WebSearch if needed. Return its answer, then the Chair resumes. Do not escalate every question — it is the exception.

## Log every round

Immediately after each response, append the round to `qa_log.md`:
```
printf '\n## Q: %s\n\n%s\n' "<user question>" "<response>" \
  >> .claude/council/checkpoints/<id>/qa_log.md
```

## Graceful close

After each answer, watch for a natural close signal — "thanks", "that's all", "done", "close". **Do not** ask "Are you done?" after every message. On a close signal, confirm once:
> Session closed. You can reopen it from Past sessions at any time.

Then stop. The session is already `DONE`; reopening later re-enters this phase via the logbook.
