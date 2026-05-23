"use client";

import { useEffect, useRef } from "react";

/**
 * Two layers of particles tracing the same sinusoidal envelope but
 * separated by a vertical offset and a small phase lag — the offset
 * visualizes parallax displacement between two observation viewpoints
 * looking at the same underlying object. Thin lines connect each
 * paired dot, making the displacement legible at a glance.
 *
 * Mouse-over on the hero increases the displacement gradually (the
 * "viewpoint" widens). prefers-reduced-motion paints a static frame.
 *
 * Designed to sit inside the /research dark hero figure slot where
 * the trajectory SVG used to live. Canvas fills its parent.
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

    const COUNT = 64;
    const phases: number[] = [];
    let t = 0;
    let targetParallax = 1; // multiplier for displacement
    let parallax = 1;

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

    function spawn() {
      phases.length = 0;
      for (let i = 0; i < COUNT; i++) {
        phases.push((i / COUNT) * Math.PI * 4);
      }
    }

    function paint() {
      ctx!.clearRect(0, 0, width, height);
      const midY = height / 2;
      const amplitudeA = Math.min(height * 0.22, 70);
      const amplitudeB = amplitudeA * 0.85;
      const offset = 22 * parallax;

      const aPos: { x: number; y: number }[] = [];
      const bPos: { x: number; y: number }[] = [];
      const drift = (t * 0.32) % (width + 80);

      for (let i = 0; i < COUNT; i++) {
        const baseX = (i / (COUNT - 1)) * (width + 80) - 40;
        const x = (baseX + drift) % (width + 80) - 40;
        const yA =
          midY + Math.sin(phases[i] + t * 0.0085) * amplitudeA;
        const yB =
          midY + Math.sin(phases[i] + t * 0.0085 - 0.55) * amplitudeB + offset;
        aPos.push({ x, y: yA });
        bPos.push({ x, y: yB });
      }

      // axis baseline (very faint)
      ctx!.strokeStyle = "rgba(245, 244, 237, 0.06)";
      ctx!.lineWidth = 1;
      ctx!.setLineDash([2, 6]);
      ctx!.beginPath();
      ctx!.moveTo(0, midY + 10);
      ctx!.lineTo(width, midY + 10);
      ctx!.stroke();
      ctx!.setLineDash([]);

      // parallax connector lines
      ctx!.lineWidth = 0.6;
      for (let i = 0; i < COUNT; i++) {
        const dx = aPos[i].x - bPos[i].x;
        const dy = aPos[i].y - bPos[i].y;
        const len = Math.hypot(dx, dy);
        const alpha = Math.min(0.22, 0.08 + len / 600);
        ctx!.strokeStyle = `rgba(245, 244, 237, ${alpha})`;
        ctx!.beginPath();
        ctx!.moveTo(aPos[i].x, aPos[i].y);
        ctx!.lineTo(bPos[i].x, bPos[i].y);
        ctx!.stroke();
      }

      // background layer (cream, small, faint)
      for (const p of bPos) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.1, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(245, 244, 237, 0.5)";
        ctx!.fill();
      }

      // foreground layer (ember, larger, more solid)
      for (const p of aPos) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 2.0, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(193, 95, 60, 0.92)";
        ctx!.fill();
      }
    }

    function step() {
      t += 1;
      parallax += (targetParallax - parallax) * 0.04;
      paint();
      raf = requestAnimationFrame(step);
    }

    let raf = 0;
    resize();
    spawn();
    paint();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) raf = requestAnimationFrame(step);

    function onMove(e: MouseEvent) {
      const rect = parent!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      // x ∈ [0,1] → parallax multiplier ∈ [0.6, 2.0]
      const clamped = Math.max(0, Math.min(1, x));
      targetParallax = 0.6 + clamped * 1.4;
    }
    function onLeave() {
      targetParallax = 1;
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
