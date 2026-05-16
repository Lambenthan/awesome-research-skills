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
const OUT_DIR = path.join(projectRoot, "src", "data", "generated");
const CACHE_DIR = path.join(projectRoot, "scripts", ".cache");
const REPO_CACHE_FILE = path.join(CACHE_DIR, "github.json");
const SKILL_CACHE_FILE = path.join(CACHE_DIR, "skill-md.json");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

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

async function extractRepos() {
  const config = await readYaml(FEATURED_REPOS);
  const cache = await loadJsonCache(REPO_CACHE_FILE);
  const result = {};
  for (const section of ["ai", "research"]) {
    const groups = config[section] || [];
    const out = [];
    for (const group of groups) {
      const items = [];
      for (const fullName of group.repos || []) {
        const data = await fetchRepo(fullName, cache);
        if (!data) continue;
        items.push(data);
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
  const totalAi = result.ai.reduce((n, g) => n + g.items.length, 0);
  const totalResearch = result.research.reduce((n, g) => n + g.items.length, 0);
  console.log(`  repos: ${totalAi} ai + ${totalResearch} research`);
  return result;
}

async function main() {
  console.log("extract-content: fetching public skills + GitHub repos");
  await fs.mkdir(OUT_DIR, { recursive: true });
  const [skills, repos] = await Promise.all([extractSkills(), extractRepos()]);
  await fs.writeFile(
    path.join(OUT_DIR, "skills.json"),
    JSON.stringify(skills, null, 2),
  );
  await fs.writeFile(
    path.join(OUT_DIR, "repos.json"),
    JSON.stringify(repos, null, 2),
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
