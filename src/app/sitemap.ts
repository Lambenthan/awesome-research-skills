import type { MetadataRoute } from "next";
import { CHAPTERS } from "@/lib/chapters";
import { articles, latest, notes, repos, skills } from "@/lib/data";

// Required for output: "export" — Next emits sitemap.xml as a static
// file only when the route is explicitly marked force-static.
export const dynamic = "force-static";

const SITE_ORIGIN = "https://lambenthan.github.io";
const SITE_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const SITE_URL = SITE_ORIGIN + SITE_BASE_PATH;

const NOW = new Date();

function url(path: string): string {
  // path already starts with /
  return SITE_URL + (path.endsWith("/") ? path : path + "/");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Top-level
  entries.push({ url: SITE_URL + "/", lastModified: NOW, priority: 1.0 });
  for (const path of [
    "/skills",
    "/ai",
    "/reading",
    "/notes",
    "/latest",
    "/latest/research",
    "/latest/paper",
    "/latest/engineering",
    "/latest/news",
    "/latest/oss",
  ]) {
    entries.push({ url: url(path), lastModified: NOW, priority: 0.8 });
  }

  // Skills: category + item
  for (const cat of skills) {
    entries.push({
      url: url(`/skills/${cat.id}`),
      lastModified: NOW,
      priority: 0.7,
    });
    for (const it of cat.items) {
      entries.push({
        url: url(`/skills/${cat.id}/${it.itemSlug}`),
        lastModified: NOW,
        priority: 0.6,
      });
    }
  }

  // AI repos
  for (const cat of repos.ai) {
    entries.push({
      url: url(`/ai/${cat.id}`),
      lastModified: NOW,
      priority: 0.7,
    });
    for (const it of cat.items) {
      entries.push({
        url: url(`/ai/${cat.id}/${it.itemSlug}`),
        lastModified: NOW,
        priority: 0.6,
      });
    }
  }

  // Reading articles
  for (const cat of articles) {
    entries.push({
      url: url(`/reading/${cat.id}`),
      lastModified: NOW,
      priority: 0.7,
    });
    for (const it of cat.items) {
      entries.push({
        url: url(`/reading/${cat.id}/${it.itemSlug}`),
        lastModified: NOW,
        priority: 0.6,
      });
    }
  }

  // Notes: book + chapter (highest content priority)
  for (const cat of notes) {
    entries.push({
      url: url(`/notes/${cat.id}`),
      lastModified: NOW,
      priority: 0.8,
    });
    for (const note of cat.items) {
      entries.push({
        url: url(`/notes/${cat.id}/${note.itemSlug}`),
        lastModified: NOW,
        priority: 0.9,
      });
    }
  }
  for (const ch of CHAPTERS) {
    entries.push({
      url: url(`/notes/${ch.categorySlug}/${ch.itemSlug}/${ch.slug}`),
      lastModified: NOW,
      priority: 0.7,
    });
  }

  // Latest detail pages (per-item)
  for (const it of latest.rss ?? []) {
    entries.push({
      url: url(`/latest/${it.id}`),
      lastModified: it.publishedAt
        ? new Date(it.publishedAt)
        : it.discoveredAt
          ? new Date(it.discoveredAt)
          : NOW,
      priority: 0.5,
    });
  }

  return entries;
}
