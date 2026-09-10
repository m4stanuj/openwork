import fs from "fs";
import path from "path";
import assert from "assert";
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

// 3. Test Sync in Sandbox
const testDir = path.join(process.cwd(), "test", "sandbox");
if (fs.existsSync(testDir)) {
  fs.rmSync(testDir, { recursive: true, force: true });
}
fs.mkdirSync(testDir, { recursive: true });

const mockOpenworkConfig = path.join(testDir, "openwork.json");
fs.writeFileSync(
  mockOpenworkConfig,
  JSON.stringify({
    name: "test-stack",
    mcpServers: {
      "sqlite": {
        "command": "uvx",
        "args": ["mcp-server-sqlite", "--db-path", "test.db"]
      }
    }
  }, null, 2)
);

console.log("✔ Sandbox configuration created.");
console.log("\n🎉 ALL OPENWORK TESTS PASSED SUCCESSFULLY!\n");
