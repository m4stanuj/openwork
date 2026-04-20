<div align="center">

# 🔧 OpenWork v12 — Universal MCP Workspace

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![CI](https://github.com/m4stanuj/openwork/actions/workflows/ci.yml/badge.svg)](https://github.com/m4stanuj/openwork/actions)
[![Release](https://img.shields.io/github/v/release/m4stanuj/openwork?style=flat-square&color=B026FF)](https://github.com/m4stanuj/openwork/releases)
[![Stars](https://img.shields.io/github/stars/m4stanuj/openwork?style=flat-square&color=yellow)](https://github.com/m4stanuj/openwork/stargazers)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-16%20Servers-00E5FF?style=flat-square)](https://modelcontextprotocol.io)

**One brain. Every IDE. The MCP workspace layer that makes any AI coding assistant dramatically smarter.**

[Overview](#overview) · [MCP Servers](#mcp-servers) · [Installation](#installation) · [Skills](#skills) · [Platforms](#platforms)

</div>

---

## 🧠 Overview

OpenWork v12 is a **production-grade MCP (Model Context Protocol) workspace** that plugs into any AI coding environment and transforms it into a fully autonomous agent. The same SOUL — identical behavior, identical capabilities — regardless of which IDE you're using.

```
┌──────────────────────────────────────────────────────────┐
│                    OpenWork v12                          │
│                                                          │
│  ┌────────┐  ┌─────────┐  ┌────────┐  ┌──────────────┐ │
│  │Cursor  │  │Windsurf │  │Claude  │  │    Codex     │ │
│  │Desktop │  │  IDE    │  │Desktop │  │    Engine    │ │
│  └────┬───┘  └────┬────┘  └───┬────┘  └──────┬───────┘ │
│       └───────────┴───────────┴───────────────┘         │
│                          │                              │
│              ┌───────────▼──────────┐                   │
│              │   SOUL_v3.md Config  │                   │
│              │   (Hot-reloadable)   │                   │
│              └───────────┬──────────┘                   │
│                          │                              │
│         ┌────────────────▼─────────────────┐            │
│         │         16 MCP Servers           │            │
│         │  task_router │ memory │ research │            │
│         │  pentest     │ shell  │ browser  │            │
│         │  vision      │ file   │ skills   │            │
│         └──────────────────────────────────┘            │
└──────────────────────────────────────────────────────────┘
```

## 🔌 MCP Servers

| Server | Purpose | Key Capabilities |
|--------|---------|-----------------|
| `task_router` ⭐ | Intelligent routing | Auto-detects task type, selects optimal LLM chain |
| `universal_bridge` ⭐ | Cross-IDE sync | Same brain state across all platforms |
| `pentest` ⭐ | Security automation | Nmap, Nuclei, Shodan, CVE lookups |
| `m4st_agent` ⭐ | Multi-agent ops | Sub-agent spawning, OMO protocol |
| `memory` | 3-tier memory | Working + Episodic + ChromaDB Semantic |
| `research` | Deep research | Web scraping, source synthesis |
| `skills` | Skill execution | Custom skill files with hot-reload |
| `react` | ReAct engine | Reasoning + Acting loop for complex tasks |
| `file` | File operations | Read, write, search, diff across workspace |
| `shell` | Shell execution | Safe command execution with guard rails |
| `browser` | Web automation | Playwright-based headless browsing |
| `vision` | 5-layer optical | CV + OCR + UIA + Local AI + Cloud AI |
| `notify` | Notifications | Desktop alerts, webhook integrations |
| `scrapling` | Smart scraping | Anti-bot bypassing web content extraction |
| `llm_fallback` | Failover routing | 56-key pool management across 7 providers |
| `_mcp_base` | Base framework | Shared utilities for all MCP servers |

## 🚀 Installation

```bash
# Clone
git clone https://github.com/m4stanuj/openwork.git
cd openwork

# Windows
.\INSTALL_SKILLS.bat

# Or PowerShell
.\install.ps1

# Configure your API keys
cp .env.template .env
# Edit .env with your keys (supports 56 keys across 7 providers)
```

## 🎯 Supported Platforms

| Platform | Status | Notes |
|----------|--------|-------|
| **OpenWork IDE** | ✅ Native | Designed for this environment |
| **Cursor** | ✅ Full | Plug-and-play via `opencode.json` |
| **Windsurf** | ✅ Full | Same config works out-of-box |
| **Claude Desktop** | ✅ Full | MCP native support |
| **Codex Engine** | ✅ Full | API-level integration |
| **Manus** | ✅ Full | Universal bridge handles handoff |

## ⚡ Skills System

OpenWork supports a hot-reloadable **Skills** system — markdown files that define AI behaviors:

```
skills/
├── deep_research.md      # Multi-step research methodology
├── code_review.md        # Systematic code analysis protocol
├── osint_recon.md        # OSINT reconnaissance workflow
├── report_writer.md      # Auto-generate structured reports
└── pentest_session.md    # Guided penetration testing flow
```

Edit a skill file → behavior changes instantly. No restart needed.

## 📁 Project Structure

```
openwork_v12/
├── mcp_servers/          # All 16 MCP server implementations
│   ├── task_router.py    # ⭐ Intelligent task routing
│   ├── llm_fallback.py   # 56-key provider pool
│   ├── memory_mcp.py     # 3-tier memory system
│   └── ...
├── skills/               # Hot-reloadable skill definitions
├── agents/               # Multi-agent configurations
├── commands/             # Custom command definitions
├── SOUL.md               # Core AI personality config
└── opencode.json         # IDE integration config
```

---

<div align="center">
  <sub>Part of the <a href="https://github.com/m4stanuj">M4STCLAW ecosystem</a> · Built solo · Zero funding · Maximum impact</sub>
</div>
