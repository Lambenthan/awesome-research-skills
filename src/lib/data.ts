import type { Meta, ReposData, SkillCategory } from "./types";
import skillsJson from "@/data/generated/skills.json";
import reposJson from "@/data/generated/repos.json";
import metaJson from "@/data/generated/meta.json";

export const skills = skillsJson as SkillCategory[];
export const repos = reposJson as ReposData;
export const meta = metaJson as Meta;
