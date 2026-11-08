// The foldrun mark's drawing: a folder with its run light at the corner,
// on a 24×24 grid. One geometry for every place it appears — the kit's
// FoldrunMark (react/mark.tsx: the sidebar, the phone bar, the sign-in card)
// and the sites' Logo.astro. The light is the outline's own colour
// (currentColor; owner, 7 Nov 2026); the ring behind it is the surface the
// mark sits on, so the light never touches the outline.
export const MARK = {
  viewBox: "0 0 24 24",
  strokeWidth: 1.8,
  folder: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z",
  line: "M3 11h18",
  light: { cx: 20.6, cy: 19.4, r: 1.9 },
  ring: { cx: 20.6, cy: 19.4, r: 3 },
} as const;
