# Phase: Pre-brief

The Chair gathers just enough context before casting. Three parts: thread injection, adaptive Q&A, checkpoint-per-answer.

Inputs: `meta.json` (idea, effort). Output: `prebrief.json` — an array of `[question, answer]` pairs.

UX rules from `SKILL.md` apply.

## 1. Thread context injection

Narrate (if relevant): *"Reading prior session memory to inform my questions."*

Read `.claude/council/sessions/THREAD.md` if it exists, and surface the 3 most relevant prior entries:
```
node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" recent-entries <<'JSON'
{"thread": <THREAD.md contents as a JSON string>, "n": 3}
JSON
```
Show them as a brief "Continuing context" block. Offer a one-step skip ("skip" / Enter). If `THREAD.md` is absent or empty, skip this silently.

## 2. Adaptive Q&A

Ask clarifying questions **one at a time**, waiting for each answer. Each question must be informed by the idea, the effort level, the `stakes` signal already in `meta.json` (set by the scope read), and prior answers — never a static checklist.

- **Reuse what scope already learned.** `meta.stakes` was set by the scope read. If it is already `low`/`medium`/`high`, don't re-ask "what's at stake?" generically — ask only the specific thing that signal leaves open (e.g. the dominant risk), and feel free to **end after 1–2 questions** when the idea is already well-specified. Ask "what's at stake?" from scratch only if `meta.stakes` is empty.
- **Stop early** when you have enough — the ceiling is a cap, not a target.
- **Ceiling**: Quick **4**, Standard **5**, Deep **6** questions.
- The user may reply **"skip"** or blank → empty answer, move on. **"move on" / "that's enough"** → end the pre-brief immediately.

## 3. Checkpoint per answer

Immediately after each answer, narrate *"Saving your answer."* and rewrite `prebrief.json`:
```
echo '[["q1","a1"],["q2","a2"], ...]' \
  | node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs" write-artifact .claude/council/checkpoints/<id> prebrief.json
```

**On resume:** read the existing `prebrief.json` first; continue from the first unanswered question (or proceed to casting if the pre-brief had ended).

When done, hand off to `phases/casting.md`.
