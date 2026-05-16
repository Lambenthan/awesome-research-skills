import Link from "next/link";

/**
 * Home-page callout for the live /latest/ feed. Distinct visual treatment
 * from the static SectionPreview blocks because this one is dynamic.
 */
export function LiveCallout() {
  return (
    <Link
      href="/latest"
      className="group block border-t border-rule py-12 transition first:border-t-0 first:pt-0"
    >
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 sm:col-span-4">
          <p className="eyebrow flex items-baseline gap-2">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />
            Latest · 实时
          </p>
          <h2 className="display mt-4 text-[32px] text-ink sm:text-[40px]">
            AI 新动向（<em>live</em>）
          </h2>
          <p className="mt-4 max-w-md text-[14px] leading-[1.7] text-ink-muted">
            打开页面时浏览器直接调 HackerNews 与 GitHub Search API。
            最新 AI 新闻、近 60 天内活跃的高 star 新项目，全部分钟级更新。
          </p>
        </div>
        <div className="col-span-12 sm:col-span-8">
          <ul className="divide-y divide-rule border-y border-rule">
            <li className="flex items-baseline justify-between py-4">
              <div className="flex items-baseline gap-4">
                <span className="font-serif text-[14px] tabular-nums text-ink-subtle">
                  01
                </span>
                <span className="font-serif text-[18px] text-ink transition group-hover:text-ember">
                  Hacker News · AI / LLM / agent 关键词
                </span>
              </div>
              <span className="eyebrow text-ink-subtle">≥10 ↑ · ~24h</span>
            </li>
            <li className="flex items-baseline justify-between py-4">
              <div className="flex items-baseline gap-4">
                <span className="font-serif text-[14px] tabular-nums text-ink-subtle">
                  02
                </span>
                <span className="font-serif text-[18px] text-ink transition group-hover:text-ember">
                  GitHub Search · 近 60 天活跃 + ≥100 star
                </span>
              </div>
              <span className="eyebrow text-ink-subtle">topic:llm / agent</span>
            </li>
          </ul>
          <p className="mt-6 eyebrow-strong text-ember transition group-hover:text-ink">
            Open the live feed →
          </p>
        </div>
      </div>
    </Link>
  );
}
