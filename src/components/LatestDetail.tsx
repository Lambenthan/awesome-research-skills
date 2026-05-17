import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Breadcrumb } from "./Breadcrumb";
import { Reveal } from "./Reveal";
import type { LatestRss } from "@/lib/types";

const SCORE_LABEL: Record<number, string> = {
  5: "重大发布",
  4: "重要更新",
  3: "可关注",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function LatestDetail({ item }: { item: LatestRss }) {
  const host = hostnameOf(item.url);
  const dateText = formatDate(item.publishedAt ?? item.discoveredAt);
  const hasDetail = !!item.detail && item.detail.trim().length > 0;

  return (
    <div className="space-y-14">
      <Breadcrumb
        trail={[
          { label: "Home", href: "/" },
          { label: "Latest", href: "/latest" },
          { label: item.title },
        ]}
      />

      <header className="mx-auto max-w-3xl space-y-7 text-center">
        <Reveal>
          <p className="eyebrow">
            {item.sourceName} · {item.category}
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="display text-ink">{item.title}</h1>
        </Reveal>
        {item.cn && (
          <Reveal delay={220}>
            <p className="font-fluid-lede mx-auto max-w-2xl leading-[1.85] text-ink">
              {item.cn}
            </p>
          </Reveal>
        )}
        <Reveal delay={300}>
          <dl className="mx-auto mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.5px] text-ink-subtle">
            <Pair label="域名" value={<code translate="no" className="font-mono text-[12px] text-ink">{host}</code>} />
            <Pair label="评分" value={`${item.score} · ${SCORE_LABEL[item.score] ?? "—"}`} />
            <Pair label={item.publishedAt ? "发布" : "收录"} value={dateText} />
          </dl>
        </Reveal>
        <Reveal delay={380}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-ink bg-ink px-5 py-2.5 text-[13px] font-medium text-cream transition hover:bg-ember hover:border-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            <span>访问项目本体</span>
            <span aria-hidden="true">→</span>
          </a>
        </Reveal>
        {item.image && (
          <Reveal delay={460}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group mx-auto mt-6 block overflow-hidden rounded border border-rule focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.title}
                width="1200"
                height="675"
                fetchPriority="high"
                className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </a>
          </Reveal>
        )}
      </header>

      <section className="mx-auto max-w-3xl">
        <h2 className="mb-5 font-serif text-[22px] leading-tight text-ink">
          导读
        </h2>
        {hasDetail ? (
          <div className="prose-detail font-fluid-body max-w-none leading-[1.95] text-ink">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {item.detail!}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="border border-dashed border-rule p-6 text-center text-[13px] text-ink-subtle">
            这条暂时没有深度导读，点上方「访问项目本体」直接到源页面查看。
          </p>
        )}

        {item.summary && (
          <div className="mt-10 border-t border-rule pt-6">
            <p className="eyebrow mb-3">原文摘要</p>
            <p className="text-[13.5px] leading-[1.8] text-ink-muted">
              {item.summary}
            </p>
          </div>
        )}
      </section>

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

function Pair({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="eyebrow">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
