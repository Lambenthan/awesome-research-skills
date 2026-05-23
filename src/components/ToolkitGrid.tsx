import Link from "next/link";
import type { SectionMeta } from "@/lib/sections";

type ToolkitCardData = {
  meta: SectionMeta;
  total: number;
  groupCount: number;
};

/**
 * Two-card horizontal grid for the homepage Toolkit section.
 *
 * Replaces the previous vertically-stacked SectionPreview blocks for
 * Skills and AI. Each card shows count + one-line blurb + Browse all →,
 * with no sub-category list — the deeper index lives behind the link.
 * The whole row compresses what used to be ~20 vertical inches of
 * grid-and-list into a single horizontal band.
 */
export function ToolkitGrid({ cards }: { cards: ToolkitCardData[] }) {
  return (
    <section className="border-t border-rule">
      <div className="mx-auto max-w-[88rem] px-6 py-20 sm:py-24">
        <p className="eyebrow text-ink-subtle">Toolkit</p>
        <h2 className="mt-5 font-serif text-[clamp(2rem,3.5vw,3rem)] leading-[1.1] tracking-[-0.02em] text-ink">
          AI 与科研工具集
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-ink-muted">
          收录用过、读过、跑过的两条工具栈。Claude Code 一侧是 AI 代理的能力扩展，开源 AI 一侧是研究里常用的代理框架、模型推理与检索栈。
        </p>
        <div className="mt-14 grid gap-6 md:grid-cols-2 md:gap-8">
          {cards.map((c) => (
            <ToolkitCard key={c.meta.id} card={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ToolkitCard({ card }: { card: ToolkitCardData }) {
  const { meta, total, groupCount } = card;
  return (
    <Link
      href={meta.href}
      className="group block rounded-sm border border-rule p-8 transition hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember sm:p-10"
    >
      <p className="eyebrow text-ink-subtle">{meta.eyebrow}</p>
      <h3 className="mt-5 font-serif text-[clamp(1.75rem,2.5vw,2.25rem)] leading-[1.1] tracking-[-0.018em] text-ink transition group-hover:text-ember">
        {meta.title}
      </h3>
      <p className="mt-5 text-[14px] leading-[1.75] text-ink-muted">
        {meta.blurb}
      </p>
      <div className="mt-10 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-[44px] leading-none text-ink">
            {total}
          </span>
          <span className="eyebrow">
            条 · {groupCount} 类
          </span>
        </div>
        <span className="eyebrow text-ember transition group-hover:text-ink">
          Browse all{" "}
          <span aria-hidden="true" className="link-arrow">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
