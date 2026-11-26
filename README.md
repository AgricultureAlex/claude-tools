# claude-tools

A collection of Claude Code mods.

---

## usage-status

Replaces the Claude Code status line with live usage bars.

### What it shows

```
ctx [████████████░░░] 82%  5h [██████░░░░░░░░░] 42%  7d [░░░░░░░░░░░░░░░] 2%  $0.00 (this chat)
```

| Column | Meaning | Resets |
|--------|---------|--------|
| `ctx` | Context window fill for this conversation | New conversation |
| `5h` | 5-hour API rate-limit used | Rolling 5-hour window |
| `7d` | 7-day API rate-limit used | Rolling 7-day window |
| `$X.XX (this chat)` | Estimated API compute cost this conversation | New conversation |

**Colors:** green below 50%, amber 50–80%, red 80%+.

The cost column shows the estimated API compute cost of this conversation (what the token usage would cost at API rates). It is an estimate, not the amount billed — Anthropic's billing system accounts for your subscription separately.

### Responsive layout

The display adapts as your terminal narrows. `%` signs are dropped before the cost label is ever removed.

**Wide — bars:**
```
ctx [████████████░░░] 82%  5h [██░░░░░░░░░░░░░] 18%  7d [░░░░░░░░░░░░░░░] 2%  $0.00 (this chat)
```

**Medium — compact:**
```
ctx 82%  5h 18%  7d 2%  $0.00 (this chat)
```

**Narrow — two rows:**
```
ctx  5h  7d
82%  18%  2%  $0.00 (this chat)
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
