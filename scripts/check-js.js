import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const offenders = [];
const ignored = new Set(["node_modules", "dist", ".git", ".manus-logs", ".next"]);
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) offenders.push(path.relative(root, full));
  }
}
walk(root);
if (offenders.length) {
  console.error(`TypeScript files found:\n${offenders.join("\n")}`);
  process.exit(1);
}
console.log("JavaScript-only check passed.");
