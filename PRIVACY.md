# Privacy Policy

_Last updated: 2026-06-06_

**The Council** ("the plugin") is an open-source Claude Code plugin maintained by Lizandro Ambriz. This policy explains what the plugin does and does not do with your data.

## The short version

The plugin **does not collect, store, transmit, or sell any personal data to the author or to any third party.** There is no telemetry, no analytics, no tracking, and no "phone home." Everything runs locally inside your own Claude Code session.

## What the plugin does with your input

- **Runs locally.** The plugin is a skill (Markdown instructions plus a Node helper that performs scoring, file I/O, and rendering). It executes entirely on your machine within Claude Code.
- **Your idea is processed by the AI models you are already using.** To produce a verdict, the text you provide is sent to Anthropic's Claude models **through your own Claude Code installation**, exactly as any other Claude Code prompt is. This processing is governed by [Anthropic's Privacy Policy](https://www.anthropic.com/legal/privacy) and your existing Claude Code / API terms — not by the plugin author.
- **Live web research.** During its research phases the plugin asks Claude Code to perform web searches related to your idea. Those searches are carried out by Claude Code's built-in web tools and the underlying search/content providers, subject to their own policies. The plugin itself does not contact any author-controlled server.
- **Outputs stay on your machine.** Session artifacts — checkpoints, the Markdown transcript, and the HTML report — are written to `.claude/council/` inside your current project. Your model preference is stored locally at `~/.claude/quorum_config.json`. None of this is uploaded anywhere by the plugin.

## What the author receives

**Nothing.** The author does not operate any backend service for this plugin and receives no data about who installs it, what ideas are evaluated, or how it is used.

## Your control

Because all data is local, you control it entirely. Delete the contents of `.claude/council/` at any time to remove session history, or uninstall the plugin to remove the skill.

## Changes

Any updates to this policy will be published in this file in the public repository: <https://github.com/lizandroambriz-ops/council>.

## Contact

Questions? Open an issue at <https://github.com/lizandroambriz-ops/council/issues>.
