"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

/**
 * Minimal binary PLY vertex parser. Reads the header, extracts vertex
 * count and the byte stride per vertex (3 floats = 12 bytes by spec),
 * then returns a Float32Array of N×3 positions. Face data is skipped
 * entirely — we only need points. Avoids three.js's PLYLoader which
 * mis-reads the trailing face list on this asset.
 */
async function loadPlyVertices(url: string): Promise<Float32Array> {
  const buf = await fetch(url).then((r) => r.arrayBuffer());
  const dv = new DataView(buf);
  // Locate end of header
  const headerStr = new TextDecoder("ascii").decode(
    new Uint8Array(buf, 0, Math.min(buf.byteLength, 2048)),
  );
  const endMatch = headerStr.match(/end_header\r?\n/);
  if (!endMatch) throw new Error("PLY: end_header not found");
  const headerLen = endMatch.index! + endMatch[0].length;

  const vertMatch = headerStr.match(/element\s+vertex\s+(\d+)/);
  if (!vertMatch) throw new Error("PLY: vertex count not found");
  const vertexCount = parseInt(vertMatch[1], 10);

  const positions = new Float32Array(vertexCount * 3);
  let offset = headerLen;
  for (let i = 0; i < vertexCount; i++) {
    positions[i * 3] = dv.getFloat32(offset, true);
    positions[i * 3 + 1] = dv.getFloat32(offset + 4, true);
    positions[i * 3 + 2] = dv.getFloat32(offset + 8, true);
    offset += 12;
  }
  return positions;
}

/**
 * Photogrammetry-style point-cloud scene rendered with Three.js.
 *
 * Loads a Stanford 3D scan (Lucy, ~100k vertices) as a luminous point
 * cloud at the scene origin, with a sparse procedural starfield as
 * ambient backdrop. Rendered through ReinhardToneMapping (exposure 2.2)
 * + EffectComposer + UnrealBloomPass so dense surfaces glow.
 *
 * Animation timeline (~36s loop):
 *   0 – 2.5s   intro burst:    every point linearly interpolates from
 *               a random sphere outside the camera frustum to its
 *               scanned position
 *   2.5 – 30s  fly-through:    camera follows a Catmull-Rom path that
 *               orbits and dives around the model
 *   30 – 36s   outro gather:   points lerp toward a central cluster
 *               and dim out, then the timeline loops
 *
 * Honors prefers-reduced-motion (single static frame, no animation).
 */
export function ParticleScene({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const parent = container.parentElement;
    if (!parent) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const basePath =
      typeof process !== "undefined" && process.env.NEXT_PUBLIC_BASE_PATH
        ? process.env.NEXT_PUBLIC_BASE_PATH
        : "";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000);
    camera.position.set(0, 80, 280);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Transparent canvas: the surrounding bg-ink shows through directly,
    // so there is no canvas bg color to mismatch. Reinhard tonemap is
    // kept for Lucy's HDR rolloff. The alphaFix pass below derives alpha
    // from rendered luminance so the canvas is opaque where particles or
    // nebula appear and transparent everywhere else.
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.2;
    renderer.setClearColor(0x000000, 0);

    let width = parent.clientWidth;
    let height = parent.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    container.appendChild(renderer.domElement);

    // soft round point sprite
    const sprite = document.createElement("canvas");
    sprite.width = 64;
    sprite.height = 64;
    const sctx = sprite.getContext("2d");
    if (sctx) {
      const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.28, "rgba(255,255,255,0.7)");
      g.addColorStop(0.65, "rgba(255,255,255,0.15)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, 64, 64);
    }
    const pointTexture = new THREE.CanvasTexture(sprite);
    pointTexture.colorSpace = THREE.SRGBColorSpace;

    // Cloud particles — populated once Lucy loads
    let cloud: THREE.Points | null = null;
    let basePositions: Float32Array | null = null;
    let burstOrigins: Float32Array | null = null;
    let livePositions: Float32Array | null = null;
    let particleCount = 0;

    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);

    let disposed = false;
    loadPlyVertices(`${basePath}/pointcloud/lucy.ply`)
      .then((raw) => {
        if (disposed) return;
        // Center + scale to fit a ~120-unit height
        let minX = Infinity,
          minY = Infinity,
          minZ = Infinity;
        let maxX = -Infinity,
          maxY = -Infinity,
          maxZ = -Infinity;
        for (let i = 0; i < raw.length; i += 3) {
          if (raw[i] < minX) minX = raw[i];
          if (raw[i + 1] < minY) minY = raw[i + 1];
          if (raw[i + 2] < minZ) minZ = raw[i + 2];
          if (raw[i] > maxX) maxX = raw[i];
          if (raw[i + 1] > maxY) maxY = raw[i + 1];
          if (raw[i + 2] > maxZ) maxZ = raw[i + 2];
        }
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const cz = (minZ + maxZ) / 2;
        const span = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
        const scale = 140 / span;

        particleCount = raw.length / 3;
        basePositions = new Float32Array(particleCount * 3);
        burstOrigins = new Float32Array(particleCount * 3);
        livePositions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
          const x = (raw[i * 3] - cx) * scale;
          const y = (raw[i * 3 + 1] - cy) * scale;
          const z = (raw[i * 3 + 2] - cz) * scale;
          basePositions[i * 3] = x;
          basePositions[i * 3 + 1] = y;
          basePositions[i * 3 + 2] = z;
          // intro burst origin: random direction on a sphere far outside
          const r = 250 + Math.random() * 200;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          burstOrigins[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          burstOrigins[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          burstOrigins[i * 3 + 2] = r * Math.cos(phi);
          // Seed live at base so the initial paint (before rAF ticks)
          // already shows Lucy in shape — for bg-tab preloads and the
          // first composer.render() right after the asset loads.
          livePositions[i * 3] = basePositions[i * 3];
          livePositions[i * 3 + 1] = basePositions[i * 3 + 1];
          livePositions[i * 3 + 2] = basePositions[i * 3 + 2];
        }

        const cloudGeo = new THREE.BufferGeometry();
        cloudGeo.setAttribute(
          "position",
          new THREE.BufferAttribute(livePositions, 3),
        );

        // per-point color: cream center, warmer near extremities,
        // a sprinkle of ember for "ornament" highlights
        const colors = new Float32Array(particleCount * 3);
        const c = new THREE.Color();
        const cream = new THREE.Color(0xfff4e0);
        const ember = new THREE.Color(0xc15f3c);
        for (let i = 0; i < particleCount; i++) {
          const y = basePositions[i * 3 + 1] / 60; // -1..1 normalized
          const t = (y + 1) * 0.5; // 0 (bottom) .. 1 (top)
          c.copy(ember).lerp(cream, 0.45 + t * 0.5);
          if (Math.random() < 0.04) c.lerp(new THREE.Color(0xfff4d8), 0.7);
          colors[i * 3] = c.r;
          colors[i * 3 + 1] = c.g;
          colors[i * 3 + 2] = c.b;
        }
        cloudGeo.setAttribute(
          "color",
          new THREE.BufferAttribute(colors, 3),
        );

        const cloudMat = new THREE.PointsMaterial({
          size: 0.65,
          vertexColors: true,
          map: pointTexture,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          sizeAttenuation: true,
        });
        cloud = new THREE.Points(cloudGeo, cloudMat);
        cloudGroup.add(cloud);

        // Always paint a first frame as soon as the asset is ready.
        composer.render();
      })
      .catch((err) => {
        console.warn("[ParticleScene] PLY load failed:", err);
      });

    // Camera spline — orbits and dives around the figure.
    // Stays ~200-260u from origin so Lucy fills the lower-center frame;
    // Y rises and falls to add cinematic depth.
    const camCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, 50, 240),
        new THREE.Vector3(200, 30, 160),
        new THREE.Vector3(240, -10, -40),
        new THREE.Vector3(110, -40, -200),
        new THREE.Vector3(-110, 0, -200),
        new THREE.Vector3(-240, 40, -20),
        new THREE.Vector3(-170, 90, 160),
        new THREE.Vector3(0, 50, 240),
      ],
      true,
      "catmullrom",
      0.5,
    );

    // Composer pipeline:
    //   RenderPass → bloom → alphaFix → OutputPass
    // The alphaFix sets canvas alpha from rendered luminance so dark
    // areas become transparent (letting the surrounding bg-ink show
    // through). OutputPass applies the SRGB encoding step so colors
    // land at the right intensity on the canvas.
    const composer = new EffectComposer(renderer);
    composer.setSize(width, height);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.55,
      0.55,
      0.65,
    );
    composer.addPass(bloom);

    const alphaFix = new ShaderPass({
      uniforms: { tDiffuse: { value: null } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
        void main() {
          vec4 t = texture2D(tDiffuse, vUv);
          float lum = dot(t.rgb, vec3(0.299, 0.587, 0.114));
          float a = smoothstep(0.0, 0.05, lum);
          gl_FragColor = vec4(t.rgb, a);
        }
      `,
    });
    composer.addPass(alphaFix);

    composer.addPass(new OutputPass());


    let raf = 0;
    let mouseX = 0;
    let mouseY = 0;
    let smoothMx = 0;
    let smoothMy = 0;
    const startedAt = performance.now();

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

    const INTRO = 2.5;
    const FLY = 27.5;
    const OUTRO = 6.0;
    const LOOP = INTRO + FLY + OUTRO;

    function easeInOut(t: number) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function animate() {
      const now = performance.now();
      const elapsed = ((now - startedAt) / 1000) % LOOP;

      smoothMx += (mouseX - smoothMx) * 0.04;
      smoothMy += (mouseY - smoothMy) * 0.04;

      // Camera path
      let cameraT = 0;
      if (elapsed < INTRO) {
        cameraT = 0;
      } else if (elapsed < INTRO + FLY) {
        cameraT = easeInOut((elapsed - INTRO) / FLY);
      } else {
        cameraT = 1;
      }
      const camPos = camCurve.getPoint(cameraT);
      camera.position.copy(camPos);
      camera.position.x += smoothMx * 16;
      camera.position.y -= smoothMy * 12;
      camera.lookAt(0, -10, 0);

      // Particle phase
      if (cloud && basePositions && burstOrigins && livePositions) {
        const attr = cloud.geometry.getAttribute("position") as THREE.BufferAttribute;
        if (elapsed < INTRO) {
          const t = easeInOut(elapsed / INTRO);
          for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            livePositions[i3] =
              burstOrigins[i3] + (basePositions[i3] - burstOrigins[i3]) * t;
            livePositions[i3 + 1] =
              burstOrigins[i3 + 1] +
              (basePositions[i3 + 1] - burstOrigins[i3 + 1]) * t;
            livePositions[i3 + 2] =
              burstOrigins[i3 + 2] +
              (basePositions[i3 + 2] - burstOrigins[i3 + 2]) * t;
          }
          attr.needsUpdate = true;
        } else if (elapsed < INTRO + FLY) {
          // Settled — only refresh if we were animating last frame
          if (attr.needsUpdate || (elapsed - INTRO) < 0.05) {
            for (let i = 0; i < particleCount * 3; i++) {
              livePositions[i] = basePositions[i];
            }
            attr.needsUpdate = true;
          }
        } else {
          const t = easeInOut((elapsed - INTRO - FLY) / OUTRO);
          // Gather toward origin with mild swirl
          for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const targetX = 0;
            const targetY = 0;
            const targetZ = 0;
            livePositions[i3] =
              basePositions[i3] + (targetX - basePositions[i3]) * t;
            livePositions[i3 + 1] =
              basePositions[i3 + 1] + (targetY - basePositions[i3 + 1]) * t;
            livePositions[i3 + 2] =
              basePositions[i3 + 2] + (targetZ - basePositions[i3 + 2]) * t;
          }
          attr.needsUpdate = true;
        }
      }

      // Bloom breathing — corner contribution is alpha-masked out so
      // strength can stay cinematic without lifting the empty bg
      bloom.strength = 0.55 + Math.sin(now * 0.0008) * 0.06;

      composer.render();
      raf = requestAnimationFrame(animate);
    }

    composer.render();
    if (!reduced) raf = requestAnimationFrame(animate);

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
      disposed = true;
      cancelAnimationFrame(raf);
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
      ro.disconnect();
      pointTexture.dispose();
      if (cloud) {
        cloud.geometry.dispose();
        (cloud.material as THREE.Material).dispose();
      }
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
