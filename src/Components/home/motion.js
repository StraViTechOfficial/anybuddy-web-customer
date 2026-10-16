"use client";
import { useEffect, useRef, useState } from "react";

// True when the visitor has asked the system for less motion. Parts that advance on their own stay still for them.
export function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  return reduce;
}

// Which slides to keep on the page: the one fading out, the one showing, and the next one (preloaded).
// Rendering every slide at once made the browser download every full-size photo before the page settled.
// The previous slide is worked out in the same render as the change. When it was tracked in an effect it arrived one
// render late, so the photo on screen was removed just as the next one started to fade in (a visible blink).
export function useSlideWindow(active, count) {
  const seen = useRef({ cur: active, prev: active });
  if (seen.current.cur !== active) seen.current = { cur: active, prev: seen.current.cur };
  const out = seen.current.prev;
  return (i) => i === active || i === out || i === (active + 1) % count;
}

// Pop-ups (the login dialog and the header search panel) freeze everything that moves on its own behind them, because
// the pop-up has the visitor's full attention (the WAI-ARIA dialog pattern, and WCAG 2.2.2 on pausing moving content).
// It is a counter, so two overlapping pop-ups keep things still until both have closed.
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
