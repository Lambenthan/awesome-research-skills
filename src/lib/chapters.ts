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

const ym = (n: number, slug: string, displayNum: string, title: string): ChapterMeta => ({
  categorySlug: "personality-causal",
  itemSlug: "yangming-trajectory",
  slug,
  num: n,
  displayNum,
  title,
  load: () =>
    import(`@/content/notes/personality-causal/yangming-trajectory/chap-${n}.mdx`),
});

const sushi = (n: number, slug: string, displayNum: string, title: string): ChapterMeta => ({
  categorySlug: "personality-causal",
  itemSlug: "sushi-trajectory",
  slug,
  num: n,
  displayNum,
  title,
  load: () =>
    import(`@/content/notes/personality-causal/sushi-trajectory/chap-${n}.mdx`),
});

export const CHAPTERS: ChapterMeta[] = [
  ym(0, "chapter-0", "0", "阳明生平与心学概览"),
  ym(1, "chapter-1", "1", "1506 廷杖事件与阳明人格重组：基于中断时间序列的因果识别"),
  ym(2, "chapter-2", "2", "概念分布散度:朱熹作为外生历史对照"),
  ym(3, "chapter-3", "3", "断点检测：不预设事件年份的转折点定位"),
  ym(4, "chapter-4", "4", "合成控制：用稳定概念构造致良知诞生的反事实"),
  ym(5, "chapter-5", "5", "跨体裁人格分析：体裁固定效应回归与共线诊断"),
  ym(6, "chapter-6", "6", "方法论附录：六种方法的假设核查与 claim 降级"),
  sushi(0, "chapter-0", "0", "东坡生平与北宋政局概览"),
  sushi(1, "chapter-1", "1", "1079 乌台诗案与东坡人格重组：基于中断时间序列的因果识别"),
  sushi(2, "chapter-2", "2", "概念分布散度：王安石与黄庭坚作为双外部历史对照"),
  sushi(3, "chapter-3", "3", "断点检测：让数据自报转折点"),
  sushi(4, "chapter-4", "4", "合成控制：用稳定概念构造黄州转向的反事实"),
  sushi(5, "chapter-5", "5", "跨体裁人格分析：体裁固定效应回归与代笔诊断"),
  sushi(6, "chapter-6", "6", "方法论附录：六种方法的假设核查与 claim 降级"),
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
