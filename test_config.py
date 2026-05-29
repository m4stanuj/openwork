"""
Tests for OpenWork Config Generator
"""
import json

from config_generator import IDE_CONFIG_MAP, MCP_SERVERS, generate_config


def test_all_ides_have_config():
    """All supported IDEs should have config definitions."""
    expected = ["cursor", "windsurf", "claude_desktop", "antigravity", "codex"]
    for ide in expected:
        assert ide in IDE_CONFIG_MAP, f"Missing config for {ide}"


def test_mcp_servers_have_required_fields():
    """All MCP servers should have command, script, and port."""
    for name, server in MCP_SERVERS.items():
        assert "command" in server, f"{name} missing command"
        assert "script" in server, f"{name} missing script"
        assert "port" in server, f"{name} missing port"


def test_no_port_conflicts():
    """MCP server ports should be unique."""
    ports = [s["port"] for s in MCP_SERVERS.values()]
    assert len(ports) == len(set(ports)), "Duplicate ports found"


def test_server_count():
    """Should have 5 core MCP servers."""
    assert len(MCP_SERVERS) == 5


def test_generate_config_writes_valid_cursor_json(tmp_path):
    """Generator should create a usable MCP config file."""
    output_path = generate_config("cursor", "./mcps", str(tmp_path))
    data = json.loads((tmp_path / ".cursor" / "mcp.json").read_text(encoding="utf-8"))

    assert output_path.endswith(".cursor/mcp.json") or output_path.endswith(".cursor\\mcp.json")
    assert "mcpServers" in data
    assert set(data["mcpServers"]) == set(MCP_SERVERS)
