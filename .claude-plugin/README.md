# M4ST / OpenWork — Claude Code Plugin (thin layer)

This directory is an **optional** thin wrapper that lets you install the M4ST MCP
servers as a Claude Code plugin. It does **not** contain the server logic — the
core MCP servers are plain, client-agnostic stdio JSON-RPC 2.0 servers that any
MCP-compliant client can consume.

## Install

1. Resolve `${MCP_DIR}` to the absolute path of your MCP server scripts
   (e.g. `C:/Users/<you>/.config/opencode/mcp_servers`).
2. Replace `${MCP_DIR}` in `.mcp.json` with that absolute path.
3. Run in Claude Code:

   ```
   /plugin install <path-to-this-repo>
   ```

## What this is NOT

This is not a Claude-only dependency. The same servers are registered for
Cursor, Windsurf, Codex, and Antigravity via `setup_universal.py` and the
`mcp_configs/` templates. This plugin is purely a convenience for Claude Code
users.