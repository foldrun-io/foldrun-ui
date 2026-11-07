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
"dependencies": { "@foldrun/ui": "github:foldrun-io/foldrun-ui#v0.1.1" }
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

## What is here

| | |
|---|---|
| `src/layouts/BaseLayout.astro` | head, meta, schema.org, theme before first paint, fonts, header and footer slots |
| `src/components/` | Header, Footer, ThemeSwitch, Hero, Section, SectionTitle, Button, ButtonRow, Card, FeatureGrid, Split, MediaPanel, Panel, TracePanel, CodePanel, Steps, StepNumber, StatGrid, PricingCards, PlanCard, ComparisonTable, Faq, Disclosure, Timeline, Callout, Badge, Chip, Check, Icon, IconTile, Logo, Monogram, Prose, ProductTour, ScreenshotFrame, CtaBand |
| `src/lib/icons.ts` | the Lucide icons the components draw, by name |
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

`demo/` renders every component once. `npm run check` runs check-native
and `astro check`; `npm run demo:build` builds the demo. (No `build`,
`prepare` or install scripts on purpose: npm would install this package's
dev dependencies in every consuming site to "prepare" it.) Hooks: `sh
.githooks/install.sh`. To try a change in a site before tagging, point its
dependency at `file:../foldrun-ui`.

Release: bump `version`, tag `vX.Y.Z`, push the tag, then move each site's
dependency to the new tag.

Source-available under FSL-1.1-ALv2 — see [LICENSING.md](LICENSING.md).
