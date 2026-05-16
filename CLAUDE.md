# CLAUDE.md — Field Notes / 田野笔记

This file is the project-level brief for any Claude Code session working in
this repo. Read it before editing.

## What this site is

A Chinese-flavored research directory. Live at <https://lambenthan.github.io/field-notes/>.
Aggregates four content streams:

1. **Skills** — Claude Code skills from public repos (anthropics/skills,
   obra/superpowers, kepano/obsidian-skills, vercel-labs/skills,
   nextlevelbuilder/ui-ux-pro-max-skill).
2. **AI** — open-source AI projects (Coding agents / Agent frameworks /
   Model runtime / RAG / Chat UI / Dev toolkits).
3. **Research** — research productivity tools (Data core / Stats &
   causal / Viz / Bio / Writing & pubs / Notebooks / Reference mgmt).
4. **Reading** — research / engineering long-form writing (Anthropic,
   Google DeepMind, OpenAI, Antigravity etc).

A fifth surface — **/latest/** — is a live feed of HackerNews AI stories
and rising GitHub repos, refreshed every 6 hours by a cron-driven workflow.

**Personal vlog scope** — the maintainer plans to add a /notes/ or
/journal/ section later for personal writing. The current structure
already accommodates that (just register a new section in lib/sections.ts
and add a route).

## Tone / style rules (HARD CONSTRAINTS)

This site uses formal academic register, not personal blog tone. All
Chinese-facing copy — hero, section blurbs, category summaries, cn
导读, detail-page subtitles — must follow the **full** book-writing-default
ruleset (`~/.claude/skills/book-writing-default/SKILL.md`).

Red lines (any one match → rewrite):

- 不用 "不是 A 而是 B" 句式（任何变体）
- 不用 "至少三类 / 两件事 / 三件事 / 三阶段 / 三步" 数字量词引导
- 不用 itemize / 列表（cn 导读必须散文一段）
- 不用 "值得注意的是 / 综上所述 / 用一句话说 / 不难发现 / 显然 / 由此可见"
- 不用 "这不是 / 这并非" 否定前置
- 一段最多 1 个破折号
- 不用 "活生生 / 翻车 / 玄学 / 惊人的 / 伟大的" 渲染词
- 不用 "戏剧性 / 命运 / 奇迹 / 灵魂 / 核心本质 / 入场券" 戏剧形容
- 不用 "押注 / 保险绳 / 工具箱 / 账本 / 地图 / 导航" 隐喻动词
- 中文不夹全角括号注释（用 "X，简称 Y" 自然融入）
- 标题不文艺 / 不疑问句 / 不口语化（禁 "带你 / 教你 / 讲清 / 玩转 / 速览 / 一文读懂"）

Banned colloquial bits specific to this site (caught in real iterations):

- "拣到 / 翻到 / 冒出来 / 上榜的故事 / 好东西" — 太散文化
- "说人话的指南 / 真东西 / 干货" — 营销化
- "几乎绕不开 / 拿来做 / 跑通 / 很方便 / 接住 / 顺手" — 口语化
- "全流程 / 一站式 / 开箱即用 / 全方位 / 完整工作流 / 成熟的 / 主流的 / 专业的 / 高效" — AI 营销
- "特别适合 / 尤其适合 / 特别针对 / 特别擅长" — "特别 +" 是 AI 写中文最高发的口癖
- "通过 X 实现 Y / 借助 X 完成 Y / 利用 X 进行 Y" — 动宾倒装 AI 句

Positive patterns to use instead:

- 直接陈述项目做什么，第三人称
- 英文专名保留：Claude Code, Anthropic, MCP, RAG, LLM, agent, skill, prompt,
  pypdf, scikit-learn, Antigravity, GitHub Models, etc.
- 数字 + topic 词后跟具体能力（"覆盖 5 种 topic" OK; "三大功能" NO）
- 80–180 字的 cn 导读，散文一段

## Architecture

Next.js 16, App Router, TypeScript, Tailwind v4, **static export** (`output: "export"`).
Deployed to GitHub Pages at base path `/field-notes`. No runtime backend.

```
src/app/
  layout.tsx               next/font (Geist + Source Serif 4 + Geist Mono)
                           + jsdelivr LXGW WenKai Screen CSS link
  page.tsx                 Home (landing) — NavBar + Hero + Stats +
                           4 SectionPreview + LiveCallout + Footer
  globals.css              @theme tokens (cream/ink/ember), font stacks,
                           .display .eyebrow .card .reveal classes,
                           .prose-detail for markdown bodies
  skills/, ai/, research/, reading/
    page.tsx               section index (hero + SectionView)
    [slug]/page.tsx        category list (hero + CategoryView with rows)
    [slug]/[item]/page.tsx item detail (DetailShell + MarkdownBody)
  latest/page.tsx          live feed page (reads latest.json)

src/components/
  NavBar.tsx               5-link nav + GitHub link + mobile fallback row
  Footer.tsx               white-list reference + Source on GitHub
  Breadcrumb.tsx           Home / Section / Category / Item trail
  Reveal.tsx               IntersectionObserver fade-up wrapper, honors
                           prefers-reduced-motion
  SectionPreview.tsx       Home-page block per section (eyebrow + serif
                           title + subcategory list + Browse all →)
  LiveCallout.tsx          Home-page block for /latest/ (animated dot)
  SectionView.tsx          Section index grid: filter chips + search +
                           grouped cards. Handles all 4 content types
                           via discriminated union.
  CategoryView.tsx         Single-column editorial list with numbered
                           rows + Other-categories nav + Back link.
  SkillCard.tsx, SkillRow.tsx        Grid card / row for skills
  RepoCard.tsx, RepoRow.tsx          Grid card / row for repos
  ArticleCard.tsx, ArticleRow.tsx    Grid card / row for articles
  DetailShell.tsx          Item detail shell (breadcrumb + serif title +
                           cn paragraph + attribute table + body)
  MarkdownBody.tsx         react-markdown + remark-gfm for SKILL.md /
                           README bodies

src/lib/
  types.ts                 SkillItem, RepoItem, ArticleItem, LatestSnapshot
                           — all carry itemSlug for URL routing
  sections.ts              SECTION_META map keyed by SectionId (skills /
                           ai / research / reading); getCategory(),
                           getItem(), allItemParams() helpers
  data.ts                  Imports the 4 JSON files generated by extract
  slugify.ts               URL-safe slug helpers
```

## Data pipeline

```
content/featured-*.yml   →   scripts/extract-content.mjs   →   src/data/generated/*.json
                                                                       ↓
content/cn-summaries.yml ────────────────────────────────────→  merged in by extract
                              ↑
                              fill-cn.mjs (GitHub Models / DeepSeek-V3)
```

White-list YAML files (hand-edited):

- `content/featured-skills.yml` — `{slug, repo}` per skill, grouped by category
- `content/featured-repos.yml`  — `owner/name` per repo, grouped under ai/research sections
- `content/featured-articles.yml` — `{title, url, source, blurb, date?}` per article
- `content/cn-summaries.yml`    — flat map `"category-slug/item-slug": cn-text`

Build-time scripts:

- `scripts/extract-content.mjs`
  - Skills: fetch each SKILL.md from raw.githubusercontent.com, parse frontmatter,
    capture body (first 8KB)
  - Repos: call GitHub REST API per repo, fetch README (first 5KB), compute
    7-day star delta against `scripts/star-history.json`
  - Articles: read YAML directly
  - Latest: query HN Algolia (per-keyword, dedupe) + GitHub Search (per-topic,
    dedupe); filter HN titles through an AI-keyword regex
  - Merges `cn-summaries.yml` into each item by `${categorySlug}/${itemSlug}` key
  - Writes `skills.json / repos.json / articles.json / latest.json / meta.json`
  - Caches: `scripts/.cache/github.json` (24h TTL) + `skill-md.json`

- `scripts/fill-cn.mjs`
  - Reads generated JSON, finds items where `cn` is empty (or all in
    `--overwrite` mode)
  - System prompt inlines the **full** book-writing-default skill verbatim
    plus item-summary adaptation header + 18-pattern banned-phrase list
  - Three few-shot examples (one each for skill / repo / article)
  - 18 regex validators run on every output (red lines + length 60–240
    + max 1 dash). Hit → 1 retry with stricter feedback. Second hit → skip.
  - GitHub Models endpoint `https://models.github.ai/inference/chat/completions`
    via `GITHUB_TOKEN`; default `deepseek/DeepSeek-V3-0324`, override with
    `GH_MODEL=openai/gpt-4o-mini` env
  - Pacing: 12 RPM target; respects `retry-after` header for 429
  - Args: `--missing` (default) / `--overwrite` / `--keys k1,k2` / `--limit N`
    / `--dry-run`

## Workflow / CI

`.github/workflows/deploy.yml`:

- Triggers: push to main, manual dispatch, schedule `0 */6 * * *`
- Permissions: `contents: write`, `pages: write`, `id-token: write`,
  `models: read`
- Build env: `NEXT_PUBLIC_BASE_PATH: /field-notes`, `GITHUB_TOKEN`
- On schedule:
  1. `npm run extract` (fresh data)
  2. `npm run fill-cn -- --missing` (with `GH_MODEL: deepseek/DeepSeek-V3-0324`)
  3. `npm run build` (prebuild re-runs extract so new cn merges into JSON)
- Commit-back step (schedule only) stages:
  - `scripts/star-history.json` (30-day snapshot retention)
  - `src/data/generated/latest.json`
  - `src/data/generated/repos.json`
  - `content/cn-summaries.yml`
- Uses `git pull --rebase --autostash` before push to survive races

**Don't put `[skip ci]` (literal token) in commit body.** GitHub Actions
matches it anywhere in message and silently skips trigger. Use it ONLY in
subject line of automated commits, or paraphrase ("skip-tag tag") in bodies.

## Common operations

Add a new skill / repo / article — edit the matching `content/featured-*.yml`,
then:

```sh
GITHUB_TOKEN=$(gh auth token) npm run extract  # verify fetched
git add content/ src/data/generated/
git commit -m "Add ..."
git push
```

Regenerate cn for specific items:

```sh
GITHUB_TOKEN=$(gh auth token) npm run fill-cn -- --overwrite \
  --keys "anthropic-docs/pdf,coding-agents/anthropics-claude-code"
```

Full cn regenerate (~11 min at 12 RPM, needs fresh DeepSeek-V3 daily quota):

```sh
GITHUB_TOKEN=$(gh auth token) npm run fill-cn -- --overwrite
```

Local dev:

```sh
npm install
GITHUB_TOKEN=$(gh auth token) npm run dev    # http://localhost:3000
```

Typecheck + build:

```sh
npx tsc --noEmit
SKIP_GITHUB=1 npm run build       # uses cached JSON; faster
```

## Identity / branding rules

- **Site name** in user-facing copy: "Field Notes" (English) or
  "Field Notes · 田野笔记" (bilingual). 不再用 "Awesome Research Skills".
- **GitHub repo**: `Lambenthan/field-notes` (was `awesome-research-skills`;
  GitHub auto-redirects the old repo URL for ~1 year, but Pages path
  `/awesome-research-skills/` returns 404)
- **Maintainer alias** for any public artifact: **Chanw**. 不写真名 / 不写就读高校
- **Commit messages** on this public repo must read like 一气呵成的成稿;
  **禁加 `Co-Authored-By Claude` 或任何 AI 协作痕迹**

## CJK font

Loaded via jsdelivr `lxgw-wenkai-screen-webfont`. The Screen variant has
strokes adjusted for screen rendering — sharper at 10–16px than the
default WenKai. Fallback chain in `globals.css`:

```
LXGW WenKai Screen → LXGW WenKai → 霞鹜文楷 → PingFang SC → Source Han Sans SC → ...
```

A second variable `--font-cn-display` is reserved for long-form essay
contexts that may want non-Screen WenKai (slightly more delicate).
Currently unused.

## Known gotchas

- **GH Models free tier is much stricter than documented.** DeepSeek-V3-0324
  hits its daily quota after ~15 requests under sustained load with
  retry-after = 86400s. gpt-4o-mini has separate quota with faster
  throughput but less native Chinese. Plan bulk runs around when daily
  quota is fresh.
- **Cron + push race**: schedule runs every 6h commit-back data files;
  if a push lands during that window, the post-build commit-back will
  push-conflict. The workflow uses `git pull --rebase --autostash` to
  handle it.
- **`[skip ci]` in commit body** silently skips workflow trigger — already
  burned twice; avoid the literal token outside subjects.
- **react-markdown** is loaded for SKILL.md + README rendering on detail
  pages. Styles live in `.prose-detail` in globals.css.
- **GitHub Pages doesn't auto-redirect old paths** after repo rename;
  only the repo URL redirects. Don't share old `awesome-research-skills`
  URLs publicly.

## Outstanding work

- [ ] **Bulk regenerate all 134 cn导读** with fresh DeepSeek-V3 quota
      (run `npm run fill-cn -- --overwrite` locally tomorrow when free
      tier resets). The current 134 entries were written by Claude
      subagents in a prior pass and contain some colloquial phrases
      ("绕不开 / 拿来做 / 跑通 / 很方便") that the new strict prompt would
      fix.
- [ ] **Compare detail-page layout against Anthropic's site** using
      web-access skill (CDP), then iterate on attribute table /
      breadcrumb / sibling-nav placements.
- [ ] **Add /notes/ or /journal/ top-level section** when maintainer has
      personal-writing content ready.
- [ ] Consider adding LXGW WenKai Light weight (load
      `lxgw-wenkai-webfont/lxgwwenkai-light.css`) for hero `.display`
      headlines via `font-weight: 300` if elegant variant wanted.
