# @foldrun/ui

foldrun's one component set and design tokens, used by every foldrun app:

| App | Draws with |
|---|---|
| the dashboard (`foldrun-web`) and the operator console (`foldrun-admin/console`) | the React kit, `@foldrun/ui/react/*`, and `kit.css` |
| [foldrun.io](https://foldrun.io), [docs.foldrun.io](https://docs.foldrun.io), [foldrun.ir](https://foldrun.ir) | the Astro components and `styles.css` |

One implementation per pattern (owner rule, 7 Nov 2026): when an app needs
something the kit does not have, it is added here once, released, and used
everywhere — never a copy in an app. Shipped as source, no build step.

## Use — React (Next.js)

```jsonc
// package.json — pinned to a release tag
"dependencies": { "@foldrun/ui": "https://codeload.github.com/foldrun-io/foldrun-ui/tar.gz/refs/tags/v0.3.2" }
```

```ts
// next.config.ts
transpilePackages: ["@foldrun/ui"],
```

```css
/* app/globals.css */
@import "tailwindcss";
@import "@foldrun/ui/kit.css"; /* tokens, both themes, animations, @source for the kit */
```

```tsx
import { Button } from "@foldrun/ui/react/button";
import { Select } from "@foldrun/ui/react/select";
import { Panel, PageHeader } from "@foldrun/ui/react/page";
```

Each file is its own export (`scripts/exports.mjs` writes the list; a test
keeps it current). Server-safe files (`page`, `button`, `table`, `mark`, …)
carry no `"use client"`; the rest are client components. The colours are
`src/styles/tokens.css` and the generated `theme-dark.css`
(`node scripts/gen-dark-palette.mjs`); `<html data-theme>` is light, dark or
system. The app names its faces `--font-sans-ui` / `--font-mono-ui` (Geist).

## One definition, both sides

`src/recipes/` holds what the React kit and the Astro components share,
framework-neutral: `button.ts` (the Button's classes — the sites add the
`site-*` sizes and the pill shape), `input.ts` (a text control's box) and
`mark.ts` (the logo's geometry). `react/button.tsx`, `react/input.tsx`,
`react/mark.tsx` and `Button.astro`, `Field.astro`, `Logo.astro` read them;
a test refuses the mark drawn anywhere else.

## Checks every app runs

- `foldrun-ui-check-native [paths]` — no browser-native controls (selects,
  checkboxes, date inputs, `title=` tooltips, `<details>`, alert/confirm).
- `foldrun-ui-check-security [paths]` — no injection doors (OWASP A03): raw
  HTML (`dangerouslySetInnerHTML`, `set:html`, `innerHTML=`,
  `insertAdjacentHTML`, `document.write`), code from text (`eval`,
  `new Function`, string timers), `javascript:` URLs, and `target="_blank"`
  without `rel="noopener"`. An exception that must stay says why on a line
  above it: `foldrun-allow-html: <reason>`.

The dashboard and the console run both from their guard tests
(`tests/kit-only.test.ts`); the sites from `npm run check` and pre-push.

## Use — Astro sites

```jsonc
// package.json — pinned to a tag
"dependencies": { "@foldrun/ui": "https://codeload.github.com/foldrun-io/foldrun-ui/tar.gz/refs/tags/v0.3.2" }
```

```astro
---
import BaseLayout from "@foldrun/ui/layouts/BaseLayout.astro";
import Header from "@foldrun/ui/components/Header.astro";
import Footer from "@foldrun/ui/components/Footer.astro";
import Hero from "@foldrun/ui/components/Hero.astro";
---
<BaseLayout title="…" description="…" siteUrl="https://example.com">
  <Header slot="header" nav={[…]} actions={[…]} />
  <Hero title="…" lead="…" />
  <Footer slot="footer" columns={[…]} />
</BaseLayout>
```

`BaseLayout` imports `styles.css` (Tailwind, the tokens, base styles, prose,
the fonts); a site adds nothing unless it has styles of its own. Every
colour, size and radius is a token in `src/styles/global.css`.

### Another language, right to left (foldrun.ir)

```astro
<BaseLayout lang="fa" ogLocale="fa_IR" siteName="foldrun.ir" strictCsp
  fontPreload="/fonts/Estedad-wght-v8.6.woff2" …>
  <Header slot="header" labels={{ skip: "…", home: "…", nav: "…", menu: "…" }} … />
  …
  <Footer slot="footer" labels={{ nav: "…", theme: { group: "…", system: "…", light: "…", dark: "…" } }} …>
    <!-- anything beside the mark: a trust seal -->
  </Footer>
</BaseLayout>
```

- `lang` sets `dir` (right to left for fa, ar, he, ur). The components use
  logical properties (`ms-`, `ps-`, `border-s`, `text-start`), so they
  mirror by themselves; arrows mirror too. Tracking is off and display
  leading is looser for Persian and Arabic (global.css).
- The typeface: set `--font-site` (and `--font-site-mono`) on `:root` in
  the site's own stylesheet, and pass its file as `fontPreload`.
- `strictCsp` loads the first-paint script (`src/lib/boot.js`: `html.js`,
  the saved theme) as a file instead of inline, for a policy with no
  `'unsafe-inline'`. Astro inlines its own small scripts unless the site
  sets `vite.build.assetsInlineLimit: 0`; a strict-CSP site sets it.
- Numbers the components print: `Steps` / `StepNumber` take `locale`
  (`"fa"` → ۱ ۲ ۳). Everything else prints what the site passes.
- Also for any page: `noindex`, `canonical`, `image` / `imageAlt` (a large
  share card), and a `head` slot.

## What is here

| | |
|---|---|
| `src/layouts/BaseLayout.astro` | head, meta, schema.org, theme before first paint, fonts, header and footer slots |
| `src/components/` | Header, Footer, ThemeSwitch, Hero, Section, SectionTitle, Button, ButtonRow, Card, FeatureGrid, Split, MediaPanel, Panel, TracePanel, CodePanel, Steps, StepNumber, StatGrid, PricingCards, PlanCard, ComparisonTable, Faq, Disclosure, Timeline, Callout, Badge, Chip, Check, Icon, IconTile, Logo, BrandMark, LogoWall, Prose, ProductTour, ScreenshotFrame, CtaBand (Monogram is deprecated: initials read as placeholders); for forms: Field (a labelled text field), ChoiceTiles (one choice from a few, our own pressed buttons), DataList (name and value rows), and Button without `href` (a real `<button>`) |
| `src/lib/icons.ts` | the Lucide icons the components draw, by name |
| `src/lib/brands.ts` | vendors' own single-colour marks (Simple Icons, CC0) for BrandMark, LogoWall and Card `mark`; a vendor without one is shown by name |
| `src/lib/boot.js` | the first-paint script (`html.js`, the saved theme), for `strictCsp` |
| `src/lib/signup-client.ts` | one request per page to the app's `GET /api/signup`: sign-up switches for buttons marked `signup`, and live plans for `PricingCards` / `ComparisonTable` |
| `src/styles/global.css` | the tokens (the dashboard's names and values), base, prose, backdrops |
| `fonts/` | Geist and Geist Mono, variable (SIL OFL, `fonts/GEIST-LICENSE.txt`) |
| `scripts/check-native.mjs` | `foldrun-ui-check-native [paths]`: fails on the browser's own controls (`<details>`, `<select>`, checkbox/radio, `title=` tooltips, `alert()` …) |

## Rules

- **No browser controls.** Disclosures, menus, tabs, tooltips and the theme
  switch are components here; `check-native` runs in every consuming
  repo's checks and in this one's.
- **One implementation per pattern.** A site composes these components and
  passes its own words and links as props; it does not copy markup.
- **Tokens only.** No raw colours in components.

## Develop

`demo/` renders every component once; `demo/pages/rtl.astro` renders the
right-to-left, strict-CSP shape and the form pieces. `npm run check` runs check-native
and `astro check`; `npm run demo:build` builds the demo. (No `build`,
`prepare` or install scripts on purpose: npm would install this package's
dev dependencies in every consuming site to "prepare" it.) Hooks: `sh
.githooks/install.sh`. To try a change in a site before tagging, point its
dependency at `file:../foldrun-ui`.

Release: bump `version`, tag `vX.Y.Z`, push the tag, then move each site's
dependency to the new tag.

Source-available under FSL-1.1-ALv2 — see [LICENSING.md](LICENSING.md).
