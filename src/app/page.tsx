import Link from "next/link";
import { AboutBlock } from "@/components/AboutBlock";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { NotesIndex } from "@/components/NotesIndex";
import { Reveal } from "@/components/Reveal";
import { ToolkitGrid } from "@/components/ToolkitGrid";
import { notes, repos, skills } from "@/lib/data";
import { SECTION_META } from "@/lib/sections";

export default function Home() {
  const totalSkills = skills.reduce((n, c) => n + c.items.length, 0);
  const totalAi = repos.ai.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />

      {/* Hero — maggieappleton.com pattern: big Fraunces statement with
          one word given a soft mustard highlighter wash, a quiet italic
          sub-line, and a small accent pill for "currently working on".
          No backdrop, no particles — the typography is the foreground. */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-[68rem] px-6 pt-28 pb-24 sm:pt-36 sm:pb-32">
          <Reveal>
            <h1 className="display display-xl text-ink">
              <mark className="marker">Chanw</mark>{" "}
              写关于 <em>AI</em>、因果推断、与科研方法的田野笔记。
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-8 max-w-[36rem] font-serif text-[clamp(1.05rem,1.2vw,1.25rem)] italic leading-[1.55] text-ink-subtle">
              独立研究者 · 人格因果学 / 会计 / 教育 / 公共卫生 / 中医方向。
              当下用 Claude Code 把这套方法做进可复现的脚本里。
            </p>
          </Reveal>
          <Reveal delay={320}>
            <p className="mt-5 text-[15px] leading-[1.6] text-ink-muted">
              当前推进{" "}
              <Link
                href="/notes"
                className="inline-flex items-baseline gap-1 rounded-full bg-ember-tint px-3 py-1 text-[13px] font-medium text-ember transition hover:bg-ember hover:text-cream"
              >
                Lambenthan/field-notes
                <span aria-hidden="true">→</span>
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Section opener — "The Field Notes" frame for everything below.
          Mirrors maggieappleton.com's "The Garden" pattern: section H1
          + one-line description, then the content lists immediately. */}
      <section className="border-b border-rule bg-cream-surface/40">
        <div className="mx-auto max-w-[68rem] px-6 pt-20 pb-10 sm:pt-24">
          <Reveal>
            <h2 className="display text-[clamp(2.4rem,4vw,3.5rem)] text-ink">
              The Field Notes
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-[44rem] text-[clamp(1.05rem,1.1vw,1.2rem)] leading-[1.65] text-ink-subtle">
              一处长期写作与工具收纳的园圃。十本研究方向的书稿、AI 与科研栈的开源项目、Claude Code skill，以及每天追的 AI 一手动态都长在这里。
              <Link
                href="/latest"
                className="ml-2 text-ember hover:text-ink"
              >
                Learn more →
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

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

      <Reveal>
        <NotesIndex categories={notes} />
      </Reveal>

      <AboutBlock />

      <Footer />
    </div>
  );
}
