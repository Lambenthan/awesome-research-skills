"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "./Breadcrumb";
import { Reveal } from "./Reveal";
import { RssRow } from "./rss/RssRow";
import type { LatestRss } from "@/lib/types";
import type { RssGroupMeta } from "@/lib/rss-groups";

/**
 * Full-list view for a single rss group (Labs / 中文厂商 / 学术 / OSS).
 *
 * Adds client-side search + source filter chips. Items are sorted by
 * publishedAt desc in extract-content.mjs and bucketed by year-month
 * here for editorial rhythm. Source chips appear when the group has
 * more than one source name (Labs has 8+ — the filters matter; 学术
 * has 4, still worth filtering).
 */
export function LatestGroupView({
  group,
  items,
}: {
  group: RssGroupMeta;
  items: LatestRss[];
}) {
  const [query, setQuery] = useState("");
  const [activeSource, setActiveSource] = useState<string>("all");

  const sources = useMemo(() => {
    const counts = new Map<string, number>();
    for (const it of items) {
      counts.set(it.sourceName, (counts.get(it.sourceName) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (activeSource !== "all" && it.sourceName !== activeSource) return false;
      if (!q) return true;
      const hay = `${it.title} ${it.cn ?? ""} ${it.summary ?? ""} ${it.sourceName} ${it.category ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, activeSource]);

  const byMonth = useMemo(() => groupByMonth(filtered), [filtered]);

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

      <div className="space-y-4">
        <div className="flex items-center gap-3 border-b border-rule pb-3">
          <span className="eyebrow shrink-0">Search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="按标题、导读、来源、分类过滤…"
            aria-label="Search items in this group"
            className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink-subtle outline-none focus-visible:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="eyebrow shrink-0 rounded transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              Clear
            </button>
          )}
        </div>
        {sources.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              active={activeSource === "all"}
              onClick={() => setActiveSource("all")}
            >
              全部 <span className="text-ink-subtle">{items.length}</span>
            </FilterChip>
            {sources.map((s) => (
              <FilterChip
                key={s.name}
                active={activeSource === s.name}
                onClick={() => setActiveSource(s.name)}
              >
                {s.name} <span className="text-ink-subtle">{s.count}</span>
              </FilterChip>
            ))}
          </div>
        )}
        <p className="eyebrow text-ink-subtle">
          {filtered.length === items.length
            ? `${items.length} items`
            : `${filtered.length} / ${items.length} items`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-rule p-8 text-center">
          <p className="eyebrow">没有匹配的条目</p>
          <p className="mt-3 text-[14px] text-ink-muted">
            尝试更短的关键词，或清空筛选条件再看。
          </p>
        </div>
      ) : (
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
      )}

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

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-[12px] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${
        active
          ? "border-ink bg-ink text-cream"
          : "border-rule-strong text-ink-muted hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
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
  return [...buckets.values()].sort((a, b) => (a.key < b.key ? 1 : -1));
}
