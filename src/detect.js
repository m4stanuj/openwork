import fs from "fs";
import path from "path";
import os from "os";

export function getPlatformPaths() {
  const platform = process.platform;
  const home = os.homedir();
  const cwd = process.cwd();

  let claudeDesktopPath = "";
  if (platform === "win32") {
    claudeDesktopPath = path.join(process.env.APPDATA || path.join(home, "AppData", "Roaming"), "Claude", "claude_desktop_config.json");
  } else if (platform === "darwin") {
    claudeDesktopPath = path.join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json");
  } else {
    claudeDesktopPath = path.join(home, ".config", "Claude", "claude_desktop_config.json");
  }

  return [
    {
      id: "claude-desktop",
      name: "Claude Desktop",
      type: "global",
      configPath: claudeDesktopPath,
      exists: fs.existsSync(claudeDesktopPath)
    },
    {
      id: "cursor-global",
      name: "Cursor (Global)",
      type: "global",
      configPath: path.join(home, ".cursor", "mcp.json"),
      exists: fs.existsSync(path.join(home, ".cursor", "mcp.json"))
    },
    {
      id: "cursor-workspace",
      name: "Cursor (Workspace)",
      type: "workspace",
      configPath: path.join(cwd, ".cursor", "mcp.json"),
      exists: fs.existsSync(path.join(cwd, ".cursor", "mcp.json"))
    },
    {
      id: "windsurf-global",
      name: "Windsurf (Global)",
      type: "global",
      configPath: path.join(home, ".codeium", "windsurf", "mcp_config.json"),
      exists: fs.existsSync(path.join(home, ".codeium", "windsurf", "mcp_config.json"))
    },
    {
      id: "windsurf-workspace",
      name: "Windsurf (Workspace)",
      type: "workspace",
      configPath: path.join(cwd, ".windsurf", "mcp.json"),
      exists: fs.existsSync(path.join(cwd, ".windsurf", "mcp.json"))
    }
  ];
}
