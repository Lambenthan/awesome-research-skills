import { Browser } from "@/components/Browser";
import { meta, repos, skills } from "@/lib/data";

const REPO_URL = "https://github.com/Lambenthan/awesome-research-skills";

export default function Home() {
  const totalSkills = skills.reduce((n, c) => n + c.items.length, 0);
  const totalAi = repos.ai.reduce((n, g) => n + g.items.length, 0);
  const totalResearch = repos.research.reduce((n, g) => n + g.items.length, 0);
  const buildDate = meta.builtAt
    ? new Date(meta.builtAt).toISOString().slice(0, 10)
    : "—";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-stone-900">
              Awesome Research Skills
            </h1>
            <p className="text-sm text-stone-500">
              科研向 Claude Code skill 与开源项目的集散地
            </p>
          </div>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 transition hover:border-stone-400"
          >
            GitHub
          </a>
        </div>
      </header>

      <section className="border-b border-stone-200 bg-gradient-to-b from-white to-stone-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="max-w-2xl text-base leading-relaxed text-stone-700">
            收录三类资源：来自公开 GitHub 仓库的 Claude Code skill、
            AI 方向高星开源项目，以及科研生产力工具仓库。
            每张 skill 卡片都直链到{" "}
            <a
              href="https://skills.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              skills.sh
            </a>{" "}
            和原始 GitHub 目录，方便你看一眼 SKILL.md 再决定要不要装。
          </p>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-stone-600">
            <span>
              <strong className="text-stone-900">{totalSkills}</strong> 个 skill
            </span>
            <span>
              <strong className="text-stone-900">{totalAi}</strong> 个 AI 项目
            </span>
            <span>
              <strong className="text-stone-900">{totalResearch}</strong>{" "}
              个科研工具
            </span>
            <span className="text-stone-400">数据构建于 {buildDate}</span>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <Browser skills={skills} repos={repos} />
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-stone-500">
          内容白名单见仓库 <code className="font-mono">content/featured-skills.yml</code> 与{" "}
          <code className="font-mono">content/featured-repos.yml</code>。
        </div>
      </footer>
    </div>
  );
}
