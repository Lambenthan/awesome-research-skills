export type SkillItem = {
  slug: string;
  itemSlug: string; // URL slug within category
  repo: string;
  name: string;
  description: string;
  body?: string; // SKILL.md body (markdown after frontmatter), capped
  githubUrl: string;
  skillsShUrl: string;
  cn?: string; // optional curated Chinese intro
};

export type SkillCategory = {
  id: string;
  label: string;
  summary: string;
  items: SkillItem[];
};

export type RepoItem = {
  itemSlug: string; // URL slug within category
  owner?: string;
  name?: string;
  fullName: string;
  description?: string;
  readme?: string; // README.md excerpt, capped
  stars?: number;
  starsDelta7d?: number;
  forks?: number;
  language?: string | null;
  url?: string;
  homepage?: string | null;
  topics?: string[];
  license?: string | null;
  pushedAt?: string | null;
  createdAt?: string | null;
  fetchFailed?: boolean;
  cn?: string; // optional curated Chinese intro
};

export type RepoGroup = {
  id: string;
  label: string;
  summary: string;
  items: RepoItem[];
};

export type ReposData = {
  ai: RepoGroup[];
};

export type ArticleItem = {
  itemSlug: string; // URL slug within category
  title: string;
  url: string;
  source: string;
  date?: string;
  blurb?: string;
  cn?: string;
};

export type ArticleCategory = {
  id: string;
  label: string;
  summary: string;
  items: ArticleItem[];
};

export type NoteChapter = {
  num: string;
  title: string;
};

export type NoteItem = {
  itemSlug: string;
  title: string;
  subtitle?: string;
  author: string;
  date?: string;
  version?: string;
  pages?: number;
  kind: string;
  cover: string;
  pdf: string;
  cn?: string;
  chapters?: NoteChapter[];
};

export type NoteCategory = {
  id: string;
  label: string;
  summary: string;
  items: NoteItem[];
};

export type Meta = {
  builtAt: string;
};

export type HnItem = {
  id: string;
  title: string;
  url: string;
  points: number;
  comments: number;
  createdAt: string;
  author?: string;
};

export type LatestRepo = {
  id: number;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  pushedAt: string;
  createdAt: string;
  language: string | null;
};

export type LatestRss = {
  id: string;
  source: string;
  sourceName: string;
  // Display-level vendor — collapses same-company source variants
  // (e.g. "Anthropic News" / "Anthropic Research" / "Anthropic Engineering"
  // / "claude.com" all surface as "Anthropic"). Source stays available
  // for forensic detail.
  vendor: string;
  // Functional content type, classified deterministically in
  // scripts/extract-content.mjs from sourceName + URL pattern + slug
  // heuristics. Drives the /latest top-level grouping.
  contentType: "research" | "paper" | "engineering" | "news" | "oss";
  title: string;
  url: string;
  summary: string;
  category: string;
  score: number;
  cn: string;
  // Optional hand-written deep dive for the detail page. When absent the
  // detail page falls back to the short cn intro. Lives in
  // content/feed-detail.yml keyed by id and merged at extract time.
  detail?: string;
  // Optional og:image / twitter:image scraped from upstream URL. Used as
  // hero on the detail page. May be absent for sites that hide their
  // social card behind JS or Cloudflare.
  image?: string;
  publishedAt: string | null;
  discoveredAt: string;
};

export type LatestSnapshot = {
  fetchedAt: string | null;
  hn: HnItem[];
  gh: LatestRepo[];
  rss: LatestRss[];
};
