// Button: the one action control, as classes — what every foldrun app draws a
// button with. The dashboard and the console through the kit's <Button>
// (react/button.tsx); foldrun.io, docs and foldrun.ir through Button.astro.
// Framework-neutral (no React, no Astro), so both read the same definition.
//
// Variants are what the action is (primary, secondary, ghost, danger, link);
// sizes are its box. The site-* sizes and the pill shape are a page's call
// to action, larger than an app's; everything else is shared.
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border text-sm font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "border-transparent bg-ink text-on-ink hover:bg-ink-hover",
        secondary: "border-line bg-surface text-fg hover:border-line-strong hover:bg-sunken aria-expanded:bg-sunken",
        ghost: "border-transparent text-fg-tertiary hover:bg-muted hover:text-fg aria-expanded:bg-muted aria-expanded:text-fg",
        danger: "border-transparent bg-red-600 text-white hover:bg-red-700",
        "danger-outline": "border-line bg-surface text-danger hover:border-danger-line hover:bg-danger-soft",
        link: "h-auto border-transparent px-0 text-link underline-offset-4 hover:underline",
        /** "+ Add …": a full-width dashed row that opens into a form. */
        dashed: "w-full border-dashed border-line-strong text-fg-muted hover:border-fg-subtle hover:bg-surface hover:text-fg",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-9 px-3.5",
        lg: "h-10 px-4",
        xs: "h-6 gap-1 rounded px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-xs": "size-6 rounded [&_svg:not([class*='size-'])]:size-3.5",
        /** A page's call to action (the sites). */
        "site-lg": "h-11 gap-2 px-5 text-[0.9375rem]",
        "site-md": "h-10 gap-2 px-4",
        "site-sm": "h-8 gap-2 px-3",
      },
      shape: { rounded: "", pill: "rounded-full" },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "secondary", size: "sm" },
  },
);

/** What an action is: primary, secondary, ghost, danger… */
export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
