import fs from "fs";
import path from "path";

export function initializeProject(cwd = process.cwd()) {
  const targetFile = path.join(cwd, "openwork.json");

  if (fs.existsSync(targetFile)) {
    return { created: false, message: `Config already exists at ${targetFile}` };
  }

  const template = {
    "$schema": "https://m4stanuj.github.io/openwork/schema.json",
    "version": "1.0.0",
    "description": "Universal MCP Control Plane configuration",
    "targets": [
      "claude-desktop",
      "cursor-global",
      "cursor-workspace",
      "windsurf-workspace"
    ],
    "mcpServers": {
      "filesystem": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", process.cwd()]
      },
      "fetch": {
        "command": "uvx",
        "args": ["mcp-server-fetch"]
      }
    }
  };

  fs.writeFileSync(targetFile, JSON.stringify(template, null, 2), "utf-8");
  return { created: true, path: targetFile };
}
