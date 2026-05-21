"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A 1px wide horizontal line that scales out from the center the
 * first time it scrolls into view. Used as a quiet section opener
 * above big mission H2s — the line "draws itself" outward over
 * 1.2s as the reader arrives at the section.
 *
 * Independent IntersectionObserver (does not nest inside <Reveal>)
 * so the line stays positioned while it scales. Honors
 * prefers-reduced-motion via the .hairline media block in globals.css.
 */
export function Hairline({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el || "IntersectionObserver" in window === false) {
      setShown(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`hairline ${shown ? "is-revealed" : ""} ${className}`}
    />
  );
}
