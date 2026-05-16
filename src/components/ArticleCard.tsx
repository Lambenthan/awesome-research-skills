import Link from "next/link";
import type { ArticleItem } from "@/lib/types";

export function ArticleCard({
  item,
  href,
}: {
  item: ArticleItem;
  href: string;
}) {
  return (
    <Link href={href} className="card group flex h-full flex-col p-6">
      <div className="flex items-baseline justify-between gap-3">
        <span className="eyebrow">{item.source}</span>
        {item.date && (
          <span className="font-mono text-[11px] text-ink-subtle">
            {item.date}
          </span>
        )}
      </div>
      <h3 className="mt-3 font-serif text-[19px] leading-tight text-ink transition group-hover:text-ember">
        {item.title}
      </h3>
      {(item.cn || item.blurb) && (
        <p className="mt-3 line-clamp-5 text-[13.5px] leading-[1.65] text-ink-muted">
          {item.cn || item.blurb}
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
