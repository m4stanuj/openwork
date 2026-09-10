import fs from "fs";
import path from "path";
import { getPlatformPaths } from "./detect.js";
import { loadMasterConfig } from "./sync.js";

/**
 * Compare master openwork.json servers against each IDE's current config.
 * Shows which servers are missing, extra, or matched in each target.
 */
export function diffConfigs(options = {}) {
  const {
    configPath = path.join(process.cwd(), "openwork.json"),
    verbose = false
  } = options;

  const masterConfig = loadMasterConfig(configPath);
  const masterServers = Object.keys(masterConfig.mcpServers || {});
  const targets = getPlatformPaths();

  const results = [];

  for (const target of targets) {
    const entry = {
      name: target.name,
      configPath: target.configPath,
      exists: target.exists,
      missing: [],
      extra: [],
      matched: []
    };

    if (!target.exists) {
      entry.missing = [...masterServers];
      results.push(entry);
      continue;
    }

    try {
      const raw = fs.readFileSync(target.configPath, "utf-8");
      const parsed = JSON.parse(raw);
      const ideServers = Object.keys(parsed.mcpServers || {});

      for (const s of masterServers) {
        if (ideServers.includes(s)) {
          entry.matched.push(s);
        } else {
          entry.missing.push(s);
        }
      }

      for (const s of ideServers) {
        if (!masterServers.includes(s)) {
          entry.extra.push(s);
        }
      }
    } catch (err) {
      entry.error = err.message;
    }

    results.push(entry);
  }

  return results;
}
