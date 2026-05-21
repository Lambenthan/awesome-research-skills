"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The /research hero centerpiece. Replaces a Glasswing-style webm with
 * a research-meaningful SVG: a personality trajectory for 苏轼 (1037–
 * 1101), with four annotated intervention points discussed in the
 * Personality Causality program — the sharp peak at 1094 惠州 is
 * intentionally the largest, to visualize the program's finding that
 * the deepest discourse rupture sits there, not at 1080 黄州.
 *
 * Animation:
 *   - stroke-dasharray "draws" the polyline over 2.8s with a smooth
 *     ease-in-out curve
 *   - markers (dot + label) fade in staggered so the eye lands on
 *     each intervention in turn
 *   - everything kicks off the first time the SVG enters the viewport
 *
 * Honors prefers-reduced-motion (snaps to final state, no animation).
 */
export function TrajectoryDiagram({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(true);
      return;
    }
    const el = ref.current;
    if (!el || "IntersectionObserver" in window === false) {
      setActive(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(true);
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 1000 280"
      role="img"
      aria-label="苏轼 (1037–1101) 话语断裂轨迹示意"
      data-active={active ? "true" : "false"}
      className={`trajectory ${className}`}
    >
      {/* time axis baseline */}
      <line
        x1="0"
        y1="232"
        x2="1000"
        y2="232"
        stroke="rgba(245, 244, 237, 0.16)"
        strokeWidth="1"
        strokeDasharray="3 5"
      />

      {/* year endpoints */}
      <text
        x="0"
        y="258"
        fill="rgba(245, 244, 237, 0.5)"
        fontSize="11"
        fontFamily="var(--font-serif)"
        fontStyle="italic"
      >
        1037
      </text>
      <text
        x="1000"
        y="258"
        textAnchor="end"
        fill="rgba(245, 244, 237, 0.5)"
        fontSize="11"
        fontFamily="var(--font-serif)"
        fontStyle="italic"
      >
        1101
      </text>

      {/* trajectory — polyline with intentional sharp peaks at
          intervention years (1079 / 1094 / 1097). 1094 惠州 is the
          tallest peak, matching the program's headline finding. */}
      <path
        className="trajectory-path"
        d="M 0,205 L 250,200 L 500,195 L 640,188 L 660,95 L 690,110 L 720,170 L 765,155 L 830,150 L 875,140 L 890,42 L 920,58 L 945,78 L 1000,85"
        stroke="rgba(245, 244, 237, 0.88)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* intervention markers */}
      <Marker x={660} y={95} label="1079 乌台诗案" delay={1600} />
      <Marker x={765} y={155} label="1086 元祐起复" delay={2100} />
      <Marker
        x={890}
        y={42}
        label="1094 惠州"
        delay={2600}
        emphasis
      />
      <Marker x={945} y={78} label="1097 儋州" delay={3000} />
    </svg>
  );
}

function Marker({
  x,
  y,
  label,
  delay,
  emphasis = false,
}: {
  x: number;
  y: number;
  label: string;
  delay: number;
  emphasis?: boolean;
}) {
  // Ember color for the headline 1094 惠州 finding; muted cream for
  // the other three intervention points so the eye knows where the
  // program's claim is.
  const dotColor = emphasis ? "#c15f3c" : "rgba(245, 244, 237, 0.78)";
  const ringColor = emphasis
    ? "rgba(193, 95, 60, 0.28)"
    : "rgba(245, 244, 237, 0.18)";
  // Place labels above peaks, below troughs. y < 130 → label above.
  const labelAbove = y < 130;
  const labelY = labelAbove ? y - 14 : y + 22;
  return (
    <g
      className="trajectory-marker"
      style={{ ["--marker-delay" as string]: `${delay}ms` }}
    >
      <circle cx={x} cy={y} r="10" fill={ringColor} />
      <circle cx={x} cy={y} r="3.5" fill={dotColor} />
      <text
        x={x}
        y={labelY}
        textAnchor="middle"
        fontSize="11.5"
        fontFamily="var(--font-serif)"
        fill={emphasis ? "#c15f3c" : "rgba(245, 244, 237, 0.78)"}
      >
        {label}
      </text>
    </g>
  );
}
