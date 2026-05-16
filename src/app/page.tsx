import { Footer } from "@/components/Footer";
import { LiveCallout } from "@/components/LiveCallout";
import { NavBar } from "@/components/NavBar";
import { Reveal } from "@/components/Reveal";
import { SectionPreview } from "@/components/SectionPreview";
import { articles, meta, repos, skills } from "@/lib/data";
import { SECTION_META } from "@/lib/sections";

export default function Home() {
  const skillCats = skills.map((c) => ({
    id: c.id,
    label: c.label,
    count: c.items.length,
  }));
  const aiCats = repos.ai.map((g) => ({
    id: g.id,
    label: g.label,
    count: g.items.length,
  }));
  const researchCats = repos.research.map((g) => ({
    id: g.id,
    label: g.label,
    count: g.items.length,
  }));
  const readingCats = articles.map((c) => ({
    id: c.id,
    label: c.label,
    count: c.items.length,
  }));
  const totalSkills = skillCats.reduce((n, c) => n + c.count, 0);
  const totalAi = aiCats.reduce((n, c) => n + c.count, 0);
  const totalResearch = researchCats.reduce((n, c) => n + c.count, 0);
  const totalReading = readingCats.reduce((n, c) => n + c.count, 0);
  const buildDate = meta.builtAt
    ? new Date(meta.builtAt).toISOString().slice(0, 10)
    : "—";

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />

      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-16">
          <Reveal>
            <p className="eyebrow">公开来源 · An awesome list</p>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="display mt-5 text-[44px] text-ink sm:text-6xl md:text-[72px]">
              为科研挑出来的 <em>skill</em>
              <br />
              与<em>开源项目</em>。
            </h1>
          </Reveal>
          <Reveal delay={260}>
            <p className="mt-7 max-w-xl text-[15px] leading-[1.7] text-ink-muted">
              来自{" "}
              <span className="font-mono text-[13px] text-ink">
                anthropics/skills
              </span>
              、
              <span className="font-mono text-[13px] text-ink">
                obra/superpowers
              </span>{" "}
              等公开仓库的 Claude Code skill，加上 AI 与科研方向的高星开源项目。
              每张卡片直链 skills.sh 详情页与 GitHub 源目录。
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-rule bg-cream-surface/40">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <Reveal>
            <dl className="flex flex-wrap items-baseline gap-x-12 gap-y-3">
              <Stat label="Skills" value={totalSkills} />
              <Stat label="AI repos" value={totalAi} />
              <Stat label="Research tools" value={totalResearch} />
              <Stat label="Reading" value={totalReading} />
              <div className="ml-auto eyebrow">
                Updated <span className="text-ink">{buildDate}</span>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <Reveal>
          <LiveCallout />
        </Reveal>
        <Reveal>
          <SectionPreview
            meta={SECTION_META.skills}
            total={totalSkills}
            categories={skillCats}
          />
        </Reveal>
        <Reveal>
          <SectionPreview
            meta={SECTION_META.ai}
            total={totalAi}
            categories={aiCats}
          />
        </Reveal>
        <Reveal>
          <SectionPreview
            meta={SECTION_META.research}
            total={totalResearch}
            categories={researchCats}
          />
        </Reveal>
        <Reveal>
          <SectionPreview
            meta={SECTION_META.reading}
            total={totalReading}
            categories={readingCats}
          />
        </Reveal>
      </main>

      <Footer />
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
