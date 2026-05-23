import { AboutParallaxBlock } from "@/components/AboutParallaxBlock";
import { Footer } from "@/components/Footer";
import { Hairline } from "@/components/Hairline";
import { HeroParticles } from "@/components/HeroParticles";
import { LatestStrip } from "@/components/LatestStrip";
import { NavBar } from "@/components/NavBar";
import { NotesIndex } from "@/components/NotesIndex";
import { Reveal } from "@/components/Reveal";
import { SectionPreview } from "@/components/SectionPreview";
import { SplitReveal } from "@/components/SplitReveal";
import { ToolkitGrid } from "@/components/ToolkitGrid";
import { articles, notes, repos, skills } from "@/lib/data";
import { SECTION_META } from "@/lib/sections";

export default function Home() {
  const totalSkills = skills.reduce((n, c) => n + c.items.length, 0);
  const totalAi = repos.ai.reduce((n, g) => n + g.items.length, 0);
  const readingCats = articles.map((c) => ({
    id: c.id,
    label: c.label,
    count: c.items.length,
  }));
  const totalReading = readingCats.reduce((n, c) => n + c.count, 0);

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />

      {/* Hero — single declarative slogan in sans, no lede paragraph or
          CTA pill. Echoes anthropic.com's hero rhythm of a weighty
          statement that lets the site introduce itself. A faint two-tone
          particle backdrop adds texture without competing with the H1. */}
      <section className="relative overflow-hidden border-b border-rule">
        <HeroParticles />
        <div className="relative z-10 mx-auto max-w-[88rem] px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
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

      {/* Toolkit · 工具集 — visitor's first deep entry. Two horizontal
          cards (Skills + AI) for the two tool stacks the visitor is
          most likely to want immediately. */}
      <Reveal>
        <ToolkitGrid
          cards={[
            {
              meta: SECTION_META.skills,
              total: totalSkills,
              groupCount: skills.length,
            },
            {
              meta: SECTION_META.ai,
              total: totalAi,
              groupCount: repos.ai.length,
            },
          ]}
        />
      </Reveal>

      {/* Latest · live pulse — compact strip rather than full preview.
          The /latest page itself holds the source breakdown. */}
      <Reveal>
        <LatestStrip />
      </Reveal>

      {/* Reading — editorial 4/8 split. Articles benefit from showing
          their category names because the categories are publishers
          the visitor recognizes. Wrapped in a max-width container so
          the inner grid lines up with the rest of the page. */}
      <section className="border-t border-rule">
        <div className="mx-auto max-w-[88rem] px-6 py-24 sm:py-32">
          <Reveal>
            <SectionPreview
              meta={{
                ...SECTION_META.reading,
                title: "AI 研究长文",
              }}
              total={totalReading}
              categories={readingCats}
            />
          </Reveal>
        </div>
      </section>

      {/* Notes — the 10 book drafts listed individually. Each book
          is the value proposition; the category taxonomy is just for
          orientation. */}
      <Reveal>
        <NotesIndex categories={notes} />
      </Reveal>

      {/* About + Parallax — combined closing editorial block.
          anthropic.com Project Glasswing pattern: meet the author and
          the author's program in one continuous read. */}
      <AboutParallaxBlock />

      {/* Mission statement — single oversized line. Closes the page
          on a declarative note, like anthropic.com's "At Anthropic, we
          build AI to serve humanity's long-term well-being." */}
      <section className="border-t border-rule bg-cream-surface/30">
        <div className="mx-auto max-w-[88rem] px-6 py-32 sm:py-40">
          <Hairline className="mb-12 max-w-[12rem]" />
          <Reveal delay={200}>
            <h2 className="font-serif text-[clamp(2rem,4vw,4rem)] leading-[1.12] tracking-[-0.02em] text-ink">
              在原本不能做实验的研究对象上，把因果识别的语汇还原回去。
            </h2>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
