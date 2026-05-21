import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Hairline } from "@/components/Hairline";
import { LiveCallout } from "@/components/LiveCallout";
import { NavBar } from "@/components/NavBar";
import { Reveal } from "@/components/Reveal";
import { SectionPreview } from "@/components/SectionPreview";
import { SplitReveal } from "@/components/SplitReveal";
import { articles, meta, notes, repos, skills } from "@/lib/data";
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
  const readingCats = articles.map((c) => ({
    id: c.id,
    label: c.label,
    count: c.items.length,
  }));
  const noteCats = notes.map((c) => ({
    id: c.id,
    label: c.label,
    count: c.items.length,
  }));
  const totalSkills = skillCats.reduce((n, c) => n + c.count, 0);
  const totalAi = aiCats.reduce((n, c) => n + c.count, 0);
  const totalReading = readingCats.reduce((n, c) => n + c.count, 0);
  const totalNotes = noteCats.reduce((n, c) => n + c.count, 0);
  const buildDate = meta.builtAt
    ? new Date(meta.builtAt).toISOString().slice(0, 10)
    : "—";

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />

      {/* Hero — short declarative slogan in sans, no lede paragraph.
          Echoes anthropic.com hero pattern of a single weighty
          statement instead of a marketing pitch. */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-[88rem] px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
          <Reveal>
            <p className="eyebrow">Field Notes · 田野笔记</p>
          </Reveal>
          <SplitReveal
            as="h1"
            text="通过 AI 拓展科研方法的边界"
            className="mt-7 font-sans text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.05] tracking-[-0.025em] text-ink"
          />
          <Reveal delay={260}>
            <p className="mt-7 font-serif italic text-[clamp(1rem,1.3vw,1.25rem)] text-ink-muted">
              晨瀚宇 · Independent research at the edge of AI &amp; methodology
            </p>
          </Reveal>
        </div>
      </section>

      {/* Featured research program — Glasswing-style entry to /research.
          Big serif H2 carries the project name; visit-the-program CTA
          links to the dedicated page. */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-[88rem] px-6 py-24 sm:py-32">
          <Reveal>
            <p className="eyebrow text-ink-subtle">
              Featured · Research Program
            </p>
          </Reveal>
          <SplitReveal
            as="h2"
            text="人格因果学"
            className="mt-6 font-serif text-[clamp(3rem,7vw,6rem)] leading-[1.02] tracking-[-0.028em] text-ink"
          />
          <Reveal delay={200}>
            <p className="mt-4 font-serif italic text-[clamp(1.1rem,1.4vw,1.5rem)] text-ink-muted">
              Personality Causality
            </p>
          </Reveal>
          <Reveal delay={320}>
            <p className="mt-8 max-w-2xl font-fluid-lede leading-[1.7] text-ink">
              把因果识别的语汇移植到不能做随机化实验的研究对象。
            </p>
          </Reveal>
          <Reveal delay={440}>
            <Link
              href="/research"
              className="group mt-10 inline-flex items-baseline gap-2 eyebrow text-ember transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
            >
              Read the program{" "}
              <span aria-hidden="true" className="link-arrow">
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* About 晨瀚宇 — first-person, sophisticated tone modeled on the
          Anthropic mission block. Three concise paragraphs. */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
          <Reveal>
            <p className="eyebrow text-ink-subtle">About</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-6 font-serif text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.1] tracking-[-0.02em] text-ink">
              我是晨瀚宇
            </h2>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-8 space-y-5 font-fluid-body leading-[1.9] text-ink">
              <p>
                研究方法在人格、会计与因果推断医学三个领域的交汇处。我关心方法本身的边界——什么样的研究对象本来不能做随机化实验，用哪些识别策略可以重新可解。
              </p>
              <p>
                近两年我在做一种统一的练习：单一数据集 × 多种方法并联演练 × 章末累积对比。第一份研究处理王阳明与苏轼的全集语料，把贬谪当作可识别的人格干预点；第二份在 Compustat / AAER 面板上比较舞弊检测与盈余管理的方法谱系；第三份在 Connors 等人 1996 年发表的右心导管数据上比较九种因果推断方法。
              </p>
              <p>
                这份网站收录我用过的工具、读过的论文、写过的书稿，与每天跟踪的 AI 一手动态。
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mission statement as a single oversized H2 — anthropic.com
          uses the same pattern with their "At Anthropic, we build AI
          to serve humanity's long-term well-being." line. A hairline
          above the H2 expands from center on reveal. */}
      <section className="border-b border-rule bg-cream-surface/30">
        <div className="mx-auto max-w-[88rem] px-6 py-32 sm:py-40">
          <Hairline className="mb-12 max-w-[12rem]" />
          <Reveal delay={200}>
            <h2 className="font-serif text-[clamp(2rem,4vw,4rem)] leading-[1.12] tracking-[-0.02em] text-ink">
              在原本不能做实验的研究对象上，把因果识别的语汇还原回去。
            </h2>
          </Reveal>
        </div>
      </section>

      {/* Stats bar — quiet quantitative footer for the editorial block,
          before the support content sections take over. */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-[88rem] px-6 py-6">
          <Reveal>
            <dl className="flex flex-wrap items-baseline gap-x-12 gap-y-3">
              <Stat label="Skills" value={totalSkills} />
              <Stat label="AI repos" value={totalAi} />
              <Stat label="Reading" value={totalReading} />
              <Stat label="Notes" value={totalNotes} />
              <div className="ml-auto eyebrow">
                Updated <span className="text-ink">{buildDate}</span>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Support sections — Skills / AI / Reading / Notes / Latest.
          Demoted from main content to a reading-room style index. */}
      <main className="mx-auto w-full max-w-[88rem] flex-1 px-6 py-20">
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
            meta={SECTION_META.reading}
            total={totalReading}
            categories={readingCats}
          />
        </Reveal>
        <Reveal>
          <SectionPreview
            meta={SECTION_META.notes}
            total={totalNotes}
            categories={noteCats}
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
