# ⚡ OpenWork

> **Universal MCP Workspace & Control Plane for AI IDEs**  
> Sync Model Context Protocol (MCP) servers across Cursor, Windsurf, Claude Desktop, and Continue with zero schema drift.

[![npm version](https://img.shields.io/badge/npm-v0.1.0-blue.svg)](https://www.npmjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)]()
[![CI](https://github.com/m4stanuj/openwork/actions/workflows/ci.yml/badge.svg)](https://github.com/m4stanuj/openwork/actions)

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

# 3. Preview changes before applying
npx @m4stanuj/openwork diff --verbose

# 4. Deploy and sync across all clients simultaneously
npx @m4stanuj/openwork sync
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    openwork.json (Master)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  filesystem   │  │    github     │  │   database    │     │
│  │  MCP Server   │  │  MCP Server   │  │  MCP Server   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│                    .env Resolution                           │
│         ${GITHUB_TOKEN} → actual_token_value                │
├───────────┬───────────┬───────────┬─────────────────────────┤
│           │           │           │                         │
│     ▼           ▼           ▼           ▼                   │
│  Claude      Cursor      Cursor     Windsurf                │
│  Desktop    (Global)   (Workspace)  (Global)                │
│  config.json  mcp.json   mcp.json  mcp_config.json          │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

| Feature | Description |
|:---|:---|
| 🏎️ **Zero Dependencies** | Built with pure native Node.js ESM. No `node_modules` bloat. |
| 🔍 **Smart Auto-Detection** | Discovers Claude Desktop, Cursor, and Windsurf on Windows, macOS, and Linux. |
| 🔐 **Secret Safe** | `.env` interpolation — use `${DATABASE_URL}` in config; keys never committed. |
| 🛡️ **Atomic Backups** | Every sync creates `.bak` copies of previous configs before writing. |
| 🧪 **Dry-Run Mode** | `openwork sync --dry-run` simulates actions without touching disk. |
| 🔬 **Diff Command** | `openwork diff` shows missing/extra servers per IDE before syncing. |
| 📝 **Verbose Logging** | `--verbose` flag for debugging sync and config resolution issues. |

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
| `openwork diff` | Compare master config vs each IDE's current state |
| `openwork diff --verbose` | Show detailed missing/extra server breakdown |
| `openwork status` | Inspects current drift and server count across all targets |

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

---

## 👤 Author & License
Crafted with ❤️ by **Anuj ([@m4stanuj](https://github.com/m4stanuj))**  
Distributed under the **MIT License**.
