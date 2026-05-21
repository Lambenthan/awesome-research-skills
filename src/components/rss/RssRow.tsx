import Link from "next/link";
import { TimeDisplay } from "@/components/TimeDisplay";
import type { LatestRss } from "@/lib/types";

/**
 * Shared rss item row used on /latest (per-group preview) and the
 * /latest/{group} subpages. Click navigates to /latest/{id} detail.
 *
 * showReadHint=true adds the hover-only "阅读详情 →" affordance used on
 * the home page where the visitor might miss that rows are clickable.
 * Subpage rows omit it because the whole context already screams "list
 * of articles you can open."
 */
export function RssRow({
  item,
  showReadHint = false,
}: {
  item: LatestRss;
  showReadHint?: boolean;
}) {
  return (
    <li>
      <Link
        href={`/latest/${item.id}`}
        className="group block rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="eyebrow-strong text-ember">{item.sourceName}</span>
          <span className="eyebrow">{item.category}</span>
          {item.publishedAt && (
            <TimeDisplay
              iso={item.publishedAt}
              className="text-[11px] text-ink-subtle"
            />
          )}
        </div>
        <h3 className="mt-2 font-serif text-[17px] leading-snug text-ink transition group-hover:text-ember">
          {item.title}
        </h3>
        {item.cn && (
          <p className="mt-2 line-clamp-3 text-[13.5px] leading-[1.75] text-ink-muted">
            {item.cn}
          </p>
        )}
        {showReadHint && (
          <p className="mt-2 text-[12px] text-ember opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
            阅读详情 <span aria-hidden="true">→</span>
          </p>
        )}
      </Link>
    </li>
  );
}
