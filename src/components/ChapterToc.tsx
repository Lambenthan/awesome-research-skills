import Link from "next/link";
import type { ChapterMeta } from "@/lib/chapters";

/**
 * Sticky side-nav listing every chapter of the current book, with the
 * current chapter highlighted. Lives in the right column on desktop;
 * stacks above the article body on small screens (handled by parent
 * grid breakpoints).
 *
 * Pure server component — current chapter is known at render time,
 * no client logic needed.
 */
export function ChapterToc({
  itemHref,
  peers,
  currentSlug,
  noteTitle,
}: {
  itemHref: string;
  peers: ChapterMeta[];
  currentSlug: string;
  noteTitle: string;
}) {
  return (
    <nav
      aria-label="本书章节目录"
      className="lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto"
    >
      <p className="eyebrow mb-3 text-ink-subtle">本书目录</p>
      <p className="mb-4 font-serif text-[15px] leading-tight text-ink">
        《{noteTitle}》
      </p>
      <ol className="space-y-1 border-l border-rule pl-4">
        {peers.map((c) => {
          const isCurrent = c.slug === currentSlug;
          return (
            <li key={c.slug} className="relative">
              {isCurrent && (
                <span
                  aria-hidden="true"
                  className="absolute -left-[17px] top-1 h-4 w-[2px] bg-ember"
                />
              )}
              <Link
                href={`${itemHref}/${c.slug}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`block py-1 text-[13px] leading-snug transition rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${
                  isCurrent
                    ? "font-medium text-ember"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <span className="font-mono text-[11px] text-ink-subtle">
                  {c.displayNum.padStart(2, "0")}
                </span>{" "}
                {c.title}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
