#!/usr/bin/env node
// package.json "exports" for the React kit: one entry per file in src/react,
// "./react/select" → "./src/react/select.tsx". A pattern ("./react/*") cannot
// say the extension, so neither Node nor TypeScript would find the file.
//
//   node scripts/exports.mjs           rewrite package.json
//   node scripts/exports.mjs --check   exit 1 when it is stale (tests run this)
import fs from "node:fs";
import path from "node:path";

const root = path.join(path.dirname(new URL(import.meta.url).pathname), "..");
const pkgPath = path.join(root, "package.json");

// The React kit (src/react) and the framework-neutral recipes both sides read
// (src/recipes), one export per file.
const DIRS = ["react", "recipes"];

export function reactExports() {
  const out = {};
  for (const d of DIRS) {
    const dir = path.join(root, "src", d);
    for (const f of fs.readdirSync(dir).filter((f) => /\.tsx?$/.test(f)).sort()) out[`./${d}/${f.replace(/\.tsx?$/, "")}`] = `./src/${d}/${f}`;
  }
  return out;
}

export function render(pkg) {
  const rest = Object.fromEntries(Object.entries(pkg.exports).filter(([k]) => !DIRS.some((d) => k.startsWith(`./${d}/`))));
  return { ...pkg, exports: { ...rest, ...reactExports() } };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const next = JSON.stringify(render(pkg), null, 2) + "\n";
  if (process.argv.includes("--check")) {
    if (fs.readFileSync(pkgPath, "utf8") !== next) {
      console.error("package.json exports are stale — run node scripts/exports.mjs");
      process.exit(1);
    }
  } else fs.writeFileSync(pkgPath, next);
}
