import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";

const root = process.cwd();
const outDir = path.join(root, "extension", "dist");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const shared = {
  bundle: true,
  platform: "browser",
  target: "chrome120",
  format: "iife",
  sourcemap: false,
  alias: {
    "@": path.join(root, "client", "src"),
    "@shared": path.join(root, "shared"),
  },
};

await build({ ...shared, entryPoints: [path.join(root, "extension", "src", "popup.jsx")], outfile: path.join(outDir, "popup.js") });
await build({ ...shared, entryPoints: [path.join(root, "extension", "src", "content.js")], outfile: path.join(outDir, "content.js") });
await build({ ...shared, entryPoints: [path.join(root, "extension", "src", "background.js")], outfile: path.join(outDir, "background.js") });
for (const file of ["manifest.json", "popup.html", "popup.css"]) fs.copyFileSync(path.join(root, "extension", file), path.join(outDir, file));
console.log(`TrustLens extension built at ${path.relative(root, outDir)}`);
