"use client";

// Focus back where it was, when a dialog opened without a Radix Trigger
// closes. Radix returns focus to the dialog's Trigger, and the kit's
// imperative dialogs (useConfirm, usePrompt) have none, so after one closed a
// keyboard user was left on <body> (Codex review, 8 Nov 2026). What had focus
// as `open` turned true is kept and focused again on close.
import { useRef, useState } from "react";

export function useReturnFocus(open: boolean): (e: Event) => void {
  const back = useRef<HTMLElement | null>(null);
  const [was, setWas] = useState(open);
  if (open !== was) {
    setWas(open);
    if (open && typeof document !== "undefined") back.current = document.activeElement as HTMLElement | null;
  }
  return (e: Event) => {
    const el = back.current;
    back.current = null;
    if (el && el.isConnected && el !== document.body) {
      e.preventDefault();
      el.focus();
    }
  };
}
