import fs from "fs";
import path from "path";

export function loadEnvFile(envPath = path.join(process.cwd(), ".env")) {
  const envMap = { ...process.env };
  if (!fs.existsSync(envPath)) return envMap;

  try {
    const raw = fs.readFileSync(envPath, "utf-8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        envMap[key] = val;
      }
    }
  } catch (err) {
    // ignore read error
  }
  return envMap;
}

export function resolveEnvVars(data, envMap = process.env) {
  if (typeof data === "string") {
    return data.replace(/\$\{([a-zA-Z0-9_]+)\}|\$([a-zA-Z0-9_]+)/g, (match, p1, p2) => {
      const varName = p1 || p2;
      return envMap[varName] !== undefined ? envMap[varName] : match;
    });
  } else if (Array.isArray(data)) {
    return data.map(item => resolveEnvVars(item, envMap));
  } else if (typeof data === "object" && data !== null) {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = resolveEnvVars(value, envMap);
    }
    return result;
  }
  return data;
}
