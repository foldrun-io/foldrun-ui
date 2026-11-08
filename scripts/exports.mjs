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

export function reactExports() {
  const dir = path.join(root, "src/react");
  return Object.fromEntries(
    fs.readdirSync(dir)
      .filter((f) => /\.tsx?$/.test(f))
      .sort()
      .map((f) => [`./react/${f.replace(/\.tsx?$/, "")}`, `./src/react/${f}`]),
  );
}

export function render(pkg) {
  const rest = Object.fromEntries(Object.entries(pkg.exports).filter(([k]) => !k.startsWith("./react/")));
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
