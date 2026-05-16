import type { ArticleItem } from "@/lib/types";

export function ArticleRow({
  item,
  index,
}: {
  item: ArticleItem;
  index: number;
}) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border-t border-rule py-7 first:border-t-0 first:pt-0"
    >
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 sm:col-span-1">
          <span className="font-serif text-[14px] tabular-nums text-ink-subtle">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="col-span-12 sm:col-span-8">
          <div className="flex items-baseline gap-3">
            <span className="eyebrow">{item.source}</span>
            {item.date && (
              <span className="font-mono text-[11px] text-ink-subtle">
                {item.date}
              </span>
            )}
          </div>
          <h3 className="mt-2 font-serif text-[24px] leading-tight text-ink transition group-hover:text-ember">
            {item.title}
          </h3>
          {item.blurb && (
            <p className="mt-3 max-w-3xl text-[14px] leading-[1.7] text-ink-muted">
              {item.blurb}
            </p>
          )}
        </div>
        <div className="col-span-12 flex sm:col-span-3 sm:justify-end">
          <span className="eyebrow-strong text-ember transition group-hover:text-ink">
            Read →
          </span>
        </div>
      </div>
    </a>
  );
}
