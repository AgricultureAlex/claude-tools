# claude-tools

A collection of Claude Code mods.

---

## usage-status

Replaces the Claude Code status line with live (approximate) usage
and context dashboard in a responsive layout. A picture is worth a thousand words:
![Screenshot 2026-11-26 at 12.53.51 PM.png](usage-status/docs/Screenshot%202026-11-26%20at%2012.53.51%E2%80%AFPM.png)

And a video demonstrating the responsive layout:
[Screen Recording 2026-11-26 at 12.54.47 PM.mov](usage-status/docs/Screen%20Recording%202026-11-26%20at%2012.54.47%E2%80%AFPM.mov)

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
