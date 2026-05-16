import Link from "next/link";
import type { NoteItem } from "@/lib/types";
import { asset } from "@/lib/asset";

export function NoteRow({
  item,
  index,
  href,
}: {
  item: NoteItem;
  index: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block border-t border-rule py-8 first:border-t-0 first:pt-0"
    >
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 sm:col-span-1">
          <span className="font-serif text-[14px] tabular-nums text-ink-subtle">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="col-span-4 sm:col-span-3">
          <div className="relative aspect-[1/1.414] overflow-hidden rounded-sm border border-rule bg-cream-elevated">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(item.cover)}
              alt={item.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        </div>
        <div className="col-span-8 sm:col-span-7">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="eyebrow">{item.kind}</span>
            {item.date && (
              <span className="font-mono text-[11px] text-ink-subtle">
                {item.date}
              </span>
            )}
            {item.pages && (
              <span className="eyebrow text-ink-subtle">{item.pages} pp.</span>
            )}
          </div>
          <h3 className="mt-2 font-serif text-[26px] leading-tight text-ink transition group-hover:text-ember sm:text-[30px]">
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="mt-2 text-[14px] leading-[1.55] text-ink-muted">
              {item.subtitle}
            </p>
          )}
          {item.cn && (
            <p className="mt-4 max-w-3xl text-[14px] leading-[1.75] text-ink-muted">
              {item.cn}
            </p>
          )}
        </div>
        <div className="col-span-12 flex sm:col-span-1 sm:justify-end">
          <span className="eyebrow-strong text-ember transition group-hover:text-ink">
            Open →
          </span>
        </div>
      </div>
    </Link>
  );
}
