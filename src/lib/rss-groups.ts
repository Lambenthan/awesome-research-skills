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

export function groupIdOf(contentType: string | undefined): string {
  return contentType ?? "news";
}

export function getGroupMeta(id: string): RssGroupMeta | undefined {
  return GROUP_ORDER.find((g) => g.id === id);
}

/**
 * Bucket rss[] by content-type group, preserving each bucket's original
 * (publishedAt desc) order. Empty buckets are dropped.
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
 * All rss items in a specific group, already publishedAt-desc sorted by
 * extract-content.mjs.
 */
export function itemsInGroup(rss: LatestRss[], groupId: string): LatestRss[] {
  return rss.filter((it) => groupIdOf(it.contentType) === groupId);
}
