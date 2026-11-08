// A text control's look — the box every foldrun app types into: the kit's
// Input, Textarea, Select and DateTimeField triggers (react/), and the sites'
// Field.astro. Framework-neutral, so both read the same definition. Each
// adds only its own height and text size.
export const inputBase =
  "w-full min-w-0 rounded-md border border-line bg-surface px-3 text-sm text-fg transition-colors placeholder:text-fg-subtle hover:border-line-strong focus-visible:border-focus focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-soft disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger";
