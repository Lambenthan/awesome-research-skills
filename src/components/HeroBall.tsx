"use client";

import { useEffect, useState } from "react";

/**
 * Bouncing-ball intro animation inspired by Anthropic's SectionHero. The ball
 * arcs across the viewport from upper-left, bounces with gravity-style
 * easing, and pucker-lands at the bottom-center.
 *
 * Each transform axis lives on its own nested element so the CSS animations
 * don't fight over `transform`.
 *
 * Plays once per browser session (sessionStorage) and skips entirely when
 * the user opts into reduced motion.
 */
export function HeroBall() {
  const [active, setActive] = useState(false);
  const [puckered, setPuckered] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.sessionStorage.getItem("ball-played") === "1") return;
    window.sessionStorage.setItem("ball-played", "1");
    setActive(true);
    // The x/y move animations are 3s with 350ms delay. Trigger pucker
    // ~50ms before they end so squash overlaps the final landing frame.
    const puckerTimer = window.setTimeout(() => setPuckered(true), 3300);
    // Remove the element from the DOM after the pucker settles so it
    // doesn't sit around blocking layout/paint.
    const doneTimer = window.setTimeout(() => setDone(true), 4200);
    return () => {
      window.clearTimeout(puckerTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (!active || done) return null;
  return (
    <div className="ball-stage" aria-hidden="true">
      <div className="ball-x">
        <div className="ball-y">
          <div className="ball-spin">
            <div className="ball-pucker" data-pucker={puckered ? "true" : "false"}>
              <div className="ball-visual" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
