import Link from "next/link";
import { Breadcrumb } from "./Breadcrumb";
import { Reveal } from "./Reveal";
import { RssRow } from "./rss/RssRow";
import type { LatestRss } from "@/lib/types";
import type { RssGroupMeta } from "@/lib/rss-groups";

/**
 * Full-list view for a single rss group (Labs / 中文厂商 / 学术 / OSS).
 *
 * Used by /latest/{groupId} pages. The /latest index shows only the
 * top 12 of each group with a "查看全部 N 条 →" link pointing here,
 * so this view never needs to truncate.
 */
export function LatestGroupView({
  group,
  items,
}: {
  group: RssGroupMeta;
  items: LatestRss[];
}) {
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
          <p className="eyebrow">{group.subtitle}</p>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="display text-[40px] text-ink sm:text-[56px]">
            {group.label}
          </h1>
        </Reveal>
        <Reveal delay={220}>
          <p className="max-w-3xl text-[15px] leading-[1.85] text-ink-muted">
            {group.blurb}
          </p>
        </Reveal>
        <Reveal delay={320}>
          <p className="eyebrow text-ink-subtle">{items.length} items</p>
        </Reveal>
      </header>

      <ul
        className="grid grid-cols-1 gap-x-10 gap-y-7 lg:grid-cols-2"
        style={{ contentVisibility: "auto", containIntrinsicSize: "auto 240px" }}
      >
        {items.map((it) => (
          <RssRow key={it.id} item={it} />
        ))}
      </ul>

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

