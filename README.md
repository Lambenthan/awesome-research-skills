# Field Notes · 田野笔记

研究路上的随手笔记。

线上：<https://lambenthan.github.io/field-notes/>

## 这是什么

一个克制的研究目录站，把日常工作里翻到的好东西放在一个地方：

- **Claude Code skill**：来自 `anthropics/skills`、`obra/superpowers`、
  `kepano/obsidian-skills`、`vercel-labs/skills` 等公开仓库，分 7 组整理
- **AI 开源项目**：Agent 框架、编码 agent、模型推理、RAG、对话 UI、SDK
- **科研生产力工具**：数据科学、统计因果、可视化、生信、写作发表、文献管理
- **Reading**：Agent 工程、研究索引、LLM 与上下文工程相关的长文
- **Latest**：HackerNews 与 GitHub Search 上最近的 AI 动向，每 6 小时由 cron 自动刷新

每一条都直链到原始来源（skills.sh / GitHub / 文章页），加上中文导读说明这是什么、
什么时候用得上。

定位上偏个人记录：未来会逐步加入更长的笔记 / 思考 / 项目进展类内容。

## 站点构成

数据在构建时抓取并生成静态 JSON，运行时没有后端：

- skill 描述从 `https://raw.githubusercontent.com/{owner}/{repo}/main/skills/{slug}/SKILL.md` 拉 frontmatter
- 仓库信息从 GitHub REST API 拉 star / 描述 / 语言 / topic / license
- 文章手工维护在 `content/featured-articles.yml`
- /latest 由 GitHub Actions cron 每 6 小时跑一次抓取脚本写入静态 JSON
- 中文导读由 `scripts/fill-cn.mjs` 调 GitHub Models 上的 DeepSeek-V3 生成，存在
  `content/cn-summaries.yml`，按 `~/.claude/skills/book-writing-default/SKILL.md`
  的红线规则过滤

## 本地开发

```sh
npm install
npm run dev          # http://localhost:3000
```

`predev` / `prebuild` 钩子会自动调 `npm run extract` 抓数据。

未授权调用 GitHub API 限速 60 次/小时，本地批量抓取或 CI 部署请设
`GITHUB_TOKEN`：

```sh
export GITHUB_TOKEN=$(gh auth token)
npm run extract
```

## 添加 / 编辑条目

**新增 skill / repo / article**：编辑对应的 `content/featured-*.yml`，加一行
`owner/repo/slug` 或文章元数据。再跑 `npm run extract` 验证抓得到。

**重写 / 修改中文导读**：

```sh
# 单独重写某几条
GITHUB_TOKEN=$(gh auth token) npm run fill-cn -- --overwrite \
  --keys "anthropic-docs/pdf,coding-agents/anthropics-claude-code"

# 全量重写
GITHUB_TOKEN=$(gh auth token) npm run fill-cn -- --overwrite

# 只补缺失的（cron 自动跑的就是这个）
GITHUB_TOKEN=$(gh auth token) npm run fill-cn -- --missing
```

也可以直接编辑 `content/cn-summaries.yml`——`fill-cn` 下次不会覆盖已有 cn，
除非显式 `--overwrite`。

## 部署

仓库自带 `.github/workflows/deploy.yml`：

- `push` 到 `main` 自动构建并发布到 GitHub Pages
- 每 6 小时 cron 跑一次刷新 star 数、HN/GH Search 最新条目，并自动给新增 item 补 cn
- workflow 用 `GITHUB_TOKEN`（runner 自动注入）调 GitHub API 和 GitHub Models

basePath 是 `/field-notes`，换仓库名要同步改 workflow 里的 `NEXT_PUBLIC_BASE_PATH`。

## 项目结构

```
content/                       # 手动维护的内容白名单
  featured-skills.yml          # owner/repo/slug 三元组
  featured-repos.yml           # AI 与科研仓库 owner/name
  featured-articles.yml        # 文章 title/url/source/blurb
  cn-summaries.yml             # 中文导读集中表
scripts/
  extract-content.mjs          # 抓 SKILL.md + GitHub API
  fill-cn.mjs                  # 用 DeepSeek-V3 生成 cn 导读
  star-history.json            # 30 天 star 快照（用来算 7d delta）
src/
  app/
    layout.tsx                 # 字体加载 + metadata
    page.tsx                   # Home landing
    skills,ai,research,reading,latest/   # 5 个顶级 section
  components/                  # NavBar / Footer / SectionView / DetailShell ...
  data/generated/              # build 产物（构建期生成）
  lib/                         # types + sections meta + slugify
.github/workflows/
  deploy.yml                   # cron + build + commit-back
next.config.ts                 # static export + basePath
```
