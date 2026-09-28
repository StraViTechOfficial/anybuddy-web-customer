"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Instant feedback on every internal link click: a thin amber bar at the top that runs until the new page is in.
// Only shows if the page takes longer than 120 ms, so fast pages don't flash.
export default function NavProgress() {
  const pathname = usePathname();
  const [state, setState] = useState("idle"); // idle | wait | run | done

  useEffect(() => {
    let timer;
    const onClick = (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      clearTimeout(timer);
      setState("wait");
      timer = setTimeout(() => setState((s) => (s === "wait" ? "run" : s)), 120);
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    setState((s) => (s === "run" ? "done" : "idle"));
    const t = setTimeout(() => setState((s) => (s === "done" ? "idle" : s)), 300);
    return () => clearTimeout(t);
  }, [pathname]);

  return <div className={`ab-navbar ab-navbar--${state}`} aria-hidden="true" />;
}
