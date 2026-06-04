# Phase: Scope — recommend effort & model

The bridge between "what's the idea?" and running the council. Read the request,
recommend an **effort tier** and a **model** with a one-line rationale, and let the
user confirm or override — so nobody pays for Deep on a gut-check or burns Opus on
a trivial question.

Inputs: the idea (single-idea) or both options (head-to-head). Output handed back to
the caller: a chosen `effort` (`quick|standard|deep`), a `model`
(`opus-4-7|sonnet-4-6|haiku-4-5`), and the scope signals `complexity` + `stakes`.
**This phase writes no artifact and is safe to abort** — nothing is committed yet,
so cancelling here never leaves an `abandoned` marker.

UX rules from `SKILL.md` apply.

## 1. Scope read (Haiku 4.5)

Narrate: *"Sizing up the request — a few seconds."*

Spawn a **Haiku 4.5** sub-agent (this is a low-value judgment — never spend the
primary model on it) that reads the idea (both options, for head-to-head) and returns:
- `complexity` ∈ `low | medium | high` — unknown territory / moving parts.
- `stakes` ∈ `low | medium | high` — cost of being wrong (capital, reputation, irreversibility).
- `recommendedEffort` ∈ `quick | standard | deep`.
- a one-line `rationale` the user will see.

If the idea is a single thin line with no context, you may ask **one** scoping
question first (e.g. *"One line on what's riding on this?"*) — at most one; deeper
questions belong to the pre-brief. "skip" / Enter → proceed on the idea alone.

If the sub-agent is unsure, map signals → effort:

| Signal | Lean |
|---|---|
| low complexity **and** low stakes | Quick |
| anything in between | Standard |
| high complexity **or** high stakes | Deep |

## 2. Recommend the effort (`AskUserQuestion`)

State the recommendation in one line (the `rationale`), then offer the choice. List
the three tiers, append **"(recommended)"** to the one the scope read picked, and add
a Cancel. Each tier shows its wall-time + a one-line benefit — **no token number here;
the precise estimate lands at the casting gate once the real seat count is known.**

- `Quick — ~1–2 min · fast gut-check, 3 specialists, no cross-exam`
- `Standard — ~3–5 min · balanced, auto-resolves the top unknowns`
- `Deep — ~6–10 min · cross-examination + deepest bench`
- `Cancel — don't run`

If **Cancel** → stop. Write no `abandoned` marker.

## 3. Recommend the model (`AskUserQuestion`)

Map the scope read to a primary-model recommendation:

| Scope | Recommended primary |
|---|---|
| low complexity **and** low stakes (typically Quick) | Haiku 4.5 |
| medium complexity **or** medium stakes | Sonnet 4.6 |
| high complexity **or** high stakes, or Deep chosen | Opus 4.7 |

Header: *"Primary model — runs the seats, the Chair, and follow-up. Utility steps always use Haiku 4.5."*
Offer all three with the mapped one marked **"(recommended)"** and pre-selected:

- `Opus 4.7 — deepest reasoning`
- `Sonnet 4.6 — balanced (default)`
- `Haiku 4.5 — fastest / cheapest`

This sets the model for **this session only** (written to `meta.json`). To change the
saved cross-session default, the user can run model selection (`phases/settings.md`).

## 4. Hand back

Return the chosen `effort` and `model`, plus the `stakes` reading (`low|medium|high`),
to the caller, which writes them into `meta.json` (`stakes` populates the existing
field, which the pre-brief reads to stop early). `complexity` was only needed to shape
this recommendation — it is **not** persisted.
- **Single idea** → back to `SKILL.md` "New session".
- **Head-to-head** → back to `phases/compare.md`.
