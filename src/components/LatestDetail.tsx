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

      <header className="space-y-6">
        <Reveal>
          <p className="eyebrow">
            {item.sourceName} · {item.category}
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="display text-[34px] text-ink sm:text-[48px]">
            {item.title}
          </h1>
        </Reveal>
        {item.cn && (
          <Reveal delay={220}>
            <p className="max-w-3xl text-[16px] leading-[1.85] text-ink">
              {item.cn}
            </p>
          </Reveal>
        )}
      </header>

      <div className="grid grid-cols-12 gap-x-10 gap-y-10">
        <aside className="col-span-12 sm:col-span-4">
          <dl className="divide-y divide-rule border-y border-rule">
            <Row label="来源">
              <span className="text-ink">{item.sourceName}</span>
            </Row>
            <Row label="域名">
              <code className="font-mono text-[12.5px] text-ink-muted">
                {host}
              </code>
            </Row>
            <Row label="分类">{item.category}</Row>
            <Row label="评分">
              {item.score} · {SCORE_LABEL[item.score] ?? "—"}
            </Row>
            <Row label={item.publishedAt ? "发布" : "收录"}>{dateText}</Row>
          </dl>
          <div className="mt-6 flex flex-col gap-3">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-between rounded-full border border-ember bg-ember-tint px-5 py-2.5 text-[13px] font-medium text-ember transition hover:bg-ember hover:text-cream"
            >
              <span>访问项目本体</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </aside>

        <section className="col-span-12 sm:col-span-8">
          <h2 className="mb-4 font-serif text-[22px] leading-tight text-ink">
            导读
          </h2>
          {hasDetail ? (
            <div className="prose-detail max-w-none text-[14.5px] leading-[1.9] text-ink">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.detail!}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="border border-dashed border-rule p-6 text-[13px] text-ink-subtle">
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
      </div>

      <div className="border-t border-rule pt-6">
        <Link href="/latest" className="eyebrow transition hover:text-ember">
          ← Back to Latest
        </Link>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3">
      <dt className="eyebrow col-span-1">{label}</dt>
      <dd className="col-span-2 text-[13.5px] text-ink">{children}</dd>
    </div>
  );
}
