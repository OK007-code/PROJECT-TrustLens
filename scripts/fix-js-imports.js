import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const directories = ["server", "shared", "drizzle"];
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".js")) files.push(full);
  }
}
directories.forEach((directory) => walk(path.join(root, directory)));
files.push(path.join(root, "vite.config.js"), path.join(root, "vitest.config.js"));

for (const file of files) {
  let source = fs.readFileSync(file, "utf8");
  source = source.replace(/from\s+(["'])(\.{1,2}\/[^"']+?)(\1)/g, (match, quote, specifier) => {
    if (/\.(?:js|jsx|json|css)$/.test(specifier)) return match;
    return `from ${quote}${specifier}.js${quote}`;
  });
  fs.writeFileSync(file, source);
}
console.log(`Normalized ${files.length} JavaScript ESM files.`);
