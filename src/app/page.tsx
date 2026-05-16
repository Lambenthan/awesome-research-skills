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
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-5">
          <a href="/" className="group inline-flex items-baseline gap-2">
            <span className="font-serif text-[19px] italic leading-none text-ink">
              Awesome Research Skills
            </span>
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow transition hover:text-ink"
          >
            GitHub →
          </a>
        </div>
      </header>

      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-16">
          <p className="eyebrow">公开来源 · An awesome list</p>
          <h1 className="display mt-5 text-[44px] text-ink sm:text-6xl md:text-[72px]">
            为科研挑出来的 <em>skill</em>
            <br />
            与<em>开源项目</em>。
          </h1>
          <p className="mt-7 max-w-xl text-[15px] leading-[1.7] text-ink-muted">
            来自 <span className="font-mono text-[13px] text-ink">anthropics/skills</span>、
            <span className="font-mono text-[13px] text-ink">obra/superpowers</span>
            等公开仓库的 Claude Code skill，加上 AI 与科研方向的高星开源项目。
            每张卡片直链 skills.sh 详情页与 GitHub 源目录，
            看一眼 SKILL.md 再决定要不要装。
          </p>
        </div>
      </section>

      <section className="border-b border-rule bg-cream-surface/40">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <dl className="flex flex-wrap items-baseline gap-x-12 gap-y-3">
            <Stat label="Skills" value={totalSkills} />
            <Stat label="AI repos" value={totalAi} />
            <Stat label="Research tools" value={totalResearch} />
            <div className="ml-auto eyebrow">
              Updated <span className="text-ink">{buildDate}</span>
            </div>
          </dl>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pt-10 pb-20">
        <Browser skills={skills} repos={repos} />
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6">
          <p className="eyebrow">
            白名单 ·{" "}
            <span className="font-mono normal-case tracking-normal text-ink-muted">
              content/featured-skills.yml
            </span>
            {" + "}
            <span className="font-mono normal-case tracking-normal text-ink-muted">
              content/featured-repos.yml
            </span>
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow transition hover:text-ink"
          >
            Source on GitHub →
          </a>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="font-serif text-[26px] leading-none text-ink">
        {value}
      </span>
      <span className="eyebrow">{label}</span>
    </div>
  );
}
