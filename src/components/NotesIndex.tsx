import Link from "next/link";
import type { NoteCategory } from "@/lib/types";

/**
 * Editorial-style index of the ten book drafts.
 *
 * Replaces the generic SectionPreview for /notes on the homepage. Where
 * SectionPreview only surfaces category names ("人格因果学 · 4 项"),
 * this surfaces every individual book by title with a numbered prefix
 * — the books themselves are the value the visitor came to see, not
 * the taxonomy. Left column carries the section eyebrow + count + CTA,
 * right column carries the 10-row list.
 */
export function NotesIndex({ categories }: { categories: NoteCategory[] }) {
  // Flatten while preserving category order and tagging each row with
  // its category label so the visitor can see what's what without
  // breaking the single numbered run from 01 to 10.
  type Row = {
    title: string;
    href: string;
    categoryLabel: string;
  };
  const rows: Row[] = [];
  for (const cat of categories) {
    for (const it of cat.items) {
      rows.push({
        title: it.title,
        href: `/notes/${cat.id}/${it.itemSlug}`,
        categoryLabel: cat.label,
      });
    }
  }

  const total = rows.length;

  return (
    <section className="border-t border-rule">
      <div className="mx-auto grid max-w-[88rem] grid-cols-12 gap-6 px-6 py-24 sm:py-32">
        <div className="col-span-12 md:col-span-4">
          <p className="eyebrow text-ink-subtle">Research Notes</p>
          <h2 className="display mt-5 text-[clamp(2rem,3.5vw,3rem)] text-ink">
            写过的书稿
          </h2>
          <p className="mt-5 max-w-md text-[14px] leading-[1.75] text-ink-muted">
            围绕因果推断、文本计量与人格心理学交叉方向的研究草稿与方法笔记。每篇以工作论文或方法纲要形式发布，可在浏览器内打开。
          </p>
          <div className="mt-8 flex items-baseline gap-3">
            <span className="font-serif text-[44px] leading-none text-ink">
              {total}
            </span>
            <span className="eyebrow">
              本 · {categories.length} 类
            </span>
          </div>
          <Link
            href="/notes"
            className="mt-8 inline-block eyebrow-strong text-ember transition hover:text-ink"
          >
            Browse all{" "}
            <span aria-hidden="true" className="link-arrow">
              →
            </span>
          </Link>
        </div>
        <div className="col-span-12 md:col-span-8">
          <ul className="divide-y divide-rule border-y border-rule">
            {rows.map((r, i) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="group flex items-baseline justify-between gap-4 py-4 transition"
                >
                  <div className="flex items-baseline gap-5">
                    <span className="font-serif text-[14px] tabular-nums text-ink-subtle">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-serif text-[18px] text-ink transition group-hover:text-ember">
                      {r.title}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="eyebrow text-ink-subtle hidden sm:inline">
                      {r.categoryLabel}
                    </span>
                    <span className="eyebrow text-ink-subtle transition group-hover:text-ember">
                      →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
