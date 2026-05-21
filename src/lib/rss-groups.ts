import type { LatestRss } from "./types";

/**
 * RSS content-type → group mapping for /latest page sectioning.
 *
 * Five buckets, classified deterministically at build time
 * (scripts/extract-content.mjs::classifyContentType) and stored on each
 * item as `contentType`:
 *
 *   research    — lab research blogs (Anthropic Research, research.google, ...)
 *   paper       — academic preprints (arXiv, HuggingFace Papers, Nature)
 *   engineering — technical how-tos / best practices (Anthropic Engineering,
 *                 claude.com/blog 工程类博客)
 *   news        — vendor product launches / company news (OpenAI, Anthropic
 *                 News, Google AI, NVIDIA, Meta AI, xAI, Mistral, CN vendors,
 *                 claude.com 产品类博客)
 *   oss         — indie open-source projects (GitHub repos, r/LocalLLaMA,
 *                 r/MachineLearning)
 *
 * Vendor (e.g., "Anthropic" merging News + Research + Engineering +
 * claude.com) is a separate filter axis exposed on each group page via
 * chip rows in LatestGroupView.
 */

export type RssGroupMeta = {
  id: string;
  label: string;
  subtitle: string;
  blurb: string;
  /** CSS var name from globals.css palette. Used for the small accent
   *  bar on section headers so groups are visually distinguishable. */
  accentVar: string;
};

/**
 * Canonical order — used for /latest top-nav, sitemap, and anywhere the
 * "logical depth-of-research" axis matters. From deepest (Research) to
 * widest (OSS).
 */
export const GROUP_ORDER: RssGroupMeta[] = [
  {
    id: "research",
    label: "Research",
    subtitle: "lab research blogs",
    blurb:
      "Anthropic、Google、DeepMind 等实验室的研究博客与对外发布的研究成果，覆盖 alignment、interpretability、scaling 等方向的工程化研究记录。",
    accentVar: "--color-cactus",
  },
  {
    id: "paper",
    label: "Paper",
    subtitle: "preprints & journals",
    blurb:
      "arXiv 上的 AI 相关预印本、HuggingFace Papers 当日精选与 Nature 等期刊发布的原始研究论文。",
    accentVar: "--color-cloud",
  },
  {
    id: "engineering",
    label: "Engineering",
    subtitle: "技术博客 / 最佳实践",
    blurb:
      "Anthropic Engineering 与 claude.com/blog 的工程类博客，含 prompt engineering、Computer Use、Claude Code、Skills 与 MCP 的最佳实践指南与故障复盘。",
    accentVar: "--color-coral",
  },
  {
    id: "news",
    label: "News",
    subtitle: "厂商一手公告",
    blurb:
      "OpenAI、Anthropic、Google AI、DeepMind、NVIDIA、Meta AI、xAI、Mistral 以及阿里、月之暗面、字节、智谱等厂商的产品发布、能力更新与企业合作公告。",
    accentVar: "--color-ember",
  },
  {
    id: "oss",
    label: "OSS",
    subtitle: "indie open source",
    blurb:
      "GitHub 上的独立开源 AI 项目与 r/LocalLLaMA、r/MachineLearning 社区里发酵的工具原型。",
    accentVar: "--color-heather",
  },
];

/**
 * Home page order — News first, then Engineering, then the longer-tail
 * Research / Paper / OSS. Studied anthropic.com/news and openai.com on
 * 2026-05-21: both put product/news content highest on the home and bury
 * research deeper. Visitor traffic skews to News so it leads here too;
 * the canonical GROUP_ORDER still drives nav + sitemap.
 */
export const HOME_GROUP_ORDER: string[] = [
  "news",
  "engineering",
  "research",
  "paper",
  "oss",
];

export function groupIdOf(contentType: string | undefined): string {
  return contentType ?? "news";
}

/**
 * Pick a single editorial hero for the /latest home page. Preference
 * order: highest score with an og:image and a publishedAt within the
 * last 30 days → highest score with an image (any age) → highest score
 * regardless of image → first item. Returns null only for an empty list.
 */
export function pickHero(rss: LatestRss[]): LatestRss | null {
  if (rss.length === 0) return null;
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const recent = rss.filter((it) => {
    if (it.score < 4 || !it.image) return false;
    const t = it.publishedAt ? Date.parse(it.publishedAt) : NaN;
    return Number.isFinite(t) && now - t <= thirtyDays;
  });
  if (recent.length > 0) return recent[0]; // already publishedAt desc
  const anyImage = rss.find((it) => it.score >= 4 && it.image);
  if (anyImage) return anyImage;
  const highScore = rss.find((it) => it.score >= 4);
  if (highScore) return highScore;
  return rss[0];
}

export function getGroupMeta(id: string): RssGroupMeta | undefined {
  return GROUP_ORDER.find((g) => g.id === id);
}

/**
 * Bucket rss[] by content-type group, preserving each bucket's original
 * (publishedAt desc) order. Empty buckets are dropped. Group ordering
 * follows GROUP_ORDER (canonical depth-of-research order).
 */
export function groupRss(
  rss: LatestRss[],
): Array<RssGroupMeta & { items: LatestRss[] }> {
  const bucket: Record<string, LatestRss[]> = {};
  for (const it of rss) {
    const gid = groupIdOf(it.contentType);
    if (!bucket[gid]) bucket[gid] = [];
    bucket[gid].push(it);
  }
  return GROUP_ORDER.filter((g) => (bucket[g.id]?.length ?? 0) > 0).map(
    (g) => ({ ...g, items: bucket[g.id] }),
  );
}

/**
 * Variant of groupRss for the /latest home feed. Orders groups by
 * HOME_GROUP_ORDER (News first) and optionally excludes one item id
 * (the hero card slot) so it doesn't render twice.
 */
export function groupRssForHome(
  rss: LatestRss[],
  excludeId?: string,
): Array<RssGroupMeta & { items: LatestRss[] }> {
  const bucket: Record<string, LatestRss[]> = {};
  for (const it of rss) {
    if (excludeId && it.id === excludeId) continue;
    const gid = groupIdOf(it.contentType);
    if (!bucket[gid]) bucket[gid] = [];
    bucket[gid].push(it);
  }
  return HOME_GROUP_ORDER
    .map((id) => GROUP_ORDER.find((g) => g.id === id))
    .filter(
      (g): g is RssGroupMeta => !!g && (bucket[g.id]?.length ?? 0) > 0,
    )
    .map((g) => ({ ...g, items: bucket[g.id] }));
}

/**
 * All rss items in a specific group, already publishedAt-desc sorted by
 * extract-content.mjs.
 */
export function itemsInGroup(rss: LatestRss[], groupId: string): LatestRss[] {
  return rss.filter((it) => groupIdOf(it.contentType) === groupId);
}
