import type { LatestRss } from "./types";

/**
 * RSS source → group mapping for /latest page sectioning.
 *
 * Four buckets:
 *   - labs       OpenAI / Anthropic / Google AI / DeepMind / NVIDIA /
 *                Mistral / Meta AI / xAI plus Anthropic sub-domains
 *   - cn-vendors Alibaba, Moonshot, Xiaomi, Tencent, ByteDance, Zhipu,
 *                01.AI, MiniMax, Qwen and HuggingFace-hosted CN models
 *   - academia   arXiv, Nature, research.google, group research pages
 *   - oss        GitHub independent projects, indie tools (fallback)
 *
 * The discovery layer (whether an item was found via lab feed or via
 * AIGCLINK) is not exposed in the group taxonomy — visitors see
 * "中文厂商" the same way they see "AI Labs".
 */

export type RssGroupMeta = {
  id: string;
  label: string;
  subtitle: string;
  blurb: string;
  /** CSS var name from globals.css palette (--color-cactus / etc). Used
   *  by section headers to render a small accent bar so the four groups
   *  are visually distinguishable beyond just their label text. */
  accentVar: string;
};

export const SOURCE_GROUP_MAP: Record<string, string> = {
  OpenAI: "labs",
  Anthropic: "labs",
  "Google AI": "labs",
  DeepMind: "labs",
  NVIDIA: "labs",
  Mistral: "labs",
  "Meta AI": "labs",
  xAI: "labs",
  "claude.com": "labs",
  "code.claude.com": "labs",

  "Alibaba Cloud": "cn-vendors",
  "Moonshot Kimi": "cn-vendors",
  "Zhipu AI": "cn-vendors",
  "01.AI": "cn-vendors",
  StepFun: "cn-vendors",
  ByteDance: "cn-vendors",
  MiniMax: "cn-vendors",
  Xiaomi: "cn-vendors",
  Tencent: "cn-vendors",
  Qwen: "cn-vendors",
  HuggingFace: "cn-vendors",
  "mimo.xiaomi.com": "cn-vendors",
  ModelScope: "cn-vendors",

  arXiv: "academia",
  Nature: "academia",
  "research.google": "academia",
  "correr-zhou.github.io": "academia",
  "HuggingFace Papers": "academia",

  GitHub: "oss",
  "r/LocalLLaMA": "oss",
  "r/MachineLearning": "oss",
};

export const GROUP_ORDER: RssGroupMeta[] = [
  {
    id: "labs",
    label: "AI Labs",
    subtitle: "厂商一手发布",
    blurb:
      "OpenAI、Anthropic、DeepMind、Google AI、NVIDIA、Mistral、Meta AI、xAI 的官方公告，覆盖新模型与新能力发布。",
    accentVar: "--color-cloud",
  },
  {
    id: "cn-vendors",
    label: "中文厂商",
    subtitle: "Chinese vendors",
    blurb:
      "阿里通义、月之暗面、小米、智谱、字节、腾讯等中文厂商的模型与产品发布，含 HuggingFace 上托管的中文模型卡。",
    accentVar: "--color-coral",
  },
  {
    id: "academia",
    label: "学术",
    subtitle: "research & papers",
    blurb:
      "arXiv 预印本、Nature 等期刊以及研究机构博客（research.google 等）的 AI 相关原始研究。",
    accentVar: "--color-cactus",
  },
  {
    id: "oss",
    label: "开源 OSS",
    subtitle: "indie projects",
    blurb:
      "GitHub 上的独立开源项目，多为个人或小团队发起的工具与原型。长存的高 star 项目整理在 /ai 与 /research 两个 section 下，按主题归组。",
    accentVar: "--color-heather",
  },
];

export function groupIdOf(sourceName: string): string {
  return SOURCE_GROUP_MAP[sourceName] ?? "oss";
}

export function getGroupMeta(id: string): RssGroupMeta | undefined {
  return GROUP_ORDER.find((g) => g.id === id);
}

/**
 * Bucket rss[] by group, preserving each bucket's original (score-sorted)
 * order. Empty buckets are dropped.
 */
export function groupRss(
  rss: LatestRss[],
): Array<RssGroupMeta & { items: LatestRss[] }> {
  const bucket: Record<string, LatestRss[]> = {};
  for (const it of rss) {
    const gid = groupIdOf(it.sourceName);
    if (!bucket[gid]) bucket[gid] = [];
    bucket[gid].push(it);
  }
  return GROUP_ORDER.filter((g) => (bucket[g.id]?.length ?? 0) > 0).map(
    (g) => ({ ...g, items: bucket[g.id] }),
  );
}

/**
 * All rss items in a specific group, score-sorted (already done by
 * extract-content.mjs, so this is a simple filter).
 */
export function itemsInGroup(rss: LatestRss[], groupId: string): LatestRss[] {
  return rss.filter((it) => groupIdOf(it.sourceName) === groupId);
}
