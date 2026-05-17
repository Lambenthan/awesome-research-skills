import { latest } from "@/lib/data";
import type { HnItem, LatestRepo, LatestRss } from "@/lib/types";

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
              built {timeAgo(fetchedAt)} · refreshed every 6 hours
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

      {rss.length > 0 && (
        <section>
          <div className="mb-5 flex items-baseline justify-between border-b border-rule pb-3">
            <h2 className="font-serif text-[22px] leading-tight text-ink">
              厂商一手发布 <em className="text-ember">· lab feed</em>
            </h2>
            <span className="eyebrow">{rss.length} items</span>
          </div>
          <p className="mb-6 max-w-3xl text-[13px] leading-[1.7] text-ink-muted">
            来自 OpenAI、Anthropic、DeepMind、Google AI、NVIDIA、Mistral、Meta AI、xAI
            的官方公告。每条由 deepseek-v4-flash 打分（1–5）、归类并写中文导读，
            分数 &lt; 3 的运营动态已过滤掉。
          </p>
          <ul className="grid grid-cols-1 gap-x-10 gap-y-7 lg:grid-cols-2">
            {rss.map((it) => (
              <RssRow key={it.id} item={it} />
            ))}
          </ul>
        </section>
      )}

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

function RssRow({ item }: { item: LatestRss }) {
  const when = item.publishedAt ?? item.discoveredAt;
  return (
    <li>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="eyebrow-strong text-ember">{item.sourceName}</span>
          <span className="eyebrow">{item.category}</span>
          <span className="text-[11px] text-ink-subtle">{timeAgo(when)}</span>
        </div>
        <h3 className="mt-2 font-serif text-[17px] leading-snug text-ink transition group-hover:text-ember">
          {item.title}
        </h3>
        {item.cn && (
          <p className="mt-2 line-clamp-4 text-[13.5px] leading-[1.75] text-ink-muted">
            {item.cn}
          </p>
        )}
      </a>
    </li>
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
        className="group block"
      >
        <h3 className="font-serif text-[17px] leading-snug text-ink transition group-hover:text-ember">
          {item.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {host && <span className="eyebrow">{host}</span>}
          <span className="text-[11px] text-ink-subtle">
            {item.points} ↑ · {item.comments} comments ·{" "}
            {timeAgo(item.createdAt)}
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
        className="group block"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-mono text-[14px] leading-snug text-ink transition group-hover:text-ember">
            <span className="text-ink-subtle">{owner}/</span>
            <span className="font-medium">{name}</span>
          </h3>
          <span className="shrink-0 font-serif text-[14px] text-ember">
            ★ {formatStars(item.stars)}
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
            pushed {timeAgo(item.pushedAt)} · created {timeAgo(item.createdAt)}
          </span>
        </div>
      </a>
    </li>
  );
}

function timeAgo(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  const diff = Date.now() - t;
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(t).toISOString().slice(0, 10);
}

function formatStars(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}
