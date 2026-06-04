---
name: council
description: Run a multi-agent idea-validation panel (The Council) inside Claude Code. A bench of AI expert personas independently stress-tests an idea with live web research; a Chair synthesises a structured verdict with scores, blocking conditions, and time-bound next actions. Use when the user wants to pressure-test, validate, or get a second opinion on an idea, plan, or decision, or invokes /council.
---

# The Council

A multi-agent idea-validation panel. Three permanent critics — The Adversary, The Pre-Mortem, The Resource Realist — plus domain specialists cast on the fly independently research and stress-test an idea, and a Chair synthesises a verdict.

This `SKILL.md` is the **router**. It detects resumable sessions, renders the menu, resolves the model preference, and hands off to a phase file.

## Conventions (read first)

- **Helper CLI** — all deterministic work (scoring, checkpoint I/O, rendering, config) is done by a tested Node module. Invoke it as:
  ```
  node .claude/skills/council/lib/cli.mjs <command> [args]   # JSON payloads on stdin
  ```
  Paths are relative to the repo root.
- **Data locations**
  - Checkpoints: `.claude/skills/council/checkpoints/<session-id>/`
  - Session outputs: `.claude/skills/council/sessions/` (`<id>.md`, `<id>.html`, `THREAD.md`)
  - Model preference: `~/.claude/quorum_config.json`
- **Session id** — `cli.mjs session-id` returns the canonical `YYYYMMDDTHHMMSS` id.
- **Models — two tiers.** **Needle-moving work** (research seats, cross-examination, Chair synthesis, follow-up, pre-brief questions) runs on the session's **primary model** — Opus 4.7, Sonnet 4.6, or Haiku 4.5 — recommended per query in `phases/scope.md` and stored in `meta.json`. **Low-value work always runs on Haiku 4.5** regardless of the primary choice: the scope read, casting director, seat selector, and unknowns classifier. Choosing Opus therefore only spends Opus where it changes the verdict.

## UX rules (apply in every phase)

These rules govern how you talk to the user. Follow them in this file and in every phase file. They override default verbosity habits.

1. **Menus use `AskUserQuestion`, not free-text input.** Whenever the user is picking from a list — main menu, model choice, past-session picker, bench review actions, outcome status — call the `AskUserQuestion` tool with the options as a selectable list. Never ask the user to *type* a choice when a list exists.
2. **Auto-accept recommendation at startup.** Before the main menu, tell the user once: *"Tip — press Shift+Tab to enable auto-accept mode. The Council runs many small local CLI calls and approving each one slows the session significantly."* Skip this line if the same session has already shown it.
3. **Narrate intent, not commands.** Before any `Bash` or write tool, state in one short sentence (≤ 12 words) what you are about to do in plain English (e.g. *"Saving the bench so we can resume later."*). Do **not** paste the command as a sentence and do **not** show the literal command in your chat text — the tool call already shows it.
4. **No echo / keep-alive / polling chatter.** Never emit `echo ping`, `echo READY`, `echo ok`, `echo poll`, `echo r1`/`r2`/…, `echo waiting`, `date +%s`-style heartbeats, or any command whose only output is a synchronisation token. Do not re-read the same file or re-print the same status to "stay alive". If you genuinely need to wait, wait silently.
5. **Combine housekeeping into one tool call.** Don't chain `mkdir` + `printf` + `ls` + debug `>` as separate Bash calls when one call writes the artifact. Use `write-artifact` once; the CLI handles the directory.
6. **Progress, not a transcript.** During research, cross-examination, and resolve, emit only the tick lines specified by each phase. Do not paste seat summaries, reasoning, scores grids, raw CLI JSON, or sub-agent activity logs into chat. The artifacts live on disk and are rendered into the final `.md` / `.html`.
7. **One headline at the end.** When export completes, the absolute `file://` HTML link is the only output the user needs — present it as the deliverable they can open or download.

## Startup sequence

1. **Load the saved model default (silently).**
   - Run `cli.mjs config-get ~/.claude/quorum_config.json` to read the saved default (Opus 4.7 / Sonnet 4.6 / Haiku 4.5; default Sonnet 4.6).
   - Do **not** announce it — the per-query model is recommended later in `phases/scope.md`, which uses this saved value as its starting point.

2. **Auto-accept tip.** Emit the Shift+Tab line from UX rule 2 (once per session).

3. **Check for resumable sessions.** Run `cli.mjs select-resume .claude/skills/council/checkpoints` and interpret `action`:
   - `resume` — announce `Resuming: <idea excerpt> — stopped after <session.lastPhase>` and jump to the phase **after** `lastPhase`. Don't re-ask answered questions.
   - `picker` — list resumable sessions and use `AskUserQuestion` to let the user pick one or start fresh.
   - `menu` — proceed to the main menu.

4. **Main menu — use `AskUserQuestion`** with these options (don't ask the user to type a number):
   - `1. Validate an idea`
   - `2. Compare two ideas`
   - `3. Past sessions`

   Effort (Quick/Standard/Deep) and model are **not** chosen here — they're recommended after the idea is known, in `phases/scope.md`.

## Routing

| Selection | Goes to |
|---|---|
| 1 Validate an idea | start a new session (see "New session" below) |
| 2 Compare two ideas | `phases/compare.md` |
| 3 Past sessions | `phases/logbook.md` |

Model selection (`phases/settings.md`) is no longer a menu item — model is recommended per query in `phases/scope.md`. It stays reachable if the user explicitly asks to change their saved cross-session default.

## New session

1. **Ask for the idea** (one line is fine; the scope read and pre-brief can elaborate). Do **not** write anything yet.
2. **Recommend effort + model** — run `phases/scope.md`, which reads the request and hands back a chosen `effort`, `model`, and a `stakes` signal (`low|medium|high`). If the user cancels there, stop — nothing was committed (no `abandoned` marker).
3. **Create the session** — narrate *"Creating the session folder and meta file so progress can be saved."*, then run `session-id` and write `meta.json` (now carrying the recommended model/effort and the scope signals) via:
   ```
   echo '{"idea":"<idea>","model":"<model>","effort":"<quick|standard|deep>","stakes":"<low|medium|high>","createdAt":"<id>","abandoned":false}' \
     | node .claude/skills/council/lib/cli.mjs write-artifact .claude/skills/council/checkpoints/<id> meta.json
   ```
4. Run phases in order:

   **Phase order:** `prebrief` → `casting` → `research` → (`cross-examination` — Deep only) → `chair` → (`resolve` — Standard/Deep only) → `export`.

   For **Quick**: `prebrief` → `casting` → `research` → `chair` → `export`.

   | Phase | File | Effort gating |
   |---|---|---|
   | prebrief | `phases/prebrief.md` | all (question ceiling: Quick 4 / Standard 5 / Deep 6) |
   | casting | `phases/casting.md` | all (dynamic seats: Quick 2–3 / Standard 3–4 / Deep 4–5) |
   | research | `phases/research.md` | all |
   | cross-examination | `phases/cross_exam.md` | Deep only |
   | chair | `phases/chair.md` | all |
   | resolve | `phases/resolve.md` | Standard + Deep |
   | export | `phases/export.md` | all |

## Quitting

If the user says "quit" / "cancel" / "stop" mid-session, mark abandoned and stop:
```
node .claude/skills/council/lib/cli.mjs mark-abandoned .claude/skills/council/checkpoints/<id>
```
Aborting at the casting preflight estimate is **not** a quit — no `abandoned` marker (no research was committed).
