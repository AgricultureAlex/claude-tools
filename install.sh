#!/bin/sh
set -e

CLAUDE_DIR="${CLAUDE_DIR:-$HOME/.claude}"
DEST="$CLAUDE_DIR/plugins/usage-status"
SRC="$(cd "$(dirname "$0")" && pwd)/usage-status"

cp -r "$SRC" "$DEST"
echo "Installed to $DEST"

# Add CLAUDE_CODE_PLUGIN_DIRS to the shell RC file
case "$(uname -s)" in
  Darwin) RC="$HOME/.zshrc" ;;
  *)      RC="$HOME/.bashrc" ;;
esac

if grep -q 'CLAUDE_CODE_PLUGIN_DIRS' "$RC" 2>/dev/null; then
  echo "Note: CLAUDE_CODE_PLUGIN_DIRS already set in $RC"
  echo "      Add $DEST to it manually if running multiple mods."
else
  printf '\nexport CLAUDE_CODE_PLUGIN_DIRS="%s"\n' "$DEST" >> "$RC"
  echo "Added CLAUDE_CODE_PLUGIN_DIRS to $RC"
fi

echo "Done. Open a new Claude Code session to load the mod."
