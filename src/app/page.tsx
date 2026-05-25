import Link from "next/link";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { Reveal } from "@/components/Reveal";
import { articles, notes, repos, skills } from "@/lib/data";

/**
 * Home page — full layout port of maggieappleton.com:
 *
 *   1. Hero (serif statement with marker word + italic lede + accent pill)
 *   2. Section opener (H1 + lede paragraph framing the site)
 *   3. Essays | Notes two-column (longform writing | short reading notes)
 *   4. Patterns 3-col grid (small icon + title + 2-line description + meta)
 *   5. Library 3-col grid (curated tools / repos as "books I keep reaching for")
 *
 * Content surfaces map as:
 *   Essays  = /notes book drafts (10 items, the user's own longform writing)
 *   Notes   = /reading curated articles (12, third-party long-form being followed)
 *   Patterns= /skills Claude Code skill catalogue (12 picks from 130 across 14 cats)
 *   Library = /ai open-source AI repos (top 12 by stars from 43 total)
 */

// Eight rotating dot colors for Patterns icons — Maggie uses tiny
// hand-drawn leaves and plant motifs; we approximate with colored
// concentric discs so the list reads as a species catalogue, not 12
// identical bullets.
const DOT_COLORS = [
  "#5f023e", // maroon
  "#04a5bb", // teal
  "#c46686", // berry
  "#bcd1ca", // mint
  "#cbcadb", // lavender
  "#b0aea5", // warm grey
  "#f4d575", // mustard
  "#ebcece", // nude pink
];

function PatternDot({ i }: { i: number }) {
  const c = DOT_COLORS[i % DOT_COLORS.length];
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      aria-hidden="true"
      className="mt-1 flex-shrink-0"
    >
      <circle cx="11" cy="11" r="9.5" fill="none" stroke={c} strokeWidth="1" opacity="0.45" />
      <circle cx="11" cy="11" r="5.5" fill={c} opacity="0.9" />
    </svg>
  );
}

export default function Home() {
  // Flatten notes for the Essays column, keeping category context so we
  // can build the detail-page link and show the small meta line.
  const essayRows = notes.flatMap((cat) =>
    cat.items.map((it) => ({
      href: `/notes/${cat.id}/${it.itemSlug}`,
      title: it.title,
      subtitle: it.subtitle,
      categoryLabel: cat.label,
      date: it.date,
    })),
  );

  // Flatten articles for the Notes column. External links open in a
  // new tab — these are other people's work the user is tracking.
  const noteRows = articles.flatMap((cat) =>
    cat.items.map((it) => ({
      href: it.url,
      title: it.title,
      source: it.source,
      categoryLabel: cat.label,
      date: it.date,
    })),
  );

  // For Patterns: one curated skill per category, capped at 12, so the
  // visitor sees breadth across the 14-category catalogue rather than a
  // single dominant area.
  const patternRows = skills
    .flatMap((cat) =>
      cat.items.slice(0, 1).map((it) => ({
        href: `/skills/${cat.id}/${it.itemSlug}`,
        name: it.name,
        gloss: it.cn || it.description,
        categoryLabel: cat.label,
      })),
    )
    .slice(0, 12);

  // For Library: top 12 AI repos by stars across all 6 groups. These
  // are the open-source projects the user keeps reaching for.
  const libraryRows = repos.ai
    .flatMap((g) =>
      g.items.map((it) => ({
        href: it.url,
        name: it.name,
        fullName: it.fullName,
        description: it.cn || it.description || "",
        language: it.language,
        stars: it.stars,
      })),
    )
    .sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0))
    .slice(0, 12);

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />

      {/* ───────── 1. Hero ─────────
          Maggie's pattern: big Fraunces statement with one word painted
          on a soft mustard marker, an italic sub-paragraph in serif,
          and a small accent pill for what's currently shipping. */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-[68rem] px-6 pt-28 pb-24 sm:pt-32 sm:pb-28">
          <Reveal>
            <h1 className="display display-xl text-ink">
              <mark className="marker">Chanw</mark> 写关于 <em>AI</em>、因果推断、与科研方法的田野笔记。
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

      {/* ───────── 2. Section opener — "The Field" ─────────
          Mirrors Maggie's "The Garden" frame: section H1 + a single
          sub-paragraph that introduces what the visitor is looking at. */}
      <section className="border-b border-rule bg-cream-surface/40">
        <div className="mx-auto max-w-[68rem] px-6 pt-20 pb-12 sm:pt-24">
          <Reveal>
            <h2 className="display text-[clamp(2.4rem,4vw,3.5rem)] text-ink">
              The Field
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-[44rem] text-[clamp(1rem,1.05vw,1.15rem)] leading-[1.65] text-ink-subtle">
              一处长期写作与工具收纳的园圃。十本研究方向的书稿、追的研究长文、用过的 130 个 Claude Code skill、与 40+ 个 AI 开源项目都长在这里。
              <Link href="/latest" className="ml-2 text-ember hover:text-ink">
                Learn more →
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ───────── 3. Essays | Notes (two-column) ─────────
          Left: user's longform book drafts. Right: third-party reading
          the user follows. Plain lists with serif titles, sans meta —
          no card backgrounds. Matches Maggie's home pattern exactly. */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-[68rem] grid grid-cols-1 gap-x-14 gap-y-16 px-6 py-20 md:grid-cols-2">
          {/* Essays */}
          <div>
            <Reveal>
              <h2 className="display text-[clamp(2rem,3.2vw,2.8rem)] text-ink">
                Essays
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-3 font-serif text-[16px] italic leading-[1.55] text-ink-subtle">
                Opinionated, longform writing with an agenda.
              </p>
            </Reveal>
            <ul className="mt-9 space-y-6">
              {essayRows.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="group block">
                    <h3 className="font-serif text-[18px] leading-[1.3] text-ink transition group-hover:text-ember">
                      {r.title}
                    </h3>
                    {r.subtitle && (
                      <p className="mt-1.5 text-[13.5px] leading-[1.55] text-ink-subtle">
                        {r.subtitle}
                      </p>
                    )}
                    <p className="mt-2 text-[11.5px] uppercase tracking-[0.1em] text-meta">
                      {r.categoryLabel}
                      {r.date && <> · {r.date}</>}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Notes */}
          <div>
            <Reveal>
              <h2 className="display text-[clamp(2rem,3.2vw,2.8rem)] text-ink">
                Notes
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-3 font-serif text-[16px] italic leading-[1.55] text-ink-subtle">
                Loose, unopinionated notes on what others are figuring out.
              </p>
            </Reveal>
            <ul className="mt-9 space-y-5">
              {noteRows.map((r) => (
                <li key={r.href}>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <h3 className="font-serif text-[16.5px] leading-[1.3] text-ink transition group-hover:text-ember">
                      {r.title}
                    </h3>
                    <p className="mt-1.5 text-[11.5px] uppercase tracking-[0.1em] text-meta">
                      {r.source}
                      {r.date && <> · {r.date.slice(0, 7)}</>}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───────── 4. Patterns (3-col icon list) ─────────
          Maggie's signature pattern catalogue. Small colored dot left,
          title + 2-line gloss + meta on the right. Twelve picks, one
          per skill category. "Browse all →" at the bottom. */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-[68rem] px-6 py-20">
          <Reveal>
            <h2 className="display text-[clamp(2.2rem,3.6vw,3rem)] text-ink">
              Patterns
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-4 max-w-[40rem] font-serif text-[clamp(1rem,1.15vw,1.2rem)] italic leading-[1.55] text-ink-subtle">
              A catalogue of Claude Code skills gathered from my own use and reading.
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
            {patternRows.map((p, i) => (
              <Link key={p.href} href={p.href} className="group flex items-start gap-3">
                <PatternDot i={i} />
                <div className="min-w-0">
                  <h3 className="font-sans text-[15.5px] font-semibold leading-tight text-ink transition group-hover:text-ember">
                    {p.name}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-subtle line-clamp-2">
                    {p.gloss}
                  </p>
                  <p className="mt-2.5 text-[11px] uppercase tracking-[0.1em] text-meta">
                    Skill · {p.categoryLabel}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <Reveal delay={300}>
            <Link
              href="/skills"
              className="mt-12 inline-flex eyebrow-strong text-ember transition hover:text-ink"
            >
              Browse all 130 skills <span aria-hidden="true" className="link-arrow ml-1">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ───────── 5. Library (3-col grid) ─────────
          Maggie's "books I like the idea of having read" shelf —
          for this site, the open-source AI repos the user keeps
          reaching for, top 12 by stars. Title + repo path + 3-line
          description + language/stars meta. */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-[68rem] px-6 py-20">
          <Reveal>
            <h2 className="display text-[clamp(2.2rem,3.6vw,3rem)] text-ink">
              Library
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-4 max-w-[40rem] font-serif text-[clamp(1rem,1.15vw,1.2rem)] italic leading-[1.55] text-ink-subtle">
              AI 开源项目里循环用到的几十个，按 star 排序。
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
            {libraryRows.map((r) => (
              <a
                key={r.fullName}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <h3 className="font-serif text-[19px] leading-tight text-ink transition group-hover:text-ember">
                  {r.name}
                </h3>
                <p className="mt-1 font-mono text-[11.5px] text-meta">{r.fullName}</p>
                <p className="mt-3 text-[13px] leading-[1.6] text-ink-subtle line-clamp-3">
                  {r.description}
                </p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.1em] text-meta">
                  {r.language || "Repo"} · ★ {((r.stars ?? 0) / 1000).toFixed(1)}k
                </p>
              </a>
            ))}
          </div>
          <Reveal delay={300}>
            <Link
              href="/ai"
              className="mt-12 inline-flex eyebrow-strong text-ember transition hover:text-ink"
            >
              Browse all {repos.ai.reduce((n, g) => n + g.items.length, 0)} repos{" "}
              <span aria-hidden="true" className="link-arrow ml-1">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
