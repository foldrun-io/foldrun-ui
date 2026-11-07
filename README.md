# @foldrun/ui

foldrun's web components and design tokens — the one look shared by
[foldrun.io](https://foldrun.io) (`foldrun-site`) and
[docs.foldrun.io](https://docs.foldrun.io) (`foldrun-docs`), and the same
tokens as the dashboard (`foldrun-web` `app/globals.css`): neutral greys,
hairlines, small radii, one blue accent, Geist.

Astro components and CSS, shipped as source. No build step: a site imports
the `.astro` files and compiles them with its own Astro and Tailwind.

## Use

```jsonc
// package.json — pinned to a tag
"dependencies": { "@foldrun/ui": "github:foldrun-io/foldrun-ui#v0.2.2" }
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
