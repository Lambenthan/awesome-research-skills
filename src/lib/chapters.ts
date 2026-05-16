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
  {
    categorySlug: "personality-causal",
    itemSlug: "yangming-trajectory",
    slug: "chapter-1",
    num: 1,
    displayNum: "1",
    title: "1506 廷杖事件与阳明人格重组：基于中断时间序列的因果识别",
    load: () =>
      import(
        "@/content/notes/personality-causal/yangming-trajectory/chap-1.mdx"
      ),
  },
  {
    categorySlug: "personality-causal",
    itemSlug: "yangming-trajectory",
    slug: "chapter-2",
    num: 2,
    displayNum: "2",
    title: "概念分布散度：朱熹作为外生历史对照",
    load: () =>
      import(
        "@/content/notes/personality-causal/yangming-trajectory/chap-2.mdx"
      ),
  },
  {
    categorySlug: "personality-causal",
    itemSlug: "yangming-trajectory",
    slug: "chapter-3",
    num: 3,
    displayNum: "3",
    title: "断点检测：不预设事件年份的转折点定位",
    load: () =>
      import(
        "@/content/notes/personality-causal/yangming-trajectory/chap-3.mdx"
      ),
  },
  {
    categorySlug: "personality-causal",
    itemSlug: "yangming-trajectory",
    slug: "chapter-4",
    num: 4,
    displayNum: "4",
    title: "合成控制：用稳定概念构造致良知诞生的反事实",
    load: () =>
      import(
        "@/content/notes/personality-causal/yangming-trajectory/chap-4.mdx"
      ),
  },
  {
    categorySlug: "personality-causal",
    itemSlug: "yangming-trajectory",
    slug: "chapter-5",
    num: 5,
    displayNum: "5",
    title: "跨体裁人格分析：体裁固定效应回归与共线诊断",
    load: () =>
      import(
        "@/content/notes/personality-causal/yangming-trajectory/chap-5.mdx"
      ),
  },
  {
    categorySlug: "personality-causal",
    itemSlug: "yangming-trajectory",
    slug: "chapter-6",
    num: 6,
    displayNum: "6",
    title: "方法论附录：六种方法的假设核查与 claim 降级",
    load: () =>
      import(
        "@/content/notes/personality-causal/yangming-trajectory/chap-6.mdx"
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
