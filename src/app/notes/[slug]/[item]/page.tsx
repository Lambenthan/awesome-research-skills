import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { Reveal } from "@/components/Reveal";
import { Breadcrumb } from "@/components/Breadcrumb";
import { notes } from "@/lib/data";
import { SECTION_META, allItemParams } from "@/lib/sections";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function generateStaticParams() {
  return allItemParams("notes");
}

type Params = Promise<{ slug: string; item: string }>;

export default async function NoteItemPage({ params }: { params: Params }) {
  const { slug, item } = await params;
  const category = notes.find((c) => c.id === slug);
  if (!category) notFound();
  const note = category.items.find((it) => it.itemSlug === item);
  if (!note) notFound();

  const meta = SECTION_META.notes;
  const pdfUrl = `${BASE_PATH}${note.pdf}`;

  const siblings = category.items
    .filter((it) => it.itemSlug !== item)
    .map((it) => ({ itemSlug: it.itemSlug, title: it.title }));

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-14">
        <div className="space-y-14">
          <Breadcrumb
            trail={[
              { label: "Home", href: "/" },
              { label: meta.eyebrow, href: meta.href },
              {
                label: category.label,
                href: `${meta.href}/${category.id}`,
              },
              { label: note.title },
            ]}
          />

          <header className="space-y-6">
            <Reveal>
              <p className="eyebrow">
                {meta.eyebrow} · {category.label}
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="display text-[40px] text-ink sm:text-[60px]">
                {note.title}
              </h1>
            </Reveal>
            {note.subtitle && (
              <Reveal delay={180}>
                <p className="max-w-3xl font-serif text-[18px] italic leading-[1.5] text-ink-muted sm:text-[22px]">
                  {note.subtitle}
                </p>
              </Reveal>
            )}
            {note.cn && (
              <Reveal delay={260}>
                <p className="max-w-3xl text-[16px] leading-[1.9] text-ink">
                  {note.cn}
                </p>
              </Reveal>
            )}
          </header>

          <div className="grid grid-cols-12 gap-x-10 gap-y-10">
            <Reveal className="col-span-12 sm:col-span-5">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                aria-label={`在浏览器中打开 ${note.title} PDF`}
              >
                <div className="relative aspect-[1/1.414] overflow-hidden rounded-sm border border-rule-strong bg-cream-elevated shadow-[0_18px_40px_-28px_rgba(20,20,19,0.45)] transition-transform duration-300 hover:scale-[1.01]">
                  <Image
                    src={note.cover}
                    alt={`${note.title} 封面`}
                    fill
                    priority
                    sizes="(min-width: 640px) 400px, 90vw"
                    className="object-cover object-top"
                  />
                </div>
              </a>
            </Reveal>

            <aside className="col-span-12 sm:col-span-7">
              <dl className="divide-y divide-rule border-y border-rule">
                <AttrRow label="Author" value={note.author} />
                {note.date && <AttrRow label="Date" value={note.date} />}
                {note.version && (
                  <AttrRow label="Version" value={note.version} />
                )}
                {note.pages != null && (
                  <AttrRow label="Pages" value={`${note.pages} pp.`} />
                )}
                <AttrRow label="Kind" value={note.kind} />
                <AttrRow
                  label="File"
                  value={
                    <span className="break-all font-mono text-[12.5px] text-ink-muted">
                      {note.pdf.split("/").pop()}
                    </span>
                  }
                />
              </dl>
              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-between rounded-full border border-ember bg-ember-tint px-5 py-2.5 text-[13px] font-medium text-ember transition hover:bg-ember hover:text-cream"
                >
                  <span>在浏览器中打开 PDF</span>
                  <span aria-hidden="true">→</span>
                </a>
                <a
                  href={pdfUrl}
                  download
                  className="inline-flex w-full items-center justify-between rounded-full border border-rule-strong px-5 py-2.5 text-[13px] text-ink-muted transition hover:border-ink hover:text-ink"
                >
                  <span>下载 PDF</span>
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
            </aside>
          </div>

          {note.chapters && note.chapters.length > 0 && (
            <section>
              <h2 className="mb-6 font-serif text-[22px] leading-tight text-ink">
                章节梗概
              </h2>
              <ol className="border-y border-rule">
                {note.chapters.map((ch) => (
                  <li
                    key={ch.num}
                    className="grid grid-cols-12 gap-4 border-t border-rule py-4 first:border-t-0"
                  >
                    <div className="col-span-2 sm:col-span-1">
                      <span className="font-serif text-[15px] tabular-nums text-ink-subtle">
                        {ch.num.padStart(2, "0")}
                      </span>
                    </div>
                    <div className="col-span-10 sm:col-span-11">
                      <span className="font-serif text-[17px] leading-snug text-ink">
                        {ch.title}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {siblings.length > 0 && (
            <section className="border-t border-rule pt-8">
              <p className="eyebrow mb-4">同一分类的其他项</p>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                {siblings.map((s) => (
                  <li key={s.itemSlug}>
                    <Link
                      href={`${meta.href}/${category.id}/${s.itemSlug}`}
                      className="text-[13.5px] text-ink-muted transition hover:text-ember"
                    >
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="border-t border-rule pt-6">
            <Link
              href={`${meta.href}/${category.id}`}
              className="eyebrow transition hover:text-ember"
            >
              ← Back to {category.label}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function AttrRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3">
      <dt className="eyebrow col-span-1">{label}</dt>
      <dd className="col-span-2 text-[13.5px] text-ink">{value}</dd>
    </div>
  );
}
