import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { SectionView } from "@/components/SectionView";
import { Breadcrumb } from "@/components/Breadcrumb";
import { repos } from "@/lib/data";
import { SECTION_META } from "@/lib/sections";

export default function ResearchIndex() {
  const meta = SECTION_META.research;
  const total = repos.research.reduce((n, g) => n + g.items.length, 0);
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
              <p className="eyebrow">{meta.eyebrow}</p>
              <h1 className="display mt-4 text-[44px] text-ink sm:text-[56px]">
                {meta.title}
              </h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-[1.75] text-ink-muted">
                {meta.blurb}
              </p>
            </div>
            <div className="col-span-12 sm:col-span-4 sm:text-right">
              <p className="eyebrow">In total</p>
              <p className="mt-2 font-serif text-[48px] leading-none text-ink">
                {total}
              </p>
              <p className="mt-1 eyebrow text-ink-subtle">
                repos · {repos.research.length} categories
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <SectionView
          section="research"
          basePath={meta.href}
          groups={repos.research}
        />
      </main>

      <Footer />
    </div>
  );
}
