"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Real-time AI feed. Two CORS-friendly sources fetched directly from the
 * visitor's browser:
 *
 *   1. HackerNews Algolia — AI/LLM/Claude/GPT/agent stories from the last
 *      ~72 hours with ≥10 points. Updates within minutes of HN ranking.
 *
 *   2. GitHub Search — repos created in the last ~6 months with strong
 *      recent activity in agent / LLM topics. Sorted by stars desc.
 *
 * Results cached in localStorage with a 15-minute TTL so navigating away
 * and back doesn't re-hit the APIs. A Refresh button forces a fresh pull.
 */

type HnHit = {
  objectID: string;
  title: string;
  url: string;
  points: number;
  num_comments: number;
  created_at: string;
  author: string;
};

type GhRepo = {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  pushed_at: string;
  created_at: string;
  language: string | null;
  topics?: string[];
};

type FeedSnapshot = {
  fetchedAt: number;
  hn: HnHit[];
  gh: GhRepo[];
};

const CACHE_KEY = "latest-feed-v1";
const CACHE_TTL_MS = 15 * 60 * 1000;

const HN_URL =
  "https://hn.algolia.com/api/v1/search_by_date?tags=story&" +
  encodeURI(
    "query=AI OR LLM OR Claude OR GPT OR Gemini OR Anthropic OR OpenAI OR agent OR Antigravity",
  ) +
  "&numericFilters=points>=10&hitsPerPage=20";

function ghSearchUrl() {
  // Repos pushed in the last 60 days, topic in our list, ≥100 stars.
  const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const q = encodeURIComponent(
    `topic:llm OR topic:ai-agent OR topic:agentic OR topic:claude OR topic:coding-agent pushed:>${since} stars:>100`,
  );
  return `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=15`;
}

async function fetchHn(): Promise<HnHit[]> {
  const res = await fetch(HN_URL);
  if (!res.ok) throw new Error(`HN ${res.status}`);
  const json = await res.json();
  const hits: HnHit[] = (json.hits ?? []).filter((h: HnHit) => h.url);
  return hits.slice(0, 12);
}

async function fetchGh(): Promise<GhRepo[]> {
  const res = await fetch(ghSearchUrl(), {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GH ${res.status}`);
  const json = await res.json();
  return (json.items ?? []).slice(0, 12);
}

function readCache(): FeedSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(snap: FeedSnapshot) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(snap));
  } catch {
    /* quota — ignore */
  }
}

function timeAgo(iso: string | number): string {
  const t = typeof iso === "number" ? iso : Date.parse(iso);
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

export function LatestFeed() {
  const [hn, setHn] = useState<HnHit[]>([]);
  const [gh, setGh] = useState<GhRepo[]>([]);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (force = false) => {
    if (!force) {
      const cached = readCache();
      if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        setHn(cached.hn);
        setGh(cached.gh);
        setFetchedAt(cached.fetchedAt);
        setLoading(false);
        return;
      }
    }
    setError(null);
    if (force) setRefreshing(true);
    else setLoading(true);
    const results = await Promise.allSettled([fetchHn(), fetchGh()]);
    const newHn = results[0].status === "fulfilled" ? results[0].value : [];
    const newGh = results[1].status === "fulfilled" ? results[1].value : [];
    const errs: string[] = [];
    if (results[0].status === "rejected") errs.push(`HN: ${results[0].reason}`);
    if (results[1].status === "rejected") errs.push(`GH: ${results[1].reason}`);
    setHn(newHn);
    setGh(newGh);
    const now = Date.now();
    setFetchedAt(now);
    writeCache({ fetchedAt: now, hn: newHn, gh: newGh });
    if (errs.length === 2) setError(errs.join(" · "));
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-3">
        <div className="flex items-baseline gap-3">
          <span className="eyebrow-strong">Live</span>
          {fetchedAt && (
            <span className="eyebrow text-ink-subtle">
              fetched {timeAgo(fetchedAt)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing || loading}
          className="eyebrow transition hover:text-ember disabled:opacity-50"
        >
          {refreshing ? "Refreshing…" : "Refresh ↻"}
        </button>
      </div>

      {loading && (
        <div className="space-y-3 text-[14px] text-ink-muted">
          <p className="eyebrow">Fetching…</p>
          <p>
            正在从 HackerNews 与 GitHub Search API 拉数据，
            首次大约 1–2 秒。
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="border border-dashed border-rule p-6">
          <p className="eyebrow">Both sources failed</p>
          <p className="mt-2 text-[13px] text-ink-muted">{error}</p>
          <p className="mt-2 text-[12px] text-ink-subtle">
            一般是临时限频，等一两分钟再点 Refresh。
          </p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-2">
          <section>
            <div className="mb-5 flex items-baseline justify-between border-b border-rule pb-3">
              <h2 className="font-serif text-[22px] leading-tight text-ink">
                Hacker News · AI
              </h2>
              <span className="eyebrow">{hn.length} items</span>
            </div>
            {hn.length === 0 ? (
              <p className="text-[13.5px] text-ink-subtle">没有新内容。</p>
            ) : (
              <ul className="space-y-5">
                {hn.map((it) => (
                  <li key={it.objectID}>
                    <a
                      href={it.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <h3 className="font-serif text-[17px] leading-snug text-ink transition group-hover:text-ember">
                        {it.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="eyebrow">
                          {new URL(it.url).hostname.replace(/^www\./, "")}
                        </span>
                        <span className="text-[11px] text-ink-subtle">
                          {it.points} ↑ · {it.num_comments} comments ·{" "}
                          {timeAgo(it.created_at)}
                        </span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="mb-5 flex items-baseline justify-between border-b border-rule pb-3">
              <h2 className="font-serif text-[22px] leading-tight text-ink">
                GitHub · 上升中
              </h2>
              <span className="eyebrow">{gh.length} items</span>
            </div>
            {gh.length === 0 ? (
              <p className="text-[13.5px] text-ink-subtle">
                没有命中——可能是 GitHub Search 限频，等几分钟再试。
              </p>
            ) : (
              <ul className="space-y-5">
                {gh.map((r) => {
                  const [owner, name] = r.full_name.split("/");
                  return (
                    <li key={r.id}>
                      <a
                        href={r.html_url}
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
                            ★ {formatStars(r.stargazers_count)}
                          </span>
                        </div>
                        {r.description && (
                          <p className="mt-1 line-clamp-2 text-[13px] leading-[1.55] text-ink-muted">
                            {r.description}
                          </p>
                        )}
                        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          {r.language && (
                            <span className="eyebrow">{r.language}</span>
                          )}
                          <span className="text-[11px] text-ink-subtle">
                            pushed {timeAgo(r.pushed_at)} · created{" "}
                            {timeAgo(r.created_at)}
                          </span>
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}

      <p className="border-t border-rule pt-4 text-[11.5px] text-ink-subtle">
        数据来自 HackerNews Algolia 与 GitHub Search API，由你浏览器直接请求，
        服务端不做转发。命中限频时本地缓存最多保留 15 分钟。
      </p>
    </div>
  );
}
