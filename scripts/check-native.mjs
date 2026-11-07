#!/usr/bin/env node
// Refuses the browser's own UI in the site's source (owner rule, Nov 2026:
// "no browser default fallback and no use of browser components for the
// UI/UX"). Every visible control is ours: disclosures are Disclosure.astro,
// tooltips our own or none, focus rings and scrollbars styled in
// global.css. Runs in `npm run check` and the pre-push checks.
//
// Refused in src/: <details>, <summary>, <select>, <dialog>, <datalist>,
// <progress>, <meter>; checkbox, radio, range, color and date inputs; a
// title="…" tooltip on an HTML element (component props named title are
// fine: those start with a capital); alert(), confirm(), prompt().
//
// Usage, from a project's root: foldrun-ui-check-native [path …]
// (default: src). Directories are walked; markdown files are checked
// outside their code (fenced blocks and `inline code` may show anything).
// Part of @foldrun/ui; every foldrun site runs it in its checks.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const targets = (args.length ? args : ["src"]).map((a) => path.resolve(root, a));
const rules = [
  [/<(details|summary|select|dialog|datalist|progress|meter)\b/g, (m) => `native <${m[1]}>`],
  [/<input\b[^>]*\btype=["'](checkbox|radio|range|color|date|datetime-local|month|week|time)["']/g, (m) => `native ${m[1]} input`],
  // An HTML element (lowercase tag) with a title attribute: the browser's
  // hover tooltip. <link title> names a feed for readers; it shows nothing.
  [/<(?!link\b)([a-z][a-z0-9-]*)\b[^<>]*?\stitle=/g, (m) => `title= tooltip on <${m[1]}>`],
  [/(?<![\w.$])(alert|confirm|prompt)\s*\(/g, (m) => `${m[1]}()`, "code"],
];

const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(astro|ts|tsx|js|mjs|html|md)$/.test(e.name)) files.push(p);
  }
};
for (const t of targets) {
  if (!fs.existsSync(t)) continue;
  if (fs.statSync(t).isDirectory()) walk(t); else files.push(t);
}

const found = [];
for (const f of files) {
  // Comments may name what is refused; strip them before looking.
  let text = fs.readFileSync(f, "utf8");
  if (f.endsWith(".md")) {
    // markdown: only the prose renders as HTML; code shows its text
    text = text.replace(/```[\s\S]*?```/g, (c) => c.replace(/[^\n]/g, " ")).replace(/`[^`\n]*`/g, (c) => " ".repeat(c.length));
  }
  const src = text
    .replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, " "))
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'`])\/\/[^\n]*/g, (c, p) => p + " ".repeat(c.length - p.length));
  for (const [re, say, only] of rules) {
    // markdown is prose: "the agent's prompt (…)" is not a call
    if (only === "code" && f.endsWith(".md")) continue;
    for (const m of src.matchAll(re)) {
      const line = src.slice(0, m.index).split("\n").length;
      found.push(`${path.relative(root, f)}:${line}  ${say(m)}`);
    }
  }
}

if (found.length) {
  console.error(`check-native: the browser's own controls are not used on this site (use the site's components):\n  ${found.join("\n  ")}`);
  process.exit(1);
}
console.log(`check-native: ${files.length} files, no native controls`);
