#!/usr/bin/env node
/**
 * Additional feed sources beyond the 8 lab feeds in feed-sources.yml.
 * Each source has its own fetcher because the upstream APIs are wildly
 * different (HF web page, Reddit JSON, arXiv Atom). Output schema matches
 * feed-raw.json so score-and-tag.mjs can merge them in directly.
 *
 * Sources:
 *   - HuggingFace Daily Papers (editor-curated paper picks)
 *   - Reddit r/LocalLLaMA + r/MachineLearning hot posts
 *   - arXiv recent submissions in cs.AI / cs.CL / cs.LG / cs.CV
 *
 * Output: src/data/generated/feed-extras-raw.json
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { XMLParser } from "fast-xml-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const OUT_FILE = path.join(
  projectRoot,
  "src/data/generated/feed-extras-raw.json",
);
const UA =
  "field-notes-bot/0.1 (+https://lambenthan.github.io/field-notes)";

function stableId(url) {
  return crypto.createHash("sha1").update(url).digest("hex").slice(0, 16);
}

function trim(text, max = 300) {
  if (!text) return "";
  const clean = String(text).replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, init, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, init);
      if (res.status === 429 || res.status >= 500) {
        await sleep(2000 * (i + 1));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      lastErr = err;
      await sleep(1000 * (i + 1));
    }
  }
  throw lastErr ?? new Error("rate limited");
}

// ─────────────────────────────────────────────────────────────────────────
// HuggingFace Daily Papers
//
// /papers serves a Next.js page where each paper card carries an arXiv ID
// and the curator-picked daily list. Without JS we still get the paper IDs
// and titles in the SSR HTML.
// ─────────────────────────────────────────────────────────────────────────
async function fetchHFPapers() {
  const res = await fetchWithRetry("https://huggingface.co/papers", {
    headers: { "User-Agent": UA },
    redirect: "follow",
  });
  const html = await res.text();
  // HF papers wraps each paper in an <article>…</article>. Inside the
  // article the paper id is on an <a href="/papers/{id}"> (often two
  // siblings: image anchor and text anchor) and the title is in an <h3>.
  const seen = new Set();
  const items = [];
  const articleRe = /<article[^>]*>([\s\S]*?)<\/article>/g;
  let m;
  while ((m = articleRe.exec(html))) {
    const inner = m[1];
    const idMatch = inner.match(/href="\/papers\/([0-9]{4}\.[0-9]+)"/);
    if (!idMatch) continue;
    const id = idMatch[1];
    if (seen.has(id)) continue;
    const titleMatch =
      inner.match(/<h3[^>]*>([\s\S]*?)<\/h3>/) ||
      inner.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    if (!titleMatch) continue;
    const title = trim(
      titleMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " "),
      220,
    );
    if (!title) continue;
    seen.add(id);
    const url = `https://huggingface.co/papers/${id}`;
    items.push({
      source: "hf-papers",
      sourceName: "HuggingFace Papers",
      id: stableId(url),
      title,
      url,
      summary: "",
      category: "paper",
      publishedAt: null,
      discoveredAt: new Date().toISOString(),
    });
  }
  return items;
}

// ─────────────────────────────────────────────────────────────────────────
// Reddit hot — public JSON endpoint
// ─────────────────────────────────────────────────────────────────────────
async function fetchRedditHot(subreddit, limit = 25) {
  const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}&t=day`;
  const res = await fetchWithRetry(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
  });
  const json = await res.json();
  const posts = json?.data?.children ?? [];
  const items = [];
  for (const p of posts) {
    const d = p?.data;
    if (!d || d.stickied) continue;
    if (typeof d.score === "number" && d.score < 20) continue;
    const title = trim(d.title, 220);
    const externalUrl =
      d.url && !d.url.includes("reddit.com") ? d.url : `https://reddit.com${d.permalink}`;
    if (!title || !externalUrl) continue;
    items.push({
      source: `reddit-${subreddit.toLowerCase()}`,
      sourceName: `r/${subreddit}`,
      id: stableId(externalUrl),
      title,
      url: externalUrl,
      summary: trim(d.selftext || "", 300),
      category: "discussion",
      publishedAt: d.created_utc
        ? new Date(d.created_utc * 1000).toISOString()
        : null,
      discoveredAt: new Date().toISOString(),
    });
  }
  return items;
}

// ─────────────────────────────────────────────────────────────────────────
// arXiv recent submissions
//
// Atom feed via export.arxiv.org. arXiv rate-limits aggressively — sleep
// 3s after every query, do at most 1 query.
// ─────────────────────────────────────────────────────────────────────────
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@",
  trimValues: true,
});

async function fetchArxiv(categories, maxResults = 30) {
  const q = categories.map((c) => `cat:${c}`).join("+OR+");
  const url = `https://export.arxiv.org/api/query?search_query=${q}&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`;
  const res = await fetchWithRetry(url, {
    headers: { "User-Agent": UA },
  });
  const xml = await res.text();
  const doc = xmlParser.parse(xml);
  const entries = doc?.feed?.entry ?? [];
  const list = Array.isArray(entries) ? entries : [entries];
  return list
    .map((e) => {
      const id = e.id?.["#text"] ?? e.id;
      const title = trim(
        (e.title?.["#text"] ?? e.title ?? "").replace(/\s+/g, " "),
        220,
      );
      const summary = trim(
        (e.summary?.["#text"] ?? e.summary ?? "").replace(/\s+/g, " "),
        300,
      );
      const link = Array.isArray(e.link)
        ? e.link.find((l) => l["@type"] === "text/html")?.["@href"] ?? e.link[0]?.["@href"]
        : e.link?.["@href"];
      if (!title || !link) return null;
      // Primary category lives at arxiv:primary_category[@term]
      const primary =
        e["arxiv:primary_category"]?.["@term"] ??
        (Array.isArray(e.category)
          ? e.category[0]?.["@term"]
          : e.category?.["@term"]) ??
        "cs.AI";
      return {
        source: "arxiv",
        sourceName: "arXiv",
        id: stableId(link),
        title,
        url: link,
        summary,
        category: primary,
        publishedAt: e.published ?? null,
        discoveredAt: new Date().toISOString(),
      };
    })
    .filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────
// Orchestration
// ─────────────────────────────────────────────────────────────────────────
async function main() {
  const t0 = Date.now();
  const stats = [];
  const all = [];

  // HF papers
  try {
    const hf = await fetchHFPapers();
    all.push(...hf);
    stats.push(`  hf-papers          ${String(hf.length).padStart(3)} items`);
  } catch (err) {
    stats.push(`  hf-papers          FAILED ${err.message}`);
  }

  // Reddit — two subreddits, 1s gap between to be polite
  for (const sub of ["LocalLLaMA", "MachineLearning"]) {
    try {
      const items = await fetchRedditHot(sub, 20);
      all.push(...items);
      stats.push(
        `  reddit-${sub.padEnd(12)} ${String(items.length).padStart(3)} items`,
      );
    } catch (err) {
      stats.push(`  reddit-${sub.padEnd(12)} FAILED ${err.message}`);
    }
    await sleep(1000);
  }

  // arXiv — 1 query, 3s sleep before to respect their etiquette guide.
  await sleep(3000);
  try {
    const ax = await fetchArxiv(["cs.AI", "cs.CL", "cs.LG", "cs.CV"], 40);
    all.push(...ax);
    stats.push(`  arxiv              ${String(ax.length).padStart(3)} items`);
  } catch (err) {
    stats.push(`  arxiv              FAILED ${err.message}`);
  }

  // Dedupe by id
  const byId = new Map();
  for (const it of all) {
    if (!byId.has(it.id)) byId.set(it.id, it);
  }
  const items = [...byId.values()].sort((a, b) => {
    const ad = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bd = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return bd - ad;
  });

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(
    OUT_FILE,
    JSON.stringify(
      { fetchedAt: new Date().toISOString(), items },
      null,
      2,
    ),
  );

  console.log("feed-extras:");
  for (const s of stats) console.log(s);
  console.log(
    `  total: ${items.length} items after dedupe -> ${path.relative(projectRoot, OUT_FILE)} (${Date.now() - t0}ms)`,
  );
}

main().catch((err) => {
  console.error("feed-extras failed:", err);
  process.exit(1);
});
