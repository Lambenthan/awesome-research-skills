"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lightweight scroll-reveal wrapper. Wraps any block and fades it in with a
 * 14px upward translate the first time it enters the viewport. Stays
 * revealed afterward — never hides again. Use `delay` (ms) to stagger
 * siblings.
 *
 * Respects prefers-reduced-motion: the wrapped content is shown immediately
 * with no transition.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  as?: "div" | "section" | "article" | "li";
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    if ("IntersectionObserver" in window === false) {
      setRevealed(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const style = delay ? { transitionDelay: `${delay}ms` } : undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Element = Tag as any;
  return (
    <Element
      ref={ref}
      data-revealed={revealed ? "true" : "false"}
      className={`reveal ${className}`}
      style={style}
    >
      {children}
    </Element>
  );
}
