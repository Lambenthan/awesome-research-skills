import type { ReposData, SkillCategory, RepoGroup } from "./types";
import { repos, skills } from "./data";

export type SectionId = "skills" | "ai" | "research";

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
      "Agent 框架、模型推理、RAG 检索、对话 UI——按方向归组、按 star 排序，更新于每日构建。",
  },
  research: {
    id: "research",
    href: "/research",
    eyebrow: "Research Tools",
    title: "科研生产力工具",
    blurb:
      "数据科学、统计因果、可视化、生信单细胞、写作发表、Notebook、文献管理——研究每个阶段都能找到对应的开源工具。",
  },
};

export function getSectionGroups(section: SectionId): SkillCategory[] | RepoGroup[] {
  if (section === "skills") return skills;
  if (section === "ai") return repos.ai;
  return repos.research;
}

export function getCategory(section: SectionId, slug: string) {
  const groups = getSectionGroups(section);
  return groups.find((g) => g.id === slug) ?? null;
}

export function getSectionCount(section: SectionId): number {
  const groups = getSectionGroups(section);
  return groups.reduce((n, g) => n + g.items.length, 0);
}

export function isSkillSection(section: SectionId): section is "skills" {
  return section === "skills";
}

export const ALL_SECTIONS: SectionId[] = ["skills", "ai", "research"];
