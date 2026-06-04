# Phase: Session output + export

Runs at the end of every completed session. Produces three artifacts, then marks the session done. **The HTML link is the headline deliverable** — the user opens or downloads it from there.

Inputs: everything in the checkpoint dir. Outputs: `sessions/<id>.md`, `sessions/<id>.html`, an appended `sessions/THREAD.md` entry, and the `DONE` marker.

UX rules from `SKILL.md` apply — narrate intent in short plain English before each tool call; do not paste CLI JSON into chat.

**Do not hand-assemble the session.** One module reads every checkpoint artifact and returns the canonical session object that all three renderers consume. Narrate *"Bundling the full session for export."* and run:
```
node .claude/skills/council/lib/cli.mjs load-session .claude/skills/council/checkpoints/<id> > /tmp/council-<id>.json
```

## 1. Session markdown

Narrate *"Writing the session markdown."*
```
node .claude/skills/council/lib/cli.mjs render-session-md < /tmp/council-<id>.json > .claude/skills/council/sessions/<id>.md
```

## 2. Rich HTML report

Narrate *"Writing the HTML report you'll open at the end."*
```
node .claude/skills/council/lib/cli.mjs render-html < /tmp/council-<id>.json > .claude/skills/council/sessions/<id>.html
```
The file is self-contained (inline styles, no external assets), with a decision-card hero, collapsible seat cards, visual score bars, and a distinct pre-resolved section. Head-to-Head sessions render a winner banner and per-option seat cards instead.

## 3. Thread entry

Narrate *"Appending this session to the thread log."* Build the entry from the loaded session and append:
```
echo '{"date":"<YYYY-MM-DD>","idea":"<idea>","confidence":"<level>","scores":{"feasibility":N,"differentiation":N,"upside":N},"firstAction":"<first Today action>","topUnknowns":[...],"outcomes":[]}' \
  | node .claude/skills/council/lib/cli.mjs format-thread-entry >> .claude/skills/council/sessions/THREAD.md
```
(Ensure a blank line separates entries.)

## 4. Mark complete + present the link

Narrate *"Marking the session complete."*
```
node .claude/skills/council/lib/cli.mjs write-done .claude/skills/council/checkpoints/<id>
```
This removes the session from resume candidates.

Resolve the **absolute** path to the HTML report (current working directory joined with `.claude/skills/council/sessions/<id>.html`) and print exactly this block — **nothing else** at this point (no recap, no decision-card re-print, no transcript paste):

```
✓ Council session complete

  Open or download your results:
  file://<absolute path to .html>

  (Markdown: .claude/skills/council/sessions/<id>.md)
```

Then open the follow-up conversation (`phases/followup.md`).
