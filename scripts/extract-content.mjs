#!/usr/bin/env node
/**
 * Build-time content pipeline.
 *
 *   1. Reads content/featured-skills.yml. Every entry refers to a public
 *      SKILL.md on GitHub (owner/repo/skills/<slug>/SKILL.md by default).
 *      The script fetches each one from raw.githubusercontent.com, parses
 *      YAML frontmatter (name / description), and writes
 *      src/data/generated/skills.json — including links to skills.sh and the
 *      GitHub source so the UI card is clickable.
 *
 *   2. Reads content/featured-repos.yml, calls the GitHub REST API for each
 *      `owner/name`, and writes src/data/generated/repos.json with stars,
 *      forks, description, language, topics, license.
 *
 * Cache:
 *   - scripts/.cache/github.json stores past API responses keyed by full name.
 *   - scripts/.cache/skill-md.json stores past SKILL.md fetches keyed by URL.
 *   - Both reuse a cached response if it is <24h old, or if the fresh fetch fails.
 *
 * Env:
 *   - GITHUB_TOKEN or GH_TOKEN — optional; raises rate limit from 60/hr to
 *     5000/hr. The workflow injects ${{ secrets.GITHUB_TOKEN }} automatically.
 *   - SKIP_GITHUB=1 — skip outgoing HTTP entirely (use cache only).
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const FEATURED_SKILLS = path.join(projectRoot, "content", "featured-skills.yml");
const FEATURED_REPOS = path.join(projectRoot, "content", "featured-repos.yml");
const FEATURED_ARTICLES = path.join(projectRoot, "content", "featured-articles.yml");
const OUT_DIR = path.join(projectRoot, "src", "data", "generated");
const CACHE_DIR = path.join(projectRoot, "scripts", ".cache");
const REPO_CACHE_FILE = path.join(CACHE_DIR, "github.json");
const SKILL_CACHE_FILE = path.join(CACHE_DIR, "skill-md.json");
// Long-lived star snapshots — committed to the repo (not in .cache/).
const STAR_HISTORY_FILE = path.join(projectRoot, "scripts", "star-history.json");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const HISTORY_RETAIN_MS = 30 * 24 * 60 * 60 * 1000;
const DELTA_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const FRONTMATTER_RE = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

async function readYaml(file) {
  const text = await fs.readFile(file, "utf8");
  return yaml.load(text);
}

async function loadJsonCache(file) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return {};
    throw err;
  }
}

async function saveJsonCache(file, cache) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(file, JSON.stringify(cache, null, 2));
}

function authHeaders() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "awesome-research-skills-build",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function rawSkillUrl({ repo, slug, path: subPath, ref }) {
  const branch = ref || "main";
  const dir = subPath || `skills/${slug}`;
  return `https://raw.githubusercontent.com/${repo}/${branch}/${dir}/SKILL.md`;
}

function githubSourceUrl({ repo, slug, path: subPath, ref }) {
  const branch = ref || "main";
  const dir = subPath || `skills/${slug}`;
  return `https://github.com/${repo}/tree/${branch}/${dir}`;
}

function skillsShUrl({ repo, slug }) {
  return `https://skills.sh/${repo}/${slug}`;
}

async function fetchSkillMd(entry, cache) {
  const url = rawSkillUrl(entry);
  const cached = cache[url];
  if (process.env.SKIP_GITHUB === "1" && cached) {
    return { ...cached.data, _source: "cache" };
  }
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { ...cached.data, _source: "cache-fresh" };
  }
  if (process.env.SKIP_GITHUB === "1") {
    return null;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  [warn] ${entry.repo}/${entry.slug}: HTTP ${res.status}`);
      if (cached) return { ...cached.data, _source: "cache-stale" };
      return null;
    }
    const text = await res.text();
    const m = text.match(FRONTMATTER_RE);
    if (!m) {
      console.warn(`  [warn] ${entry.repo}/${entry.slug}: no frontmatter`);
      return null;
    }
    const fm = yaml.load(m[1]) ?? {};
    const data = {
      name: typeof fm.name === "string" ? fm.name : entry.slug,
      description:
        typeof fm.description === "string" ? fm.description.trim() : "",
    };
    cache[url] = { fetchedAt: Date.now(), data };
    return { ...data, _source: "raw" };
  } catch (err) {
    console.warn(`  [warn] ${entry.repo}/${entry.slug}: ${err.message}`);
    if (cached) return { ...cached.data, _source: "cache-stale" };
    return null;
  }
}

async function extractSkills() {
  const config = await readYaml(FEATURED_SKILLS);
  const categories = config.categories || [];
  const cache = await loadJsonCache(SKILL_CACHE_FILE);
  const out = [];
  let total = 0;
  let missing = 0;
  for (const cat of categories) {
    const items = [];
    for (const entry of cat.items || []) {
      const data = await fetchSkillMd(entry, cache);
      if (!data) {
        missing += 1;
        continue;
      }
      items.push({
        slug: entry.slug,
        repo: entry.repo,
        name: data.name,
        description: data.description,
        githubUrl: githubSourceUrl(entry),
        skillsShUrl: skillsShUrl(entry),
      });
      total += 1;
    }
    out.push({
      id: cat.id,
      label: cat.label,
      summary: cat.summary || "",
      items,
    });
  }
  await saveJsonCache(SKILL_CACHE_FILE, cache);
  console.log(
    `  skills: ${total} fetched, ${missing} missing across ${out.length} categories`,
  );
  return out;
}

async function fetchRepo(fullName, cache) {
  const cached = cache[fullName];
  if (process.env.SKIP_GITHUB === "1" && cached) {
    return { ...cached.data, _source: "cache" };
  }
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { ...cached.data, _source: "cache-fresh" };
  }
  if (process.env.SKIP_GITHUB === "1") {
    return null;
  }
  const url = `https://api.github.com/repos/${fullName}`;
  try {
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) {
      console.warn(`  [warn] ${fullName}: HTTP ${res.status} ${res.statusText}`);
      if (cached) return { ...cached.data, _source: "cache-stale" };
      return { fullName, fetchFailed: true, status: res.status };
    }
    const json = await res.json();
    const data = {
      owner: json.owner?.login,
      name: json.name,
      fullName: json.full_name,
      description: json.description || "",
      stars: json.stargazers_count ?? 0,
      forks: json.forks_count ?? 0,
      language: json.language || null,
      url: json.html_url,
      homepage: json.homepage || null,
      topics: Array.isArray(json.topics) ? json.topics.slice(0, 8) : [],
      license: json.license?.spdx_id || null,
      pushedAt: json.pushed_at || null,
    };
    cache[fullName] = { fetchedAt: Date.now(), data };
    return { ...data, _source: "api" };
  } catch (err) {
    console.warn(`  [warn] ${fullName}: ${err.message}`);
    if (cached) return { ...cached.data, _source: "cache-stale" };
    return { fullName, fetchFailed: true, error: err.message };
  }
}

async function loadStarHistory() {
  try {
    const text = await fs.readFile(STAR_HISTORY_FILE, "utf8");
    const parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.snapshots)) {
      return { snapshots: [] };
    }
    return parsed;
  } catch (err) {
    if (err.code === "ENOENT") return { snapshots: [] };
    throw err;
  }
}

async function saveStarHistory(history) {
  await fs.writeFile(
    STAR_HISTORY_FILE,
    JSON.stringify(history, null, 2) + "\n",
  );
}

/**
 * Given the snapshots array, find the most recent snapshot taken at least
 * DELTA_WINDOW_MS ago for the given repo, and return current - old.
 * Returns null if no eligible historical reading exists yet.
 */
function computeStarsDelta7d(snapshots, fullName, currentStars) {
  if (currentStars === undefined || currentStars === null) return null;
  const cutoff = Date.now() - DELTA_WINDOW_MS;
  let oldStars = null;
  let oldAt = 0;
  for (const snap of snapshots) {
    const t = Date.parse(snap.fetchedAt);
    if (!Number.isFinite(t) || t > cutoff) continue;
    const v = snap.stars?.[fullName];
    if (typeof v !== "number") continue;
    if (t > oldAt) {
      oldAt = t;
      oldStars = v;
    }
  }
  if (oldStars === null) return null;
  return currentStars - oldStars;
}

async function extractRepos() {
  const config = await readYaml(FEATURED_REPOS);
  const cache = await loadJsonCache(REPO_CACHE_FILE);
  const history = await loadStarHistory();
  const currentSnapshot = {
    fetchedAt: new Date().toISOString(),
    stars: {},
  };
  const result = {};
  for (const section of ["ai", "research"]) {
    const groups = config[section] || [];
    const out = [];
    for (const group of groups) {
      const items = [];
      for (const fullName of group.repos || []) {
        const data = await fetchRepo(fullName, cache);
        if (!data) continue;
        const enriched = { ...data };
        if (typeof enriched.stars === "number") {
          currentSnapshot.stars[enriched.fullName] = enriched.stars;
          const delta = computeStarsDelta7d(
            history.snapshots,
            enriched.fullName,
            enriched.stars,
          );
          if (delta !== null) enriched.starsDelta7d = delta;
        }
        items.push(enriched);
      }
      items.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
      out.push({
        id: group.id,
        label: group.label,
        summary: group.summary || "",
        items,
      });
    }
    result[section] = out;
  }
  await saveJsonCache(REPO_CACHE_FILE, cache);

  // Snapshot retention: one entry per ~day. If the last snapshot is <12h old,
  // merge current readings into it (so a partial earlier run gets upgraded by
  // a later full run). Otherwise append a new snapshot. Then prune old.
  if (Object.keys(currentSnapshot.stars).length > 0) {
    const lastSnap = history.snapshots[history.snapshots.length - 1];
    const lastAt = lastSnap ? Date.parse(lastSnap.fetchedAt) : 0;
    if (lastSnap && Date.now() - lastAt < 12 * 60 * 60 * 1000) {
      lastSnap.stars = { ...lastSnap.stars, ...currentSnapshot.stars };
      lastSnap.fetchedAt = currentSnapshot.fetchedAt;
    } else {
      history.snapshots.push(currentSnapshot);
    }
    const cutoff = Date.now() - HISTORY_RETAIN_MS;
    history.snapshots = history.snapshots.filter(
      (s) => Date.parse(s.fetchedAt) >= cutoff,
    );
    await saveStarHistory(history);
    const latest = history.snapshots[history.snapshots.length - 1];
    console.log(
      `  star-history: ${history.snapshots.length} snapshots, latest has ${Object.keys(latest.stars).length} repos`,
    );
  }

  const totalAi = result.ai.reduce((n, g) => n + g.items.length, 0);
  const totalResearch = result.research.reduce((n, g) => n + g.items.length, 0);
  const withDelta = [...result.ai, ...result.research].reduce(
    (n, g) => n + g.items.filter((i) => i.starsDelta7d !== undefined).length,
    0,
  );
  console.log(
    `  repos: ${totalAi} ai + ${totalResearch} research (${withDelta} with 7d delta)`,
  );
  return result;
}

/**
 * Pull a snapshot of "what's hot right now" so the static site can render
 * a Latest page without making the visitor's browser fetch external APIs.
 *
 *   - HackerNews Algolia: AI/LLM/Claude/GPT/agent stories with >=10 points
 *     in the last few days. CORS-friendly + no auth needed.
 *   - GitHub Search: repos in agent/llm topics pushed in last 60 days with
 *     >=100 stars. Authenticated via GITHUB_TOKEN for higher rate limits.
 *
 * Failures degrade gracefully — we keep the previous snapshot if one exists.
 */
async function fetchLatest() {
  const outPath = path.join(OUT_DIR, "latest.json");
  let previous = { fetchedAt: null, hn: [], gh: [] };
  try {
    previous = JSON.parse(await fs.readFile(outPath, "utf8"));
  } catch {
    /* fine — first run */
  }
  if (process.env.SKIP_GITHUB === "1") {
    console.log("  latest: skipped (SKIP_GITHUB=1, keeping previous snapshot)");
    return previous;
  }

  const out = { fetchedAt: new Date().toISOString(), hn: [], gh: [] };

  // HackerNews — Algolia's advancedSyntax `OR` operator returns very few
  // results once combined with numericFilters. More reliable: run one
  // query per keyword and dedupe by objectID.
  try {
    const keywords = [
      "LLM",
      "Claude",
      "GPT",
      "agent",
      "OpenAI",
      "Anthropic",
      "Antigravity",
      "Gemini",
    ];
    const seen = new Map();
    for (const kw of keywords) {
      const url =
        "https://hn.algolia.com/api/v1/search_by_date?tags=story&query=" +
        encodeURIComponent(kw) +
        "&numericFilters=" +
        encodeURIComponent("points>=15") +
        "&hitsPerPage=20";
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const json = await res.json();
        for (const h of json.hits ?? []) {
          if (!h.url || !h.title) continue;
          if (!seen.has(h.objectID)) seen.set(h.objectID, h);
        }
      } catch {
        /* one keyword failing shouldn't tank the rest */
      }
    }
    out.hn = [...seen.values()]
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
      .slice(0, 15)
      .map((h) => ({
        id: h.objectID,
        title: h.title,
        url: h.url,
        points: h.points ?? 0,
        comments: h.num_comments ?? 0,
        createdAt: h.created_at,
        author: h.author,
      }));
  } catch (err) {
    console.warn(`  latest: HN ${err.message}`);
  }

  // GitHub Search — `topic:X OR topic:Y` returns 422; instead query each
  // topic separately and merge by repo id, deduplicating.
  try {
    const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const topics = ["llm", "ai-agent", "agentic", "coding-agent", "claude"];
    const all = new Map();
    for (const topic of topics) {
      try {
        const q = `topic:${topic} pushed:>${since} stars:>100`;
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=10`;
        const res = await fetch(url, { headers: authHeaders() });
        if (!res.ok) {
          console.warn(
            `  latest: GH topic:${topic} HTTP ${res.status} ${res.statusText}`,
          );
          continue;
        }
        const json = await res.json();
        for (const it of json.items ?? []) {
          if (!all.has(it.id)) all.set(it.id, it);
        }
      } catch (err) {
        console.warn(`  latest: GH topic:${topic} ${err.message}`);
      }
    }
    out.gh = [...all.values()]
      .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
      .slice(0, 15)
      .map((it) => ({
        id: it.id,
        fullName: it.full_name,
        description: it.description || "",
        url: it.html_url,
        stars: it.stargazers_count ?? 0,
        pushedAt: it.pushed_at,
        createdAt: it.created_at,
        language: it.language || null,
      }));
  } catch (err) {
    console.warn(`  latest: GH ${err.message}`);
  }

  // If both sources failed, fall back to previous snapshot rather than
  // emptying the page.
  if (out.hn.length === 0 && out.gh.length === 0 && previous.fetchedAt) {
    console.log("  latest: both sources empty, keeping previous snapshot");
    return previous;
  }
  console.log(`  latest: ${out.hn.length} hn + ${out.gh.length} gh`);
  return out;
}

async function extractArticles() {
  // Articles are static curated entries — no network fetch, just YAML → JSON.
  try {
    const config = await readYaml(FEATURED_ARTICLES);
    const categories = config.categories || [];
    const out = categories.map((c) => ({
      id: c.id,
      label: c.label,
      summary: c.summary || "",
      items: (c.items || []).map((it) => ({
        title: it.title,
        url: it.url,
        source: it.source,
        // YAML auto-parses dates to Date objects; keep ISO YYYY-MM-DD format.
        date:
          it.date instanceof Date
            ? it.date.toISOString().slice(0, 10)
            : it.date,
        blurb: it.blurb,
      })),
    }));
    const total = out.reduce((n, c) => n + c.items.length, 0);
    console.log(`  articles: ${total} across ${out.length} categories`);
    return out;
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("  articles: featured-articles.yml not present, skipping");
      return [];
    }
    throw err;
  }
}

async function main() {
  console.log("extract-content: fetching public skills + GitHub repos");
  await fs.mkdir(OUT_DIR, { recursive: true });
  const [skills, repos, articles, latest] = await Promise.all([
    extractSkills(),
    extractRepos(),
    extractArticles(),
    fetchLatest(),
  ]);
  await fs.writeFile(
    path.join(OUT_DIR, "skills.json"),
    JSON.stringify(skills, null, 2),
  );
  await fs.writeFile(
    path.join(OUT_DIR, "repos.json"),
    JSON.stringify(repos, null, 2),
  );
  await fs.writeFile(
    path.join(OUT_DIR, "articles.json"),
    JSON.stringify(articles, null, 2),
  );
  await fs.writeFile(
    path.join(OUT_DIR, "latest.json"),
    JSON.stringify(latest, null, 2),
  );
  await fs.writeFile(
    path.join(OUT_DIR, "meta.json"),
    JSON.stringify({ builtAt: new Date().toISOString() }, null, 2),
  );
  console.log(`extract-content: wrote ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
