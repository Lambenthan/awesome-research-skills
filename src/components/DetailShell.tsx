import Link from "next/link";
import { Breadcrumb } from "./Breadcrumb";
import { Reveal } from "./Reveal";
import { SECTION_META, type SectionId } from "@/lib/sections";

export type DetailAttribute = { label: string; value: React.ReactNode };

/**
 * Shared shell for /skills, /ai, /reading item detail pages.
 *
 * Editorial layout following maggieappleton.com's essay detail rhythm:
 * left-aligned eyebrow → big Fraunces title → cn intro lede → inline
 * attribute strip, then the body in a single ~640px column with serif
 * heads and Lato body. Quiet sibling nav at the foot.
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
    <div className="mx-auto max-w-3xl space-y-12">
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

      <header className="space-y-7">
        <Reveal>
          <p className="eyebrow">
            {meta.eyebrow} · {categoryLabel}
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.08] text-ink">
            {title}
          </h1>
        </Reveal>
        {cn && (
          <Reveal delay={220}>
            <p className="font-serif text-[clamp(1.05rem,1.2vw,1.25rem)] leading-[1.6] text-ink-subtle">
              {cn}
            </p>
          </Reveal>
        )}
        {description && (
          <Reveal delay={cn ? 320 : 220}>
            <p className="text-[14px] leading-[1.75] text-ink-muted">
              {description}
            </p>
          </Reveal>
        )}
        {attributes.length > 0 && (
          <Reveal delay={cn || description ? 400 : 280}>
            <dl className="flex flex-wrap items-baseline gap-x-5 gap-y-2 text-[12.5px] text-meta">
              {attributes.map((a, i) => (
                <div key={i} className="flex items-baseline gap-1.5">
                  <dt className="eyebrow">{a.label}</dt>
                  <dd className="font-sans text-ink">{a.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
        <Reveal delay={cn || description ? 480 : 360}>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={externalHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-cream transition hover:bg-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              <span>{externalLabel}</span>
              <span aria-hidden="true">→</span>
            </a>
            {secondaryHref && (
              <a
                href={secondaryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-[13px] text-ink transition hover:border-ember hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
              >
                <span>{secondaryLabel ?? "Source"}</span>
                <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        </Reveal>
      </header>

      <section>
        {bodyHeading && (
          <h2 className="mb-5 font-serif text-[clamp(1.4rem,2vw,1.8rem)] leading-tight text-ink">
            {bodyHeading}
          </h2>
        )}
        {body ? (
          <div className="prose-detail max-w-none text-ink">{body}</div>
        ) : (
          <p className="rounded-md border border-dashed border-rule-strong p-6 text-[13px] text-ink-subtle">
            这一条暂时没有抓到正文内容；点上方「{externalLabel}」直接到源页面看完整信息。
          </p>
        )}
      </section>

      {siblings.length > 1 && (
        <section className="border-t border-rule pt-8">
          <p className="eyebrow mb-4">More in {categoryLabel}</p>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {siblings.map((s) => (
              <li key={s.itemSlug}>
                <Link
                  href={`${meta.href}/${categoryId}/${s.itemSlug}`}
                  className="font-serif text-[15px] text-ink transition hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
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
          className="eyebrow rounded transition hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          <span aria-hidden="true">←</span> Back to {categoryLabel}
        </Link>
      </div>
    </div>
  );
}
