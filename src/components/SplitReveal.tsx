"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hero word-by-word reveal. Equivalent to anthropic.com's
 * "word-animation-processed" GSAP SplitText timeline (their
 * 2026-05-21 implementation) but done in CSS + IntersectionObserver
 * so the static export stays bundle-free.
 *
 * Splits the text on whitespace, wraps each word in
 * <span class="split-reveal-word">, and lets globals.css animate
 * each word in with --word-index multiplied by 70ms stagger.
 * Spaces become inline-block elements of 0.28em so word boxes don't
 * collapse when transformed.
 *
 * Reveals on first viewport enter, then stays. Honors
 * prefers-reduced-motion via the .reveal-style media query.
 */
export function SplitReveal({
  text,
  as = "span",
  className = "",
}: {
  text: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
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
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Splitter rules:
  //   - whitespace → kind: "space" span, no stagger
  //   - CJK character (CJK Unified + Ext-A) → each char becomes its
  //     own staggered "word" so Chinese hero text reveals char-by-char
  //   - Latin / digit runs → accumulate into a single "word"
  //   - Punctuation between Latin runs stays glued to the run
  //
  // Result for "通过 AI 拓展科研方法的边界":
  //   通 / 过 / [space] / AI / [space] / 拓 / 展 / 科 / 研 / 方 / 法 / 的 / 边 / 界
  // Each fade-in 70ms apart → roughly 900ms full reveal for a hero line.
  const CJK_RE = /[一-鿿㐀-䶿豈-﫿]/;
  const segments: Array<{ kind: "word" | "space"; text: string }> = [];
  let buf = "";
  const flush = () => {
    if (buf) {
      segments.push({ kind: "word", text: buf });
      buf = "";
    }
  };
  for (const ch of Array.from(text)) {
    if (/\s/.test(ch)) {
      flush();
      segments.push({ kind: "space", text: ch });
    } else if (CJK_RE.test(ch)) {
      flush();
      segments.push({ kind: "word", text: ch });
    } else {
      buf += ch;
    }
  }
  flush();

  const Tag = as;

  let wordIdx = 0;
  return (
    <Tag
      ref={ref as React.Ref<HTMLHeadingElement & HTMLParagraphElement & HTMLSpanElement>}
      data-revealed={revealed ? "true" : "false"}
      className={`split-reveal ${className}`}
    >
      {segments.map((seg, i) => {
        if (seg.kind === "space") {
          return (
            <span key={i} aria-hidden="true" className="split-reveal-space">
              {" "}
            </span>
          );
        }
        const idx = wordIdx++;
        return (
          <span
            key={i}
            className="split-reveal-word"
            style={{ ["--word-index" as string]: idx }}
          >
            {seg.text}
          </span>
        );
      })}
    </Tag>
  );
}
