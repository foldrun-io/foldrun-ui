"use client";

// A date and a time of day, in the viewer's zone — the kit's stand-in for
// <input type="datetime-local"> (owner rule: no browser controls in the UI).
// A button showing the value opens a month on Radix Popover; the time is the
// kit's TimeField. The value is the same string a datetime-local input gives,
// "YYYY-MM-DDTHH:MM", so a caller keeps its `new Date(value)`; empty until a
// day is picked. With `name`, a hidden input carries it in a plain <form>.
import * as React from "react";
import { Popover as P } from "radix-ui";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./cn";
import { inputBase } from "./input";
import { TimeField } from "./time-field";

const pad = (n: number) => String(n).padStart(2, "0");
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });

/** "YYYY-MM-DDTHH:MM" → its parts, or null when it is not one. */
export function parseLocal(v: string): { y: number; m: number; d: number; hh: number; mm: number } | null {
  const x = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(v);
  return x ? { y: +x[1], m: +x[2], d: +x[3], hh: +x[4], mm: +x[5] } : null;
}
export const formatLocal = (y: number, m: number, d: number, hh: number, mm: number) => `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}`;

/** The days drawn for a month, Monday first: leading blanks, then 1…n. */
export function monthGrid(y: number, m: number): (number | null)[] {
  const first = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const days = new Date(y, m, 0).getDate();
  return [...Array<null>(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
}

export function DateTimeField({
  value,
  onChange,
  className,
  label = "Date and time",
  name,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Names the button and the time lists. */
  label?: string;
  /** Submits the value under this name in a plain <form>. */
  name?: string;
  disabled?: boolean;
}) {
  const now = new Date();
  const cur = parseLocal(value);
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState(() => ({ y: cur?.y ?? now.getFullYear(), m: cur?.m ?? now.getMonth() + 1 }));
  const hh = cur?.hh ?? 9;
  const mm = cur?.mm ?? 0;
  const step = (n: number) => setView(({ y, m }) => ({ y: m + n < 1 ? y - 1 : m + n > 12 ? y + 1 : y, m: ((m + n + 11) % 12) + 1 }));
  const shown = cur
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(cur.y, cur.m - 1, cur.d, cur.hh, cur.mm))
    : "Pick a date";
  const today = { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
  const picked = (d: number) => !!cur && cur.y === view.y && cur.m === view.m && cur.d === d;

  return (
    <>
      {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
      <P.Root
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (o && cur) setView({ y: cur.y, m: cur.m });
        }}
      >
        <P.Trigger asChild disabled={disabled}>
          <button type="button" aria-label={`${label}: ${shown}`} className={cn(inputBase, "inline-flex h-9 w-auto items-center gap-2 text-left", !cur && "text-fg-subtle", className)}>
            <CalendarDays className="size-4 shrink-0 text-fg-muted" aria-hidden />
            <span className="tabular-nums">{shown}</span>
          </button>
        </P.Trigger>
        <P.Portal>
          <P.Content align="start" sideOffset={4} className="z-[70] w-72 rounded-lg border border-line bg-surface p-3 text-sm text-fg shadow-menu">
            <div className="mb-2 flex items-center justify-between">
              <button type="button" aria-label="Previous month" onClick={() => step(-1)} className="rounded-md p-1 text-fg-muted hover:bg-muted hover:text-fg">
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <span className="font-medium" aria-live="polite">
                {MONTH.format(new Date(view.y, view.m - 1, 1))}
              </span>
              <button type="button" aria-label="Next month" onClick={() => step(1)} className="rounded-md p-1 text-fg-muted hover:bg-muted hover:text-fg">
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
            <div role="grid" aria-label={MONTH.format(new Date(view.y, view.m - 1, 1))} className="grid grid-cols-7 gap-0.5 text-center">
              {WEEKDAYS.map((w) => (
                <span key={w} role="columnheader" className="py-1 text-[11px] font-medium text-fg-subtle">
                  {w}
                </span>
              ))}
              {monthGrid(view.y, view.m).map((d, i) =>
                d === null ? (
                  <span key={`b${i}`} />
                ) : (
                  <button
                    key={d}
                    type="button"
                    role="gridcell"
                    aria-selected={picked(d)}
                    onClick={() => onChange(formatLocal(view.y, view.m, d, hh, mm))}
                    className={cn(
                      "rounded-md py-1 text-[13px] tabular-nums hover:bg-muted",
                      today.y === view.y && today.m === view.m && today.d === d && "font-semibold",
                      picked(d) ? "bg-ink text-on-ink hover:bg-ink-hover" : "text-fg-secondary",
                    )}
                  >
                    {d}
                  </button>
                ),
              )}
            </div>
            <div className="mt-3 flex items-center gap-1 border-t border-line pt-3">
              <span className="mr-auto text-xs text-fg-muted">Time</span>
              <TimeField
                label={`${label} time`}
                value={`${pad(hh)}:${pad(mm)}`}
                disabled={!cur || disabled}
                onChange={(t) => {
                  const [h, m] = t.split(":").map(Number);
                  if (cur) onChange(formatLocal(cur.y, cur.m, cur.d, h, m));
                }}
              />
            </div>
          </P.Content>
        </P.Portal>
      </P.Root>
    </>
  );
}
