import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { Reveal } from "@/components/Reveal";
import { SectionView } from "@/components/SectionView";
import { Breadcrumb } from "@/components/Breadcrumb";
import { articles } from "@/lib/data";
import { SECTION_META } from "@/lib/sections";

export default function ReadingIndex() {
  const meta = SECTION_META.reading;
  const total = articles.reduce((n, c) => n + c.items.length, 0);
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />

      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-6 pt-14 pb-12">
          <Breadcrumb
            trail={[{ label: "Home", href: "/" }, { label: meta.eyebrow }]}
          />
          <div className="mt-7 grid grid-cols-12 gap-6">
            <div className="col-span-12 sm:col-span-8">
              <Reveal>
                <p className="eyebrow">{meta.eyebrow}</p>
              </Reveal>
              <Reveal delay={100}>
                <h1 className="display display-xl mt-4 text-ink">
                  {meta.title}
                </h1>
              </Reveal>
              <Reveal delay={220}>
                <p className="mt-5 max-w-2xl font-fluid-lede leading-[1.75] text-ink-muted">
                  {meta.blurb}
                </p>
              </Reveal>
            </div>
            <Reveal
              delay={180}
              className="col-span-12 sm:col-span-4 sm:text-right"
            >
              <p className="eyebrow">In total</p>
              <p className="mt-2 font-serif text-[48px] leading-none text-ink">
                {total}
              </p>
              <p className="mt-1 eyebrow text-ink-subtle">
                articles · {articles.length} categories
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <SectionView
          section="reading"
          basePath={meta.href}
          groups={articles}
        />
      </main>

      <Footer />
    </div>
  );
}
