# The Council

A multi-agent idea-validation panel for [Claude Code](https://claude.com/claude-code). Three permanent critics — **The Adversary**, **The Pre-Mortem**, **The Resource Realist** — plus domain specialists cast on the fly independently research and stress-test an idea with live web search, and a **Chair** synthesises a structured verdict with confidence scores, blocking conditions, and time-bound next actions.

Two ways to run: **validate one idea** or **compare two ideas (A vs. B)**. Once it understands your request, the Council recommends an effort level (**Quick / Standard / Deep**) and the best model, shows a token + wall-time estimate before the expensive phase, then runs. A **logbook** keeps past sessions with outcome tracking, and you can **follow up** over any completed verdict.

## Prerequisites

- Claude Code
- **Node.js** (v18+). All deterministic work — scoring, checkpoint I/O, rendering, config — runs through a tested Node helper (`lib/cli.mjs`); the skill never re-implements it in prose.

## Install

The skill must live at the path `.claude/skills/council/`. Clone the repo, then run the bundled installer:

```bash
git clone https://github.com/lizandroambriz-ops/council.git
cd council
./install.sh            # installs for all projects → ~/.claude/skills/council/
./install.sh --project  # or install into the current project → ./.claude/skills/council/
```

Prefer to do it by hand? The installer just copies three things into place:

```bash
# personal (all projects)
mkdir -p ~/.claude/skills/council
cp -r SKILL.md phases lib ~/.claude/skills/council/

# or per-project (commit it alongside your code)
mkdir -p .claude/skills/council
cp -r SKILL.md phases lib .claude/skills/council/
```

Then restart Claude Code so it discovers the skill, and run `/council`.

> The skill expects to live at `.claude/skills/council/` — `SKILL.md` and the phase files reference the helper CLI at that location. Installing under a different folder name will break those paths.

Verify the install (optional):

```bash
node --test ~/.claude/skills/council/lib/*.test.mjs   # expect: 82 pass
```

## Usage

In Claude Code, run:

```
/council
```

You'll get a short menu: **Validate an idea**, **Compare two ideas**, or **Past sessions**. Once you describe the idea, the Council recommends an effort level and model (you can override either), then shows a token + wall-time estimate at the launch gate so you can abort before spending. Sessions are checkpointed at every phase boundary and auto-resume if interrupted. Each completed session writes a Markdown transcript and a self-contained HTML report under `sessions/`.

The primary model — **Opus 4.7, Sonnet 4.6, or Haiku 4.5**, recommended per query and overridable — runs the needle-moving work (research, Chair synthesis, follow-up). Haiku 4.5 always runs the low-value utility calls (scope read, casting, seat selection, unknowns classification), so a higher-tier choice only spends where it changes the verdict.

## Layout

```
SKILL.md      router — startup, resume detection, menu, phase routing
phases/       one file per phase (prebrief, casting, research, cross_exam,
              chair, resolve, export, followup, logbook, compare, settings)
lib/          tested Node helpers (*.mjs) + their tests (*.test.mjs)
```

## Tests

```bash
node --test lib/*.test.mjs
```

## License

[MIT](LICENSE) © 2026 Lizandro Ambriz
