// foldrun's colours (src/styles/tokens.css + the generated theme-dark.css):
// the dark half is what the generator writes, its two selectors are the two
// dark cases, the text a page leans on is AA in both themes, and the kit's
// own components paint in tokens, never a light-only colour.
//
//   node --test tests/palette.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dirname, "..");
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8");

test("the stylesheet's two dark selectors are the model's two dark cases", () => {
  // data-theme="dark" always; no choice / "system" only on a dark OS; "light" never.
  const css = read("src/styles/theme-dark.css");
  assert.match(css, /:root\[data-theme="dark"\] \{/);
  assert.match(css, /@media \(prefers-color-scheme: dark\) \{\n {2}:root:not\(\[data-theme="light"\]\):not\(\[data-theme="dark"\]\) \{/);
  assert.match(read("src/styles/tokens.css"), /@import "\.\/theme-dark\.css";/);
  assert.match(read("src/styles/kit.css"), /@import "\.\/tokens\.css";/);
});

test("src/styles/theme-dark.css is what the generator writes", async () => {
  const { render } = await import("../scripts/gen-dark-palette.mjs");
  assert.equal(read("src/styles/theme-dark.css"), render(), "run node scripts/gen-dark-palette.mjs");
});

test("the text a page leans on is AA in both themes", async () => {
  const { contrast, darkVars } = await import("../scripts/gen-dark-palette.mjs");
  const dark: Record<string, string> = darkVars();
  const v = (k: string) => dark[`--color-${k}`];
  for (const [fg, bg] of [["gray-900", "white"], ["gray-700", "white"], ["gray-500", "white"], ["gray-500", "gray-50"], ["white", "gray-900"], ["red-700", "red-50"], ["amber-800", "amber-50"], ["emerald-700", "emerald-50"], ["sky-700", "sky-50"], ["white", "red-600"]]) {
    assert.ok(contrast(v(fg), v(bg)) >= 4.5, `dark ${fg} on ${bg}: ${contrast(v(fg), v(bg)).toFixed(2)}`);
  }
});

// The greys that have a name in tokens.css, and colours that cannot follow
// the theme at all — the same rule each app applies to its own pages.
const RAW_GREY = /(?<![\w-])(?:[a-z-]+:)*(bg-white|bg-gray-(?:50|100|200|900)|text-gray-(?:400|500|600|700|900)|border-gray-(?:100|200|300)|divide-gray-(?:100|200)|ring-gray-(?:100|200|300))(?![\w-])/g;
const LITERAL = /-\[#[0-9a-fA-F]{3,8}\]|["'`]#[0-9a-fA-F]{3,8}["'`]|\brgba?\(|\bhsla?\(/g;

test("the kit's components paint in theme tokens, not light-only colours", () => {
  const dir = path.join(root, "src/react");
  const files = fs.readdirSync(dir).filter((f) => /\.tsx?$/.test(f));
  assert.ok(files.length > 30, `found only ${files.length} files`);
  const bad: string[] = [];
  for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    for (const m of src.matchAll(RAW_GREY)) bad.push(`${f}: ${m[0]}`);
    for (const m of src.matchAll(LITERAL)) bad.push(`${f}: ${m[0]}`);
  }
  assert.deepEqual(bad, [], "use the tokens in src/styles/tokens.css: bg-surface, bg-sunken, text-fg-muted, border-line …");
});

test("package.json exports every kit file, by its own extension", async () => {
  const { render } = await import("../scripts/exports.mjs");
  const pkg = JSON.parse(read("package.json"));
  assert.deepEqual(pkg.exports, render(pkg).exports, "run node scripts/exports.mjs");
});

test("light mode draws the tokens' own neutral greys, not Tailwind's tinted ones", () => {
  // theme-dark.css's light block is unlayered and wins over @theme: it must
  // carry tokens.css's grey values, or light mode quietly goes blue-grey.
  const own = read("src/styles/tokens.css").match(/@theme \{([\s\S]*?)\n\}/)![1];
  const light = read("src/styles/theme-dark.css").match(/:root,\n\.palette-fixed \{([\s\S]*?)\n\}/)![1];
  for (const shade of ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"]) {
    const want = own.match(new RegExp(`--color-gray-${shade}:\\s*([^;]+);`))?.[1];
    const got = light.match(new RegExp(`--color-gray-${shade}:\\s*([^;]+);`))?.[1];
    assert.ok(want, `tokens.css declares gray-${shade}`);
    assert.equal(got, want, `gray-${shade} in light mode`);
  }
});
