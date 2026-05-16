export type SkillItem = {
  slug: string;
  repo: string;
  name: string;
  description: string;
  githubUrl: string;
  skillsShUrl: string;
};

export type SkillCategory = {
  id: string;
  label: string;
  summary: string;
  items: SkillItem[];
};

export type RepoItem = {
  owner?: string;
  name?: string;
  fullName: string;
  description?: string;
  stars?: number;
  starsDelta7d?: number;
  forks?: number;
  language?: string | null;
  url?: string;
  homepage?: string | null;
  topics?: string[];
  license?: string | null;
  pushedAt?: string | null;
  fetchFailed?: boolean;
};

export type RepoGroup = {
  id: string;
  label: string;
  summary: string;
  items: RepoItem[];
};

export type ReposData = {
  ai: RepoGroup[];
  research: RepoGroup[];
};

export type ArticleItem = {
  title: string;
  url: string;
  source: string;
  date?: string;
  blurb?: string;
};

export type ArticleCategory = {
  id: string;
  label: string;
  summary: string;
  items: ArticleItem[];
};

export type Meta = {
  builtAt: string;
};
