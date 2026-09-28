"use client";
import { useEffect, useRef, useState } from "react";

// True when the visitor asked the system for less motion; auto-advancing parts stay still for them.
export function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  return reduce;
}

// Which slides to keep on the page: the one fading out, the one showing, and the next one (preloaded).
// Rendering every slide at once made the browser download every full-size photo before the page settled.
// The previous slide is worked out during the same render as the change: tracked in an effect it arrived one render
// late, so the photo on screen was removed the moment the next one started to fade in (a visible blink).
export function useSlideWindow(active, count) {
  const seen = useRef({ cur: active, prev: active });
  if (seen.current.cur !== active) seen.current = { cur: active, prev: seen.current.cur };
  const out = seen.current.prev;
  return (i) => i === active || i === out || i === (active + 1) % count;
}

// Pop-ups (log-in dialog, header search panel) freeze everything that moves on its own behind them: the pop-up has
// the visitor's full attention (WAI-ARIA dialog pattern; WCAG 2.2.2 pause for auto-moving content). A counter, so two
// overlapping pop-ups keep things still until both close.
const OVERLAY_EVENT = "ab-overlay";
let overlays = 0;
export function setOverlayOpen(open) {
  overlays = Math.max(0, overlays + (open ? 1 : -1));
  window.dispatchEvent(new Event(OVERLAY_EVENT));
}
export function useOverlayOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const read = () => setOpen(overlays > 0);
    read();
    window.addEventListener(OVERLAY_EVENT, read);
    return () => window.removeEventListener(OVERLAY_EVENT, read);
  }, []);
  return open;
}
