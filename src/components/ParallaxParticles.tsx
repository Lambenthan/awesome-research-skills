"use client";

import { useEffect, useRef } from "react";

/**
 * Solar-system parallax scene rendered as a layered deep-field
 * composition. Back-to-front:
 *
 *   - Soft ember nebula cloud (very large radial gradient)
 *   - ~200 far stars (tiny, faint, ~5px parallax)
 *   - 3 elliptical orbits at a shared ~7° tilt
 *   - ~44 mid stars (~14px parallax)
 *   - Sun: ember corona + hot inner bloom + soft diffraction cross
 *   - 3 planets, each with a fading orbital trail + sun-lit terminator
 *   - ~10 near stars (~32px parallax); brightest three have flare crosses
 *   - Occasional comet streak
 *   - Edge vignette
 *
 * Mouse parallax: far layer barely moves, near layer shifts the most —
 * mirroring how real stellar parallax behaves through a telescope.
 * Honors prefers-reduced-motion by painting one static frame.
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

    type Hue = "cream" | "ember" | "heather";
    type Star = {
      x: number;
      y: number;
      r: number;
      alpha: number;
      hue: Hue;
      twinkle: number;
      flare: boolean;
    };
    type Planet = {
      orbitA: number;
      orbitB: number;
      angle: number;
      speed: number;
      r: number;
      hue: Hue;
      alpha: number;
    };
    type Comet = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      max: number;
    };

    const far: Star[] = [];
    const mid: Star[] = [];
    const near: Star[] = [];
    const planets: Planet[] = [];
    let comet: Comet | null = null;
    let nextCometAt = 600;

    let mouseX = 0.5;
    let mouseY = 0.5;
    let smoothX = 0.5;
    let smoothY = 0.5;
    let t = 0;
    let raf = 0;

    // Shared tilt for the whole orbital plane — gives the scene a
    // "looking down from slightly above" feel instead of textbook flat.
    const ORBIT_TILT = -0.12;

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

    function pickHue(emberP: number, heatherP: number): Hue {
      const r = Math.random();
      if (r < heatherP) return "heather";
      if (r < heatherP + emberP) return "ember";
      return "cream";
    }

    function spawn() {
      far.length = 0;
      mid.length = 0;
      near.length = 0;
      planets.length = 0;

      for (let i = 0; i < 210; i++) {
        far.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: rand(0.25, 0.95),
          alpha: rand(0.22, 0.55),
          hue: pickHue(0.1, 0.07),
          twinkle: Math.random() * Math.PI * 2,
          flare: false,
        });
      }

      for (let i = 0; i < 46; i++) {
        mid.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: rand(0.85, 1.55),
          alpha: rand(0.45, 0.78),
          hue: pickHue(0.22, 0.1),
          twinkle: Math.random() * Math.PI * 2,
          flare: false,
        });
      }

      for (let i = 0; i < 10; i++) {
        const flare = i < 3;
        const hue: Hue = i < 3 ? "ember" : i < 8 ? "cream" : "heather";
        near.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: rand(1.6, flare ? 3.2 : 2.5),
          alpha: rand(0.88, 1.0),
          hue,
          twinkle: Math.random() * Math.PI * 2,
          flare,
        });
      }

      const baseR = Math.min(width, height);
      planets.push({
        orbitA: baseR * 0.22,
        orbitB: baseR * 0.13,
        angle: rand(0, Math.PI * 2),
        speed: 0.0058,
        r: 1.8,
        hue: "ember",
        alpha: 0.95,
      });
      planets.push({
        orbitA: baseR * 0.34,
        orbitB: baseR * 0.21,
        angle: rand(0, Math.PI * 2),
        speed: 0.0034,
        r: 2.3,
        hue: "cream",
        alpha: 0.92,
      });
      planets.push({
        orbitA: baseR * 0.46,
        orbitB: baseR * 0.30,
        angle: rand(0, Math.PI * 2),
        speed: 0.0021,
        r: 1.55,
        hue: "ember",
        alpha: 0.82,
      });
    }

    function colorFor(hue: Hue, alpha: number) {
      switch (hue) {
        case "ember":
          return `rgba(193, 95, 60, ${alpha})`;
        case "heather":
          return `rgba(180, 175, 205, ${alpha})`;
        default:
          return `rgba(245, 244, 237, ${alpha})`;
      }
    }

    function orbitPos(
      cx: number,
      cy: number,
      a: number,
      b: number,
      angle: number,
    ) {
      const c = Math.cos(ORBIT_TILT);
      const s = Math.sin(ORBIT_TILT);
      const ux = Math.cos(angle) * a;
      const uy = Math.sin(angle) * b;
      return { x: cx + ux * c - uy * s, y: cy + ux * s + uy * c };
    }

    function drawNebula(cx: number, cy: number) {
      const ncx = cx + width * 0.05;
      const ncy = cy - height * 0.08;
      const nR = Math.max(width, height) * 0.9;
      const g = ctx!.createRadialGradient(ncx, ncy, 0, ncx, ncy, nR);
      g.addColorStop(0, "rgba(193, 95, 60, 0.11)");
      g.addColorStop(0.22, "rgba(193, 95, 60, 0.05)");
      g.addColorStop(0.55, "rgba(180, 175, 205, 0.015)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, width, height);
    }

    function drawStarLayer(
      arr: Star[],
      offsetX: number,
      offsetY: number,
      twinkleAmp: number,
      withHalo: boolean,
    ) {
      for (const s of arr) {
        const a = Math.max(
          0,
          s.alpha + Math.sin(t * 0.018 + s.twinkle) * twinkleAmp,
        );
        const sx = s.x + offsetX;
        const sy = s.y + offsetY;

        if (withHalo && s.r > 1.6) {
          const haloR = s.r * 4.2;
          const hg = ctx!.createRadialGradient(sx, sy, 0, sx, sy, haloR);
          hg.addColorStop(0, colorFor(s.hue, a * 0.55));
          hg.addColorStop(1, colorFor(s.hue, 0));
          ctx!.fillStyle = hg;
          ctx!.beginPath();
          ctx!.arc(sx, sy, haloR, 0, Math.PI * 2);
          ctx!.fill();
        }

        ctx!.beginPath();
        ctx!.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = colorFor(s.hue, a);
        ctx!.fill();

        if (s.flare) {
          const flareLen = s.r * 9;
          ctx!.lineWidth = 0.6;
          const fg = ctx!.createLinearGradient(
            sx - flareLen,
            sy,
            sx + flareLen,
            sy,
          );
          fg.addColorStop(0, colorFor(s.hue, 0));
          fg.addColorStop(0.5, colorFor(s.hue, a * 0.55));
          fg.addColorStop(1, colorFor(s.hue, 0));
          ctx!.strokeStyle = fg;
          ctx!.beginPath();
          ctx!.moveTo(sx - flareLen, sy);
          ctx!.lineTo(sx + flareLen, sy);
          ctx!.stroke();
          const fg2 = ctx!.createLinearGradient(
            sx,
            sy - flareLen,
            sx,
            sy + flareLen,
          );
          fg2.addColorStop(0, colorFor(s.hue, 0));
          fg2.addColorStop(0.5, colorFor(s.hue, a * 0.55));
          fg2.addColorStop(1, colorFor(s.hue, 0));
          ctx!.strokeStyle = fg2;
          ctx!.beginPath();
          ctx!.moveTo(sx, sy - flareLen);
          ctx!.lineTo(sx, sy + flareLen);
          ctx!.stroke();
        }
      }
    }

    function drawOrbit(
      cx: number,
      cy: number,
      a: number,
      b: number,
    ) {
      ctx!.beginPath();
      ctx!.ellipse(cx, cy, a, b, ORBIT_TILT, 0, Math.PI * 2);
      ctx!.strokeStyle = "rgba(245, 244, 237, 0.13)";
      ctx!.lineWidth = 0.7;
      ctx!.stroke();
    }

    function drawPlanet(cx: number, cy: number, p: Planet) {
      const trailCount = 26;
      for (let i = trailCount; i > 0; i--) {
        const back = p.angle - i * p.speed * 5.5;
        const pt = orbitPos(cx, cy, p.orbitA, p.orbitB, back);
        const fade = 1 - i / trailCount;
        const easing = fade * fade;
        ctx!.beginPath();
        ctx!.arc(pt.x, pt.y, p.r * (0.35 + 0.6 * easing), 0, Math.PI * 2);
        ctx!.fillStyle = colorFor(p.hue, p.alpha * 0.16 * easing);
        ctx!.fill();
      }

      const pos = orbitPos(cx, cy, p.orbitA, p.orbitB, p.angle);

      // halo
      const haloR = p.r * 5;
      const hg = ctx!.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, haloR);
      hg.addColorStop(0, colorFor(p.hue, p.alpha * 0.5));
      hg.addColorStop(1, colorFor(p.hue, 0));
      ctx!.fillStyle = hg;
      ctx!.beginPath();
      ctx!.arc(pos.x, pos.y, haloR, 0, Math.PI * 2);
      ctx!.fill();

      // body with sun-lit terminator
      const dx = cx - pos.x;
      const dy = cy - pos.y;
      const dMag = Math.hypot(dx, dy) || 1;
      const ox = (dx / dMag) * p.r * 0.45;
      const oy = (dy / dMag) * p.r * 0.45;
      const bg = ctx!.createRadialGradient(
        pos.x + ox,
        pos.y + oy,
        0,
        pos.x,
        pos.y,
        p.r,
      );
      bg.addColorStop(0, colorFor(p.hue, p.alpha));
      bg.addColorStop(1, colorFor(p.hue, p.alpha * 0.4));
      ctx!.fillStyle = bg;
      ctx!.beginPath();
      ctx!.arc(pos.x, pos.y, p.r, 0, Math.PI * 2);
      ctx!.fill();
    }

    function drawSun(cx: number, cy: number) {
      const pulse = 1 + Math.sin(t * 0.018) * 0.05;

      // Outer corona — large, very faint ember
      const outerR = 95 * pulse;
      const og = ctx!.createRadialGradient(cx, cy, 0, cx, cy, outerR);
      og.addColorStop(0, "rgba(193, 95, 60, 0.5)");
      og.addColorStop(0.16, "rgba(193, 95, 60, 0.22)");
      og.addColorStop(0.5, "rgba(193, 95, 60, 0.06)");
      og.addColorStop(1, "rgba(193, 95, 60, 0)");
      ctx!.fillStyle = og;
      ctx!.beginPath();
      ctx!.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx!.fill();

      // Hot bloom — warm amber transitioning to cream
      const midR = 24 * pulse;
      const mg = ctx!.createRadialGradient(cx, cy, 0, cx, cy, midR);
      mg.addColorStop(0, "rgba(255, 225, 180, 0.95)");
      mg.addColorStop(0.45, "rgba(220, 140, 90, 0.65)");
      mg.addColorStop(1, "rgba(193, 95, 60, 0)");
      ctx!.fillStyle = mg;
      ctx!.beginPath();
      ctx!.arc(cx, cy, midR, 0, Math.PI * 2);
      ctx!.fill();

      // Diffraction spike — soft cream bars fading at the ends
      const spikeLen = 78 * pulse;
      const sgH = ctx!.createLinearGradient(
        cx - spikeLen,
        cy,
        cx + spikeLen,
        cy,
      );
      sgH.addColorStop(0, "rgba(245, 244, 237, 0)");
      sgH.addColorStop(0.5, "rgba(245, 244, 237, 0.38)");
      sgH.addColorStop(1, "rgba(245, 244, 237, 0)");
      ctx!.fillStyle = sgH;
      ctx!.fillRect(cx - spikeLen, cy - 0.7, spikeLen * 2, 1.4);
      const sgV = ctx!.createLinearGradient(
        cx,
        cy - spikeLen,
        cx,
        cy + spikeLen,
      );
      sgV.addColorStop(0, "rgba(245, 244, 237, 0)");
      sgV.addColorStop(0.5, "rgba(245, 244, 237, 0.38)");
      sgV.addColorStop(1, "rgba(245, 244, 237, 0)");
      ctx!.fillStyle = sgV;
      ctx!.fillRect(cx - 0.7, cy - spikeLen, 1.4, spikeLen * 2);

      // Bright cream core
      ctx!.beginPath();
      ctx!.arc(cx, cy, 3.6, 0, Math.PI * 2);
      ctx!.fillStyle = "rgba(255, 250, 240, 1)";
      ctx!.fill();
    }

    function drawComet() {
      if (!comet) return;
      const life = comet.life / comet.max;
      const a = Math.sin(life * Math.PI);
      const len = 44;
      const mag = Math.hypot(comet.vx, comet.vy) || 1;
      const ux = comet.vx / mag;
      const uy = comet.vy / mag;
      const tg = ctx!.createLinearGradient(
        comet.x,
        comet.y,
        comet.x - ux * len,
        comet.y - uy * len,
      );
      tg.addColorStop(0, `rgba(245, 244, 237, ${0.85 * a})`);
      tg.addColorStop(1, "rgba(245, 244, 237, 0)");
      ctx!.strokeStyle = tg;
      ctx!.lineWidth = 1.3;
      ctx!.lineCap = "round";
      ctx!.beginPath();
      ctx!.moveTo(comet.x, comet.y);
      ctx!.lineTo(comet.x - ux * len, comet.y - uy * len);
      ctx!.stroke();
      ctx!.beginPath();
      ctx!.arc(comet.x, comet.y, 1.5, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(255, 250, 240, ${a})`;
      ctx!.fill();
    }

    function drawVignette() {
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.max(width, height) * 0.78;
      const g = ctx!.createRadialGradient(cx, cy, r * 0.55, cx, cy, r);
      g.addColorStop(0, "rgba(0, 0, 0, 0)");
      g.addColorStop(1, "rgba(0, 0, 0, 0.55)");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, width, height);
    }

    function paint() {
      ctx!.clearRect(0, 0, width, height);

      const px = smoothX - 0.5;
      const py = smoothY - 0.5;
      const midOX = px * 14;
      const midOY = py * 10;
      const cx = width * 0.5 + midOX;
      const cy = height * 0.5 + midOY;

      drawNebula(cx, cy);
      drawStarLayer(far, px * 5, py * 4, 0.06, false);

      for (const p of planets) {
        drawOrbit(cx, cy, p.orbitA, p.orbitB);
      }

      drawStarLayer(mid, midOX, midOY, 0.1, true);

      drawSun(cx, cy);

      for (const p of planets) {
        drawPlanet(cx, cy, p);
      }

      drawStarLayer(near, px * 32, py * 22, 0.14, true);

      drawComet();
      drawVignette();
    }

    function step() {
      t += 1;
      smoothX += (mouseX - smoothX) * 0.05;
      smoothY += (mouseY - smoothY) * 0.05;
      for (const p of planets) {
        p.angle += p.speed;
      }

      if (comet) {
        comet.x += comet.vx;
        comet.y += comet.vy;
        comet.life += 1;
        if (comet.life >= comet.max) comet = null;
      } else if (t >= nextCometAt) {
        const side = Math.floor(Math.random() * 4);
        const speed = rand(1.6, 2.5);
        let sx = 0;
        let sy = 0;
        let vx = 0;
        let vy = 0;
        if (side === 0) {
          sx = rand(0, width);
          sy = -12;
          vx = rand(-0.7, 0.7) * speed;
          vy = speed;
        } else if (side === 1) {
          sx = width + 12;
          sy = rand(0, height);
          vx = -speed;
          vy = rand(-0.5, 0.5) * speed;
        } else if (side === 2) {
          sx = rand(0, width);
          sy = height + 12;
          vx = rand(-0.7, 0.7) * speed;
          vy = -speed;
        } else {
          sx = -12;
          sy = rand(0, height);
          vx = speed;
          vy = rand(-0.5, 0.5) * speed;
        }
        comet = { x: sx, y: sy, vx, vy, life: 0, max: 95 };
        nextCometAt = t + Math.floor(rand(900, 1500));
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
