import type {
  ArticleCategory,
  NoteCategory,
  SkillCategory,
  RepoGroup,
} from "./types";
import { articles, notes, repos, skills } from "./data";

export type SectionId = "skills" | "ai" | "reading" | "notes";

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
      "Agent 框架、模型推理、RAG 检索、对话 UI、编码 agent，按研究方向归组、按 star 排序，由 6 小时构建周期刷新数据。",
  },
  reading: {
    id: "reading",
    href: "/reading",
    eyebrow: "Reading",
    title: "Agent 与 LLM 的研究长文",
    blurb:
      "Anthropic、Google DeepMind、OpenAI、Antigravity 等机构发布的一手研究与工程长文，以及社区在 LLM 与上下文工程方向的代表性写作。",
  },
  notes: {
    id: "notes",
    href: "/notes",
    eyebrow: "Research Notes",
    title: "因果推断与文本计量的研究随笔",
    blurb:
      "围绕因果推断、文本计量与人格心理学交叉方向的研究草稿与方法笔记。每篇以工作论文或方法纲要形式发布，附 PDF 全文与章节梗概，可直接下载或在浏览器内打开。",
  },
};

export function getSectionGroups(
  section: SectionId,
): SkillCategory[] | RepoGroup[] | ArticleCategory[] | NoteCategory[] {
  if (section === "skills") return skills;
  if (section === "ai") return repos.ai;
  if (section === "notes") return notes;
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

export const ALL_SECTIONS: SectionId[] = [
  "skills",
  "ai",
  "reading",
  "notes",
];
