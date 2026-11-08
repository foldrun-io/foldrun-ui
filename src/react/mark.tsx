// The foldrun mark: the folder with its run light. One drawing for every
// place it appears (the sidebar, the phone bar, the sign-in card). One
// colour (7 Nov 2026): the light is the mark's own colour, black on light and
// white on dark; green stays for status. The ring behind the light is the
// surface the mark sits on (`on`), so the dot never touches the outline.
// Server-safe.

import { cn } from "./cn";
import { MARK } from "../recipes/mark";

const RING = { paper: "var(--color-paper-deep)", surface: "var(--color-surface)" } as const;

export function FoldrunMark({ size = 20, on = "paper", className }: { size?: number; on?: keyof typeof RING; className?: string }) {
  return (
    <svg width={size} height={size} viewBox={MARK.viewBox} fill="none" stroke="currentColor" strokeWidth={MARK.strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={cn("shrink-0 text-fg", className)} aria-hidden>
      <path d={MARK.folder} />
      <path d={MARK.line} />
      <circle {...MARK.ring} fill={RING[on]} stroke="none" />
      <circle {...MARK.light} fill="currentColor" stroke="none" />
    </svg>
  );
}
