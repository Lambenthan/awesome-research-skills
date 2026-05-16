import Link from "next/link";
import type { NoteItem } from "@/lib/types";
import { asset } from "@/lib/asset";

export function NoteCard({
  item,
  href,
}: {
  item: NoteItem;
  href: string;
}) {
  return (
    <Link href={href} className="card group flex h-full flex-col p-5">
      <div className="relative aspect-[1/1.414] w-full overflow-hidden rounded-sm border border-rule bg-cream-elevated">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(item.cover)}
          alt={item.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <span className="eyebrow">{item.kind}</span>
        {item.date && (
          <span className="font-mono text-[11px] text-ink-subtle">
            {item.date}
          </span>
        )}
      </div>
      <h3 className="mt-2 font-serif text-[20px] leading-tight text-ink transition group-hover:text-ember">
        {item.title}
      </h3>
      {item.subtitle && (
        <p className="mt-1 text-[12.5px] leading-[1.55] text-ink-muted">
          {item.subtitle}
        </p>
      )}
      {item.cn && (
        <p className="mt-3 line-clamp-4 text-[13px] leading-[1.65] text-ink-muted">
          {item.cn}
        </p>
      )}
      <div className="mt-auto pt-4">
        <span className="eyebrow-strong text-ember transition group-hover:text-ink">
          Open →
        </span>
      </div>
    </Link>
  );
}
