# Awesome Research Skills

科研向 Claude Code skill 与开源项目的集散地。

线上版本：<https://lambenthan.github.io/awesome-research-skills/>

## 为什么做这个

平时跑科研项目要用的东西散得到处都是：Claude Code 里装了一堆 skill，
但叫什么、能干什么、什么时候用得上，过两周就忘；GitHub 上的好仓库
（Agent 框架、模型推理、单细胞、因果推断、Zotero 插件……）也是看到一个收藏一个，
最后躺在浏览器书签里再也找不到。

这个站点用来集中收 **两类东西**：

1. 真正用得上、并且**已经在公开仓库发布**的 Claude Code skill。每条都标着
   它的来源仓库（`anthropics/skills`、`obra/superpowers` 等），点卡片直接跳到
   skills.sh 的详情页 + GitHub 源目录 —— 你能看到 SKILL.md 原文再决定要不要装。
2. 高 star、还在活跃维护的 AI 与科研开源项目，按方向分组。

**只收公开来源**：站点本身不读你本地 `~/.claude/skills/`，也不会泄露你
没发布的 skill 描述；想新增条目就在白名单 YAML 里加 `owner/repo/slug`。

## 站点收的内容

- **来自公开仓库的 Claude Code skill**：分 7 组 ——
  Anthropic 官方文档处理 / 设计图形 / 开发与扩展、obra/superpowers 流程纪律、
  kepano/obsidian-skills、找 skill 装 skill、UI 与终端体验。
- **AI 方向高星开源项目**：Agent 框架 / 模型推理 / RAG 与检索 / 对话 UI。
- **科研生产力工具**：数据科学 / 统计因果 / 可视化 / 生信 / 写作发表 /
  Notebook 与轻应用 / 文献管理。

数据在 **构建时** 抓：

- skill 描述从 `https://raw.githubusercontent.com/{owner}/{repo}/main/skills/{slug}/SKILL.md`
  拉 frontmatter
- 仓库信息从 GitHub REST API 拉 star / 描述 / 语言 / topic / license

站点本身是纯静态的 Next.js 导出，部署到 GitHub Pages，不调用任何后端。

## 快速开始

```sh
npm install
npm run dev          # http://localhost:3000
```

`predev` / `prebuild` 钩子会自动调 `npm run extract`：

- 读 `content/featured-skills.yml`，对每个公开 skill 拉 `SKILL.md` 的 frontmatter，
  生成 `src/data/generated/skills.json`，并附上 `skills.sh` 详情页 + GitHub 源目录链接。
- 读 `content/featured-repos.yml`，调 GitHub API 拉每个仓库的 star / 描述，
  生成 `src/data/generated/repos.json`。响应缓存在 `scripts/.cache/`，24 小时内复用。

未授权调用 GitHub API 限速 60 次/小时。本地批量抓取或 CI 部署请设
`GITHUB_TOKEN`：

```sh
export GITHUB_TOKEN=ghp_xxx
npm run extract
```

## 添加 / 删除条目

**添加新 skill**（必须是公开仓库里的）：编辑 `content/featured-skills.yml`，
在对应分类下加一行：

```yaml
- { slug: pdf, repo: anthropics/skills }
```

只写 `slug` 和 `repo` 即可，路径默认按 `skills/<slug>/SKILL.md` 找。布局不同的可以加：

```yaml
- { slug: my-skill, repo: foo/bar, path: src/skills/my-skill, ref: dev }
```

跑一次 `npm run extract` 验证拉取成功，再 commit。

**添加新仓库**：编辑 `content/featured-repos.yml`，把 `owner/name`
加进 `ai` 或 `research` 下某个分组的 `repos` 列表。

## 部署

仓库已带 `.github/workflows/deploy.yml`：

- `push` 到 `main` 自动构建并发布到 GitHub Pages
- 每天 UTC 4:00 也会跑一次，刷新 star 数 / SKILL.md 描述
- CI 用 `GITHUB_TOKEN`（workflow 自动注入）调 API，不会撞 60/hr 限制

在 GitHub 仓库 Settings → Pages 把 Source 切到 “GitHub Actions” 即可生效。
basePath 默认是 `/awesome-research-skills`，换仓库名要同步改 workflow 里的
`NEXT_PUBLIC_BASE_PATH`。

## 项目结构

```
content/                  # 白名单 YAML（手动维护）
  featured-skills.yml     # owner/repo/slug 三元组
  featured-repos.yml      # owner/name
scripts/
  extract-content.mjs     # 拉公开 SKILL.md + GitHub API
src/
  app/
    layout.tsx
    page.tsx              # 首页 + 三个 tab
    globals.css
  components/
    Browser.tsx           # 客户端 tab + 搜索 + 分类过滤
    SkillCard.tsx         # 卡片直链 skills.sh / GitHub
    RepoCard.tsx
  data/generated/         # 构建产物
    skills.json
    repos.json
    meta.json
  lib/
    data.ts
    types.ts
next.config.ts            # static export + basePath
```
