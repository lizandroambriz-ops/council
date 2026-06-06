# The Council

A multi-agent idea-validation panel for [Claude Code](https://claude.com/claude-code). Three permanent critics — **The Adversary**, **The Pre-Mortem**, **The Resource Realist** — plus domain specialists cast on the fly independently research and stress-test an idea with live web search, and a **Chair** synthesises a structured verdict with confidence scores, blocking conditions, and time-bound next actions.

Two ways to run: **validate one idea** or **compare two ideas (A vs. B)**. Once it understands your request, the Council recommends an effort level (**Quick / Standard / Deep**) and the best model, shows a token + wall-time estimate before the expensive phase, then runs. A **logbook** keeps past sessions with outcome tracking, and you can **follow up** over any completed verdict.

## Prerequisites

- Claude Code
- **Node.js** (v18+). All deterministic work — scoring, checkpoint I/O, rendering, config — runs through a tested Node helper (`lib/cli.mjs`); the skill never re-implements it in prose.

## Install

The Council ships as a **Claude Code plugin**. There are two ways to get it; the plugin route is recommended.

### Option A — Install as a plugin (recommended)

This repo is also a plugin marketplace, so you can install without cloning. In Claude Code:

```
/plugin marketplace add lizandroambriz-ops/council
/plugin install council@council
```

Then run it with the namespaced command:

```
/council:council
```

Plugin skills are always namespaced (`/<plugin>:<skill>`), which is why the command is `/council:council`. Updates are a single `/plugin marketplace update` away.

### Option B — Install as a standalone skill (clone & copy)

Prefer to vendor the skill directly (e.g. commit it into a project)? Clone the repo and run the bundled installer:

```bash
git clone https://github.com/lizandroambriz-ops/council.git
cd council
./install.sh            # all projects   → ~/.claude/skills/council/
./install.sh --project  # current project → ./.claude/skills/council/
```

Or copy it by hand — the installer just places the skill folder:

```bash
# personal (all projects)
cp -r skills/council ~/.claude/skills/council

# or per-project (commit it alongside your code)
mkdir -p .claude/skills && cp -r skills/council .claude/skills/council
```

Restart Claude Code so it discovers the skill, then run `/council` (standalone installs are **not** namespaced).

> The same `SKILL.md` works in both modes: it locates its helper CLI via `${CLAUDE_PLUGIN_ROOT:-.claude}/skills/council/lib/cli.mjs`, which resolves to the plugin directory when installed as a plugin and to `.claude/skills/council/` when installed standalone.

Verify the install (optional):

```bash
node --test skills/council/lib/*.test.mjs   # expect: 82 pass
```

## Usage

Run `/council:council` (plugin) or `/council` (standalone). You'll get a short menu: **Validate an idea**, **Compare two ideas**, or **Past sessions**. Once you describe the idea, the Council recommends an effort level and model (you can override either), then shows a token + wall-time estimate at the launch gate so you can abort before spending. Sessions are checkpointed at every phase boundary and auto-resume if interrupted. Each completed session writes a Markdown transcript and a self-contained HTML report.

Session data (checkpoints, transcripts, HTML reports) is written under **`.claude/council/`** in your current project — never inside the plugin directory, so it survives plugin updates.

The primary model — **Opus 4.7, Sonnet 4.6, or Haiku 4.5**, recommended per query and overridable — runs the needle-moving work (research, Chair synthesis, follow-up). Haiku 4.5 always runs the low-value utility calls (scope read, casting, seat selection, unknowns classification), so a higher-tier choice only spends where it changes the verdict.

## Layout

```
.claude-plugin/
  plugin.json        plugin manifest
  marketplace.json   marketplace catalog (this repo is its own marketplace)
skills/council/
  SKILL.md           router — startup, resume detection, menu, phase routing
  phases/            one file per phase (prebrief, casting, research, cross_exam,
                     chair, resolve, export, followup, logbook, compare, settings)
  lib/               tested Node helpers (*.mjs) + their tests (*.test.mjs)
install.sh           standalone installer (Option B)
```

## Tests

```bash
node --test skills/council/lib/*.test.mjs
```

## License

[MIT](LICENSE) © 2026 Lizandro Ambriz — you're free to use, modify, and redistribute it. Attribution appreciated but not required.
