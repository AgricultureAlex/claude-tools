# claude-tools

A collection of Claude Code mods.

---

## usage-status

Replaces the Claude Code status line with live usage bars.

### What it shows

```
ctx [████████████░░░] 82%  5h [██████░░░░░░░░░] 42%  7d [░░░░░░░░░░░░░░░] 2%  $0.00 over
```

| Column | Meaning | Resets |
|--------|---------|--------|
| `ctx` | Context window fill for this conversation | New conversation |
| `5h` | 5-hour API rate-limit used | Rolling 5-hour window |
| `7d` | 7-day API rate-limit used | Rolling 7-day window |
| `$X.XX over` | Usage credit overage this conversation | New conversation |

**Colors:** green below 50%, amber 50–80%, red 80%+.

The `over` label is always visible so the column is self-labeling from session start (`$0.00 over` before any overage accrues).

### Responsive layout

The display adapts as your terminal narrows. `%` signs are dropped before the cost label is ever removed.

**Wide — bars:**
```
ctx [████████████░░░] 82%  5h [██░░░░░░░░░░░░░] 18%  7d [░░░░░░░░░░░░░░░] 2%  $0.00 over
```

**Medium — compact:**
```
ctx 82%  5h 18%  7d 2%  $0.00 over
```

**Narrow — two rows:**
```
ctx  5h  7d
82%  18%  2%  $0.00 over
```

**Very narrow — values only, no `%`:**
```
ctx  5h  7d
82   18   2  $0
```

### Install

```sh
git clone https://github.com/AgricultureAlex/claude-tools.git
cd claude-tools
sh install.sh
```

Then open a new Claude Code session.

**Multiple plugin dirs:** If you already have `CLAUDE_CODE_PLUGIN_DIRS` set, add the new path with a `:` separator:
```sh
export CLAUDE_CODE_PLUGIN_DIRS="$CLAUDE_CODE_PLUGIN_DIRS:$HOME/.claude/plugins/usage-status"
```

**Custom Claude install location:** Set `CLAUDE_DIR` before running the script:
```sh
CLAUDE_DIR=/path/to/claude sh install.sh
```

**Non-zsh shells (Linux):** The script writes to `~/.bashrc` on Linux. For fish, nushell, etc., add the export line to your shell's RC file manually:
```sh
export CLAUDE_CODE_PLUGIN_DIRS="$HOME/.claude/plugins/usage-status"
```
