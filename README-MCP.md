# Universal MCP Setup — MAST / M4STCLAW / OpenWork

Make the M4ST MCP servers work in **any** MCP-compliant client — Claude Code,
Cursor, Windsurf, Codex, Antigravity — with **zero manual tweaking**.

## Why this works everywhere

The M4ST MCP servers are **plain MCP** — JSON-RPC 2.0 over stdio
(`initialize`, `tools/list`, `tools/call`, protocol version `2024-11-05`).
They have **no Claude-only assumptions**. Any MCP-compliant client can consume
them. The only thing that differs per client is the **config file format** —
and that is exactly what this setup generates for you.

## Quick start

```bash
# 1. Point at your MCP server scripts (the folder with memory_mcp.py, shell_mcp.py, ...)
python setup_universal.py --mcp-dir C:/Users/<you>/.config/opencode/mcp_servers --all

# 2. Or target one client explicitly
python setup_universal.py --mcp-dir C:/Users/<you>/.config/opencode/mcp_servers --client codex

# 3. Preview without writing anything
python setup_universal.py --mcp-dir C:/Users/<you>/.config/opencode/mcp_servers --all --dry-run
```

The script **detects** which clients are installed, writes each client's native
config, and is **idempotent** — re-running merges by server name and never
creates duplicates or breaks existing entries.

## Per-client setup

### Claude Code
- **Project scope:** `.mcp.json` at project root
- **User scope:** merge `mcpServers` into `~/.claude.json`
- Template: `mcp_configs/claude-code/.mcp.json`
- Optional plugin: `.claude-plugin/` (thin layer, see its README)

### Cursor
- **Project scope:** `.cursor/mcp.json`
- Template: `mcp_configs/cursor/.cursor/mcp.json`
- Cursor reads this automatically on project open.

### Windsurf
- **Project scope:** `.windsurf/mcp.json`
- **Global scope:** `~/.codeium/windsurf/mcp_config.json`
- Template: `mcp_configs/windsurf/.windsurf/mcp.json`

### Codex
- **Config:** `~/.codex/config.toml` — native TOML `[mcp_servers.NAME]` blocks
- Template: `mcp_configs/codex/config.toml`
- The setup script merges `[mcp_servers.*]` blocks idempotently (no duplicates).
- You can also use `codex mcp add` manually.

### Antigravity
- **Config:** `~/.antigravity/opencode.jsonc` (JSONC, opencode-compatible)
- Template: `mcp_configs/antigravity/opencode.jsonc`
- Kept in sync with the `antigravity-migration` repo.

## CLI reference

```
python setup_universal.py \
  --mcp-dir <path>          # folder with MCP server .py scripts (required)
  --all                     # write configs for every detected client
  --client claude|cursor|windsurf|codex|antigravity
  --project-dir <path>      # project root for project-scoped configs (default: cwd)
  --user                    # also write user/global configs (Claude, Windsurf)
  --dry-run                 # preview without writing
  --force                   # overwrite existing server entries (default: merge)
```

## Files

| File | Purpose |
|------|---------|
| `setup_universal.py` | Detects clients, generates + injects configs (idempotent) |
| `mcp_configs/` | Reference templates per client |
| `.claude-plugin/` | Optional thin Claude Code plugin layer |
| `README-MCP.md` | This file |

## Guardrails honored

- **Add-only:** no existing core file was modified — everything here is new.
- **Plain MCP:** servers stay client-agnostic; only config wrappers are added.
- **Idempotent:** safe to re-run, merges by server name.