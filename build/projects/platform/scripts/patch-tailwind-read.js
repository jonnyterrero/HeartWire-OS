/**
 * Patches Tailwind CSS's expandTailwindAtRules to retry fs.readFile on failure.
 * OneDrive on Windows can briefly lock files during sync, causing UNKNOWN read
 * errors. This patch wraps the readFile call with exponential-backoff retries.
 */
const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "..",
  "node_modules",
  "tailwindcss",
  "lib",
  "lib",
  "expandTailwindAtRules.js"
);

if (!fs.existsSync(filePath)) {
  console.log("[patch-tailwind-read] Tailwind file not found, skipping patch.");
  process.exit(0);
}

let content = fs.readFileSync(filePath, "utf8");

if (content.includes("__retryReadFile")) {
  console.log("[patch-tailwind-read] Already patched, skipping.");
  process.exit(0);
}

const retryFn = `
async function __retryReadFile(fsModule, filePath, encoding, maxRetries) {
    for (var attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fsModule.promises.readFile(filePath, encoding);
        } catch (err) {
            if (attempt === maxRetries) throw err;
            await new Promise(function(r) { setTimeout(r, 50 * Math.pow(2, attempt)); });
        }
    }
}
`;

content = content.replace(
  '"use strict";',
  '"use strict";\n' + retryFn
);

content = content.replace(
  'content = file ? await _fs.default.promises.readFile(file, "utf8") : content;',
  'content = file ? await __retryReadFile(_fs.default, file, "utf8", 5) : content;'
);

fs.writeFileSync(filePath, content, "utf8");
console.log("[patch-tailwind-read] Patched successfully.");
