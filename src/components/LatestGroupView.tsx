import Link from "next/link";
import { Breadcrumb } from "./Breadcrumb";
import { Reveal } from "./Reveal";
import { RssRow } from "./rss/RssRow";
import type { LatestRss } from "@/lib/types";
import type { RssGroupMeta } from "@/lib/rss-groups";

/**
 * Full-list view for a single rss group (Labs / 中文厂商 / 学术 / OSS).
 *
 * Items are pre-sorted by publishedAt desc in extract-content.mjs. This
 * view groups them by year-month so readers always know where they are
 * in time — useful when a group has 100+ items and pure infinite scroll
 * would feel arbitrary.
 */
export function LatestGroupView({
  group,
  items,
}: {
  group: RssGroupMeta;
  items: LatestRss[];
}) {
  const byMonth = groupByMonth(items);

  return (
    <div className="space-y-12">
      <Breadcrumb
        trail={[
          { label: "Home", href: "/" },
          { label: "Latest", href: "/latest" },
          { label: group.label },
        ]}
      />

      <header className="space-y-5">
        <Reveal>
          <p className="eyebrow inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: `var(${group.accentVar})` }}
            />
            {group.subtitle}
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="display display-xl text-ink">{group.label}</h1>
        </Reveal>
        <Reveal delay={220}>
          <p className="max-w-3xl text-[15px] leading-[1.85] text-ink-muted">
            {group.blurb}
          </p>
        </Reveal>
        <Reveal delay={320}>
          <p className="eyebrow text-ink-subtle">
            {items.length} items · 按发布时间倒序
          </p>
        </Reveal>
      </header>

      <div className="space-y-14">
        {byMonth.map(({ key, label, items: monthItems }) => (
          <section key={key}>
            <div className="sticky top-0 z-10 -mx-6 mb-6 border-b border-rule bg-cream/95 px-6 py-3 backdrop-blur-sm">
              <p className="eyebrow flex items-baseline justify-between">
                <span className="text-ink">{label}</span>
                <span className="text-ink-subtle">
                  {monthItems.length} items
                </span>
              </p>
            </div>
            <ul
              className="grid grid-cols-1 gap-x-10 gap-y-7 lg:grid-cols-2"
              style={{
                contentVisibility: "auto",
                containIntrinsicSize: "auto 240px",
              }}
            >
              {monthItems.map((it) => (
                <RssRow key={it.id} item={it} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="border-t border-rule pt-6">
        <Link
          href="/latest"
          className="eyebrow rounded transition hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          <span aria-hidden="true">←</span> Back to Latest
        </Link>
      </div>
    </div>
  );
}

type MonthBucket = {
  key: string;
  label: string;
  items: LatestRss[];
};

function groupByMonth(items: LatestRss[]): MonthBucket[] {
  const buckets = new Map<string, MonthBucket>();
  for (const it of items) {
    const iso = it.publishedAt ?? it.discoveredAt;
    const t = iso ? Date.parse(iso) : NaN;
    let key: string;
    let label: string;
    if (Number.isFinite(t)) {
      const d = new Date(t);
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth() + 1;
      key = `${y}-${String(m).padStart(2, "0")}`;
      label = `${y} 年 ${m} 月`;
    } else {
      key = "0000-00";
      label = "未知日期";
    }
    if (!buckets.has(key)) buckets.set(key, { key, label, items: [] });
    buckets.get(key)!.items.push(it);
  }
  // Keys are sortable as ISO yyyy-mm; descending = most recent month first.
  return [...buckets.values()].sort((a, b) => (a.key < b.key ? 1 : -1));
}
