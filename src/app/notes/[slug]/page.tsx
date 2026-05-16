import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { Reveal } from "@/components/Reveal";
import { Breadcrumb } from "@/components/Breadcrumb";
import { NoteRow } from "@/components/NoteRow";
import { notes } from "@/lib/data";
import { SECTION_META } from "@/lib/sections";

export function generateStaticParams() {
  return notes.map((c) => ({ slug: c.id }));
}

type Params = Promise<{ slug: string }>;

export default async function NotesCategoryPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const category = notes.find((c) => c.id === slug);
  if (!category) notFound();
  const meta = SECTION_META.notes;
  const siblings = notes
    .filter((c) => c.id !== category.id)
    .map((c) => ({ id: c.id, label: c.label }));

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <div className="space-y-12">
          <div className="space-y-6">
            <Breadcrumb
              trail={[
                { label: "Home", href: "/" },
                { label: meta.eyebrow, href: meta.href },
                { label: category.label },
              ]}
            />
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 sm:col-span-8">
                <Reveal>
                  <p className="eyebrow">{meta.eyebrow} · Category</p>
                </Reveal>
                <Reveal delay={100}>
                  <h1 className="display mt-4 text-[42px] text-ink sm:text-[56px]">
                    {category.label}
                  </h1>
                </Reveal>
                {category.summary && (
                  <Reveal delay={220}>
                    <p className="mt-5 max-w-2xl text-[15px] leading-[1.75] text-ink-muted">
                      {category.summary}
                    </p>
                  </Reveal>
                )}
              </div>
              <Reveal
                delay={180}
                className="col-span-12 sm:col-span-4 sm:text-right"
              >
                <p className="eyebrow">In this category</p>
                <p className="mt-2 font-serif text-[42px] leading-none text-ink">
                  {category.items.length}
                </p>
                <p className="mt-1 eyebrow text-ink-subtle">
                  {category.items.length === 1 ? "item" : "items"}
                </p>
              </Reveal>
            </div>
          </div>

          {siblings.length > 0 && (
            <Reveal delay={280}>
              <div className="border-y border-rule py-4">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <span className="eyebrow shrink-0">Other categories</span>
                  {siblings.map((s) => (
                    <Link
                      key={s.id}
                      href={`${meta.href}/${s.id}/`}
                      className="text-[13px] text-ink-muted transition hover:text-ember"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          <div>
            {category.items.map((it, i) => (
              <Reveal key={it.itemSlug} delay={Math.min(i, 6) * 60}>
                <NoteRow
                  item={it}
                  index={i}
                  href={`${meta.href}/${category.id}/${it.itemSlug}`}
                />
              </Reveal>
            ))}
          </div>

          <div className="border-t border-rule pt-6">
            <Link
              href={meta.href}
              className="eyebrow transition hover:text-ember"
            >
              ← All of {meta.eyebrow}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
