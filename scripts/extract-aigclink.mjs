#!/usr/bin/env node
/**
 * Discover-layer scraper for AIGCLINK editor's picks (d.aigclink.ai).
 *
 * AIGCLINK is a human-curated Notion table. Its AI方案库 default view
 * exposes 50 most-recent items as public detail pages, each carrying a
 * "网址" field that points to the upstream project (github, huggingface,
 * vendor blog, etc.). This script:
 *
 *   1. Loads the AIGCLINK index page with playwright chromium
 *   2. Collects up to 50 detail-page URLs
 *   3. Opens each detail page concurrently (small pool to stay polite),
 *      extracts upstream URL + title + raw description text
 *   4. Classifies each upstream URL to a source key (qwen, kimi, github,
 *      huggingface, alibaba-bailian, etc.)
 *   5. Writes feed-aigclink-raw.json in the same schema as feed-raw.json
 *      so score-and-tag.mjs can consume both without changes.
 *
 * Notes:
 *   - Upstream URL is the authoritative URL stored on each item, NOT the
 *     AIGCLINK detail page URL. This keeps downstream rendering clean —
 *     visitors click straight through to the project.
 *   - Stable id = sha1 of upstream URL. If the same URL is already in
 *     feed-raw.json (e.g. an openai.com link the lab feed already covers),
 *     the score-and-tag merge step will dedupe automatically.
 *   - This script is meant to run on a separate, weekly cron — not the
 *     6h main loop — so heavy chromium work is fine.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const INDEX_URL =
  "https://d.aigclink.ai/?v=8f252a54730e49f4b8caf897b7ae49f6";
const OUT_FILE = path.join(
  projectRoot,
  "src",
  "data",
  "generated",
  "feed-aigclink-raw.json",
);
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const CONCURRENCY = 4;

function stableId(url) {
  return crypto.createHash("sha1").update(url).digest("hex").slice(0, 16);
}

function trim(text, max = 500) {
  if (!text) return "";
  const clean = String(text).replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
}

// ─────────────────────────────────────────────────────────────────────────
// Upstream URL → source key classifier.
//
// Returns { source, sourceName } for use in feed-aigclink-raw.json. If the
// host is one of the labs we already cover natively (openai.com etc), we
// still classify it — score-and-tag's dedup will skip the duplicate id.
// ─────────────────────────────────────────────────────────────────────────
function classifySource(url) {
  let host;
  try {
    host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return { source: "unknown", sourceName: "Other" };
  }
  const table = [
    [/^openai\.com$/, "openai", "OpenAI"],
    [/^anthropic\.com$/, "anthropic", "Anthropic"],
    [/^blog\.google$/, "google-ai", "Google AI"],
    [/^deepmind\.google$/, "deepmind", "DeepMind"],
    [/(^|\.)nvidia\.com$/, "nvidia", "NVIDIA"],
    [/^mistral\.ai$/, "mistral", "Mistral"],
    [/^ai\.meta\.com$/, "meta-ai", "Meta AI"],
    [/^x\.ai$/, "xai", "xAI"],

    [/(^|\.)qwenlm\.github\.io$/, "qwen", "Qwen"],
    [/^modelscope\.cn$/, "modelscope", "ModelScope"],
    [/(^|\.)aliyun\.com$/, "alibaba", "Alibaba Cloud"],
    [/^kimi\.com$|^moonshot\.cn$/, "kimi", "Moonshot Kimi"],
    [/^zhipuai\.cn$|^bigmodel\.cn$|^chatglm\.cn$/, "zhipu", "Zhipu AI"],
    [/^01\.ai$/, "lingyi", "01.AI"],
    [/^stepfun\.com$/, "stepfun", "StepFun"],
    [/(^|\.)bytedance\.com$|^doubao\.com$|^volcengine\.com$/, "bytedance", "ByteDance"],
    [/(^|\.)mihoyo\.com$|^minimaxi\.com$|^minimax\.io$/, "minimax", "MiniMax"],
    [/^xiaomi\.com$|^mi\.com$/, "xiaomi", "Xiaomi"],
    [/(^|\.)tencent\.com$|^hunyuan\.tencent\.com$/, "tencent", "Tencent"],

    [/^huggingface\.co$/, "huggingface", "HuggingFace"],
    [/^github\.com$/, "github", "GitHub"],
    [/^arxiv\.org$/, "arxiv", "arXiv"],
    [/^nature\.com$/, "nature", "Nature"],
  ];
  for (const [re, source, sourceName] of table) {
    if (re.test(host)) return { source, sourceName };
  }
  // Fallback: derive from host
  return { source: host, sourceName: host };
}

// ─────────────────────────────────────────────────────────────────────────
// Index scrape: collect the 50 detail-page URLs
// ─────────────────────────────────────────────────────────────────────────
async function scrapeIndex(browser) {
  const ctx = await browser.newContext({ userAgent: UA });
  const page = await ctx.newPage();
  try {
    await page.goto(INDEX_URL, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForSelector("a[href*='pvs=25']", { timeout: 20000 });
    await page.waitForTimeout(2000);
    const links = await page.$$eval("a[href*='pvs=25']", (els) =>
      els
        .map((a) => a.href)
        .filter((h) => h.includes("aigclink.ai/") && h.includes("pvs=25")),
    );
    return [...new Set(links)];
  } finally {
    await ctx.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Detail page: extract upstream URL + title + raw description.
//
// Detail pages embed a property table with a "网址" row that links out.
// We collect every off-site link and pick the first non-aigclink-owned
// one as the upstream URL.
// ─────────────────────────────────────────────────────────────────────────
async function scrapeDetail(browser, url) {
  const ctx = await browser.newContext({ userAgent: UA });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1800);
    const data = await page.evaluate(() => {
      const title =
        (document.querySelector("h1")?.innerText ?? "").trim() ||
        (document.title ?? "").trim();
      const text = document.body.innerText || "";
      // First date in YYYY/MM/DD form is the publication date row
      const dateMatch = text.match(/\d{4}\/\d{2}\/\d{2}/);
      // Outbound link = first <a> whose host differs from current
      const own = new Set(["aigclink.ai", "d.aigclink.ai", "custom.aigclink.ai"]);
      const externals = [];
      for (const a of document.querySelectorAll("a[href]")) {
        try {
          const u = new URL(a.href, location.origin);
          if (!u.protocol.startsWith("http")) continue;
          const h = u.hostname.replace(/^www\./, "");
          if (own.has(h)) continue;
          if (
            ["t.zsxq.com", "x.com", "twitter.com", "youtube.com",
             "weibo.com", "space.bilibili.com", "t.co"].includes(h)
          ) continue;
          externals.push({ href: a.href, text: (a.textContent || "").trim() });
        } catch {}
      }
      return { title, text: text.slice(0, 4000), dateText: dateMatch?.[0] || null, externals };
    });
    return data;
  } finally {
    await ctx.close();
  }
}

function normalizeDate(dateText) {
  if (!dateText) return null;
  // "2026/05/07" → ISO
  const m = dateText.match(/(\d{4})\/(\d{2})\/(\d{2})/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}T00:00:00.000Z`;
}

// Pull a reasonable item summary from the detail page text. The first 600
// chars after the title typically contain editor commentary + bullets.
function extractSummary(allText, title) {
  if (!allText) return "";
  let s = allText;
  if (title) {
    const idx = s.indexOf(title);
    if (idx >= 0) s = s.slice(idx + title.length);
  }
  // Strip menu noise that leaks in
  s = s.replace(/AI方案库\s*AI日报\s*AI产品[\s\S]*?关于我们/g, "");
  s = s.replace(/会员社区[\s\S]*?我要定制/g, "");
  s = s.replace(/跳至内容/g, "");
  s = s.replace(/隐藏描述/g, "");
  return trim(s.replace(/\s+/g, " ").trim(), 600);
}

async function runPool(items, worker, concurrency) {
  const out = new Array(items.length);
  let i = 0;
  async function next() {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      try {
        out[idx] = await worker(items[idx], idx);
      } catch (err) {
        out[idx] = { error: err.message };
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, next));
  return out;
}

async function main() {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

  const t0 = Date.now();
  let detailLinks;
  try {
    detailLinks = await scrapeIndex(browser);
  } catch (err) {
    console.error("aigclink index scrape failed:", err.message);
    await browser.close();
    process.exit(1);
  }
  console.log(`aigclink index: ${detailLinks.length} detail pages found (${Date.now() - t0}ms)`);

  const results = await runPool(
    detailLinks,
    async (url, idx) => {
      const t = Date.now();
      const d = await scrapeDetail(browser, url);
      const upstream = d.externals.find((e) => e.href && !e.href.includes("aigclink.ai"));
      if (!upstream) {
        return { error: "no upstream", aigclinkUrl: url };
      }
      const { source, sourceName } = classifySource(upstream.href);
      const summary = extractSummary(d.text, d.title);
      const item = {
        source,
        sourceName,
        id: stableId(upstream.href),
        title: d.title,
        url: upstream.href,
        summary,
        category: null,
        publishedAt: normalizeDate(d.dateText),
        discoveredAt: new Date().toISOString(),
      };
      console.log(
        `  [${String(idx + 1).padStart(2)}/${detailLinks.length}] ${sourceName.padEnd(14)} ${(d.title || "(untitled)").slice(0, 50)}  (${Date.now() - t}ms)`,
      );
      return item;
    },
    CONCURRENCY,
  );

  await browser.close();

  const items = results.filter((r) => r && !r.error);
  const errors = results.filter((r) => r && r.error);

  const byHost = {};
  for (const it of items) {
    byHost[it.sourceName] = (byHost[it.sourceName] || 0) + 1;
  }

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(
    OUT_FILE,
    JSON.stringify(
      { fetchedAt: new Date().toISOString(), items },
      null,
      2,
    ),
  );

  console.log(`\naigclink extract: ${items.length} items, ${errors.length} errors`);
  console.log("by source:");
  for (const [s, n] of Object.entries(byHost).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${s.padEnd(18)} ${n}`);
  }
  console.log(`written -> ${path.relative(projectRoot, OUT_FILE)}`);
}

main().catch((err) => {
  console.error("aigclink extract failed:", err);
  process.exit(1);
});
