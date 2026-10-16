"use client";
import { useEffect } from "react";

const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Mounted once in the root layout.
 * - Scroll reveal: any `.ab-reveal` element gets `data-in` when it enters the viewport
 *   (a data attribute, not a class, so React re-renders never strip it).
 * - Spotlight: sets --mx / --my on the `.ab-spotlight` element under the pointer.
 * Both work on content that arrives later from the API (MutationObserver).
 */
export function MotionRuntime() {
  useEffect(() => {
    const show = (el) => el.setAttribute("data-in", "");
    let io;
    if (reduceMotion() || !("IntersectionObserver" in window)) {
      io = { observe: show, disconnect() {} };
    } else {
      io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              show(e.target);
              io.unobserve(e.target);
            }
          }),
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
      );
    }
    const scan = (root) =>
      root
        .querySelectorAll?.(".ab-reveal:not([data-in])")
        .forEach((el) => io.observe(el));
    scan(document);
    // Rescan once per frame when the DOM changes (API data renders after mount).
    let queued = 0;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        scan(document);
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const onMove = (e) => {
      const card = e.target.closest?.(".ab-spotlight");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(queued);
      document.removeEventListener("pointermove", onMove);
    };
  }, []);
  return null;
}
