import type {
  ArticleCategory,
  LatestSnapshot,
  Meta,
  NoteCategory,
  ReposData,
  SkillCategory,
} from "./types";
import skillsJson from "@/data/generated/skills.json";
import reposJson from "@/data/generated/repos.json";
import articlesJson from "@/data/generated/articles.json";
import notesJson from "@/data/generated/notes.json";
import latestJson from "@/data/generated/latest.json";
import metaJson from "@/data/generated/meta.json";

export const skills = skillsJson as SkillCategory[];
export const repos = reposJson as ReposData;
export const articles = articlesJson as ArticleCategory[];
export const notes = notesJson as NoteCategory[];
export const latest = latestJson as LatestSnapshot;
export const meta = metaJson as Meta;
