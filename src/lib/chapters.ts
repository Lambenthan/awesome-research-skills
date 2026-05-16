import type { MDXProps } from "mdx/types";

/**
 * Registry of chapter-level MDX content for notes that have been ported
 * from LaTeX source. The detail page consults this registry to surface a
 * "在线阅读" outline; the chapter route consults it to load + render.
 *
 * To add a new chapter: write the .mdx file under
 * src/content/notes/{categorySlug}/{itemSlug}/chap-{n}.mdx, then push an
 * entry below with the matching loader.
 */
export type ChapterModule = {
  default: (props: MDXProps) => React.JSX.Element;
};

export type ChapterMeta = {
  categorySlug: string;
  itemSlug: string;
  /** URL slug, e.g. "chapter-0" → /notes/.../chapter-0/ */
  slug: string;
  /** Zero-based chapter index. Used for sort order + display number. */
  num: number;
  /** Display number shown in the UI (often num, sometimes Roman). */
  displayNum: string;
  title: string;
  /** Async loader returning the compiled MDX default export. */
  load: () => Promise<ChapterModule>;
};

export const CHAPTERS: ChapterMeta[] = [
  {
    categorySlug: "personality-causal",
    itemSlug: "yangming-trajectory",
    slug: "chapter-0",
    num: 0,
    displayNum: "0",
    title: "阳明生平与心学概览",
    load: () =>
      import(
        "@/content/notes/personality-causal/yangming-trajectory/chap-0.mdx"
      ),
  },
];

export function getChaptersForItem(
  categorySlug: string,
  itemSlug: string,
): ChapterMeta[] {
  return CHAPTERS.filter(
    (c) => c.categorySlug === categorySlug && c.itemSlug === itemSlug,
  ).sort((a, b) => a.num - b.num);
}

export function getChapter(
  categorySlug: string,
  itemSlug: string,
  chapterSlug: string,
): ChapterMeta | null {
  return (
    CHAPTERS.find(
      (c) =>
        c.categorySlug === categorySlug &&
        c.itemSlug === itemSlug &&
        c.slug === chapterSlug,
    ) ?? null
  );
}

export function getAdjacentChapters(chapter: ChapterMeta): {
  prev: ChapterMeta | null;
  next: ChapterMeta | null;
} {
  const peers = getChaptersForItem(chapter.categorySlug, chapter.itemSlug);
  const idx = peers.findIndex((c) => c.slug === chapter.slug);
  return {
    prev: idx > 0 ? peers[idx - 1] : null,
    next: idx >= 0 && idx < peers.length - 1 ? peers[idx + 1] : null,
  };
}
