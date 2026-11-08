#!/usr/bin/env node
// Refuses the ways a page lets text become markup or code (OWASP A03,
// injection / XSS): every foldrun app — the dashboard, the operator console,
// foldrun.io, foldrun.ir, docs.foldrun.io — runs it over its own source, and
// @foldrun/ui over itself. React and Astro escape text on their own; these
// are the doors around that.
//
// Refused:
//   dangerouslySetInnerHTML, Astro's set:html, .innerHTML= / .outerHTML=,
//   insertAdjacentHTML(), document.write()  — raw HTML into the page
//   eval(), new Function(), setTimeout/setInterval with a string — code from text
//   a "javascript:" URL                     — script in a link
//   target="_blank" without rel="noopener" or "noreferrer" — the opened page
//                                             gets window.opener (tabnabbing)
//
// One that must stay — fixed markup the file itself owns, or text it escapes
// first — says why on a line just above, in any comment form:
//   // foldrun-allow-html: the icon table is this file's own constant SVG
// A marker with no reason allows nothing.
//
// Usage, from a project's root: foldrun-ui-check-security [path …]
// (default: src). Part of @foldrun/ui, beside foldrun-ui-check-native.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const targets = (args.length ? args : ["src"]).map((a) => path.resolve(root, a));

const rules = [
  [/\bdangerouslySetInnerHTML\b/g, () => "dangerouslySetInnerHTML (raw HTML)"],
  [/\bset:html\s*=/g, () => "set:html (raw HTML)"],
  [/\.(innerHTML|outerHTML)\s*=(?!=)/g, (m) => `.${m[1]} = (raw HTML)`],
  [/\binsertAdjacentHTML\s*\(/g, () => "insertAdjacentHTML() (raw HTML)"],
  [/\bdocument\.write(ln)?\s*\(/g, () => "document.write() (raw HTML)"],
  [/(?<![\w.$])eval\s*\(/g, () => "eval() (code from text)"],
  [/\bnew\s+Function\s*\(/g, () => "new Function() (code from text)"],
  [/\bset(Timeout|Interval)\s*\(\s*["'`]/g, (m) => `set${m[1]}() with a string (code from text)`],
  [/["'`]\s*javascript:/gi, () => "a javascript: URL"],
];
// An element opening a new tab, without rel. A JSX attribute may hold "=>",
// so the tag ends at the first ">" not part of one ("=>" is tried first).
const BLANK = /<[A-Za-z][\w.:-]*\b(?:=>|[^<>])*?\btarget\s*=\s*\{?\s*["']_blank["']\s*\}?(?:=>|[^<>])*>/g;

const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".") || e.name === "dist") continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(astro|ts|tsx|js|mjs|jsx|html)$/.test(e.name) && !/\.(test|spec)\.[tj]sx?$/.test(e.name)) files.push(p);
  }
};
for (const t of targets) {
  if (!fs.existsSync(t)) continue;
  if (fs.statSync(t).isDirectory()) walk(t);
  else files.push(t);
}

const ALLOW = /foldrun-allow-html:[ \t]*[\w`"(]/; // a reason: words, not the comment's own */ or -->
const found = [];
for (const f of files) {
  const text = fs.readFileSync(f, "utf8");
  const lines = text.split("\n");
  // Comments may name what is refused; blank them (keeping lines) first.
  const src = text
    .replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, " "))
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (c, p) => p + " ".repeat(c.length - p.length));
  const allowed = (line) => [1, 2, 3].some((k) => ALLOW.test(lines[line - 1 - k] ?? ""));
  const report = (index, say) => {
    const line = src.slice(0, index).split("\n").length;
    if (!allowed(line)) found.push(`${path.relative(root, f)}:${line}  ${say}`);
  };
  for (const [re, say] of rules) for (const m of src.matchAll(re)) report(m.index, say(m));
  for (const m of src.matchAll(BLANK)) {
    if (!/\brel\s*=\s*\{?\s*["'`][^"'`]*\b(noopener|noreferrer)\b/.test(m[0])) report(m.index, 'target="_blank" without rel="noopener" (tabnabbing)');
  }
}

if (found.length) {
  console.error(`check-security: markup or code from text (OWASP A03) — escape it, use the component, or say why above it (foldrun-allow-html: <reason>):\n  ${found.join("\n  ")}`);
  process.exit(1);
}
console.log(`check-security: ${files.length} files, no raw HTML, script URLs or code from text`);
