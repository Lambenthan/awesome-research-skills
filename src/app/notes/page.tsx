import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { Reveal } from "@/components/Reveal";
import { Breadcrumb } from "@/components/Breadcrumb";
import { NoteCard } from "@/components/NoteCard";
import { notes } from "@/lib/data";
import { SECTION_META } from "@/lib/sections";
import Link from "next/link";

export default function NotesIndex() {
  const meta = SECTION_META.notes;
  const total = notes.reduce((n, c) => n + c.items.length, 0);
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />

      <section className="border-b border-rule">
        <div className="mx-auto max-w-[88rem] px-6 pt-14 pb-12">
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
                {total === 1 ? "note" : "notes"} · {notes.length}{" "}
                {notes.length === 1 ? "category" : "categories"}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[88rem] flex-1 px-6 py-12">
        <div className="space-y-14">
          {notes.map((cat) => (
            <section key={cat.id} id={cat.id}>
              <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-rule pb-3">
                <div>
                  <Link
                    href={`${meta.href}/${cat.id}/`}
                    className="group inline-flex items-baseline gap-3"
                  >
                    <h2 className="font-serif text-[22px] leading-tight text-ink transition group-hover:text-ember">
                      {cat.label}
                    </h2>
                    <span className="eyebrow transition group-hover:text-ember">
                      View all →
                    </span>
                  </Link>
                  {cat.summary && (
                    <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
                      {cat.summary}
                    </p>
                  )}
                </div>
                <span className="eyebrow shrink-0">
                  {cat.items.length} {cat.items.length === 1 ? "item" : "items"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {cat.items.map((it) => (
                  <NoteCard
                    key={it.itemSlug}
                    item={it}
                    href={`${meta.href}/${cat.id}/${it.itemSlug}`}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
