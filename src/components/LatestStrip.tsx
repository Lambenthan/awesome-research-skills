import Link from "next/link";

/**
 * Compact one-row callout for the live feed.
 *
 * Replaces the previous LiveCallout which used the same 4/8 SectionPreview
 * shape as the static sections. This is a single horizontal strip — a
 * pulsing dot, a one-line description, and an "Open →" CTA. The feed
 * itself lives at /latest; the homepage doesn't need to bake out the
 * source mix.
 */
export function LatestStrip() {
  return (
    <section className="border-t border-rule">
      <Link
        href="/latest"
        className="group block transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
      >
        <div className="mx-auto flex max-w-[88rem] flex-wrap items-baseline gap-x-6 gap-y-3 px-6 py-10 sm:py-12">
          <p className="eyebrow flex items-baseline gap-2">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />
            Latest · 每 6 小时刷新
          </p>
          <p className="font-serif text-[clamp(1.05rem,1.4vw,1.25rem)] text-ink transition group-hover:text-ember">
            HackerNews AI 故事 · GitHub rising · 多 topic 合并
          </p>
          <span className="ml-auto eyebrow text-ember transition group-hover:text-ink">
            Open the feed{" "}
            <span aria-hidden="true" className="link-arrow">
              →
            </span>
          </span>
        </div>
      </Link>
    </section>
  );
}
