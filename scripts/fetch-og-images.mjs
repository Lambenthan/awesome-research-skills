#!/usr/bin/env node
/**
 * Pull og:image / twitter:image from each rss item's upstream URL and
 * save into src/data/generated/og-images.json as a flat { id: imageUrl }
 * map. extract-content.mjs merges this map into latest.json.rss[].image
 * so the detail page can render a hero shot above the deep dive.
 *
 * Strategy:
 *   - Read latest.json rss[] for ids + urls
 *   - For each url: HEAD-then-GET the page, look for og:image / twitter:image
 *     in the first 50KB (head is usually enough; saves bandwidth)
 *   - Absolutize relative URLs against the page origin
 *   - Filter out obvious low-quality candidates (favicons, tiny SVGs)
 *   - Concurrent pool of 6 to stay polite across hosts
 *   - Items that fail are simply absent from the output — detail page
 *     falls back to no-hero layout
 *
 * Run: npm run fetch-og-images   (no auth needed, all public pages)
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
const CONCURRENCY = 6;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const META_RE_OG = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i;
const META_RE_OG2 = /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i;
const META_RE_TW = /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i;
const META_RE_TW2 = /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i;

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

async function fetchHead(url) {
  // Range request: skip if remote ignores it; we just truncate manually too.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Range: "bytes=0-49999" },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok && res.status !== 206) {
      return null;
    }
    const text = await res.text();
    return { html: text.slice(0, 60000), finalUrl: res.url };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function imageFor(item) {
  const got = await fetchHead(item.url);
  if (!got) return null;
  let raw = pickImage(got.html);
  if (!raw) return null;
  raw = raw.trim().replace(/&amp;/g, "&");
  const abs = absolutize(raw, got.finalUrl || item.url);
  if (!abs) return null;
  if (looksLowQuality(abs)) return null;
  return abs;
}

async function runPool(items, worker, concurrency) {
  const out = new Array(items.length);
  let i = 0;
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
  console.log(`fetch-og-images: ${items.length} urls to probe`);

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
    /* fine — optional */
  }

  let hits = 0;
  let misses = 0;
  let cached = 0;
  let overridden = 0;
  const results = await runPool(
    items,
    async (it, idx) => {
      // Editor overrides win over both cache and live fetch.
      if (typeof overrides[it.id] === "string") {
        overridden++;
        return [it.id, overrides[it.id]];
      }
      if (existing[it.id]) {
        cached++;
        return [it.id, existing[it.id]];
      }
      const img = await imageFor(it);
      if (img) {
        hits++;
        process.stdout.write(
          `  [${String(idx + 1).padStart(2)}/${items.length}] OK   ${it.sourceName.padEnd(14)} ${it.title.slice(0, 50)}\n`,
        );
        return [it.id, img];
      }
      misses++;
      process.stdout.write(
        `  [${String(idx + 1).padStart(2)}/${items.length}] miss ${it.sourceName.padEnd(14)} ${it.title.slice(0, 50)}\n`,
      );
      return null;
    },
    CONCURRENCY,
  );

  const out = { ...existing };
  for (const r of results) {
    if (r) out[r[0]] = r[1];
  }

  await fs.writeFile(OUT, JSON.stringify(out, null, 2));
  console.log(
    `\nsummary: ${hits} new hits, ${misses} miss, ${cached} from cache, ${overridden} from overrides | total in file: ${Object.keys(out).length}`,
  );
}

main().catch((err) => {
  console.error("fetch-og-images failed:", err);
  process.exit(1);
});
