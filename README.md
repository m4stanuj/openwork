# ⚡ OpenWork

> **Universal MCP Workspace & Control Plane for AI IDEs**  
> Sync Model Context Protocol (MCP) servers across Cursor, Windsurf, Claude Desktop, and Continue with zero schema drift.

[![npm version](https://img.shields.io/badge/npm-v0.1.0-blue.svg)](https://www.npmjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)

---

## 💥 The Problem
Every AI IDE manages MCP server configurations in its own fragmented location:
* **Claude Desktop:** `%APPDATA%\Claude\claude_desktop_config.json` (or macOS `~/Library/...`)
* **Cursor:** `~/.cursor/mcp.json` (Global) or `.cursor/mcp.json` (Workspace)
* **Windsurf:** `~/.codeium/windsurf/mcp_config.json` or `.windsurf/mcp.json`

Whenever you update an API key, add a database server, or switch machines, you have to manually copy and paste JSON across multiple different files. One typo causes silent crashes and broken agent tools.

---

## 🚀 The Solution: `openwork`
**OpenWork** provides a single master configuration file (`openwork.json`) and a zero-dependency CLI that syncs your tool definitions everywhere in **under 100ms**.

```bash
# 1. Initialize your master MCP configuration
npx @m4stanuj/openwork init

# 2. Detect your installed AI IDEs
npx @m4stanuj/openwork detect

# 3. Deploy and sync across all clients simultaneously
npx @m4stanuj/openwork sync
```

---

## ✨ Features
* 🏎️ **Zero External Dependencies:** Built with pure native Node.js ESM. Instant execution with no bloated `node_modules`.
* 🔍 **Smart Auto-Detection:** Automatically discovers installed instances of Claude Desktop, Cursor, and Windsurf across Windows, macOS, and Linux.
* 🔐 **Secret Safe (.env interpolation):** Use `${DATABASE_URL}` or `${GITHUB_TOKEN}` in your master config; OpenWork resolves them at sync time so your keys are never committed to version control.
* 🛡️ **Zero-Loss Atomic Backups:** Every file write automatically creates a `.bak` copy of previous configs before touching disk.
* 🧪 **Dry-Run Mode:** Simulate sync actions (`openwork sync --dry-run`) before making changes.

---

## 📋 Example `openwork.json`

```json
{
  "name": "my-agent-stack",
  "targets": [
    "claude-desktop",
    "cursor-workspace",
    "windsurf-workspace"
  ],
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./data"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

---

## 🛠️ CLI Reference

| Command | Description |
| :--- | :--- |
| `openwork init` | Generates a starter `openwork.json` with recommended tools |
| `openwork detect` | Scans OS and reports installed AI IDE configuration paths |
| `openwork sync` | Syncs `openwork.json` to all active IDE config targets |
| `openwork sync --dry-run` | Previews changes without writing to disk |
| `openwork sync --target <id>` | Target a specific client (e.g. `claude-desktop`) |
| `openwork status` | Inspects current drift and server count across all targets |

---

## 👤 Author & License
Crafted with ❤️ by **Anuj ([@m4stanuj](https://github.com/m4stanuj))**  
Distributed under the **MIT License**.
