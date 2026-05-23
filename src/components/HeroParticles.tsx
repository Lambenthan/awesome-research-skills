"use client";

import { useEffect, useRef } from "react";

/**
 * Soft canvas particle backdrop for the home hero. 40-ish slow-drifting
 * dots, two-tone (ember + ink-muted), low alpha — meant to read as a
 * faint texture behind the H1, not as a featured visual. Toroidal wrap
 * keeps the field steady without spawn/despawn flicker.
 *
 * Honors prefers-reduced-motion: paints a single static frame and stops.
 * Resizes with its container via ResizeObserver.
 */
export function HeroParticles({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      color: string;
    };
    const particles: Particle[] = [];

    function resize() {
      const rect = parent!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width = width + "px";
      canvas!.style.height = height + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn() {
      particles.length = 0;
      const count = Math.max(28, Math.min(60, Math.floor((width * height) / 28000)));
      for (let i = 0; i < count; i++) {
        const useEmber = Math.random() < 0.55;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.18,
          r: 0.6 + Math.random() * 1.2,
          color: useEmber
            ? "rgba(193, 95, 60, 0.20)"
            : "rgba(58, 58, 54, 0.13)",
        });
      }
    }

    function paint() {
      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.fill();
      }
    }

    function step() {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -4) p.x = width + 4;
        else if (p.x > width + 4) p.x = -4;
        if (p.y < -4) p.y = height + 4;
        else if (p.y > height + 4) p.y = -4;
      }
      paint();
      rafId = requestAnimationFrame(step);
    }

    resize();
    spawn();
    paint();

    let rafId = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) rafId = requestAnimationFrame(step);

    const ro = new ResizeObserver(() => {
      resize();
      spawn();
      paint();
    });
    ro.observe(parent);

    return () => {
      cancelAnimationFrame(rafId);
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
