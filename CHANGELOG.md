# Changelog

All notable changes to OpenWork are documented here.

## [12.3.0] — 2026-04-15

### Added
- **Antigravity IDE** native support — full MCP compatibility confirmed
- SOUL.md hot-reload with <100ms propagation
- `agent_ultrawork` DAG orchestration for complex multi-step tasks

### Fixed
- Universal bridge sync delay when switching between Cursor and Claude Desktop
- Skill file watcher not detecting changes on NFS-mounted volumes

## [12.2.0] — 2026-03-01

### Added
- **Codex Engine** integration — 6th supported IDE platform
- Rate limit detection with automatic provider rotation
- Desktop notification MCP server with progress tracking

### Changed
- Unified config format — single `opencode.json` works across all IDEs
- Upgraded Playwright to 1.50 for improved browser automation

## [12.1.0] — 2026-01-10

### Added
- 5-layer vision pipeline for desktop UI automation
- Scrapling MCP server for anti-bot web extraction
- Research MCP server with depth-configurable web search

## [12.0.0] — 2025-11-01

### Added
- **MCP-native rewrite** — 16 specialized servers
- Task-aware routing with 9 intelligent chains
- 56-key API pool with automatic failover
- 3-tier memory architecture

### Breaking Changes
- Complete architecture change from v11 plugin system
- New environment variable format for multi-key pools

## [11.0.0] — 2025-07-20

### Added
- Plugin-based architecture with hot-swap support
- Multi-IDE synchronization protocol
- Cursor, Windsurf, Claude Desktop support

## [10.0.0] — 2025-04-08

### Added
- Initial public release — universal MCP workspace
- Cursor and VS Code support
- Basic task routing and memory
