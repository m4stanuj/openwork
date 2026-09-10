import fs from "fs";
import path from "path";
import { getPlatformPaths } from "./detect.js";
import { loadEnvFile, resolveEnvVars } from "./env.js";
import { ui } from "./ui.js";

export function loadMasterConfig(configPath = path.join(process.cwd(), "openwork.json")) {
  if (!fs.existsSync(configPath)) {
    throw new Error(`OpenWork configuration file not found at: ${configPath}\nRun 'openwork init' to generate one.`);
  }
  const raw = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(raw);
}

export function syncConfigs(options = {}) {
  const {
    configPath = path.join(process.cwd(), "openwork.json"),
    targetFilter = null,
    dryRun = false,
    envFile = path.join(process.cwd(), ".env"),
    createBackup = true
  } = options;

  const masterConfig = loadMasterConfig(configPath);
  const envMap = loadEnvFile(envFile);
  const resolvedServers = resolveEnvVars(masterConfig.mcpServers || {}, envMap);

  const availableTargets = getPlatformPaths();
  const activeTargetIds = masterConfig.targets || availableTargets.map(t => t.id);

  const targetsToSync = availableTargets.filter(t => {
    if (targetFilter && t.id !== targetFilter && !t.id.startsWith(targetFilter)) {
      return false;
    }
    return activeTargetIds.includes(t.id);
  });

  const results = [];

  for (const target of targetsToSync) {
    const targetDir = path.dirname(target.configPath);
    let currentConfig = {};

    if (fs.existsSync(target.configPath)) {
      try {
        currentConfig = JSON.parse(fs.readFileSync(target.configPath, "utf-8"));
      } catch (err) {
        currentConfig = {};
      }
    }

    // Merge mcpServers into the client config
    const updatedConfig = {
      ...currentConfig,
      mcpServers: {
        ...(currentConfig.mcpServers || {}),
        ...resolvedServers
      }
    };

    if (dryRun) {
      results.push({
        name: target.name,
        path: target.configPath,
        status: "DRY-RUN (Simulated)",
        serverCount: Object.keys(resolvedServers).length
      });
      continue;
    }

    // Create target dir if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Backup existing
    if (createBackup && fs.existsSync(target.configPath)) {
      const backupPath = `${target.configPath}.bak`;
      fs.copyFileSync(target.configPath, backupPath);
    }

    // Write file
    fs.writeFileSync(target.configPath, JSON.stringify(updatedConfig, null, 2), "utf-8");

    results.push({
      name: target.name,
      path: target.configPath,
      status: "SYNCED",
      serverCount: Object.keys(resolvedServers).length
    });
  }

  return results;
}
