"use client";

import { useEffect, useState } from "react";

/**
 * Thin sticky progress bar showing how far the reader has scrolled
 * through the current chapter. Renders as a 2px ember-tinted bar
 * pinned to the top of the viewport.
 *
 * SSR-safe: starts at width 0, only updates after mount.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) {
        setProgress(0);
        return;
      }
      const ratio = Math.max(0, Math.min(1, scrollTop / max));
      setProgress(ratio);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] bg-transparent"
    >
      <div
        className="h-full bg-ember transition-[width] duration-100 ease-out"
        style={{ width: `${(progress * 100).toFixed(2)}%` }}
      />
    </div>
  );
}
