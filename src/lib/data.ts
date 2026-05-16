import type {
  ArticleCategory,
  Meta,
  ReposData,
  SkillCategory,
} from "./types";
import skillsJson from "@/data/generated/skills.json";
import reposJson from "@/data/generated/repos.json";
import articlesJson from "@/data/generated/articles.json";
import metaJson from "@/data/generated/meta.json";

export const skills = skillsJson as SkillCategory[];
export const repos = reposJson as ReposData;
export const articles = articlesJson as ArticleCategory[];
export const meta = metaJson as Meta;
