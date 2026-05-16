import type {
  ArticleCategory,
  ReposData,
  SkillCategory,
  RepoGroup,
} from "./types";
import { articles, repos, skills } from "./data";

export type SectionId = "skills" | "ai" | "research" | "reading";

export type SectionMeta = {
  id: SectionId;
  href: string;
  eyebrow: string;
  title: string;
  blurb: string;
};

export const SECTION_META: Record<SectionId, SectionMeta> = {
  skills: {
    id: "skills",
    href: "/skills",
    eyebrow: "Claude Code Skills",
    title: "公开仓库收录的 skill",
    blurb:
      "来自 anthropics/skills、obra/superpowers 等公开仓库的 Claude Code skill，按 7 类整理。每条直链 skills.sh 详情页与 GitHub 源目录。",
  },
  ai: {
    id: "ai",
    href: "/ai",
    eyebrow: "AI Open Source",
    title: "AI 方向的高星开源项目",
    blurb:
      "Agent 框架、模型推理、RAG 检索、对话 UI、编码 agent——按方向归组，按 star 排序，每日构建刷新数据。",
  },
  research: {
    id: "research",
    href: "/research",
    eyebrow: "Research Tools",
    title: "科研生产力工具",
    blurb:
      "数据科学、统计因果、可视化、生信单细胞、写作发表、Notebook、文献管理——研究每个阶段都能找到对应的开源工具。",
  },
  reading: {
    id: "reading",
    href: "/reading",
    eyebrow: "Reading",
    title: "Agent 与 LLM 的真东西",
    blurb:
      "Anthropic、Google DeepMind、OpenAI、Antigravity 等一手研究/工程长文，与社区里少数说人话的 LLM 工程指南。",
  },
};

export function getSectionGroups(
  section: SectionId,
): SkillCategory[] | RepoGroup[] | ArticleCategory[] {
  if (section === "skills") return skills;
  if (section === "ai") return repos.ai;
  if (section === "research") return repos.research;
  return articles;
}

export function getCategory(section: SectionId, slug: string) {
  const groups = getSectionGroups(section);
  return groups.find((g) => g.id === slug) ?? null;
}

export function getItem(
  section: SectionId,
  categorySlug: string,
  itemSlug: string,
) {
  const cat = getCategory(section, categorySlug);
  if (!cat) return null;
  // SkillItem / RepoItem / ArticleItem all carry an itemSlug field.
  const items = cat.items as Array<{ itemSlug?: string }>;
  return items.find((it) => it.itemSlug === itemSlug) ?? null;
}

/** All { categorySlug, itemSlug } pairs for generateStaticParams. */
export function allItemParams(section: SectionId) {
  const groups = getSectionGroups(section);
  const out: { slug: string; item: string }[] = [];
  for (const g of groups) {
    for (const it of g.items as Array<{ itemSlug?: string }>) {
      if (it.itemSlug)
        out.push({ slug: g.id, item: it.itemSlug });
    }
  }
  return out;
}

export function getSectionCount(section: SectionId): number {
  const groups = getSectionGroups(section);
  return groups.reduce((n, g) => n + g.items.length, 0);
}

export const ALL_SECTIONS: SectionId[] = ["skills", "ai", "research", "reading"];
