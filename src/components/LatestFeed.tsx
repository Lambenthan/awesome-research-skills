import Link from "next/link";
import { latest } from "@/lib/data";
import { getGroupMeta, itemsInGroup, pickHero } from "@/lib/rss-groups";
import { HeroFeedCard } from "@/components/HeroFeedCard";
import { TimeDisplay } from "@/components/TimeDisplay";
import { RssRow } from "@/components/rss/RssRow";
import type { HnItem, LatestRepo } from "@/lib/types";

// Four main content blocks shown side-by-side in the sampler grid. OSS
// is intentionally not here — it lives in the bottom discovery row with
// HackerNews and GitHub trending, which match its "indie / surfacing"
// vibe better than the editorial main blocks.
const SAMPLER_GROUP_IDS = [
  "news",
  "engineering",
  "research",
  "paper",
] as const;
const SAMPLER_PICKS_PER_BLOCK = 3;
const BOTTOM_OSS_LIMIT = 8;

/**
 * Renders the latest snapshot built by scripts/extract-content.mjs at CI
 * time. Visitors load static JSON only — no external API calls from the
 * browser. Freshness is controlled by the workflow cron in
 * .github/workflows/deploy.yml.
 *
 * Layout (top → bottom):
 *
 *   1. snapshot meta bar (built X ago · N items)
 *   2. editorial hero — single most prominent recent item with og:image
 *   3. sampler grid — 4 columns of {News / Engineering / Research /
 *      Paper}, each showing 3 latest items + "View all →"
 *   4. discovery row — 3 columns of {OSS / HackerNews / GitHub trending}
 *   5. footer note explaining the data pipeline
 *
 * Reference: anthropic.com/news + openai.com home (2026-05-21 snapshot).
 * OpenAI's home uses similar 6-card-per-row stacked sections; this
 * compresses it to 3 picks per block in 4 columns since 5 vendor groups
 * × 8 items left a long scroll where Research / Paper got buried.
 */
export function LatestFeed() {
  const fetchedAt = latest.fetchedAt;
  const hn = latest.hn;
  const gh = latest.gh;
  const rss = latest.rss ?? [];
  const total = hn.length + gh.length + rss.length;

  const hero = pickHero(rss);
  const heroGroupMeta = hero ? getGroupMeta(hero.contentType) ?? null : null;

  const samplerBlocks = SAMPLER_GROUP_IDS.map((id) => {
    const meta = getGroupMeta(id);
    if (!meta) return null;
    const groupItems = itemsInGroup(rss, id);
    const items = hero?.id
      ? groupItems.filter((it) => it.id !== hero.id).slice(0, SAMPLER_PICKS_PER_BLOCK)
      : groupItems.slice(0, SAMPLER_PICKS_PER_BLOCK);
    return { meta, items, total: groupItems.length };
  }).filter((b): b is NonNullable<typeof b> => b !== null && b.items.length > 0);

  const ossItems = itemsInGroup(rss, "oss")
    .filter((it) => it.id !== hero?.id)
    .slice(0, BOTTOM_OSS_LIMIT);

  return (
    <div className="space-y-14">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-3">
        <div className="flex items-baseline gap-3">
          <span className="eyebrow-strong">Snapshot</span>
          {fetchedAt && (
            <span className="eyebrow text-ink-subtle">
              built <TimeDisplay iso={fetchedAt} className="text-ink-subtle" /> ·
              refreshed every 6 hours
            </span>
          )}
        </div>
        <span className="eyebrow text-ink-subtle">{total} items</span>
      </div>

      {total === 0 && (
        <div className="border border-dashed border-rule p-8 text-center">
          <p className="eyebrow">No data yet</p>
          <p className="mt-3 text-[14px] text-ink-muted">
            首次部署后等下一次 cron 跑完（最多 6 小时）就有内容了。
          </p>
        </div>
      )}

      {hero && (
        <HeroFeedCard
          item={hero}
          accentVar={heroGroupMeta?.accentVar ?? "--color-ember"}
        />
      )}

      {samplerBlocks.length > 0 && (
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
          {samplerBlocks.map(({ meta, items, total: blockTotal }) => {
            const accent = `var(${meta.accentVar})`;
            return (
              <section key={meta.id} className="flex flex-col">
                <div
                  className="mb-4 flex items-baseline justify-between border-b-2 pb-2"
                  style={{ borderColor: accent }}
                >
                  <Link
                    href={`/latest/${meta.id}`}
                    className="font-serif text-[18px] leading-tight text-ink rounded transition hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                  >
                    <span
                      aria-hidden="true"
                      className="mr-2 inline-block h-[8px] w-[8px] -translate-y-[2px] rounded-full"
                      style={{ background: accent }}
                    />
                    {meta.label}
                  </Link>
                  <span className="eyebrow text-ink-subtle">{blockTotal}</span>
                </div>
                <ul className="flex-1 space-y-6">
                  {items.map((it) => (
                    <RssRow key={it.id} item={it} />
                  ))}
                </ul>
                <div className="mt-5 border-t border-rule pt-3">
                  <Link
                    href={`/latest/${meta.id}`}
                    className="eyebrow text-ember rounded transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                  >
                    查看全部 {blockTotal} 条{" "}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </section>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-3">
        {ossItems.length > 0 && (
          <section className="flex flex-col">
            <div
              className="mb-4 flex items-baseline justify-between border-b-2 pb-2"
              style={{ borderColor: "var(--color-heather)" }}
            >
              <Link
                href="/latest/oss"
                className="font-serif text-[20px] leading-tight text-ink rounded transition hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
              >
                <span
                  aria-hidden="true"
                  className="mr-2 inline-block h-[8px] w-[8px] -translate-y-[2px] rounded-full"
                  style={{ background: "var(--color-heather)" }}
                />
                OSS
              </Link>
              <span className="eyebrow text-ink-subtle">
                {itemsInGroup(rss, "oss").length} items
              </span>
            </div>
            <ul className="flex-1 space-y-5">
              {ossItems.map((it) => (
                <RssRow key={it.id} item={it} />
              ))}
            </ul>
            <div className="mt-5 border-t border-rule pt-3">
              <Link
                href="/latest/oss"
                className="eyebrow text-ember rounded transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
              >
                查看全部 <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>
        )}

        {hn.length > 0 && (
          <section>
            <div className="mb-4 flex items-baseline justify-between border-b border-rule pb-2">
              <h2 className="font-serif text-[20px] leading-tight text-ink">
                Hacker News · AI
              </h2>
              <span className="eyebrow text-ink-subtle">{hn.length}</span>
            </div>
            <ul className="space-y-5">
              {hn.map((it) => (
                <HnRow key={it.id} item={it} />
              ))}
            </ul>
          </section>
        )}

        {gh.length > 0 && (
          <section>
            <div className="mb-4 flex items-baseline justify-between border-b border-rule pb-2">
              <h2 className="font-serif text-[20px] leading-tight text-ink">
                GitHub · 7 天上升
              </h2>
              <span className="eyebrow text-ink-subtle">{gh.length}</span>
            </div>
            <p className="mb-4 text-[11.5px] leading-[1.6] text-ink-subtle">
              5 个 AI topic 下 star &gt; 100、近 60 天有 push 的仓库, 按 7 天
              star 增量倒排. 没历史读数的项目兜底按总 star 排.
            </p>
            <ul className="space-y-5">
              {gh.map((r) => (
                <GhRow key={r.id} item={r} />
              ))}
            </ul>
          </section>
        )}
      </div>

      <p className="border-t border-rule pt-4 text-[11.5px] text-ink-subtle">
        数据由 GitHub Actions cron 每 6 小时跑一次{" "}
        <code className="font-mono text-[11px] text-ink-muted">
          scripts/extract-content.mjs
        </code>{" "}
        与{" "}
        <code className="font-mono text-[11px] text-ink-muted">
          scripts/extract-feed.mjs
        </code>{" "}
        从 HackerNews Algolia、GitHub Search 与一手发布源 (含 Anthropic
        News / Research / Engineering、claude.com/blog、OpenAI、Google AI、
        DeepMind、NVIDIA、Meta AI、xAI、Mistral 以及中文厂商) 抓取，过
        LLM 打分归类后 commit 回仓库随构建部署。访客 0 外部请求。
      </p>
    </div>
  );
}

function HnRow({ item }: { item: HnItem }) {
  let host = "";
  try {
    host = new URL(item.url).hostname.replace(/^www\./, "");
  } catch {
    /* invalid URL — drop host */
  }
  return (
    <li>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
      >
        <h3 className="font-serif text-[17px] leading-snug text-ink transition group-hover:text-ember">
          {item.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {host && <span className="eyebrow">{host}</span>}
          <span className="text-[11px] text-ink-subtle">
            {item.points} <span aria-hidden="true">↑</span> · {item.comments}{" "}
            comments ·{" "}
            <TimeDisplay iso={item.createdAt} className="text-ink-subtle" />
          </span>
        </div>
      </a>
    </li>
  );
}

function GhRow({ item }: { item: LatestRepo }) {
  const [owner, name] = item.fullName.split("/");
  const delta = formatDelta(item.starsDelta7d);
  return (
    <li>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-mono text-[14px] leading-snug text-ink transition group-hover:text-ember">
            <span className="text-ink-subtle">{owner}/</span>
            <span className="font-medium">{name}</span>
          </h3>
          <span className="shrink-0 font-serif text-[14px] text-ember tabular-nums">
            <span aria-hidden="true">★</span> {formatStars(item.stars)}
            {delta && (
              <span className="ml-2 text-[11px] text-ember/80">
                {delta} / 7d
              </span>
            )}
          </span>
        </div>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-[13px] leading-[1.55] text-ink-muted">
            {item.description}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {item.language && <span className="eyebrow">{item.language}</span>}
          <span className="text-[11px] text-ink-subtle">
            pushed <TimeDisplay iso={item.pushedAt} className="text-ink-subtle" /> ·
            created <TimeDisplay iso={item.createdAt} className="text-ink-subtle" />
          </span>
        </div>
      </a>
    </li>
  );
}

function formatStars(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

function formatDelta(d?: number) {
  if (d === undefined || d === null || d < 20) return null;
  if (d >= 1000) return `+${(d / 1000).toFixed(1)}k`;
  return `+${d}`;
}
