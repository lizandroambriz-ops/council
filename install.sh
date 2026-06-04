#!/usr/bin/env bash
#
# Install The Council skill into a Claude Code skills directory.
#
#   ./install.sh            # personal install → ~/.claude/skills/council/
#   ./install.sh --project  # project install  → ./.claude/skills/council/
#
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

case "${1:-}" in
  --project|-p)
    DEST="$(pwd)/.claude/skills/council"
    SCOPE="this project"
    ;;
  ""|--global|-g)
    DEST="$HOME/.claude/skills/council"
    SCOPE="all projects"
    ;;
  -h|--help)
    grep '^#' "$0" | sed 's/^# \{0,1\}//'
    exit 0
    ;;
  *)
    echo "Unknown option: $1" >&2
    echo "Usage: ./install.sh [--project]" >&2
    exit 1
    ;;
esac

# Sanity-check we are running from a clone that contains the skill.
for item in SKILL.md phases lib; do
  if [ ! -e "$SRC/$item" ]; then
    echo "error: '$item' not found next to install.sh — run this from the cloned repo." >&2
    exit 1
  fi
done

mkdir -p "$DEST"
cp -r "$SRC/SKILL.md" "$SRC/phases" "$SRC/lib" "$DEST/"

echo "Installed The Council for $SCOPE at:"
echo "  $DEST"
echo
echo "Restart Claude Code, then run /council."
