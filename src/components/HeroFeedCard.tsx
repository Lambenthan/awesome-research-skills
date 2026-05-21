import Link from "next/link";
import { TimeDisplay } from "@/components/TimeDisplay";
import type { LatestRss } from "@/lib/types";

/**
 * Big editorial hero card for the /latest home feed top slot.
 *
 * Layout reference: anthropic.com/news (2026-05-21 snapshot) — single
 * featured story above the dense news list, image-left wide proportions
 * with title + lede right of the image on desktop, stacked on mobile.
 *
 * Picks visual cues from the source group's accent color so the hero
 * reads as part of the same taxonomy as the sections beneath it.
 */
export function HeroFeedCard({
  item,
  accentVar,
}: {
  item: LatestRss;
  accentVar: string;
}) {
  const when = item.publishedAt ?? item.discoveredAt;
  const accent = `var(${accentVar})`;

  return (
    <section className="border-b border-rule pb-12">
      <p
        className="eyebrow inline-flex items-center gap-2"
        style={{ color: "var(--color-ink-muted)" }}
      >
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: accent }}
        />
        Featured · 编辑精选
      </p>
      <Link
        href={`/latest/${item.id}`}
        className="group mt-5 grid gap-8 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember lg:grid-cols-[5fr_4fr]"
      >
        {item.image ? (
          <div className="overflow-hidden rounded border border-rule">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.title}
              width="1200"
              height="675"
              fetchPriority="high"
              className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
        ) : (
          // Fallback when the upstream source hides og:image: a colored
          // tile so the layout still reads as a two-column hero.
          <div
            aria-hidden="true"
            className="aspect-[16/9] w-full rounded border border-rule"
            style={{ background: `color-mix(in oklch, ${accent} 14%, transparent)` }}
          />
        )}
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="eyebrow-strong text-ember">
              {item.vendor || item.sourceName}
            </span>
            {item.category && (
              <span className="eyebrow text-ink-muted">{item.category}</span>
            )}
            <TimeDisplay iso={when} className="text-[11px] text-ink-subtle" />
          </div>
          <h2 className="display mt-4 text-[clamp(1.75rem,2.4vw,2.5rem)] leading-[1.15] text-ink transition group-hover:text-ember">
            {item.title}
          </h2>
          {item.cn && (
            <p className="mt-5 line-clamp-4 font-fluid-lede leading-[1.75] text-ink-muted">
              {item.cn}
            </p>
          )}
          <p className="mt-6 text-[13px] text-ember opacity-70 transition group-hover:opacity-100">
            阅读完整导读 <span aria-hidden="true">→</span>
          </p>
        </div>
      </Link>
    </section>
  );
}
