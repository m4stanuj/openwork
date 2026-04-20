"""
OpenWork — Universal Config Generator
Generates IDE-specific MCP configuration from a single source of truth.
"""
import json
import os
from pathlib import Path

# Supported IDEs and their config locations
IDE_CONFIG_MAP = {
    "cursor": {
        "filename": ".cursor/mcp.json",
        "format": "cursor",
    },
    "windsurf": {
        "filename": ".windsurf/mcp.json", 
        "format": "cursor",  # Same format as Cursor
    },
    "claude_desktop": {
        "filename": "claude_desktop_config.json",
        "format": "claude",
    },
    "antigravity": {
        "filename": "opencode.jsonc",
        "format": "opencode",
    },
    "codex": {
        "filename": "codex.json",
        "format": "codex",
    },
}

# MCP Server definitions (source of truth)
MCP_SERVERS = {
    "m4st-shell": {
        "command": "python",
        "script": "mcp_system.py",
        "description": "Safe shell execution, Python runner, env reader",
        "port": 3102,
    },
    "m4st-browser": {
        "command": "python",
        "script": "mcp_browser.py",
        "description": "Playwright browser automation and data extraction",
        "port": 3103,
    },
    "m4st-memory": {
        "command": "python",
        "script": "mcp_memory.py",
        "description": "3-tier memory: core, recall, archival (ChromaDB)",
        "port": 3101,
    },
    "m4st-vision": {
        "command": "python",
        "script": "mcp_vision.py",
        "description": "5-layer screen analysis pipeline",
        "port": 3104,
    },
    "m4st-research": {
        "command": "python",
        "script": "mcp_web.py",
        "description": "Multi-depth web search and content extraction",
        "port": 3105,
    },
}


def generate_config(ide: str, mcp_dir: str, output_dir: str = ".") -> str:
    """
    Generate IDE-specific MCP configuration.
    
    Args:
        ide: Target IDE name (cursor, windsurf, claude_desktop, antigravity, codex)
        mcp_dir: Path to MCP server scripts
        output_dir: Where to write the config file
        
    Returns:
        Path to generated config file
    """
    if ide not in IDE_CONFIG_MAP:
        raise ValueError(f"Unknown IDE: {ide}. Supported: {list(IDE_CONFIG_MAP.keys())}")
    
    config = IDE_CONFIG_MAP[ide]
    servers = {}
    
    for name, server in MCP_SERVERS.items():
        script_path = os.path.join(mcp_dir, server["script"])
        servers[name] = {
            "command": server["command"],
            "args": [script_path],
            "env": _get_env_vars(),
        }
    
    if config["format"] == "cursor":
        output = {"mcpServers": servers}
    elif config["format"] == "claude":
        output = {"mcpServers": servers}
    elif config["format"] == "opencode":
        output = {
            "mcpServers": servers,
            "providers": _get_provider_config(),
        }
    else:
        output = {"servers": servers}
    
    output_path = os.path.join(output_dir, config["filename"])
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)
    
    return output_path


def _get_env_vars() -> dict:
    """Get environment variable references for config."""
    return {
        "GROQ_API_KEY": "${GROQ_API_KEY}",
        "OPENROUTER_API_KEY": "${OPENROUTER_API_KEY}",
        "CEREBRAS_API_KEY": "${CEREBRAS_API_KEY}",
    }


def _get_provider_config() -> list:
    """Generate provider fallback chain."""
    return [
        {"name": "groq", "model": "llama-3.3-70b-versatile", "tier": "speed"},
        {"name": "cerebras", "model": "llama-3.3-70b", "tier": "speed"},
        {"name": "deepseek", "model": "deepseek-chat", "tier": "reasoning"},
        {"name": "openrouter", "model": "auto", "tier": "fallback"},
    ]


if __name__ == "__main__":
    import sys
    ide = sys.argv[1] if len(sys.argv) > 1 else "cursor"
    mcp_dir = sys.argv[2] if len(sys.argv) > 2 else "./mcps"
    path = generate_config(ide, mcp_dir)
    print(f"Generated {ide} config: {path}")
