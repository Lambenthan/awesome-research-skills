#!/usr/bin/env node
/**
 * Pull og:image / twitter:image from each rss item's upstream URL and
 * save into src/data/generated/og-images.json as a flat { id: imageUrl }
 * map. extract-content.mjs merges this map into latest.json.rss[].image
 * so the detail page can render a hero shot above the deep dive.
 *
 * Two fetch paths:
 *   - raw fetch (fast, ~200ms): used first for non-blocking hosts
 *   - playwright (~2s/page): used for hosts that ECONNRESET or 403
 *     against Node's TLS fingerprint (OpenAI / Meta / DeepMind /
 *     Anthropic / xAI / Mistral / claude.com), and as a fallback when
 *     raw fetch returns no match (DeepMind also serves unquoted
 *     attribute values like `property=og:image` that the regex can't
 *     parse — playwright reads via DOM so it doesn't care).
 *
 * Items that fail both paths are simply absent from the output map;
 * detail page falls back to no-hero layout. Next run retries them.
 *
 * Run: npm run fetch-og-images   (no auth needed, all public pages)
 * Env: SKIP_BROWSER=1 disables playwright (raw-only mode, faster but
 *      misses the labs that block Node fetch).
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const IN = path.join(projectRoot, "src/data/generated/latest.json");
const OUT = path.join(projectRoot, "src/data/generated/og-images.json");
const OVERRIDES = path.join(projectRoot, "content/og-overrides.yml");
const RAW_CONCURRENCY = 6;
const BROWSER_CONCURRENCY = 4;
const SKIP_BROWSER = !!process.env.SKIP_BROWSER;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

// Hosts whose CDN blocks Node's undici TLS fingerprint (ECONNRESET) or
// returns 403 to non-browser clients. For these, skip raw fetch entirely
// and go straight to playwright.
const BLOCKING_HOSTS = new Set([
  "openai.com",
  "www.openai.com",
  "ai.meta.com",
  "www.anthropic.com",
  "anthropic.com",
  "deepmind.google",
  "x.ai",
  "claude.com",
  "www.claude.com",
  "mistral.ai",
  "www.mistral.ai",
]);

// Attribute values may be quoted ("x", 'x') or unquoted (x followed by
// whitespace or >). DeepMind serves unquoted; most others quoted. Match
// both. The raw path uses these; the playwright path uses DOM selectors
// which already handle this.
const ATTR = `["']?([^"'\\s>]+)["']?`;
const META_RE_OG = new RegExp(
  `<meta[^>]+property=["']?og:image["']?[^>]+content=${ATTR}`,
  "i",
);
const META_RE_OG2 = new RegExp(
  `<meta[^>]+content=${ATTR}[^>]+property=["']?og:image["']?`,
  "i",
);
const META_RE_TW = new RegExp(
  `<meta[^>]+name=["']?twitter:image["']?[^>]+content=${ATTR}`,
  "i",
);
const META_RE_TW2 = new RegExp(
  `<meta[^>]+content=${ATTR}[^>]+name=["']?twitter:image["']?`,
  "i",
);

function pickImage(html) {
  for (const re of [META_RE_OG, META_RE_OG2, META_RE_TW, META_RE_TW2]) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
}

function looksLowQuality(url) {
  const lower = url.toLowerCase();
  if (lower.includes("favicon")) return true;
  if (lower.endsWith(".svg")) return true;
  if (lower.endsWith(".ico")) return true;
  if (lower.endsWith("logo.png") || lower.endsWith("logo.jpg")) return true;
  return false;
}

function absolutize(href, base) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Raw fetch path
// ─────────────────────────────────────────────────────────────────────────
async function rawFetch(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Range: "bytes=0-49999" },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok && res.status !== 206) return null;
    const text = await res.text();
    return { html: text.slice(0, 60000), finalUrl: res.url };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function imageRaw(item) {
  const got = await rawFetch(item.url);
  if (!got) return null;
  let raw = pickImage(got.html);
  if (!raw) return null;
  raw = raw.trim().replace(/&amp;/g, "&");
  const abs = absolutize(raw, got.finalUrl || item.url);
  if (!abs || looksLowQuality(abs)) return null;
  return abs;
}

// ─────────────────────────────────────────────────────────────────────────
// Playwright fallback path — DOM-based, immune to TLS fingerprinting and
// unquoted-attribute regex issues.
// ─────────────────────────────────────────────────────────────────────────
let _browser = null;
async function getBrowser() {
  if (_browser) return _browser;
  const { chromium } = await import("playwright");
  _browser = await chromium.launch({ headless: true });
  return _browser;
}

async function imageBrowser(item) {
  const browser = await getBrowser();
  const ctx = await browser.newContext({ userAgent: UA });
  const page = await ctx.newPage();
  try {
    await page.goto(item.url, { waitUntil: "domcontentloaded", timeout: 25000 });
    const raw = await page.evaluate(() => {
      const grab = (sel) => {
        const el = document.querySelector(sel);
        return el ? el.getAttribute("content") : null;
      };
      return (
        grab('meta[property="og:image"]') ||
        grab('meta[name="og:image"]') ||
        grab('meta[name="twitter:image"]') ||
        grab('meta[property="twitter:image"]')
      );
    });
    if (!raw) return null;
    const cleaned = raw.trim().replace(/&amp;/g, "&");
    const abs = absolutize(cleaned, page.url() || item.url);
    if (!abs || looksLowQuality(abs)) return null;
    return abs;
  } catch {
    return null;
  } finally {
    await ctx.close().catch(() => {});
  }
}

async function imageFor(item) {
  const host = hostOf(item.url);
  const goBrowserFirst = BLOCKING_HOSTS.has(host);
  if (!goBrowserFirst) {
    const r = await imageRaw(item);
    if (r) return { img: r, via: "raw" };
  }
  if (SKIP_BROWSER) return null;
  const b = await imageBrowser(item);
  if (b) return { img: b, via: "browser" };
  return null;
}

// ─────────────────────────────────────────────────────────────────────────
// Concurrency pool that respects a per-task slot count. We use separate
// pools for raw vs browser because the browser path is heavier; without
// this a backlog of Meta/DeepMind would starve the easy raw items.
// ─────────────────────────────────────────────────────────────────────────
async function runPool(items, worker, concurrency) {
  let i = 0;
  const out = new Array(items.length);
  async function next() {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      out[idx] = await worker(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, next));
  return out;
}

async function main() {
  const latest = JSON.parse(await fs.readFile(IN, "utf8"));
  const items = latest.rss ?? [];

  let existing = {};
  try {
    existing = JSON.parse(await fs.readFile(OUT, "utf8"));
  } catch {
    /* first run */
  }
  let overrides = {};
  try {
    overrides = yaml.load(await fs.readFile(OVERRIDES, "utf8")) || {};
  } catch {
    /* optional */
  }

  // Split into work queues: cached / override (instant), raw-path,
  // browser-path. Within each queue we use its own concurrency.
  const cached = [];
  const overridden = [];
  const rawQueue = [];
  const browserQueue = [];
  for (const it of items) {
    if (typeof overrides[it.id] === "string") {
      overridden.push([it.id, overrides[it.id]]);
      continue;
    }
    if (existing[it.id]) {
      cached.push([it.id, existing[it.id]]);
      continue;
    }
    const host = hostOf(it.url);
    if (BLOCKING_HOSTS.has(host)) browserQueue.push(it);
    else rawQueue.push(it);
  }

  console.log(
    `fetch-og-images: ${items.length} total | ${cached.length} cached | ${overridden.length} overrides | ${rawQueue.length} raw to probe | ${browserQueue.length} browser to probe`,
  );

  const results = new Map();
  for (const [id, url] of cached) results.set(id, url);
  for (const [id, url] of overridden) results.set(id, url);

  // Raw queue: items not in blocking-host set. Most succeed on raw;
  // anything that returns null gets pushed to browser fallback (unless
  // SKIP_BROWSER).
  let rawHits = 0;
  let rawMiss = 0;
  const rawFallback = [];
  await runPool(
    rawQueue,
    async (it, idx) => {
      const r = await imageRaw(it);
      if (r) {
        rawHits++;
        results.set(it.id, r);
        process.stdout.write(
          `  raw  [${String(idx + 1).padStart(4)}/${rawQueue.length}] OK   ${(it.sourceName || "").padEnd(14)} ${(it.title || "").slice(0, 50)}\n`,
        );
      } else {
        rawMiss++;
        rawFallback.push(it);
      }
    },
    RAW_CONCURRENCY,
  );

  // Browser queue: blocking-host items + raw-path failures (assuming
  // playwright is enabled). Single shared browser instance, lower
  // concurrency since each context is heavier.
  const browserAll = SKIP_BROWSER ? browserQueue : browserQueue.concat(rawFallback);
  let bHits = 0;
  let bMiss = 0;
  if (browserAll.length > 0 && !SKIP_BROWSER) {
    await runPool(
      browserAll,
      async (it, idx) => {
        const r = await imageBrowser(it);
        if (r) {
          bHits++;
          results.set(it.id, r);
          process.stdout.write(
            `  brw  [${String(idx + 1).padStart(4)}/${browserAll.length}] OK   ${(it.sourceName || "").padEnd(14)} ${(it.title || "").slice(0, 50)}\n`,
          );
        } else {
          bMiss++;
          process.stdout.write(
            `  brw  [${String(idx + 1).padStart(4)}/${browserAll.length}] miss ${(it.sourceName || "").padEnd(14)} ${(it.title || "").slice(0, 50)}\n`,
          );
        }
      },
      BROWSER_CONCURRENCY,
    );
  } else if (SKIP_BROWSER && browserQueue.length > 0) {
    console.log(
      `  skipped ${browserQueue.length} blocking-host items (SKIP_BROWSER=1)`,
    );
  }

  // Persist as plain { id: url } map — extract-content.mjs reads this
  // back at line ~758 and merges into latest.json.rss[].image.
  const out = {};
  for (const [id, url] of results) out[id] = url;
  await fs.writeFile(OUT, JSON.stringify(out, null, 2));

  if (_browser) await _browser.close().catch(() => {});

  console.log(
    `\nsummary: raw ${rawHits} hit / ${rawMiss} miss, browser ${bHits} hit / ${bMiss} miss | total in file: ${Object.keys(out).length}`,
  );
}

main().catch((err) => {
  console.error("fetch-og-images failed:", err);
  process.exit(1);
});
