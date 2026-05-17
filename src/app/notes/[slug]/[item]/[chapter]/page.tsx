import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { Reveal } from "@/components/Reveal";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ChapterToc } from "@/components/ChapterToc";
import { ReadingProgress } from "@/components/ReadingProgress";
import { notes } from "@/lib/data";
import { SECTION_META } from "@/lib/sections";
import {
  CHAPTERS,
  getAdjacentChapters,
  getChapter,
  getChaptersForItem,
} from "@/lib/chapters";

export function generateStaticParams() {
  return CHAPTERS.map((c) => ({
    slug: c.categorySlug,
    item: c.itemSlug,
    chapter: c.slug,
  }));
}

type Params = Promise<{ slug: string; item: string; chapter: string }>;

export default async function ChapterPage({ params }: { params: Params }) {
  const { slug, item, chapter } = await params;
  const category = notes.find((c) => c.id === slug);
  if (!category) notFound();
  const note = category.items.find((it) => it.itemSlug === item);
  if (!note) notFound();
  const meta = getChapter(slug, item, chapter);
  if (!meta) notFound();

  const mod = await meta.load();
  const ChapterBody = mod.default as React.ComponentType;
  const { prev, next } = getAdjacentChapters(meta);
  const peers = getChaptersForItem(slug, item);

  const sectionMeta = SECTION_META.notes;
  const itemHref = `${sectionMeta.href}/${category.id}/${note.itemSlug}`;

  return (
    <div className="flex min-h-screen flex-col">
      <ReadingProgress />
      <NavBar />
      <main className="mx-auto w-full max-w-[88rem] flex-1 px-6 py-14">
        <Breadcrumb
          trail={[
            { label: "Home", href: "/" },
            { label: sectionMeta.eyebrow, href: sectionMeta.href },
            {
              label: category.label,
              href: `${sectionMeta.href}/${category.id}`,
            },
            { label: note.title, href: itemHref },
            { label: `第 ${meta.displayNum} 章` },
          ]}
        />

        <header className="mt-10 space-y-5 border-b border-rule pb-10">
          <Reveal>
            <p className="eyebrow">
              {note.title} · 第 {meta.displayNum} 章
            </p>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="display text-[36px] text-ink sm:text-[52px]">
              {meta.title}
            </h1>
          </Reveal>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[1fr_220px]">
          <article className="prose-chapter min-w-0 max-w-3xl">
            <ChapterBody />
          </article>
          <aside className="lg:order-last">
            <ChapterToc
              itemHref={itemHref}
              peers={peers}
              currentSlug={meta.slug}
              noteTitle={note.title}
            />
          </aside>
        </div>

        <nav className="mt-16 grid grid-cols-1 gap-4 border-t border-rule pt-8 sm:grid-cols-2">
          <div>
            {prev ? (
              <Link
                href={`${itemHref}/${prev.slug}`}
                className="group block rounded-sm border border-rule px-5 py-4 transition hover:border-rule-strong hover:bg-cream-surface"
              >
                <p className="eyebrow text-ink-subtle">
                  ← 上一章 · 第 {prev.displayNum} 章
                </p>
                <p className="mt-1 font-serif text-[16px] leading-tight text-ink transition group-hover:text-ember">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <div className="rounded-sm border border-dashed border-rule px-5 py-4">
                <p className="eyebrow text-ink-subtle">本书首章</p>
              </div>
            )}
          </div>
          <div>
            {next ? (
              <Link
                href={`${itemHref}/${next.slug}`}
                className="group block rounded-sm border border-rule px-5 py-4 text-right transition hover:border-rule-strong hover:bg-cream-surface"
              >
                <p className="eyebrow text-ink-subtle">
                  下一章 · 第 {next.displayNum} 章 →
                </p>
                <p className="mt-1 font-serif text-[16px] leading-tight text-ink transition group-hover:text-ember">
                  {next.title}
                </p>
              </Link>
            ) : (
              <div className="rounded-sm border border-dashed border-rule px-5 py-4 text-right">
                <p className="eyebrow text-ink-subtle">
                  下一章稍后上线（共 {peers.length} 章已上 {peers.length}）
                </p>
              </div>
            )}
          </div>
        </nav>

        <div className="mt-10 border-t border-rule pt-6">
          <Link
            href={itemHref}
            className="eyebrow transition hover:text-ember"
          >
            ← 回到《{note.title}》目录
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
