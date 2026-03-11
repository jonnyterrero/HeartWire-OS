/**
 * Patches TypeScript's Debug.assertEqual in Next.js's getTypeScriptConfiguration
 * to normalize path separators before comparison. This fixes a bug on Windows
 * where OneDrive paths cause forward/backslash mismatch assertions.
 */
const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "..",
  "node_modules",
  "next",
  "dist",
  "lib",
  "typescript",
  "getTypeScriptConfiguration.js"
);

if (!fs.existsSync(filePath)) {
  console.log("[patch-ts-paths] Next.js file not found, skipping patch.");
  process.exit(0);
}

let content = fs.readFileSync(filePath, "utf8");

if (content.includes("patchTsDebugForPaths")) {
  console.log("[patch-ts-paths] Already patched, skipping.");
  process.exit(0);
}

const patchFn = `
function patchTsDebugForPaths(ts) {
    if (ts.__debugPatched) return;
    ts.__debugPatched = true;
    const origAssertEqual = ts.Debug.assertEqual;
    if (origAssertEqual) {
        ts.Debug.assertEqual = function(a, b, msg, msg2) {
            if (typeof a === 'string' && typeof b === 'string') {
                if (a.replace(/\\\\\\\\/g, '/') === b.replace(/\\\\\\\\/g, '/')) return;
            }
            return origAssertEqual.call(this, a, b, msg, msg2);
        };
    }
}
`;

content = content.replace(
  "async function getTypeScriptConfiguration(ts, tsConfigPath, metaOnly) {",
  patchFn + "\nasync function getTypeScriptConfiguration(ts, tsConfigPath, metaOnly) {\n    patchTsDebugForPaths(ts);"
);

fs.writeFileSync(filePath, content, "utf8");
console.log("[patch-ts-paths] Patched successfully.");
