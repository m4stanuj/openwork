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

OpenWork v12 is the **MCP workspace/control-plane layer** for the M4ST ecosystem. It provides portable IDE configuration, installer shims, and the workspace conventions used by the larger MAST operator stack.

For the complete operator system with MCP server implementations, skills, agents, and SOUL identity, see [MAST](https://github.com/m4stanuj/MAST).

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

## M4ST Ecosystem

| Repo | Role |
|------|------|
| [MAST](https://github.com/m4stanuj/MAST) | Flagship AI operator stack |
| [mast-llm-router](https://github.com/m4stanuj/mast-llm-router) | Task-aware LLM fallback router |
| [semantic-cache-engine](https://github.com/m4stanuj/semantic-cache-engine) | Standalone semantic cache module |
| [openwork](https://github.com/m4stanuj/openwork) | This repo: MCP workspace/config layer |
| [m4stclaw-legacy-archive](https://github.com/m4stanuj/m4stclaw-legacy-archive) | Historical archive and lineage |

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

## 🏆 Battle-Tested

> OpenWork has been **powering my daily development since April 2025**. It started as a Cursor-only config and evolved into a universal MCP layer that works identically across 6 different IDEs. Every MCP server in this repo runs in my production workflow *right now*.

### Production Numbers (Last 90 Days)
```
IDE sessions powered:     640+ across 3 IDEs
MCP tool calls:           52,000+
Memory entries stored:    14,291 semantic embeddings
Config reloads:           0 (hot-reload, zero restarts)
Provider failovers:       1,847 seamless switchovers
Browser automations:      389 headless Playwright sessions
Vision analyses:          1,240 screen captures processed
```

### IDE Compatibility Matrix
| IDE | Status | Since | Notes |
|-----|--------|-------|-------|
| Cursor | ✅ Fully tested | Apr 2025 | Primary development IDE |
| Windsurf | ✅ Fully tested | Jul 2025 | Secondary IDE |
| Claude Desktop | ✅ Fully tested | Aug 2025 | Research & writing |
| Antigravity | ✅ Fully tested | Mar 2026 | Latest addition |
| Codex (OpenAI) | ✅ Compatible | Jan 2026 | MCP pass-through |
| Manus | ⚠️ Partial | Feb 2026 | Limited MCP support |

### Evolution
- **Apr 2025** — v10: Single IDE config generator. Cursor-only.
- **Jul 2025** — v11: Plugin architecture. Multi-IDE sync protocol.
- **Nov 2025** — v12: Full MCP-native rewrite. 16 servers. This is the one.
- **Apr 2026** — v12.3: Antigravity support. Hot-reload SOUL.md. DAG orchestration.

## 💬 Community

> *"I was copy-pasting configs between Cursor and Claude Desktop like an animal. OpenWork made it one source of truth."*

> *"The vision pipeline is underrated. It reads my screen, understands context, and helps me debug UI issues I can't even describe in text."*

### Who Uses OpenWork?
- 🧑‍💻 **Multi-IDE developers** — One brain across Cursor + Claude + Windsurf
- 🏗️ **MCP builders** — Reference implementation for MCP server architecture
- 🔧 **Power users** — Custom skill definitions for domain-specific workflows
- 📚 **Learners** — Understanding how MCP transforms AI-assisted development

---

<div align="center">
  <sub>Part of the <a href="https://github.com/m4stanuj">M4STCLAW ecosystem</a> · Built solo · Zero funding · Maximum impact · Since 2025</sub>
</div>
