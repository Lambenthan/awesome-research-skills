"use client";

import { useEffect, useRef } from "react";

/**
 * A small "solar-system-from-overhead" particle scene that visualizes
 * stellar parallax. Composition:
 *
 *   - 150 far-background stars (very small, faint, almost don't move)
 *   - 36 mid-distance stars (small, somewhat brighter)
 *   - 8 nearby foreground stars (large, ember+cream mix, big parallax)
 *   - One ember sun at the geometric anchor with a soft halo + a
 *     bright cream pinprick at its core
 *   - Three faint dashed elliptical orbits, each carrying one planet
 *     particle that revolves at its own pace
 *
 * The three star layers respond to pointer position at different
 * scales (≈ 5 / 14 / 32 px max). Move the cursor and the close stars
 * shift visibly while the distant ones barely budge — this is what
 * stellar parallax actually looks like through a telescope.
 *
 * Honors prefers-reduced-motion (paints a single static frame).
 * ResizeObserver re-spawns the field when the container changes size.
 */
export function ParallaxParticles({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    type Star = {
      x: number;
      y: number;
      r: number;
      alpha: number;
      hue: "cream" | "ember";
      twinkle: number;
    };
    type Planet = {
      orbitA: number;
      orbitB: number;
      angle: number;
      speed: number;
      r: number;
      hue: "cream" | "ember";
      alpha: number;
    };

    const far: Star[] = [];
    const mid: Star[] = [];
    const near: Star[] = [];
    const planets: Planet[] = [];

    let mouseX = 0.5;
    let mouseY = 0.5;
    let smoothX = 0.5;
    let smoothY = 0.5;
    let t = 0;
    let raf = 0;

    function resize() {
      const rect = parent!.getBoundingClientRect();
      width = rect.width;
      height = Math.max(rect.height, 280);
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width = width + "px";
      canvas!.style.height = height + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function rand(min: number, max: number) {
      return min + Math.random() * (max - min);
    }

    function spawn() {
      far.length = 0;
      mid.length = 0;
      near.length = 0;
      planets.length = 0;

      // far layer: dense, tiny, faint star field
      for (let i = 0; i < 160; i++) {
        far.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: rand(0.3, 1.0),
          alpha: rand(0.25, 0.55),
          hue: Math.random() < 0.9 ? "cream" : "ember",
          twinkle: Math.random() * Math.PI * 2,
        });
      }

      // mid layer: stars at intermediate "distance"
      for (let i = 0; i < 38; i++) {
        mid.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: rand(0.9, 1.6),
          alpha: rand(0.45, 0.75),
          hue: Math.random() < 0.78 ? "cream" : "ember",
          twinkle: Math.random() * Math.PI * 2,
        });
      }

      // near layer: a few prominent nearby stars (high parallax)
      for (let i = 0; i < 9; i++) {
        near.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: rand(1.8, 3.0),
          alpha: rand(0.85, 1.0),
          hue: i < 4 ? "ember" : "cream",
          twinkle: Math.random() * Math.PI * 2,
        });
      }

      // three elliptical orbits with one planet each, anchored at center
      const baseR = Math.min(width, height);
      planets.push({
        orbitA: baseR * 0.22,
        orbitB: baseR * 0.13,
        angle: rand(0, Math.PI * 2),
        speed: 0.0058,
        r: 1.7,
        hue: "ember",
        alpha: 0.92,
      });
      planets.push({
        orbitA: baseR * 0.34,
        orbitB: baseR * 0.21,
        angle: rand(0, Math.PI * 2),
        speed: 0.0034,
        r: 2.1,
        hue: "cream",
        alpha: 0.88,
      });
      planets.push({
        orbitA: baseR * 0.46,
        orbitB: baseR * 0.30,
        angle: rand(0, Math.PI * 2),
        speed: 0.0021,
        r: 1.5,
        hue: "ember",
        alpha: 0.75,
      });
    }

    function colorFor(hue: "cream" | "ember", alpha: number) {
      return hue === "ember"
        ? `rgba(193, 95, 60, ${alpha})`
        : `rgba(245, 244, 237, ${alpha})`;
    }

    function drawStarLayer(
      arr: Star[],
      offsetX: number,
      offsetY: number,
      twinkleAmp: number,
    ) {
      for (const s of arr) {
        const a = Math.max(
          0,
          s.alpha + Math.sin(t * 0.018 + s.twinkle) * twinkleAmp,
        );
        ctx!.beginPath();
        ctx!.arc(s.x + offsetX, s.y + offsetY, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = colorFor(s.hue, a);
        ctx!.fill();
      }
    }

    function paint() {
      ctx!.clearRect(0, 0, width, height);

      const px = smoothX - 0.5;
      const py = smoothY - 0.5;

      // far ── tiny parallax shift, looks fixed
      drawStarLayer(far, px * 5, py * 4, 0.06);

      // orbital scene + mid stars anchored to the canvas center with
      // a mid-strength parallax offset
      const midOX = px * 14;
      const midOY = py * 10;
      drawStarLayer(mid, midOX, midOY, 0.1);

      const cx = width * 0.5 + midOX;
      const cy = height * 0.5 + midOY;

      // orbit ellipses (faint dashed)
      ctx!.strokeStyle = "rgba(245, 244, 237, 0.10)";
      ctx!.lineWidth = 0.75;
      ctx!.setLineDash([2, 5]);
      for (const p of planets) {
        ctx!.beginPath();
        ctx!.ellipse(cx, cy, p.orbitA, p.orbitB, 0, 0, Math.PI * 2);
        ctx!.stroke();
      }
      ctx!.setLineDash([]);

      // sun: soft ember halo + bright cream core
      const sunPulse = 1 + Math.sin(t * 0.02) * 0.07;
      const sunR = 26 * sunPulse;
      const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, sunR);
      grad.addColorStop(0, "rgba(193, 95, 60, 0.95)");
      grad.addColorStop(0.35, "rgba(193, 95, 60, 0.55)");
      grad.addColorStop(0.7, "rgba(193, 95, 60, 0.16)");
      grad.addColorStop(1, "rgba(193, 95, 60, 0)");
      ctx!.fillStyle = grad;
      ctx!.beginPath();
      ctx!.arc(cx, cy, sunR, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.beginPath();
      ctx!.arc(cx, cy, 3.2, 0, Math.PI * 2);
      ctx!.fillStyle = "rgba(245, 244, 237, 0.97)";
      ctx!.fill();

      // planets on their orbits
      for (const p of planets) {
        const x = cx + Math.cos(p.angle) * p.orbitA;
        const y = cy + Math.sin(p.angle) * p.orbitB;
        ctx!.beginPath();
        ctx!.arc(x, y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = colorFor(p.hue, p.alpha);
        ctx!.fill();
      }

      // near foreground stars: largest parallax
      drawStarLayer(near, px * 32, py * 22, 0.14);
    }

    function step() {
      t += 1;
      smoothX += (mouseX - smoothX) * 0.05;
      smoothY += (mouseY - smoothY) * 0.05;
      for (const p of planets) {
        p.angle += p.speed;
      }
      paint();
      raf = requestAnimationFrame(step);
    }

    resize();
    spawn();
    paint();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) raf = requestAnimationFrame(step);

    function onMove(e: MouseEvent) {
      const rect = parent!.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
    }
    function onLeave() {
      mouseX = 0.5;
      mouseY = 0.5;
    }

    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseleave", onLeave);

    const ro = new ResizeObserver(() => {
      resize();
      spawn();
      paint();
    });
    ro.observe(parent);

    return () => {
      cancelAnimationFrame(raf);
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
