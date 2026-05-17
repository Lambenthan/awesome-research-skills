import Link from "next/link";
import { latest } from "@/lib/data";
import { groupRss } from "@/lib/rss-groups";
import { TimeDisplay } from "@/components/TimeDisplay";
import { RssRow } from "@/components/rss/RssRow";
import type { HnItem, LatestRepo } from "@/lib/types";

const HOME_GROUP_LIMIT = 12;

/**
 * Renders the latest snapshot built by scripts/extract-content.mjs at CI
 * time. Visitors load static JSON only — no external API calls from the
 * browser. Freshness is controlled by the workflow cron in
 * .github/workflows/deploy.yml.
 */
export function LatestFeed() {
  const fetchedAt = latest.fetchedAt;
  const hn = latest.hn;
  const gh = latest.gh;
  const rss = latest.rss ?? [];

  const total = hn.length + gh.length + rss.length;

  return (
    <div className="space-y-12">
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

      {rss.length > 0 &&
        groupRss(rss).map((group) => {
          const visible = group.items.slice(0, HOME_GROUP_LIMIT);
          const hasMore = group.items.length > HOME_GROUP_LIMIT;
          const accent = `var(${group.accentVar})`;
          return (
            <section key={group.id}>
              <div
                className="mb-5 flex items-baseline justify-between border-b-2 pb-3"
                style={{ borderColor: accent }}
              >
                <h2 className="font-serif text-[22px] leading-tight text-ink">
                  <span
                    aria-hidden="true"
                    className="mr-3 inline-block h-[10px] w-[10px] -translate-y-[2px] rounded-full"
                    style={{ background: accent }}
                  />
                  <Link
                    href={`/latest/${group.id}`}
                    className="rounded transition hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                  >
                    {group.label}
                  </Link>{" "}
                  <em className="text-ember">· {group.subtitle}</em>
                </h2>
                <span className="eyebrow">{group.items.length} items</span>
              </div>
              <p className="mb-6 max-w-3xl text-[13px] leading-[1.7] text-ink-muted">
                {group.blurb}
              </p>
              <ul className="grid grid-cols-1 gap-x-10 gap-y-7 lg:grid-cols-2">
                {visible.map((it) => (
                  <RssRow key={it.id} item={it} showReadHint />
                ))}
              </ul>
              {hasMore && (
                <div className="mt-6 border-t border-rule pt-4">
                  <Link
                    href={`/latest/${group.id}`}
                    className="eyebrow rounded text-ember transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                  >
                    查看全部 {group.items.length} 条{" "}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              )}
            </section>
          );
        })}

      <div className="grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-2">
        {hn.length > 0 && (
          <section>
            <div className="mb-5 flex items-baseline justify-between border-b border-rule pb-3">
              <h2 className="font-serif text-[22px] leading-tight text-ink">
                Hacker News · AI
              </h2>
              <span className="eyebrow">{hn.length} items</span>
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
            <div className="mb-5 flex items-baseline justify-between border-b border-rule pb-3">
              <h2 className="font-serif text-[22px] leading-tight text-ink">
                GitHub · 上升中
              </h2>
              <span className="eyebrow">{gh.length} items</span>
            </div>
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
        从 HackerNews Algolia、GitHub Search 与 8 家 AI lab 一手发布源抓取，过
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
