#!/usr/bin/env node
/**
 * Take desktop + mobile full-page screenshots of the local dev server
 * for visual comparison against maggie-clone/docs/design-references/
 * maggieappleton.com screenshots.
 *
 * Usage: BASE=http://localhost:3458 node scripts/screenshot-dev.mjs
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../docs/screenshots");
const BASE = process.env.BASE || "http://localhost:3458";

import { promises as fs } from "node:fs";

const ROUTES = [
  { name: "home", path: "/" },
  { name: "skills", path: "/skills" },
  { name: "ai", path: "/ai" },
  { name: "notes", path: "/notes" },
  { name: "reading", path: "/reading" },
  { name: "latest", path: "/latest" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const main = async () => {
  await fs.mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  for (const route of ROUTES) {
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await ctx.newPage();
      const url = BASE + route.path;
      try {
        console.log(`[${route.name}@${vp.name}] ${url}`);
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(800);
        // Scroll the full document height once so every .reveal
        // IntersectionObserver fires. Then settle back to top, wait for
        // reveal transitions to finish, and snap the full page.
        await page.evaluate(async () => {
          const docH = document.documentElement.scrollHeight;
          for (let y = 0; y < docH; y += 600) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 80));
          }
          window.scrollTo(0, docH);
          await new Promise((r) => setTimeout(r, 300));
          window.scrollTo(0, 0);
          await new Promise((r) => setTimeout(r, 400));
        });
        await page.waitForTimeout(1200);
        const shot = path.join(OUT, `${route.name}-${vp.name}.png`);
        await page.screenshot({ path: shot, fullPage: true });
      } catch (e) {
        console.error(`  failed: ${e.message}`);
      } finally {
        await ctx.close();
      }
    }
  }
  await browser.close();
};

main().catch((e) => {
  console.error("screenshot failed:", e);
  process.exit(1);
});
