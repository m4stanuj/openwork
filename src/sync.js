import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { isDeepStrictEqual } from "node:util";
import { getPlatformPaths } from "./detect.js";
import { loadEnvFile, resolveEnvVars } from "./env.js";

function targetStat(configPath) {
  try {
    const stat = fs.lstatSync(configPath, { bigint: true });
    if (!stat.isFile()) {
      throw new Error(`Expected a regular config file at ${configPath}.`);
    }
    return stat;
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function readTargetConfig(configPath) {
  const stat = targetStat(configPath);
  if (!stat) return { stat, raw: null, config: {} };

  const raw = fs.readFileSync(configPath);
  let config;
  try {
    const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
    config = JSON.parse(decoder.decode(raw));
  } catch {
    throw new Error(`Invalid JSON in target config at ${configPath}.`);
  }
  if (config === null || typeof config !== "object" || Array.isArray(config)) {
    throw new Error(`Expected a JSON object in target config at ${configPath}.`);
  }
  const { mcpServers } = config;
  if (mcpServers != null && (typeof mcpServers !== "object" || Array.isArray(mcpServers))) {
    throw new Error(`Expected an mcpServers object in target config at ${configPath}.`);
  }
  return { stat, raw, config };
}

function checkTargetUnchanged(configPath, original) {
  const current = targetStat(configPath);
  if ((!current && !original) || (current && original &&
      current.dev === original.dev && current.ino === original.ino &&
      current.size === original.size && current.mtimeNs === original.mtimeNs &&
      current.ctimeNs === original.ctimeNs)) {
    return;
  }
  throw new Error(`Target config changed during sync at ${configPath}. Run sync again.`);
}

function writeAtomic(filePath, contents, beforeReplace, mode) {
  const tempPath = path.join(path.dirname(filePath), `.openwork-${randomUUID()}.tmp`);
  const fd = fs.openSync(tempPath, "wx", 0o600);
  try {
    try {
      fs.writeFileSync(fd, contents);
      if (mode !== undefined && process.platform !== "win32") {
        fs.fchmodSync(fd, mode);
      }
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    beforeReplace();
    fs.renameSync(tempPath, filePath);
  } catch (error) {
    try {
      fs.unlinkSync(tempPath);
    } catch {
      // Preserve the original write failure.
    }
    throw error;
  }
}

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

  // Validate every selected target before writing configs or backups.
  const updates = targetsToSync.map(target => {
    const { stat, raw, config } = readTargetConfig(target.configPath);
    const existing = config.mcpServers ?? {};
    const changes = { added: 0, updated: 0, unchanged: 0 };
    for (const [name, server] of Object.entries(resolvedServers)) {
      if (!Object.hasOwn(existing, name)) {
        changes.added++;
      } else if (!isDeepStrictEqual(existing[name], server)) {
        changes.updated++;
      } else {
        changes.unchanged++;
      }
    }
    const updatedConfig = {
      ...config,
      mcpServers: {
        ...existing,
        ...resolvedServers
      }
    };
    return { target, stat, raw, changes, contents: JSON.stringify(updatedConfig, null, 2) };
  });

  const serverCount = Object.keys(resolvedServers).length;
  const syncedPaths = new Set();
  return updates.map(({ target, stat, raw, changes, contents }) => {
    const configPath = target.configPath;
    const hasChanges = changes.added > 0 || changes.updated > 0;
    if (!dryRun && hasChanges && !syncedPaths.has(configPath)) {
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
      const beforeReplace = () => {
        checkTargetUnchanged(configPath, stat);
        if (stat) fs.accessSync(configPath, fs.constants.W_OK);
      };
      if (createBackup && stat) {
        writeAtomic(`${configPath}.bak`, raw, beforeReplace);
      }
      const mode = stat ? Number(stat.mode & 0o777n) : undefined;
      writeAtomic(configPath, contents, beforeReplace, mode);
      syncedPaths.add(configPath);
    }

    return {
      name: target.name,
      path: configPath,
      status: dryRun ? "DRY-RUN (Simulated)" : (hasChanges ? "SYNCED" : "UNCHANGED"),
      serverCount,
      changes
    };
  });
}
