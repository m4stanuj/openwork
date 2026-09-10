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

export const ui = {
  banner() {
    console.log(`
${c.cyan}${c.bold}⚡ OpenWork${c.reset} ${c.dim}v0.1.0${c.reset}
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
  badge(text, color = "cyan") {
    return `${c[color] || c.cyan}[${text}]${c.reset}`;
  },
  table(headers, rows) {
    const colWidths = headers.map((h, i) => {
      const maxRow = Math.max(...rows.map(r => (r[i] ? String(r[i]).length : 0)));
      return Math.max(h.length, maxRow) + 2;
    });

    const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join("");
    const sepLine = colWidths.map(w => "─".repeat(w)).join("");

    console.log(c.bold + headerLine + c.reset);
    console.log(c.gray + sepLine + c.reset);
    rows.forEach(r => {
      console.log(r.map((cell, i) => String(cell || "").padEnd(colWidths[i])).join(""));
    });
  }
};
