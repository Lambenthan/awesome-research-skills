#!/usr/bin/env node
/**
 * Lab feed extractor.
 *
 * Reads content/feed-sources.yml and produces src/data/generated/feed-raw.json.
 * Three fetcher types are supported:
 *
 *   rss      — RSS / Atom feed, parsed by fast-xml-parser
 *   html     — SSR HTML page, parsed by JSDOM-free regex against
 *              `selector.item` anchors. Robust enough for Anthropic.
 *   browser  — Playwright chromium headless; needed for sites that
 *              block UA-based curl (Cloudflare) or render on the client.
 *
 * Each source's output is appended to the same flat list, normalized to
 *
 *   {
 *     source: "openai",                // matches feed-sources.yml id
 *     sourceName: "OpenAI",
 *     id: <stable hash of url>,
 *     title: "...",
 *     url: "https://openai.com/...",
 *     summary: "..." | "",
 *     category: "Product" | "" | null, // optional, source-supplied tag
 *     publishedAt: ISO8601 | null,
 *     discoveredAt: ISO8601,
 *   }
 *
 * Stable IDs let downstream scoring skip already-scored items.
 *
 * Env:
 *   - SKIP_BROWSER=1   skip playwright sources (CI / dev convenience)
 *   - FEED_LIMIT=N     keep at most N items per source (default 30)
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { XMLParser } from "fast-xml-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const SOURCES_FILE = path.join(projectRoot, "content", "feed-sources.yml");
const OUT_FILE = path.join(
  projectRoot,
  "src",
  "data",
  "generated",
  "feed-raw.json",
);
const FEED_LIMIT = parseInt(process.env.FEED_LIMIT ?? "30", 10);
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

function stableId(url) {
  return crypto.createHash("sha1").update(url).digest("hex").slice(0, 16);
}

function normalizeISO(input) {
  if (!input) return null;
  if (input instanceof Date) return input.toISOString();
  const s = String(input).trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function trim(text, max = 300) {
  if (!text) return "";
  const clean = String(text).replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
}

// ---------- RSS / Atom -----------------------------------------------------

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@",
  trimValues: true,
});

async function fetchWithRetry(url, init, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, init);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return res;
    } catch (err) {
      lastErr = err;
      // node undici occasionally drops TLS on first connect; back off and retry.
      await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
  throw lastErr;
}

async function fetchRss(source) {
  const res = await fetchWithRetry(source.url, { headers: { "User-Agent": UA } });
  const xml = await res.text();
  const doc = xmlParser.parse(xml);
  // RSS 2.0: rss.channel.item[]
  // Atom:    feed.entry[]
  let entries = [];
  if (doc.rss?.channel?.item) {
    entries = Array.isArray(doc.rss.channel.item)
      ? doc.rss.channel.item
      : [doc.rss.channel.item];
    return entries.map((e) => ({
      title: trim(e.title?.["#text"] ?? e.title, 200),
      url: e.link?.["#text"] ?? e.link ?? "",
      summary: trim(
        stripHtml(e.description?.["#text"] ?? e.description ?? ""),
        300,
      ),
      category: pickCategory(e.category),
      publishedAt: normalizeISO(e.pubDate ?? e["dc:date"]),
    }));
  }
  if (doc.feed?.entry) {
    entries = Array.isArray(doc.feed.entry)
      ? doc.feed.entry
      : [doc.feed.entry];
    return entries.map((e) => {
      const link = Array.isArray(e.link)
        ? e.link.find((l) => l["@rel"] !== "self") ?? e.link[0]
        : e.link;
      const href = link?.["@href"] ?? link?.["#text"] ?? "";
      const summary =
        e.summary?.["#text"] ??
        e.summary ??
        e.content?.["#text"] ??
        e.content ??
        "";
      return {
        title: trim(e.title?.["#text"] ?? e.title, 200),
        url: href,
        summary: trim(stripHtml(summary), 300),
        category: pickCategory(e.category),
        publishedAt: normalizeISO(e.published ?? e.updated),
      };
    });
  }
  throw new Error("unrecognized feed structure");
}

function stripHtml(s) {
  if (!s) return "";
  return String(s).replace(/<[^>]+>/g, " ");
}

function pickCategory(c) {
  if (!c) return null;
  if (typeof c === "string") return trim(c, 60);
  if (Array.isArray(c)) return pickCategory(c[0]);
  return trim(c["@term"] ?? c["#text"] ?? "", 60) || null;
}

// ---------- HTML (SSR static) ----------------------------------------------
//
// We do not pull in jsdom for one site. Anthropic's news index has a
// predictable shape:
//
//   <a href="/news/..." class="...content"><h2>title</h2>
//     <div><span class="caption bold">Product</span>
//          <time class="...date...">Apr 16, 2026</time></div>
//     <p class="body-3 serif ...body">summary</p>
//   </a>
//
// Regex on the anchor block is enough and keeps the dependency surface tiny.

async function fetchHtml(source) {
  const res = await fetchWithRetry(source.url, { headers: { "User-Agent": UA } });
  const html = await res.text();
  // Find <a href="/news/..."> ... </a> blocks. Anthropic uses two layouts:
  //   - FeaturedGrid: title in <h2>, summary in <p>, category in
  //     <span class="caption bold">
  //   - PublicationList: title in <span class="...title body-3">, category
  //     in <span class="...subject body-3">, no summary
  // Both have <time class="...date...">.
  const anchorRe =
    /<a[^>]+href="(\/news\/[^"#?]+)"[^>]*>([\s\S]*?)<\/a>/g;
  const seen = new Set();
  const out = [];
  let m;
  while ((m = anchorRe.exec(html))) {
    const slug = m[1];
    if (seen.has(slug)) continue;
    seen.add(slug);
    const inner = m[2];
    let title = trim(
      stripHtml((inner.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/) ?? [, ""])[1]),
      200,
    );
    if (!title) {
      title = trim(
        stripHtml(
          (inner.match(/<span[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/span>/) ?? [, ""])[1],
        ),
        200,
      );
    }
    const summary = trim(
      stripHtml((inner.match(/<p[^>]*>([\s\S]*?)<\/p>/) ?? [, ""])[1]),
      300,
    );
    const timeMatch = inner.match(/<time[^>]*>([\s\S]*?)<\/time>/);
    const dateText = timeMatch ? stripHtml(timeMatch[1]).trim() : "";
    let category = trim(
      stripHtml(
        (inner.match(/<span[^>]*class="[^"]*caption[^"]*"[^>]*>([\s\S]*?)<\/span>/) ?? [, ""])[1],
      ),
      60,
    );
    if (!category) {
      category = trim(
        stripHtml(
          (inner.match(/<span[^>]*class="[^"]*subject[^"]*"[^>]*>([\s\S]*?)<\/span>/) ?? [, ""])[1],
        ),
        60,
      );
    }
    if (!title) continue;
    out.push({
      title,
      url: source.detailBase + slug,
      summary,
      category: category || null,
      publishedAt: normalizeISO(dateText),
    });
  }
  return out;
}

// ---------- Browser (Playwright chromium) ----------------------------------

let _browser = null;
async function getBrowser() {
  if (_browser) return _browser;
  const { chromium } = await import("playwright");
  _browser = await chromium.launch({ headless: true });
  return _browser;
}

async function fetchBrowser(source) {
  const browser = await getBrowser();
  const ctx = await browser.newContext({ userAgent: UA });
  const page = await ctx.newPage();
  try {
    // networkidle is too strict for SPA sites that keep long-poll
    // connections open. domcontentloaded + small settle window is enough
    // once selectors are present.
    await page.goto(source.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    try {
      await page.waitForSelector(source.selector.item, { timeout: 15000 });
    } catch {
      // proceed even if selector doesn't appear — eval will return [].
    }
    await page.waitForTimeout(2000);
    const items = await page.$$eval(
      source.selector.item,
      (els, sel) => {
        // Group anchors by href first — grid layouts produce multiple
        // anchors per article (image, badge, title). Pick the one with
        // the most informative text per href.
        const byHref = new Map();
        for (const el of els) {
          const href = el.getAttribute("href");
          if (!href) continue;
          const key = href.replace(/[?#].*$/, "");
          if (!byHref.has(key)) byHref.set(key, []);
          byHref.get(key).push(el);
        }
        const BADGE_RE = /^(FEATURED|NEW|Featured|New|Read more|Learn more)\.?\s*$/i;
        const out = [];
        for (const [key, group] of byHref) {
          // Title resolution prefers structured selector hits across the
          // whole group (h-tags), and only falls back to anchor text when
          // none of them landed. This keeps mistral's <h1> tidy while
          // letting xai (text-only anchors) still resolve.
          let title = "";
          let bestEl = group[0];
          for (const el of group) {
            const t = (el.querySelector(sel.title)?.textContent ?? "")
              .replace(/\s+/g, " ").trim();
            if (!t || BADGE_RE.test(t)) continue;
            const clean = t.replace(/^(FEATURED|NEW|Featured|New)\s+/, "");
            if (clean.length > title.length) {
              title = clean;
              bestEl = el;
            }
          }
          if (!title) {
            for (const el of group) {
              const t = (el.textContent ?? "").replace(/\s+/g, " ").trim();
              if (!t || BADGE_RE.test(t)) continue;
              const clean = t.replace(/^(FEATURED|NEW|Featured|New)\s+/, "").slice(0, 220);
              if (clean.length > title.length) {
                title = clean;
                bestEl = el;
              }
            }
          }
          if (!title || title.length < 4) continue;
          // Date / summary / category pull from whichever anchor in the group
          // has them — try bestEl first, then any other.
          const text = (el, q) =>
            (el.querySelector(q)?.textContent ?? "").replace(/\s+/g, " ").trim();
          let dateText = "";
          let summary = "";
          let category = "";
          for (const el of [bestEl, ...group]) {
            if (!dateText) dateText = text(el, "time");
            if (!dateText && sel.timeText) {
              for (const c of el.querySelectorAll(sel.timeText)) {
                const t = (c.textContent ?? "").trim();
                if (/[A-Z][a-z]{2}\.?\s+\d{1,2},?\s+20\d{2}/.test(t)) {
                  dateText = t;
                  break;
                }
              }
            }
            if (!summary) summary = text(el, sel.summary || "p");
            if (!category && sel.category) category = text(el, sel.category);
            if (dateText && summary && category) break;
          }
          out.push({ href: key, title: title.slice(0, 220), summary, dateText, category });
        }
        return out;
      },
      source.selector,
    );
    return items.map((it) => ({
      title: trim(it.title, 200),
      url: it.href.startsWith("http") ? it.href : source.detailBase + it.href,
      summary: trim(it.summary, 300),
      category: it.category ? trim(it.category, 60) : null,
      publishedAt: normalizeISO(it.dateText),
    }));
  } finally {
    await ctx.close();
  }
}

// ---------- Orchestration --------------------------------------------------

async function run() {
  const cfg = yaml.load(await fs.readFile(SOURCES_FILE, "utf8"));
  const sources = (cfg.sources ?? []).filter((s) => s.enabled !== false);

  const now = new Date().toISOString();
  const results = [];
  const stats = [];

  for (const source of sources) {
    if (process.env.SKIP_BROWSER === "1" && source.type === "browser") {
      stats.push(`  ${source.id.padEnd(12)} skipped (SKIP_BROWSER=1)`);
      continue;
    }
    const t0 = Date.now();
    try {
      let raw;
      if (source.type === "rss") raw = await fetchRss(source);
      else if (source.type === "html") raw = await fetchHtml(source);
      else if (source.type === "browser") raw = await fetchBrowser(source);
      else throw new Error(`unknown type: ${source.type}`);

      raw = raw.filter((r) => r.url && r.title).slice(0, FEED_LIMIT);
      for (const r of raw) {
        results.push({
          source: source.id,
          sourceName: source.name,
          id: stableId(r.url),
          title: r.title,
          url: r.url,
          summary: r.summary ?? "",
          category: r.category ?? null,
          publishedAt: r.publishedAt,
          discoveredAt: now,
        });
      }
      stats.push(
        `  ${source.id.padEnd(12)} ${String(raw.length).padStart(3)} items   ${Date.now() - t0}ms`,
      );
    } catch (err) {
      stats.push(`  ${source.id.padEnd(12)} FAILED  ${err.message}`);
    }
  }

  if (_browser) await _browser.close();

  // Sort by published date desc (null pubs go to bottom).
  results.sort((a, b) => {
    if (!a.publishedAt && !b.publishedAt) return 0;
    if (!a.publishedAt) return 1;
    if (!b.publishedAt) return -1;
    return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
  });

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(
    OUT_FILE,
    JSON.stringify({ fetchedAt: now, items: results }, null, 2),
  );

  console.log("feed extract:");
  for (const line of stats) console.log(line);
  console.log(`  total: ${results.length} items -> ${path.relative(projectRoot, OUT_FILE)}`);
}

run().catch((err) => {
  console.error("feed extract failed:", err);
  process.exit(1);
});
