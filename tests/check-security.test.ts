// The injection scanner (scripts/check-security.mjs) that every foldrun app
// runs: it finds each door, accepts one only with a reason, and leaves safe
// code and comments alone.
//
//   node --test tests/check-security.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SCANNER = path.join(import.meta.dirname, "..", "scripts", "check-security.mjs");
function scan(files: Record<string, string>) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "check-security-"));
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), text);
  const r = spawnSync(process.execPath, [SCANNER, "."], { cwd: dir, encoding: "utf8" });
  fs.rmSync(dir, { recursive: true, force: true });
  return { ok: r.status === 0, out: r.stdout + r.stderr };
}

test("each door is found", () => {
  const cases: Record<string, string> = {
    "a.tsx": `export const A = ({ h }) => <div dangerouslySetInnerHTML={{ __html: h }} />;`,
    "b.astro": `<p set:html={note} />`,
    "c.ts": `el.innerHTML = value;`,
    "d.ts": `el.outerHTML = value;`,
    "e.ts": `el.insertAdjacentHTML("beforeend", x);`,
    "f.ts": `document.write(x);`,
    "g.ts": `eval(code);`,
    "h.ts": `const f = new Function("a", body);`,
    "i.ts": `setTimeout("go()", 10);`,
    "j.tsx": `<a href="javascript:alert(1)">x</a>`,
    "k.tsx": `<a href={u} target="_blank">x</a>`,
    "l.tsx": `<a target="_blank" onClick={() => go()} href="/">x</a>`,
  };
  for (const [name, text] of Object.entries(cases)) {
    const r = scan({ [name]: text });
    assert.equal(r.ok, false, `${name} should be refused: ${text}`);
    assert.match(r.out, new RegExp(name.replace(".", "\\.")));
  }
});

test("safe code, comments and reasoned exceptions pass", () => {
  const r = scan({
    "ok.tsx": [
      `// el.innerHTML = x would be refused; this says so in a comment`,
      `/* eval(x) */`,
      `export const L = ({ u, onSave }) => <a href={u} target="_blank" rel="noreferrer" onClick={() => onSave()}>x</a>;`,
      `export const M = <a target="_blank" rel="noopener noreferrer" href="/x">y</a>;`,
      `export const N = <a target="_blank" onClick={() => go()} rel="noopener" href="/">z</a>;`,
      `const same = el.innerHTML === "";`,
      `page.evaluate(() => 1); setTimeout(() => go(), 10);`,
    ].join("\n"),
    "allowed.astro": `---\n---\n{/* foldrun-allow-html: this file's own constant SVG */}\n<svg set:html={inner} />`,
  });
  assert.equal(r.ok, true, r.out);
});

test("a marker without a reason allows nothing", () => {
  const r = scan({ "x.astro": `{/* foldrun-allow-html: */}\n<p set:html={x} />` });
  assert.equal(r.ok, false, r.out);
});
