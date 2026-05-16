import Link from "next/link";
import type { SectionMeta } from "@/lib/sections";

export type SectionPreviewItem = {
  id: string;
  label: string;
  count: number;
};

export function SectionPreview({
  meta,
  total,
  categories,
}: {
  meta: SectionMeta;
  total: number;
  categories: SectionPreviewItem[];
}) {
  return (
    <article className="grid grid-cols-12 gap-6 border-t border-rule py-12 first:border-t-0 first:pt-0">
      <div className="col-span-12 sm:col-span-4">
        <p className="eyebrow">{meta.eyebrow}</p>
        <h2 className="display mt-4 text-[32px] text-ink sm:text-[40px]">
          {meta.title}
        </h2>
        <p className="mt-4 max-w-md text-[14px] leading-[1.7] text-ink-muted">
          {meta.blurb}
        </p>
        <div className="mt-6 flex items-baseline gap-5">
          <span className="font-serif text-[40px] leading-none text-ink">
            {total}
          </span>
          <span className="eyebrow">items in {categories.length} categories</span>
        </div>
        <Link
          href={meta.href}
          className="mt-6 inline-block eyebrow-strong text-ember transition hover:text-ink"
        >
          Browse all →
        </Link>
      </div>
      <div className="col-span-12 sm:col-span-8">
        <ul className="divide-y divide-rule border-y border-rule">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`${meta.href}/${c.id}/`}
                className="group flex items-baseline justify-between gap-4 py-4 transition"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-serif text-[14px] tabular-nums text-ink-subtle">
                    {String(categories.indexOf(c) + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-[18px] text-ink transition group-hover:text-ember">
                    {c.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="eyebrow text-ink-subtle">{c.count}</span>
                  <span className="eyebrow text-ink-subtle transition group-hover:text-ember">
                    →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
