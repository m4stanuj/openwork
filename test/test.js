import fs from "fs";
import os from "os";
import path from "path";
import assert from "assert";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { getPlatformPaths } from "../src/detect.js";
import { resolveEnvVars } from "../src/env.js";
import { syncConfigs } from "../src/sync.js";

console.log("🧪 Running OpenWork unit & integration tests...\n");

// 1. Test Detect
const detected = getPlatformPaths();
assert(Array.isArray(detected), "Platform paths should return an array");
assert(detected.length >= 5, "Should detect at least 5 standard client paths");
console.log("✔ Path detection logic passed.");

// 2. Test Env Resolution
const mockData = {
  key: "${TEST_SECRET_API_KEY}",
  nested: { url: "https://api.example.com?token=$MY_TOKEN" }
};
const resolved = resolveEnvVars(mockData, {
  TEST_SECRET_API_KEY: "secret_12345",
  MY_TOKEN: "token_abc"
});
assert.strictEqual(resolved.key, "secret_12345");
assert.strictEqual(resolved.nested.url, "https://api.example.com?token=token_abc");
console.log("✔ Environment variable interpolation passed.");

// 3. Exercise sync against workspace configs inside an isolated directory.
const originalCwd = process.cwd();
const testDir = fs.mkdtempSync(path.join(os.tmpdir(), "openwork-test-"));
const cliPath = fileURLToPath(new URL("../bin/openwork.js", import.meta.url));
try {
  process.chdir(testDir);
  fs.writeFileSync("openwork.json", JSON.stringify({
    name: "test-stack",
    targets: ["cursor-workspace", "windsurf-workspace"],
    mcpServers: {
      fixture: { command: "fixture-command", args: ["${OPENWORK_FIXTURE_VALUE}"] }
    }
  }));
  fs.writeFileSync(".env", "OPENWORK_FIXTURE_VALUE=resolved-value\n");

  const cursorConfig = path.join(".cursor", "mcp.json");
  const windsurfConfig = path.join(".windsurf", "mcp.json");
  const cursorBackup = `${cursorConfig}.bak`;
  const previousCursor = '{"theme":"dark","mcpServers":{"local":{"command":"local-fixture"},"fixture":{"command":"old-fixture"}}}\n';
  fs.mkdirSync(".cursor");
  fs.writeFileSync(cursorConfig, previousCursor, { mode: 0o640 });

  const preview = syncConfigs({ dryRun: true });
  assert.strictEqual(preview.length, 2);
  assert(preview.every(result => result.status === "DRY-RUN (Simulated)"));
  assert.deepStrictEqual(preview.find(result => result.path.endsWith(cursorConfig)).changes, {
    added: 0, updated: 1, unchanged: 0
  });
  assert.deepStrictEqual(preview.find(result => result.path.endsWith(windsurfConfig)).changes, {
    added: 1, updated: 0, unchanged: 0
  });
  assert.strictEqual(fs.readFileSync(cursorConfig, "utf-8"), previousCursor);
  assert(!fs.existsSync(cursorBackup));
  assert(!fs.existsSync(".windsurf"));

  fs.mkdirSync(".windsurf");
  const brokenConfig = '{"mcpServers":{"fixture":{"command":"private-fixture-text"}}';
  fs.writeFileSync(windsurfConfig, brokenConfig);
  const cliResult = spawnSync(process.execPath, [cliPath, "sync", "--verbose"], {
    cwd: testDir,
    encoding: "utf-8"
  });
  assert.strictEqual(cliResult.status, 1);
  const cliOutput = cliResult.stdout + cliResult.stderr;
  assert.match(cliOutput, /Invalid JSON in target config/);
  assert(cliOutput.includes("windsurf"));
  assert(!cliOutput.includes("private-fixture-text"));
  assert.throws(() => syncConfigs({ dryRun: true }), /Invalid JSON in target config/);
  assert.strictEqual(fs.readFileSync(cursorConfig, "utf-8"), previousCursor);
  assert.strictEqual(fs.readFileSync(windsurfConfig, "utf-8"), brokenConfig);
  assert(!fs.existsSync(cursorBackup));
  assert(!fs.existsSync(`${windsurfConfig}.bak`));

  fs.writeFileSync(windsurfConfig, "[]");
  assert.throws(() => syncConfigs(), /Expected a JSON object/);
  fs.writeFileSync(windsurfConfig, '{"mcpServers":[]}');
  assert.throws(() => syncConfigs(), /Expected an mcpServers object/);
  const invalidUtf8 = Buffer.from([0x7b, 0x22, 0xff, 0x22, 0x3a, 0x30, 0x7d]);
  fs.writeFileSync(windsurfConfig, invalidUtf8);
  assert.throws(() => syncConfigs(), /Invalid JSON in target config/);
  assert.deepStrictEqual(fs.readFileSync(windsurfConfig), invalidUtf8);
  assert.strictEqual(fs.readFileSync(cursorConfig, "utf-8"), previousCursor);
  fs.unlinkSync(windsurfConfig);

  const synced = syncConfigs();
  assert.deepStrictEqual(synced.map(result => [result.status, result.serverCount]), [
    ["SYNCED", 1],
    ["SYNCED", 1]
  ]);
  const fixture = { command: "fixture-command", args: ["resolved-value"] };
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(cursorConfig, "utf-8")), {
    theme: "dark",
    mcpServers: { local: { command: "local-fixture" }, fixture }
  });
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(windsurfConfig, "utf-8")), {
    mcpServers: { fixture }
  });
  assert.strictEqual(fs.readFileSync(cursorBackup, "utf-8"), previousCursor);
  assert(!fs.existsSync(`${windsurfConfig}.bak`));
  const originalModifyTime = fs.statSync(cursorConfig, { bigint: true }).mtimeNs;
  const repeated = syncConfigs();
  assert(repeated.every(result => result.status === "UNCHANGED"));
  assert(repeated.every(result => result.changes.unchanged === 1));
  assert.strictEqual(fs.statSync(cursorConfig, { bigint: true }).mtimeNs, originalModifyTime);
  assert.strictEqual(fs.readFileSync(cursorBackup, "utf-8"), previousCursor);
  const previewCli = spawnSync(process.execPath, [cliPath, "sync", "--dry-run"], {
    cwd: testDir,
    encoding: "utf-8"
  });
  assert.strictEqual(previewCli.status, 0);
  assert.match(previewCli.stdout, /Unchanged/);
  assert(!previewCli.stdout.includes("resolved-value"));
  if (process.platform !== "win32") {
    assert.strictEqual(fs.statSync(cursorConfig).mode & 0o777, 0o640 & ~process.umask());
    assert.strictEqual(fs.statSync(windsurfConfig).mode & 0o777, 0o600 & ~process.umask());
    assert.strictEqual(fs.statSync(cursorBackup).mode & 0o777, 0o600 & ~process.umask());
  }

  fs.writeFileSync(".env", "OPENWORK_FIXTURE_VALUE=new-value\n");
  const cursorOnly = { targetFilter: "cursor-workspace", createBackup: false };
  const previousContents = fs.readFileSync(cursorConfig, "utf-8");
  const originalRename = fs.renameSync;
  try {
    fs.renameSync = (source, destination) => {
      assert.strictEqual(path.resolve(destination), path.resolve(cursorConfig));
      assert.strictEqual(path.resolve(path.dirname(source)), path.resolve(".cursor"));
      const updated = JSON.parse(fs.readFileSync(source, "utf-8"));
      assert.deepStrictEqual(updated.mcpServers.fixture.args, ["new-value"]);
      assert.strictEqual(fs.readFileSync(cursorConfig, "utf-8"), previousContents);
      throw new Error("simulated replacement failure");
    };
    assert.throws(() => syncConfigs(cursorOnly), /simulated replacement failure/);
  } finally {
    fs.renameSync = originalRename;
  }
  assert.strictEqual(fs.readFileSync(cursorConfig, "utf-8"), previousContents);
  assert.deepStrictEqual(fs.readdirSync(".cursor").sort(), ["mcp.json", "mcp.json.bak"]);

  const concurrentContents = '{"theme":"light"}';
  const originalFsync = fs.fsyncSync;
  try {
    fs.fsyncSync = fd => {
      originalFsync(fd);
      fs.writeFileSync(cursorConfig, concurrentContents);
    };
    assert.throws(() => syncConfigs(cursorOnly), /Target config changed during sync/);
  } finally {
    fs.fsyncSync = originalFsync;
  }
  assert.strictEqual(fs.readFileSync(cursorConfig, "utf-8"), concurrentContents);
  assert.deepStrictEqual(fs.readdirSync(".cursor").sort(), ["mcp.json", "mcp.json.bak"]);

  assert.strictEqual(syncConfigs(cursorOnly).length, 1);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(cursorConfig, "utf-8")), {
    theme: "light",
    mcpServers: { fixture: { command: "fixture-command", args: ["new-value"] } }
  });
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(windsurfConfig, "utf-8")), {
    mcpServers: { fixture }
  });
  assert.strictEqual(fs.readFileSync(cursorBackup, "utf-8"), previousCursor);

  const originalHomedir = os.homedir;
  const sharedConfig = '{"mcpServers":{"local":{"command":"local-fixture"}}}';
  fs.writeFileSync(cursorConfig, sharedConfig);
  const masterConfig = JSON.parse(fs.readFileSync("openwork.json", "utf-8"));
  masterConfig.targets = ["cursor-global", "cursor-workspace"];
  fs.writeFileSync("openwork.json", JSON.stringify(masterConfig));
  try {
    os.homedir = () => testDir;
    assert.strictEqual(syncConfigs().length, 2);
  } finally {
    os.homedir = originalHomedir;
  }
  assert.strictEqual(fs.readFileSync(cursorBackup, "utf-8"), sharedConfig);
  console.log("✔ Atomic sync, backups, dry runs, and invalid config handling passed.");
} finally {
  process.chdir(originalCwd);
  fs.rmSync(testDir, { recursive: true, force: true });
}

console.log("\n🎉 ALL OPENWORK TESTS PASSED SUCCESSFULLY!\n");
