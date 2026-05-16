import Link from "next/link";
import { Breadcrumb } from "./Breadcrumb";
import { Reveal } from "./Reveal";
import { SECTION_META, type SectionId } from "@/lib/sections";

export type DetailAttribute = { label: string; value: React.ReactNode };

/**
 * Shared shell for /skills, /ai, /research, /reading item detail pages.
 *
 *  - Breadcrumb: Home / Section / Category / Item title
 *  - Top: eyebrow + serif title + short Chinese intro (cn) OR original
 *  - Two-column layout: attribute table on the left, body content on the right
 *  - Bottom: external link CTA + sibling-item navigation within category
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

      <header className="space-y-6">
        <Reveal>
          <p className="eyebrow">{meta.eyebrow} · {categoryLabel}</p>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="display text-[36px] text-ink sm:text-[52px]">
            {title}
          </h1>
        </Reveal>
        {cn && (
          <Reveal delay={220}>
            <p className="max-w-3xl text-[16px] leading-[1.85] text-ink">
              {cn}
            </p>
          </Reveal>
        )}
        {description && (
          <Reveal delay={cn ? 320 : 220}>
            <p className="max-w-3xl text-[14px] leading-[1.75] text-ink-muted">
              {description}
            </p>
          </Reveal>
        )}
      </header>

      <div className="grid grid-cols-12 gap-x-10 gap-y-10">
        <aside className="col-span-12 sm:col-span-4">
          <dl className="divide-y divide-rule border-y border-rule">
            {attributes.map((a, i) => (
              <div key={i} className="grid grid-cols-3 gap-4 py-3">
                <dt className="eyebrow col-span-1">{a.label}</dt>
                <dd className="col-span-2 text-[13.5px] text-ink">
                  {a.value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-col gap-3">
            <a
              href={externalHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-between rounded-full border border-ember bg-ember-tint px-5 py-2.5 text-[13px] font-medium text-ember transition hover:bg-ember hover:text-cream"
            >
              <span>{externalLabel}</span>
              <span aria-hidden="true">→</span>
            </a>
            {secondaryHref && (
              <a
                href={secondaryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-between rounded-full border border-rule-strong px-5 py-2.5 text-[13px] text-ink-muted transition hover:border-ink hover:text-ink"
              >
                <span>{secondaryLabel ?? "Source"}</span>
                <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        </aside>

        <section className="col-span-12 sm:col-span-8">
          {bodyHeading && (
            <h2 className="mb-4 font-serif text-[22px] leading-tight text-ink">
              {bodyHeading}
            </h2>
          )}
          {body ? (
            <div className="prose-detail max-w-none text-[14px] leading-[1.85] text-ink">
              {body}
            </div>
          ) : (
            <p className="border border-dashed border-rule p-6 text-[13px] text-ink-subtle">
              这一条暂时没有抓到正文内容；点上面的「{externalLabel}」直接到源页面看完整信息。
            </p>
          )}
        </section>
      </div>

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
          ← Back to {categoryLabel}
        </Link>
      </div>
    </div>
  );
}
