import Link from "next/link";
import { Breadcrumb } from "./Breadcrumb";
import { Reveal } from "./Reveal";
import { SECTION_META, type SectionId } from "@/lib/sections";

export type DetailAttribute = { label: string; value: React.ReactNode };

/**
 * Shared shell for /skills, /ai, /reading item detail pages.
 *
 * Editorial single-column layout (modeled after anthropic.com/news/*):
 *   - Breadcrumb
 *   - Centered hero: eyebrow → display title → cn intro
 *   - Inline attribute strip (label · value pairs separated by ·)
 *   - Primary + optional secondary CTA buttons (centered)
 *   - Centered body content, max-w-prose (~640px)
 *   - Bottom: sibling navigation + back link
 */
export function DetailShell({
  section,
  categoryId,
  categoryLabel,
  title,
  cn,
  description,
  attributes,
  bodyHeading,
  body,
  externalLabel,
  externalHref,
  secondaryHref,
  secondaryLabel,
  siblings,
}: {
  section: SectionId;
  categoryId: string;
  categoryLabel: string;
  title: string;
  cn?: string;
  description?: string;
  attributes: DetailAttribute[];
  bodyHeading?: string;
  body?: React.ReactNode;
  externalLabel: string;
  externalHref: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  siblings: { itemSlug: string; title: string }[];
}) {
  const meta = SECTION_META[section];
  return (
    <div className="space-y-14">
      <Breadcrumb
        trail={[
          { label: "Home", href: "/" },
          { label: meta.eyebrow, href: meta.href },
          {
            label: categoryLabel,
            href: `${meta.href}/${categoryId}`,
          },
          { label: title },
        ]}
      />

      <header className="mx-auto max-w-3xl space-y-7 text-center">
        <Reveal>
          <p className="eyebrow">
            {meta.eyebrow} · {categoryLabel}
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="display text-ink">{title}</h1>
        </Reveal>
        {cn && (
          <Reveal delay={220}>
            <p className="font-fluid-lede mx-auto max-w-2xl leading-[1.85] text-ink">
              {cn}
            </p>
          </Reveal>
        )}
        {description && (
          <Reveal delay={cn ? 320 : 220}>
            <p className="mx-auto max-w-2xl text-[14px] leading-[1.75] text-ink-muted">
              {description}
            </p>
          </Reveal>
        )}
        {attributes.length > 0 && (
          <Reveal delay={cn || description ? 400 : 280}>
            <dl className="mx-auto mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.5px] text-ink-subtle">
              {attributes.map((a, i) => (
                <div key={i} className="flex items-baseline gap-1.5">
                  <dt className="eyebrow">{a.label}</dt>
                  <dd className="text-ink">{a.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
        <Reveal delay={cn || description ? 480 : 360}>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href={externalHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ink bg-ink px-5 py-2.5 text-[13px] font-medium text-cream transition hover:bg-ember hover:border-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              <span>{externalLabel}</span>
              <span aria-hidden="true">→</span>
            </a>
            {secondaryHref && (
              <a
                href={secondaryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-rule-strong px-5 py-2.5 text-[13px] text-ink-muted transition hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
              >
                <span>{secondaryLabel ?? "Source"}</span>
                <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        </Reveal>
      </header>

      <section className="mx-auto max-w-3xl">
        {bodyHeading && (
          <h2 className="mb-5 font-serif text-[22px] leading-tight text-ink">
            {bodyHeading}
          </h2>
        )}
        {body ? (
          <div className="prose-detail font-fluid-body max-w-none leading-[1.9] text-ink">
            {body}
          </div>
        ) : (
          <p className="border border-dashed border-rule p-6 text-center text-[13px] text-ink-subtle">
            这一条暂时没有抓到正文内容；点上方「{externalLabel}」直接到源页面看完整信息。
          </p>
        )}
      </section>

      {siblings.length > 1 && (
        <section className="border-t border-rule pt-8">
          <p className="eyebrow mb-4">同一分类的其他项</p>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {siblings.map((s) => (
              <li key={s.itemSlug}>
                <Link
                  href={`${meta.href}/${categoryId}/${s.itemSlug}`}
                  className="text-[13.5px] text-ink-muted transition hover:text-ember"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="border-t border-rule pt-6">
        <Link
          href={`${meta.href}/${categoryId}`}
          className="eyebrow transition hover:text-ember"
        >
          <span aria-hidden="true">←</span> Back to {categoryLabel}
        </Link>
      </div>
    </div>
  );
}
