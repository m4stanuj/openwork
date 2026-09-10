import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lightweight ANSI formatting helper (Zero-dependency)
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  gray: "\x1b[90m"
};

// Strip ANSI escape codes for accurate width calculation
function stripAnsi(str) {
  return String(str).replace(/\x1b\[[0-9;]*m/g, "");
}

// Read version from package.json (single source of truth)
function getVersion() {
  try {
    const pkgPath = path.join(__dirname, "..", "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    return pkg.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export const ui = {
  version: getVersion(),

  banner() {
    console.log(`
${c.cyan}${c.bold}⚡ OpenWork${c.reset} ${c.dim}v${this.version}${c.reset}
${c.gray}Universal MCP Workspace & Control Plane for AI IDEs${c.reset}
${c.gray}───────────────────────────────────────────────────${c.reset}`);
  },
  success(msg) {
    console.log(`${c.green}✔${c.reset} ${msg}`);
  },
  info(msg) {
    console.log(`${c.blue}ℹ${c.reset} ${msg}`);
  },
  warn(msg) {
    console.log(`${c.yellow}⚠${c.reset} ${msg}`);
  },
  error(msg) {
    console.error(`${c.red}✖${c.reset} ${c.bold}${msg}${c.reset}`);
  },
  debug(msg, verbose = false) {
    if (verbose) {
      console.log(`${c.gray}  ▸ ${msg}${c.reset}`);
    }
  },
  badge(text, color = "cyan") {
    return `${c[color] || c.cyan}[${text}]${c.reset}`;
  },
  table(headers, rows) {
    // ANSI-aware column width calculation (strips escape codes for measurement)
    const colWidths = headers.map((h, i) => {
      const maxRow = Math.max(...rows.map(r => (r[i] ? stripAnsi(String(r[i])).length : 0)));
      return Math.max(stripAnsi(h).length, maxRow) + 2;
    });

    const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join("");
    const sepLine = colWidths.map(w => "─".repeat(w)).join("");

    console.log(c.bold + headerLine + c.reset);
    console.log(c.gray + sepLine + c.reset);
    rows.forEach(r => {
      const line = r.map((cell, i) => {
        const str = String(cell || "");
        const visibleLen = stripAnsi(str).length;
        const padding = Math.max(0, colWidths[i] - visibleLen);
        return str + " ".repeat(padding);
      }).join("");
      console.log(line);
    });
  }
};
