#!/usr/bin/env node

import path from "path";
import fs from "fs";
import { ui } from "../src/ui.js";
import { getPlatformPaths } from "../src/detect.js";
import { syncConfigs, loadMasterConfig } from "../src/sync.js";
import { initializeProject } from "../src/init.js";

const args = process.argv.slice(2);
const command = args[0] || "help";

async function main() {
  switch (command) {
    case "init": {
      ui.banner();
      const res = initializeProject();
      if (res.created) {
        ui.success(`Created master config at: ${res.path}`);
        ui.info("Edit openwork.json and run 'openwork sync' to deploy tools to all AI IDEs.");
      } else {
        ui.warn(res.message);
      }
      break;
    }

    case "detect": {
      ui.banner();
      ui.info("Scanning for installed AI IDE configurations on this machine...\n");
      const paths = getPlatformPaths();
      const headers = ["Target Client", "Scope", "Status", "Config Path"];
      const rows = paths.map(p => [
        p.name,
        p.type.toUpperCase(),
        p.exists ? ui.badge("DETECTED", "green") : ui.badge("NOT FOUND", "gray"),
        p.configPath
      ]);
      ui.table(headers, rows);
      console.log("\n");
      break;
    }

    case "sync": {
      ui.banner();
      const isDryRun = args.includes("--dry-run");
      const targetArgIdx = args.indexOf("--target");
      const targetFilter = targetArgIdx !== -1 ? args[targetArgIdx + 1] : null;

      try {
        ui.info(`Starting synchronization${isDryRun ? " (DRY-RUN)" : ""}...`);
        const results = syncConfigs({ dryRun: isDryRun, targetFilter });
        console.log("");
        const headers = ["Target IDE", "Status", "Servers Injected", "File Path"];
        const rows = results.map(r => [
          r.name,
          r.status === "SYNCED" ? ui.badge("SYNCED", "green") : ui.badge(r.status, "yellow"),
          r.serverCount,
          r.path
        ]);
        ui.table(headers, rows);
        console.log("");
        if (!isDryRun) {
          ui.success("All AI IDEs synchronized successfully with zero drift!");
        }
      } catch (err) {
        ui.error(err.message);
        process.exit(1);
      }
      break;
    }

    case "status": {
      ui.banner();
      try {
        const master = loadMasterConfig();
        const serverCount = Object.keys(master.mcpServers || {}).length;
        ui.info(`Master config: openwork.json (${serverCount} servers defined)\n`);

        const paths = getPlatformPaths();
        const headers = ["Target Client", "Config Exists", "Servers Installed", "Config Path"];
        const rows = paths.map(p => {
          let count = 0;
          if (p.exists) {
            try {
              const parsed = JSON.parse(fs.readFileSync(p.configPath, "utf-8"));
              count = Object.keys(parsed.mcpServers || {}).length;
            } catch (e) {
              count = "Invalid JSON";
            }
          }
          return [
            p.name,
            p.exists ? ui.badge("YES", "green") : ui.badge("NO", "gray"),
            p.exists ? `${count} servers` : "-",
            p.configPath
          ];
        });
        ui.table(headers, rows);
        console.log("");
      } catch (err) {
        ui.error(err.message);
      }
      break;
    }

    case "version":
    case "-v":
    case "--version": {
      console.log("openwork v0.1.0");
      break;
    }

    case "help":
    case "-h":
    case "--help":
    default: {
      ui.banner();
      console.log(`
Usage: openwork <command> [options]

Commands:
  init                     Create a new openwork.json in the current directory
  detect                   Scan and display installed AI IDE configs on this OS
  sync                     Sync openwork.json servers to all detected AI IDEs
  status                   Show synchronization and drift status across IDEs
  version, -v              Print OpenWork version

Options:
  --dry-run                Simulate sync actions without writing to disk
  --target <id>            Sync only a specific IDE target (e.g. claude-desktop, cursor-global)

Examples:
  npx @m4stanuj/openwork init
  npx @m4stanuj/openwork detect
  npx @m4stanuj/openwork sync --dry-run
  npx @m4stanuj/openwork sync
`);
      break;
    }
  }
}

main().catch(err => {
  ui.error(err.message);
  process.exit(1);
});
