"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

/**
 * Particle tree rendered with Three.js + UnrealBloomPass.
 *
 * 1,500 GPU points distributed along a spiral cone (radius scales with
 * height, ~50 turns from apex to base). Per-vertex color shifts from a
 * warm cream apex through ember toward a deeper ember base. The whole
 * tree rotates slowly around the Y axis; mouse pointer adds a gentle
 * tilt offset.
 *
 * Render pipeline: WebGLRenderer (alpha, antialias) → ReinhardToneMapping
 * @ exposure 2.2 → EffectComposer → RenderPass → UnrealBloomPass
 * (strength≈0.85, radius≈0.45, threshold≈0.05). Bloom strength breathes
 * gently with a 1Hz sine.
 *
 * Honors prefers-reduced-motion (single static frame).
 */
export function ParticleTree({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const parent = container.parentElement;
    if (!parent) return;

    const PARTICLE_COUNT = 1500;
    const TREE_HEIGHT = 16;
    const TREE_RADIUS = 6;
    const SPIRAL_TURNS = 50;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    camera.position.set(0, 1.5, 28);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.2;
    renderer.setClearColor(0x000000, 0);

    let width = parent.clientWidth;
    let height = parent.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    container.appendChild(renderer.domElement);

    // soft round point sprite — gradient disc, no hard edge
    const sprite = document.createElement("canvas");
    sprite.width = 64;
    sprite.height = 64;
    const sctx = sprite.getContext("2d");
    if (sctx) {
      const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.28, "rgba(255,255,255,0.7)");
      g.addColorStop(0.65, "rgba(255,255,255,0.12)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, 64, 64);
    }
    const pointTexture = new THREE.CanvasTexture(sprite);
    pointTexture.colorSpace = THREE.SRGBColorSpace;

    // Build the tree positions/colors
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    const apex = new THREE.Color(0xffe7c0); // warm cream near the top
    const mid = new THREE.Color(0xe39b6c); // amber middle
    const base = new THREE.Color(0xb24f30); // deeper ember base

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = i / (PARTICLE_COUNT - 1);

      // spiral cone — wider at the bottom, tight at the top
      const radius = TREE_RADIUS * t + (Math.random() - 0.5) * 0.5;
      const angle = t * SPIRAL_TURNS * Math.PI;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = TREE_HEIGHT * (0.5 - t) + (Math.random() - 0.5) * 0.55;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const c = new THREE.Color();
      if (t < 0.5) {
        c.copy(apex).lerp(mid, t * 2);
      } else {
        c.copy(mid).lerp(base, (t - 0.5) * 2);
      }
      // sprinkle a few brighter "ornaments" — random brightness boost
      if (Math.random() < 0.04) {
        c.lerp(new THREE.Color(0xfff4d8), 0.7);
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.24,
      vertexColors: true,
      map: pointTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Top star — single bright point above the apex
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array([0, TREE_HEIGHT * 0.5 + 0.9, 0]),
        3,
      ),
    );
    const starMat = new THREE.PointsMaterial({
      size: 0.9,
      color: 0xfff4d8,
      map: pointTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const topStar = new THREE.Points(starGeo, starMat);
    scene.add(topStar);

    // Composer + bloom
    const composer = new EffectComposer(renderer);
    composer.setSize(width, height);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.85,
      0.45,
      0.05,
    );
    composer.addPass(bloom);

    let raf = 0;
    let lastT = performance.now();
    let mouseX = 0;
    let mouseY = 0;
    let smoothMx = 0;
    let smoothMy = 0;

    function onMove(e: MouseEvent) {
      const rect = parent!.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }
    function onLeave() {
      mouseX = 0;
      mouseY = 0;
    }
    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseleave", onLeave);

    function animate() {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      smoothMx += (mouseX - smoothMx) * 0.05;
      smoothMy += (mouseY - smoothMy) * 0.05;

      points.rotation.y += dt * 0.18;
      topStar.rotation.y = points.rotation.y;

      const tilt = smoothMy * 0.18;
      const yaw = smoothMx * 0.18;
      points.rotation.x = tilt;
      points.rotation.z = -yaw * 0.4;
      topStar.rotation.x = tilt;

      bloom.strength = 0.78 + Math.sin(now * 0.0009) * 0.12;

      composer.render();
      raf = requestAnimationFrame(animate);
    }

    if (reduced) {
      composer.render();
    } else {
      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(() => {
      width = parent!.clientWidth;
      height = parent!.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
      bloom.resolution.set(width, height);
    });
    ro.observe(parent);

    return () => {
      cancelAnimationFrame(raf);
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      starGeo.dispose();
      starMat.dispose();
      pointTexture.dispose();
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
