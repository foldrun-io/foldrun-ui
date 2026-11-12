// The React kit (src/react): what every app — the dashboard, the operator
// console — draws with. One implementation per pattern (owner rule, 7 Nov
// 2026); each app's own guard refuses a copy, this one keeps the kit whole.
//
//   node --test tests/kit.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const KIT = path.join(import.meta.dirname, "..", "src/react");
const files = fs.readdirSync(KIT).filter((f) => /\.tsx?$/.test(f));
const src = (f: string) => fs.readFileSync(path.join(KIT, f), "utf8");

test("the kit's server-safe parts stay server-safe", () => {
  // A server page composes these directly; a hook or "use client" here would
  // turn every page that draws a Panel into a client bundle.
  for (const f of ["mark.tsx", "auth-card.tsx", "page.tsx", "button.tsx", "input.tsx", "segmented.tsx", "pager.tsx", "table.tsx", "chart.tsx", "cn.ts", "skeleton.tsx", "paging.ts", "list-search-model.ts"]) {
    assert.doesNotMatch(src(f), /^["']use client["']/m, `${f} must stay server-safe`);
    assert.doesNotMatch(src(f), /\buse(State|Effect|Ref|Router|Pathname|SearchParams|SyncExternalStore)\(/, `${f} calls a hook — move that part to a client file`);
  }
});

test("each pattern is defined once, in its own file", () => {
  const once: Record<string, string> = {
    Panel: "page.tsx", EmptyState: "page.tsx", Stat: "page.tsx", Field: "page.tsx", Chip: "page.tsx", Tag: "page.tsx", Callout: "page.tsx",
    SearchField: "list.tsx", Pager: "pager.tsx", PageTabs: "page-tabs.tsx", Segmented: "segmented.tsx",
    Button: "button.tsx", Select: "select.tsx", Input: "input.tsx", Toast: "toast.tsx", useConfirm: "confirm.tsx", usePrompt: "prompt.tsx",
    DataTable: "table.tsx", Checkbox: "choice.tsx", Switch: "choice.tsx", RadioGroup: "choice.tsx", Disclosure: "disclosure.tsx",
    Combobox: "combobox.tsx", FileButton: "file-button.tsx", Slider: "slider.tsx", TimeField: "time-field.tsx", DateTimeField: "date-time-field.tsx",
    Tooltip: "tooltip.tsx", IconButton: "tooltip.tsx", FoldrunMark: "mark.tsx", AuthCard: "auth-card.tsx", Brand: "auth-card.tsx",
  };
  for (const [name, file] of Object.entries(once)) {
    const defs = files.filter((f) => new RegExp(`(?:^|\\n)\\s*export\\s+function\\s+${name}\\b`).test(src(f)));
    assert.deepEqual(defs, [file], `${name} must be defined once, in src/react/${file}`);
  }
});

test("the kit reaches nothing outside itself but its declared packages", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(KIT, "../../package.json"), "utf8"));
  const allowed = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})]);
  const bad: string[] = [];
  for (const f of files) {
    for (const m of src(f).matchAll(/(?:from|import)\s*\(?\s*["']([^"'.][^"']*)["']/g)) {
      const name = m[1].startsWith("@") ? m[1].split("/").slice(0, 2).join("/") : m[1].split("/")[0];
      if (!allowed.has(name)) bad.push(`${f}: ${m[1]}`);
    }
  }
  assert.deepEqual(bad, [], "an app's own module (@/…) or an undeclared package");
});

test("one definition each side reads: the mark, the button and the input live in src/recipes", () => {
  const SRC = path.join(KIT, "..");
  const all: string[] = [];
  const walk = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(astro|tsx?|css)$/.test(e.name)) all.push(path.relative(SRC, p));
    }
  };
  walk(SRC);
  const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), "utf8");
  // The folder outline is the mark's signature: drawn from recipes/mark.ts only.
  assert.deepEqual(all.filter((f) => read(f).includes("M3 7a2 2 0 0 1 2-2h4l2 2h8")), ["recipes/mark.ts"]);
  for (const [file, recipe] of [["react/mark.tsx", "recipes/mark"], ["components/Logo.astro", "recipes/mark"], ["react/button.tsx", "recipes/button"], ["components/Button.astro", "recipes/button"], ["react/input.tsx", "recipes/input"], ["components/Field.astro", "recipes/input"]]) {
    assert.match(read(file), new RegExp(`from "\\.\\./${recipe}(\\.ts)?"`), `${file} reads ${recipe}`);
  }
  // A recipe is framework-neutral: no React, no Astro, no Next.
  for (const f of all.filter((f) => f.startsWith("recipes/"))) assert.doesNotMatch(read(f), /from ["'](react|next|astro)/, f);
});
