#!/usr/bin/env python3
"""
setup_universal.py — Universal MCP installer for MAST / M4STCLAW / OpenWork
============================================================================
Registers the M4ST MCP servers (plain stdio JSON-RPC 2.0 — spec compliant,
client-agnostic) into EVERY MCP-compliant client's native config format:

    Claude Code   ->  .mcp.json            (project)  /  ~/.claude.json (user)
    Cursor        ->  .cursor/mcp.json
    Windsurf      ->  .windsurf/mcp.json   (project)  /  ~/.codeium/windsurf/mcp_config.json (global)
    Codex         ->  ~/.codex/config.toml (native TOML [mcp_servers.X])
    Antigravity   ->  ~/.antigravity/opencode.jsonc

No Claude-specific wrapper is required. The MCP servers themselves are plain
MCP (JSON-RPC 2.0 over stdio), so any MCP-compliant client can consume them.

Idempotent: safe to re-run. Existing configs are merged by server name — no
duplicates, no broken entries, other servers are preserved.

Usage:
    python setup_universal.py --mcp-dir <path-to-mcp-servers> [--all|--client X]
    python setup_universal.py --mcp-dir C:/Users/you/.config/opencode/mcp_servers --all
    python setup_universal.py --mcp-dir <path> --client codex --dry-run

Options:
    --mcp-dir PATH   Directory containing the MCP server .py scripts (required).
    --all            Write configs for every detected client.
    --client NAME    Only write config for one client: claude|cursor|windsurf|codex|antigravity.
    --project-dir P  Project root for project-scoped configs (.mcp.json, .cursor, .windsurf).
                     Defaults to current working directory.
    --user           Also write user/global configs (Claude ~/.claude.json, Windsurf global).
    --dry-run        Print what would be written without touching any file.
    --force          Overwrite existing server entries (default: merge, keep others).
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
from pathlib import Path

# Windows console: force UTF-8 so ✓/— print without UnicodeEncodeError.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ─────────────────────────────────────────────────────────────────────────────
# SOURCE OF TRUTH — the M4ST MCP servers (plain stdio JSON-RPC 2.0).
# Each entry: script filename + optional env vars (resolved from os.environ).
# ─────────────────────────────────────────────────────────────────────────────
SERVERS = {
    "memory":      {"script": "memory_mcp.py",      "desc": "3-tier memory (core/recall/archival)"},
    "shell":       {"script": "shell_mcp.py",       "desc": "Safe shell execution"},
    "file":        {"script": "file_mcp.py",        "desc": "File read/write/search/diff"},
    "research":    {"script": "research_mcp.py",    "desc": "Multi-depth web search + extraction"},
    "browser":     {"script": "browser_mcp.py",     "desc": "Playwright browser automation"},
    "skills":      {"script": "skills_mcp.py",      "desc": "Hot-reloadable skill execution"},
    "react":       {"script": "react_mcp.py",       "desc": "ReAct reasoning engine"},
    "task-router": {"script": "task_router_mcp.py", "desc": "Intelligent task routing"},
    "coding":      {"script": "coding.py",          "desc": "Code generation"},
    "notify":      {"script": "notify_mcp.py",      "desc": "Notifications (Telegram/ntfy)"},
    "vision":      {"script": "vision_mcp.py",      "desc": "Screen analysis pipeline"},
    "scheduler":   {"script": "scheduler.py",       "desc": "Scheduled task execution"},
    "mcp-doctor":  {"script": "mcp_doctor.py",      "desc": "MCP health diagnostics"},
    "setup":       {"script": "setup_mcp.py",       "desc": "Setup helper"},
    "pentest":     {"script": "pentest_mcp.py",     "desc": "Security automation (authorized)"},
    "m4st-agents": {"script": "m4st_agent_mcp.py",  "desc": "Multi-agent operations"},
    "scrapling":   {"script": "scrapling_mcp.py",   "desc": "Anti-bot web scraping"},
}

# Env vars injected per server (values resolved from os.environ at write time).
SERVER_ENV = {
    "notify":      ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID", "NTFY_TOPIC", "MAST_ALLOWED_CHAT_IDS"],
    "pentest":     ["SHODAN_API_KEY"],
    "vision":      ["LLAMA_URL", "VISION_MODEL", "GEMINI_API_KEY"],
}
# Every server gets these two (point to the MCP dir + bridge_core).
COMMON_ENV = ["MAST_CONFIG", "M4ST_BRIDGE_DIR"]

# ─────────────────────────────────────────────────────────────────────────────
# Client detection
# ─────────────────────────────────────────────────────────────────────────────
def _on_path(name: str) -> bool:
    return shutil.which(name) is not None

def detect_clients() -> dict:
    """Return {client: bool} for each supported client based on installed tools."""
    home = Path.home()
    return {
        "claude":      _on_path("claude") or (home / ".claude.json").exists() or (home / ".claude").exists(),
        "cursor":      _on_path("cursor") or (home / ".cursor").exists(),
        "windsurf":    _on_path("windsurf") or (home / ".codeium" / "windsurf").exists(),
        "codex":       _on_path("codex") or (home / ".codex" / "config.toml").exists(),
        "antigravity": (home / ".antigravity").exists() or (home / ".gemini" / "antigravity-ide").exists(),
    }

# ─────────────────────────────────────────────────────────────────────────────
# Server -> config entry builders
# ─────────────────────────────────────────────────────────────────────────────
def _resolve_env(mcp_dir: Path, server: str) -> dict:
    env = {}
    for key in COMMON_ENV:
        if key == "MAST_CONFIG":
            env[key] = str(mcp_dir)
        elif key == "M4ST_BRIDGE_DIR":
            env[key] = str(mcp_dir / "bridge_core")
    for key in SERVER_ENV.get(server, []):
        env[key] = os.environ.get(key, "")
    return env

def _server_entries(mcp_dir: Path) -> dict:
    """Build {name: {command, args, env}} for every server."""
    entries = {}
    for name, meta in SERVERS.items():
        script = mcp_dir / meta["script"]
        if not script.exists():
            print(f"  ! skip {name}: script not found at {script}")
            continue
        entries[name] = {
            "command": "python",
            "args": [str(script)],
            "env": _resolve_env(mcp_dir, name),
        }
    return entries

# ─────────────────────────────────────────────────────────────────────────────
# JSON merge (idempotent) — used by claude/cursor/windsurf/antigravity
# ─────────────────────────────────────────────────────────────────────────────
def _strip_jsonc(text: str) -> str:
    """Remove // and /* */ comments (JSONC -> JSON)."""
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    text = re.sub(r"//[^\n]*", "", text)
    return text

def _load_json(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        return json.loads(_strip_jsonc(path.read_text(encoding="utf-8")))
    except Exception as e:
        print(f"  ! could not parse {path}: {e} — starting fresh")
        return {}

def _merge_servers(existing: dict, new: dict, force: bool) -> dict:
    """Merge new servers into existing mcpServers dict by name (no duplicates)."""
    out = dict(existing)
    for name, entry in new.items():
        if force or name not in out:
            out[name] = entry
    return out

def _write_json(path: Path, data: dict, dry_run: bool) -> None:
    if dry_run:
        print(f"  [dry-run] would write {path}")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"  ✓ wrote {path}")

# ─────────────────────────────────────────────────────────────────────────────
# Codex config.toml merge (idempotent)
# ─────────────────────────────────────────────────────────────────────────────
def _toml_str(v: str) -> str:
    """Escape a value for a TOML basic string (handles Windows backslashes)."""
    return '"' + v.replace("\\", "\\\\").replace('"', '\\"') + '"'

def _codex_merge(config_path: Path, entries: dict, dry_run: bool) -> None:
    text = config_path.read_text(encoding="utf-8") if config_path.exists() else ""
    lines = text.splitlines()

    # Remove any existing [mcp_servers.NAME] or [mcp_servers.NAME.env] blocks for our names.
    names = set(entries.keys())
    keep = []
    skip = False
    for line in lines:
        m = re.match(r"^\s*\[mcp_servers\.([\w-]+)(\.\w+)?\]\s*$", line)
        if m and m.group(1) in names:
            skip = True
            continue
        if skip:
            # End of a section block: a new top-level section or a blank line followed by a section.
            if re.match(r"^\s*\[", line):
                skip = False
            elif line.strip() == "":
                continue
            else:
                continue
        keep.append(line)
    # Rebuild: keep everything before the first [mcp_servers.*] section, then append ours.
    out = "\n".join(keep).rstrip() + "\n"
    for name, entry in entries.items():
        out += f"\n[mcp_servers.{name}]\n"
        out += f'command = {_toml_str(entry["command"])}\n'
        args = ", ".join(_toml_str(a) for a in entry["args"])
        out += f"args = [{args}]\n"
        if entry.get("env"):
            out += f"\n[mcp_servers.{name}.env]\n"
            for k, v in entry["env"].items():
                out += f"{k} = {_toml_str(v)}\n"
    if dry_run:
        print(f"  [dry-run] would write {config_path}")
        return
    config_path.parent.mkdir(parents=True, exist_ok=True)
    config_path.write_text(out, encoding="utf-8")
    print(f"  ✓ wrote {config_path}")

# ─────────────────────────────────────────────────────────────────────────────
# Per-client writers
# ─────────────────────────────────────────────────────────────────────────────
def write_claude(entries, project_dir, user, dry_run, force):
    servers = {"mcpServers": entries}
    if user:
        path = Path.home() / ".claude.json"
        data = _load_json(path)
        data["mcpServers"] = _merge_servers(data.get("mcpServers", {}), entries, force)
        _write_json(path, data, dry_run)
    else:
        path = project_dir / ".mcp.json"
        data = _load_json(path)
        data["mcpServers"] = _merge_servers(data.get("mcpServers", {}), entries, force)
        _write_json(path, data, dry_run)

def write_cursor(entries, project_dir, dry_run, force):
    path = project_dir / ".cursor" / "mcp.json"
    data = _load_json(path)
    data["mcpServers"] = _merge_servers(data.get("mcpServers", {}), entries, force)
    _write_json(path, data, dry_run)

def write_windsurf(entries, project_dir, user, dry_run, force):
    if user:
        path = Path.home() / ".codeium" / "windsurf" / "mcp_config.json"
        data = _load_json(path)
        data["mcpServers"] = _merge_servers(data.get("mcpServers", {}), entries, force)
        _write_json(path, data, dry_run)
    else:
        path = project_dir / ".windsurf" / "mcp.json"
        data = _load_json(path)
        data["mcpServers"] = _merge_servers(data.get("mcpServers", {}), entries, force)
        _write_json(path, data, dry_run)

def write_codex(entries, dry_run):
    path = Path.home() / ".codex" / "config.toml"
    _codex_merge(path, entries, dry_run)

def write_antigravity(entries, dry_run, force):
    path = Path.home() / ".antigravity" / "opencode.jsonc"
    data = _load_json(path)
    mcp = data.get("mcp", {})
    # Antigravity/opencode format: {"type":"local","command":...,"args":[...],"description":...}
    ag_entries = {}
    for name, e in entries.items():
        ag_entries[name] = {
            "type": "local",
            "command": e["command"],
            "args": e["args"],
            "description": SERVERS[name]["desc"],
        }
    data["mcp"] = _merge_servers(mcp, ag_entries, force)
    _write_json(path, data, dry_run)

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser(description="Universal MCP installer for M4ST/OpenWork")
    ap.add_argument("--mcp-dir", required=True, help="Directory containing MCP server .py scripts")
    ap.add_argument("--all", action="store_true", help="Write configs for every detected client")
    ap.add_argument("--client", choices=["claude", "cursor", "windsurf", "codex", "antigravity"])
    ap.add_argument("--project-dir", default=str(Path.cwd()), help="Project root for project-scoped configs")
    ap.add_argument("--user", action="store_true", help="Also write user/global configs")
    ap.add_argument("--dry-run", action="store_true", help="Print actions without writing")
    ap.add_argument("--force", action="store_true", help="Overwrite existing server entries")
    args = ap.parse_args()

    mcp_dir = Path(args.mcp_dir).expanduser().resolve()
    if not mcp_dir.is_dir():
        print(f"ERROR: --mcp-dir does not exist: {mcp_dir}")
        sys.exit(1)

    project_dir = Path(args.project_dir).expanduser().resolve()
    entries = _server_entries(mcp_dir)
    if not entries:
        print("ERROR: no MCP server scripts found in --mcp-dir")
        sys.exit(1)

    print(f"MCP dir : {mcp_dir}")
    print(f"Servers : {len(entries)} registered")

    detected = detect_clients()
    print("Detected clients:")
    for c, present in detected.items():
        print(f"  {c:12} {'[x] installed' if present else '[ ] not detected'}")

    targets = []
    if args.all:
        targets = [c for c, p in detected.items() if p]
    elif args.client:
        targets = [args.client]
    else:
        print("\nSpecify --all or --client NAME. Detected: " +
              ", ".join(c for c, p in detected.items() if p) or "none")
        sys.exit(0)

    for client in targets:
        print(f"\n== {client} ==")
        if client == "claude":
            write_claude(entries, project_dir, args.user, args.dry_run, args.force)
        elif client == "cursor":
            write_cursor(entries, project_dir, args.dry_run, args.force)
        elif client == "windsurf":
            write_windsurf(entries, project_dir, args.user, args.dry_run, args.force)
        elif client == "codex":
            write_codex(entries, args.dry_run)
        elif client == "antigravity":
            write_antigravity(entries, args.dry_run, args.force)

    print("\nDone. Restart your client to pick up the new MCP servers.")
    print("See README-MCP.md for per-client setup steps.")


if __name__ == "__main__":
    main()